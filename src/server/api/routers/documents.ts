import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { type Document, type Job } from "@prisma/client";
import { documents_add } from "~/models/documents_add";
import { jobs_add } from "~/models/jobs_add";
import {} from "~/models/documents_remove";
import { documents_list } from "~/models/documents_list";
import { SourceType } from "~/models/all_request";

/// Adding a document will involve sending the refernce link to the Python
export const documentsRouter = createTRPCRouter({
    ///
    getSessionsAll: protectedProcedure.query(async ({ ctx }) => {
        const document_list = await documents_list({
            user_id: ctx.session.user.id,
        });

        if (!document_list.success) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        return "";
    }),

    /// Send to python, and create corresponding in Prisma DB
    postOne: protectedProcedure
        .input(
            z.object({
                filename: z.string(),
                libraryId: z.string(),
                file: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Verify this document
            if (!input.file) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Please select a file to upload",
                });
            }

            const file = new Blob([input.file]);

            // Send document to the backend
            const res = await documents_add({
                filename: input.filename,
                file: file,
                library_id: input.libraryId,
                user_id: ctx.session.user.id,
            });

            if (!res.success) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `API returned 'success: false' to create library attempt: "${
                        res.msg ?? "No message provided"
                    }"`,
                });
            }

            // Make me objects of name: authorName so that I can take that object[] list and pass it directly to Prisma
            const authorData = res.document.authors.map((author) => ({
                name: author,
            }));

            // First, ensure all the authors mentioned in the doc are in the database
            await ctx.db.author.createMany({
                data: authorData,
                skipDuplicates: true,
            });

            // Second, now that they all exist, connect them (put documentId in Author, and vice versa)
            const created: Document = await ctx.db.document.create({
                data: {
                    libraryId: res.library_id,
                    docletCount: res.num_doclets,
                    id: res.document.doc_id,
                    title: res.document.title,
                    authors: {
                        connect: authorData,
                    },
                },
            });

            return created;
        }),

    postBatch: protectedProcedure
        .input(
            z.object({
                batchUrl: z
                    .string()
                    .url({ message: "Please enter a valid URL" }),
                libraryId: z.string(),
                sourceType: z.nativeEnum(SourceType),
                notifyByEmail: z.string().nullable(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const job_added = await jobs_add({
                user_id: ctx.session.user.id,
                library_id: input.libraryId,
                source_type: input.sourceType,
                source_location: input.batchUrl,
                notify_by_email: input.notifyByEmail,
            });

            if (job_added.msg === "No such library.") {
                throw new TRPCError({
                    code: "CONFLICT",
                    message:
                        "Library does not exist in Python which does exist in Prisma.",
                });
            }

            if (!job_added.success) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `API returned 'success: false' to create library attempt: "${
                        job_added.msg ?? "No message provided"
                    }"`,
                });
            }

            const jobAdded: Job = await ctx.db.job.create({
                data: {
                    status: "PENDING",
                    documentCount: job_added.num_docs,
                    id: job_added.job_id,
                    // createdAt generated as Now() by Prisma/DB
                    startedAt: job_added.start_time, //todo IS THE PYTHON ENCODING THIS AS ACTUAL PROCESSING START TIME OR DOES IT JUST NOT DISTINGUISH CREATED VS STARTED
                    userId: ctx.session.user.id,
                    libraryId: job_added.library_id,
                },
            });

            return jobAdded;
        }),
});
