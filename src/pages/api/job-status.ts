import { type Status } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { DocumentAPI } from "~/models/documents_add";
import { api } from "~/utils/api";

type ResponseData = {
    message: string;
};
export type UpdateJobData = {
    new_status: Status;
    user_id: string;
    library_id: string;
    job_id: string;
    start_time: number | undefined;
    documents: DocumentAPI[] | null;
    num_docs_completed: number;
};

export default function handler(
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
    const body = req.body as UpdateJobData;

    const start_time = new Date();
    start_time.setSeconds(body.start_time ?? 0); // todo) Check actual conversion
    const time = body.start_time ? start_time : undefined;

    // todo) find some way to notify an active user. Proabaly store a db row and check it for toasts, run the toast on dashboard, then delete row
    switch (body.new_status) {
        case "CANCELLED":
            api.job.updateJob
                .useMutation({
                    onError: (e) => {
                        res.status(500).json({
                            message: `NextJS failed to sync frontend DB: ${
                                e.message
                            } \nRequest that had been received: ${JSON.stringify(
                                body,
                            )}`,
                        });
                        return;
                    },
                    onSuccess: async () => {
                        await api.useContext().job.invalidate();
                        await api.useContext().user.invalidate();
                    },
                })
                .mutate({
                    newStatus: body.new_status,
                    jobId: body.job_id,
                    libraryId: body.library_id,
                    userId: body.user_id,
                    startedAt: time, //? End time is created and understood during .job.updateJob() handler in trpc router
                });
            // todo) Post effect to user's notifications
            break;
        case "RUNNING":
            api.job.updateJob
                .useMutation({
                    onError: (e) => {
                        res.status(500).json({
                            message: `NextJS failed to sync frontend DB: ${
                                e.message
                            } \nRequest that had been received: ${JSON.stringify(
                                body,
                            )}`,
                        });
                        return;
                    },
                    onSuccess: async () => {
                        await api.useContext().job.invalidate();
                        await api.useContext().user.invalidate();
                    },
                })
                .mutate({
                    newStatus: body.new_status,
                    jobId: body.job_id,
                    libraryId: body.library_id,
                    userId: body.user_id,
                    startedAt: time,
                });
            break;
        case "FAILED":
            api.job.updateJob
                .useMutation({
                    onError: (e) => {
                        res.status(500).json({
                            message: `NextJS failed to sync frontend DB: ${
                                e.message
                            } \nRequest that had been received: ${JSON.stringify(
                                body,
                            )}`,
                        });
                        return;
                    },
                    onSuccess: async () => {
                        await api.useContext().job.invalidate();
                        await api.useContext().user.invalidate();
                    },
                })
                .mutate({
                    newStatus: body.new_status,
                    jobId: body.job_id,
                    libraryId: body.library_id,
                    userId: body.user_id,
                    startedAt: time, //? End time is created and understood during .job.updateJob() handler in trpc router
                });
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
                res.status(500).json({
                    message: `Documents was null during a call to containing STATUS = "COMPLETED"!`,
                });
                return;
            }

            const newDocuments = api.document.insertMany
                .useMutation({
                    onError: (e) => {
                        res.status(500).json({
                            message: `NextJS failed to sync frontend DB: ${
                                e.message
                            } \nRequest that had been received: ${JSON.stringify(
                                body,
                            )}\nError encountered: ${JSON.stringify(e)}`,
                        });
                        return;
                    },
                    onSuccess: async () => {
                        await api.useContext().job.invalidate();
                        await api.useContext().user.invalidate();
                    },
                })
                .mutate({ libraryId: body.library_id, documents });

            const updatedJob = api.job.updateJob
                .useMutation({
                    onError: (e) => {
                        res.status(500).json({
                            message: `NextJS failed to sync frontend DB: ${
                                e.message
                            } \nRequest that had been received: ${JSON.stringify(
                                body,
                            )}\nError encountered: ${JSON.stringify(e)}`,
                        });
                        return;
                    },
                    onSuccess: async () => {
                        await api.useContext().job.invalidate();
                        await api.useContext().user.invalidate();
                    },
                })
                .mutate({
                    newStatus: body.new_status,
                    jobId: body.job_id,
                    libraryId: body.library_id,
                    userId: body.user_id,
                    startedAt: time,
                });
            break;
        case "UNKNOWN":
            api.job.updateJob
                .useMutation({
                    onError: (e) => {
                        res.status(500).json({
                            message: `NextJS failed to sync frontend DB: ${
                                e.message
                            } \nRequest that had been received: ${JSON.stringify(
                                body,
                            )}`,
                        });
                        return;
                    },
                    onSuccess: async () => {
                        await api.useContext().job.invalidate();
                        await api.useContext().user.invalidate();
                    },
                })
                .mutate({
                    newStatus: body.new_status,
                    jobId: body.job_id,
                    libraryId: body.library_id,
                    userId: body.user_id,
                    startedAt: time, //? End time is created and understood during .job.updateJob() handler in trpc router
                });
            break;
        case "PENDING":
            break;
        default:
            break;
    }

    res.status(200).json({ message: "Success" });
}
