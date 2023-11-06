import { Status } from "@prisma/client";
import { JsonHeaders, log, PythonPath } from "../all_requests";
import { z } from "zod";

export type Request = {
    user_id: string;
};

export type JobAPI = z.infer<typeof ZodJob>;
export type Response = z.infer<typeof ResponseSchema>;

const ZodJob = z.object({
    job_id: z.string(),
    library_id: z.string(),
    num_docs: z.number(),
    source_type: z.string(),
    source_location: z.string(),
    status: z.nativeEnum(Status),
    start_time: z.string(),
    finish_time: z.string(),
    took_time: z.number(),
    notificaton_requested: z.string().optional(),
    msg: z.string().optional(),
});

const ResponseSchema = z
    .object({
        user_id: z.string(),
        jobs: z.array(ZodJob),
    })
    .strict();

export const jobs_list = async (params: Request) => {
    const res = await fetch(`${PythonPath}/jobs/list`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const jobsList: Response = ResponseSchema.parse(await res.json());
    log(jobsList, "jobs/list");
    return jobsList;
};
