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
} from "~/models/documents/add";
import { jobs_add } from "~/models/jobs/add";
import { documents_remove } from "~/models/documents/remove";
import { documents_list } from "~/models/documents/list";
import { env } from "~/env.mjs";
import { createId } from "@paralleldrive/cuid2";

import { Response as DocumentAddResponse } from "~/models/documents/add";
import { Response as JobAddResponse } from "~/models/jobs/add";

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

            if (!res.success) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `API returned 'success: false' to post one attempt: "${
                        res.error ?? "No message provided"
                    }"`,
                });
            }

            const alreadyPresent: Document | null =
                await ctx.db.document.findFirst({
                    where: {
                        id: res.document.doc_id,
                        libraryId: input.libraryId,
                    },
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
                id: createId(),
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
            const job_added: JobAddResponse = await jobs_add({
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
                    message: `API returned 'success: false' to post batch attempt: "${
                        job_added.error ?? "No message provided"
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
                    id: createId(),
                }));

                // First, ensure all the authors mentioned in the doc are in the database
                await ctx.db.author.createMany({
                    data: authorData,
                    skipDuplicates: true,
                });

                // const publicationDate = new Date();
                // publicationDate.setMilliseconds(document.pub_date);
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

    remove: protectedProcedure
        .input(
            z.object({
                libraryId: z.string(),
                documentId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const res = await documents_remove({
                document_id: input.documentId,
                library_id: input.libraryId,
                user_id: ctx.session.user.id,
            });

            if (!res.success) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `API returned 'success: false' to remove document attempt: "${
                        res.error ?? "No message provided"
                    }"`,
                });
            }

            const removed: Document = await ctx.db.document.delete({
                where: {
                    id: input.documentId,
                    libraryId: input.libraryId,
                },
            });
            return removed;
        }),

    updateForm: protectedProcedure
        .input(
            z.object({
                libraryId: z.string(),
                documentId: z.string(),
                link: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const updated: Document = await ctx.db.document.update({
                where: {
                    id: input.documentId,
                    libraryId: input.libraryId,
                },
                data: {
                    link: input.link,
                },
            });
            return updated;
        }),
});
