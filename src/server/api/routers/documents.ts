import { z } from "zod";
import { AnyRouter, TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { Author, Document, Job } from "@prisma/client";

import {
    type Request as DocAddReq,
    type Response as DocAddRes,
} from "../../../models/documents_add";
import {
    type Request as JobAddReq,
    type Response as JobAddRes,
} from "../../../models/jobs_add";
import {
    type Request as DocRemReq,
    type Response as DocRemRes,
} from "../../../models/documents_remove";
import {
    type Request as DocListReq,
    type Response as DocListRes,
} from "../../../models/documents_list";
import {
    FileFormHeaders,
    JsonHeaders,
    SourceType,
    pythonPath,
} from "~/models/all_request";

// todo MAKE SURE ALL CRUD TO PYTHON IS SYNCED HERE, elsewhere is then valid

const documents_add = async (params: DocAddReq): Promise<DocAddRes> => {
    const { file, ...body } = params;

    const formData = new FormData();
    formData.append("file", file, undefined);
    for (const [key, value] of Object.entries(body)) {
        formData.append(key, value);
    }

    const res = await fetch(`${pythonPath}/documents/add`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: FileFormHeaders,
        body: formData,
    });

    const document_added = (await res.json()) as DocAddRes;

    return document_added;
};

const documents_list = async (params: DocListReq): Promise<DocListRes> => {
    const res = await fetch(`${pythonPath}/documents/list`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const document_list = (await res.json()) as DocListRes;

    return document_list;
};

const jobs_add = async (params: JobAddReq): Promise<JobAddRes> => {
    const res = await fetch(`${pythonPath}/documents/list`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const addedJob = (await res.json()) as JobAddRes;

    return addedJob;
};

// Post single file

// Post batch URL link (creating a job, telling user to come back)

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
                libraryId: z.string(),
                file: z.instanceof(File),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            // Send document to the backend
            const res = await documents_add({
                file: input.file,
                library_id: input.libraryId,
                user_id: ctx.session.user.id,
            });

            if (!res.success) {
                throw new TRPCError({ code: "CONFLICT" });
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
