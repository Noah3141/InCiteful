import { ZodType, z } from "zod";
import { TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { type Document, type Job } from "@prisma/client";
import {
    DocumentAPI,
    ZodDocument,
    documents_add,
} from "~/models/documents_add";
import { jobs_add } from "~/models/jobs_add";
import {} from "~/models/documents_remove";
import { documents_list } from "~/models/documents_list";
import { env } from "~/env.mjs";
import { createId } from "@paralleldrive/cuid2";

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
            console.log("Sent");
            // Send document to the backend
            const res = await documents_add({
                file: {
                    contents: input.file,
                    filename: input.filename,
                    size: input.file.length,
                },
                library_id: input.libraryId,
                user_id: ctx.session.user.id,
            });
            console.log("Received");

            if (!res.success) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `API returned 'success: false' to create library attempt: "${
                        res.msg ?? "No message provided"
                    }"`,
                });
            }

            const alreadyPresent = await ctx.db.document.findFirst({
                where: { id: res.document.doc_id },
            });

            if (!!alreadyPresent) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message:
                        "This document is already present in this library!",
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
                    publicationSource: res.document.pub_source,
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
                libraryId: z.string(),
                files: z.array(
                    z.object({
                        contents: z.string(),
                        filename: z.string(),
                        size: z.number(),
                    }),
                ),
                notifyByEmail: z.string().nullable(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const job_added = await jobs_add({
                user_id: ctx.session.user.id,
                library_id: input.libraryId,
                files: input.files,
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
                    documentCount: job_added.num_files_submitted,
                    id: job_added.job_id,
                    // createdAt generated as Now() by Prisma/DB
                    userId: ctx.session.user.id,
                    libraryId: job_added.library_id,
                },
            });

            return jobAdded;
        }),
    insertMany: publicProcedure
        .input(
            z.object({
                libraryId: z.string(),
                documents: z.array(ZodDocument),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            for (const document of input.documents) {
                // Make me objects of name: authorName so that I can take that object[] list and pass it directly to Prisma
                const authorData = document.authors.map((author) => ({
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
                        libraryId: input.libraryId,
                        id: document.doc_id,
                        title: document.title,
                        publicationSource: document.pub_source,
                        publishedAt: document.pub_date,
                        authors: {
                            connect: authorData,
                        },
                    },
                });
            }

            //     await ctx.db.document.createMany({
            //         data: await Promise.all(
            //             input.documents.map(async (doc): Promise<Document> => {
            //                 const authorData = doc.authors.map((author) => ({
            //                     name: author,
            //                 }));

            //                 // First, ensure all the authors mentioned in the doc are in the database
            //                 await ctx.db.author.createMany({
            //                     data: authorData,
            //                     skipDuplicates: true,
            //                 });

            //                 return {
            //                     libraryId: input.libraryId,
            //                     docletCount: input.docletCount,
            //                     id: createId(),
            //                     title: doc.title,
            //                     publicationSource: doc.pub_source,
            //                     publishedAt: doc.pub_date,
            //                     authors: {
            //                         connect: authorData,
            //                     },
            //                 };
            //             }),
            //         ),
            //     });
            //     return;
        }),
});
