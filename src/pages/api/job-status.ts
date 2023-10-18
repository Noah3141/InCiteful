import { type Status } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";

type ResponseData = {
    message: string;
};
export type UpdateJobData = {
    new_status: Status;
    user_id: string;
    library_id: string;
    job_id: string;
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
        });

    res.status(200).json({ message: "Success" });
}
