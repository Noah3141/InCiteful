import { type Status } from "@prisma/client";

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
    notificaton_requested?: string;
    msg: string;
};
