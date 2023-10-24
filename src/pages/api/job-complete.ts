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
    started_at: number | undefined;
    documents: DocumentAPI[];
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
    // Knowing the request was sent by Python, now update our database
    const body = req.body as UpdateJobData;

    const time = body.started_at ? new Date(body.started_at) : undefined;

    api.job.updateJob
        .useMutation({
            onError: (e) => {
                res.status(500).json({
                    message: `NextJS failed to sync frontend DB: ${e.message}`,
                });
                return;
            },
            onSuccess: async () => {
                await api.useContext().job.invalidate();
            },
        })
        .mutate({
            jobId: body.job_id,
            userId: body.user_id,
            libraryId: body.library_id,
            newStatus: body.new_status,
            startedAt: time,
        });

    res.status(200).json({ message: "Success" });
}
//   // // Check for changes in Jobs or Documents according to Python
//             // Maps the jobs-list endpoint to Job Prisma database objects and update
//             const job_res = await jobs_list({ user_id: ctx.session.user.id });

//             const jobsList = job_res.jobs.map((job) => ({
//                 id: job.job_id,
//                 userId: ctx.session.user.id,
//                 documentCount: job.num_docs,
//                 libraryId: job.library_id,
//                 status: job.status,
//                 message: job.msg,
//                 endedAt: new Date(job.finish_time), // todo) Properly convert to DateTime
//                 startedAt: new Date(job.start_time),
//             }));

//             const updateJobs = await ctx.db.job.updateMany({
//                 data: jobsList,
//             });

//             // Get the documents for this library according to Python (which should have any new documents)
//             const doc_res = await documents_list({
//                 user_id: ctx.session.user.id,
//                 library_id: input.libraryId,
//             });

//             // Create a list out of the Python response of Prisma Documents, where each document's authors have been verified as extant in db
//             const document_list = await Promise.all(
//                 doc_res.document_list.map(async (doc) => {
//                     const authors = doc.authors.map((author) => ({
//                         name: author,
//                     }));
//                     await ctx.db.author.createMany({
//                         data: authors,
//                         skipDuplicates: true,
//                     });
//                     return {
//                         title: doc.title,
//                         id: doc.doc_id,
//                         libraryId: input.libraryId,
//                         publishedAt: doc.pub_date,
//                         publicationSource: doc.pub_source,
//                         authors: authors,
//                     };
//                 }),
//             );

//             // todo Verify that passing authors in a create statement actually "connects"
//             const updateDocuments = await ctx.db.document.createMany({
//                 data: document_list,
//                 skipDuplicates: true,
//             });

//             // // With Jobs and Docs up to date,
//             // Get data state to hand to front end
