import { Document, Job, Status } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { env } from "~/env.mjs";
import { DocumentAPI, ZodDocument } from "~/models/documents_add";
import { db } from "~/server/db";

type ResponseData = {
    message: string;
};
export type UpdateJobRequest = {
    new_status: Status;
    user_id: string;
    library_id: string;
    job_id: string;
    start_time: number | undefined;
    documents: DocumentAPI[] | null;
    num_docs_completed: number;
};

export const ZodUpdateJobRequest = z.object({
    new_status: z.nativeEnum(Status),
    user_id: z.string(),
    library_id: z.string(),
    job_id: z.string(),
    start_time: z.number().optional(), // Can be left out of the received JSON and still parse successfully
    documents: z.array(ZodDocument).nullable(), // Must be sent, with explicit null/undefined
    num_docs_completed: z.number(),
});

// HANDLER IS COMPLETED BY USING THE .json() or .send() METHODS ON THE RES OBJECT, otherwise requester gets no response
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>,
) {
    if (req.method !== "POST") {
        res.status(405).json({ message: "Invalid method" });
        return;
    }

    // Check authorization
    const token = req.headers.authorization?.split("Bearer ").at(1);
    if (token !== env.NEXTAUTH_SECRET) {
        if (!token) {
            res.status(400).json({
                message:
                    "No auth token provided. Header 'Authorization' must have value 'Bearer {token}' ",
            });
        } else {
            res.status(401).json({ message: "Invalid Auth token" });
        }
        return;
    }

    // Knowing the request was sent by Python, now update our database: Checking the job update needed, adding authors, then adding documents, then updating Prisma's job list
    const body = req.body as UpdateJobRequest;

    try {
        ZodUpdateJobRequest.parse(body);
    } catch (e) {
        res.status(400).json({
            message: `Received JSON body which failed type validation: ${JSON.stringify(
                e,
            )}`,
        });
    }

    switch (body.new_status) {
        case "CANCELLED":
            await updateJob({ ...body });
            res.status(201).json({ message: "Success!" });
            break;
        case "RUNNING":
            await updateJob({ ...body });
            res.status(201).json({ message: "Success!" });
            break;
        case "FAILED":
            await updateJob({ ...body });
            res.status(201).json({ message: "Success!" });
            break;
        case "COMPLETED":
            const documents = body.documents?.map((doc) => {
                const publishedAt = new Date();
                publishedAt.setSeconds(doc.pub_date); // todo) Check actual conversion
                const time = publishedAt;
                return {
                    ...doc,
                    pub_date: time,
                };
            });

            if (!documents) {
                res.status(400).json({
                    message: `Documents was null during a call to ~/api/job-status containing STATUS = "COMPLETED"!`,
                });
                return;
            }

            for (const document of documents) {
                // Make me objects of name: authorName so that I can take that object[] list and pass it directly to Prisma
                const authorData = document.authors.map((author) => ({
                    name: author,
                }));

                // First, ensure all the authors mentioned in the doc are in the database
                await db.author.createMany({
                    data: authorData,
                    skipDuplicates: true,
                });

                // Second, now that they all exist, connect them (put documentId in Author, and vice versa)
                const createdDocuments: Document = await db.document.create({
                    data: {
                        libraryId: body.library_id,
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
            await updateJob({ ...body });
            res.status(201).json({ message: "Success!" });
            break;
        case "UNKNOWN":
            await updateJob({ ...body });
            res.status(201).json({ message: "Success!" });
            break;
        case "PENDING":
            res.status(201).json({
                message:
                    "Status provided was PENDING. Was this intentional? No DB changes made.",
            });
            break;
        default:
            res.status(404).json({
                message:
                    "Status provided as unknown value which bypassed Zod check. No DB changes made.",
            });
            break;
    }

    res.status(404).json({
        message: "Send a request with the body json defined in ~/api/job-sync",
    });
}

const updateJob = async (input: UpdateJobRequest) => {
    const start_time = new Date();
    start_time.setSeconds(input.start_time ?? 0); // todo) Check actual conversion
    const time = input.start_time ? start_time : undefined;

    const endedAt =
        input.new_status === ("CANCELLED" || "COMPLETED" || "FAILED")
            ? new Date()
            : undefined;

    const updatedJob: Job = await db.job.update({
        where: {
            id: input.job_id,
            userId: input.user_id,
            libraryId: input.library_id,
        },
        data: {
            status: input.new_status,
            endedAt: endedAt,
            startedAt: time,
        },
    });

    await db.notification.create({
        data: {
            jobId: updatedJob.id,
            type: "JOB_UPDATE",
            message: `Your job is now ${input.new_status}`,
            userId: input.user_id,
        },
    });
};
