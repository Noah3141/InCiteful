import { JsonHeaders, log, PythonPath } from "./all_request";
import { type FileAPI } from "./documents_add";

export type Request = {
    user_id: string;
    library_id: string;
    files: FileAPI[];
    notify_by_email: string | null;
};

export type Response = {
    user_id: string;
    job_id: string;
    library_id: string;
    msg: string;
    notify_by_email: string | null;
    num_docs: number;
    est_duration: string;
    start_time: string;
    success: boolean;
};

//todo) This is now supposed to be a formData with many files

export const jobs_add = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/jobs/add`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const addedJob = (await res.json()) as Response;

    log(addedJob, "jobs/add");
    return addedJob;
};
