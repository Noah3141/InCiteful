import { type Status } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { DocumentAPI } from "~/models/documents_add";
import { jobs_list } from "~/models/jobs_list";
import { db } from "~/server/db";
import { api } from "~/utils/api";

type ResponseData = {
    message: string;
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

    // await syncWithPython();

    res.status(200).json({ message: "Success" });
    return;
}

// export const syncWithPython = async () => {
//     // Sync Jobs
//     // const pythonsJobs = await jobs_list({ user_id: "" }); // TODO
//     // Sync Documents

//     return;
// };
