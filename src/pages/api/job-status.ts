import { Status } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { api } from "~/utils/api";

type ResponseData = {
    message: string;
};
type UpdateJobData = {
    new_status: Status;
    user_id: string;
    library_id: string;
    job_id: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>,
) {
    // Check authorization
    //todo

    // Knowing the request was sent by Python, now update our database
    const body = req.body as UpdateJobData;

    // api.job.updateJob.useMutation(body);

    await api.useContext().job.invalidate();
    res.status(200).json({ message: "Hello from Next.js!" });
}
