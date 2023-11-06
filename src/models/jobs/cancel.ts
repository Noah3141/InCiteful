import { z } from "zod";
import { JsonHeaders, log, PythonPath } from "../all_requests";
import { type FileAPI } from "../documents/add";

export type Request = {
    job_id: string;
    library_id: string;
    user_id: string;
};

export type Response = z.infer<typeof ResponseSchema>;
const ResponseSchema = z
    .object({
        success: z.boolean(),
        msg: z.string().optional(),
        cancelled: z.boolean(),
        job_id: z.string(),
        library_id: z.string(),
        user_id: z.string(),
    })
    .strict();

export async function jobs_cancel(params: Request): Promise<Response> {
    const res = await fetch(`${PythonPath}/jobs/cancel`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const cancelledJob: Response = ResponseSchema.parse(await res.json());
    log(cancelledJob, "jobs/add");
    return cancelledJob;
}
