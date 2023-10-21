import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { Status, type Job } from "@prisma/client";
import { jobs_list } from "~/models/jobs_list";

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

    updateJob: publicProcedure
        .input(
            z.object({
                newStatus: z.nativeEnum(Status),
                userId: z.string(),
                libraryId: z.string(),
                jobId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const endedAt =
                input.newStatus === ("CANCELLED" || "COMPLETED" || "FAILED")
                    ? new Date() //todo THIS CAN BE PASSED BY PYTHON TO API TO MUTATE TO INPUT TO HERE, WHICH WILL NEED TO HAPPEN TO GET STARTED & ENDED VS CREATED
                    : undefined;

            const updatedJob: Job = await ctx.db.job.update({
                where: {
                    id: input.jobId,
                    userId: input.userId,
                    libraryId: input.libraryId,
                },
                data: {
                    status: input.newStatus,
                    endedAt: endedAt,
                },
            });

            return updatedJob;
        }),
});
