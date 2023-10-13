import { z } from "zod";
import { AnyRouter, TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { Job, Status } from "@prisma/client";

import {
    type Request as JobsListReq,
    type Response as JobsListRes,
} from "../../../models/jobs_list";
import { JsonHeaders, pythonPath } from "~/models/all_request";

const jobs_list = async (params: JobsListReq) => {
    const res = await fetch(`${pythonPath}/jobs/list`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const jobsList = (await res.json()) as JobsListRes;

    return jobsList;
};

export const jobsRouter = createTRPCRouter({
    checkJob: protectedProcedure
        .input(z.object({ jobId: z.string() }))
        .query(async ({ ctx, input }) => {
            const jobsList = await jobs_list({
                user_id: ctx.session.user.id,
            });

            const jobInQuestion = jobsList.jobs.find(
                (job) => job.job_id == input.jobId,
            );

            if (!jobInQuestion) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return jobInQuestion;
        }),
});

// Add a job (fetch + note in my db)
// Check job (fetch + update my db) [trigger through stay-open-connection ]
