import { type Status } from "@prisma/client";
import { JsonHeaders, log, PythonPath } from "./all_request";

export type Request = {
    user_id: string;
};

export type Response = {
    user_id: string;
    jobs: JobAPI[];
};

export type JobAPI = {
    job_id: string;
    library_id: string;
    num_docs: number;
    source_type: string;
    source_location: string;
    status: Status;
    start_time: string;
    finish_time: string;
    took_time: number;
    notificaton_requested?: string;
    msg: string;
};

export const jobs_list = async (params: Request) => {
    const res = await fetch(`${PythonPath}/jobs/list`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const jobsList = (await res.json()) as Response;

    log(jobsList, "jobs/list");

    return jobsList;
};
