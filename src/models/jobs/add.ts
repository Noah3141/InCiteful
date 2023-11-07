import { z } from "zod";
import { JsonHeaders, log, PythonPath } from "../all_requests";
import { type FileAPI } from "../documents/add";

export type Request = {
    user_id: string;
    library_id: string;
    files: FileAPI[];
    notify_by_email: string | null;
};

export type Response = z.infer<typeof ResponseSchema>;
const ResponseSchema = z
    .object({
        user_id: z.string(),
        job_id: z.string(),
        files: z.array(z.string()),
        library_id: z.string(),
        msg: z.string().optional(),
        error: z.string().optional(),
        notify_by_email: z.string().nullable(),
        num_files_submitted: z.number(),
        est_duration: z.number(),
        start_time: z.number(),
        created_time: z.number(),
        success: z.boolean(),
    })
    .strict();

//todo) This is now supposed to be a formData with many files

export const jobs_add = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/jobs/add`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const json = (await res.json()) as Response;
    log(json, "jobs/add");
    const addedJob: Response = ResponseSchema.parse(json);
    return addedJob;
};
