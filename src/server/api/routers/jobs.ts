import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { Status, type Job } from "@prisma/client";
import { jobs_list, type Response as JobsListRes } from "~/models/jobs/list";
import {
    jobs_cancel,
    type Response as CancelJobRes,
} from "~/models/jobs/cancel";

export const jobsRouter = createTRPCRouter({
    checkJob: protectedProcedure
        .input(z.object({ jobId: z.string() }))
        .query(async ({ ctx, input }) => {
            const jobsList: JobsListRes = await jobs_list({
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
                startedAt: z.date().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const endedAt =
                input.newStatus === ("CANCELLED" || "COMPLETED" || "FAILED")
                    ? new Date()
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
                    startedAt: input.startedAt,
                },
            });

            await ctx.db.notification.create({
                data: {
                    type: "JOB_UPDATE",
                    message: `Your job is now ${input.newStatus}`,
                    userId: input.userId,
                },
            });

            return updatedJob;
        }),

    cancel: protectedProcedure
        .input(
            z.object({
                libraryId: z.string(),
                jobId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const res: CancelJobRes = await jobs_cancel({
                job_id: input.jobId,
                library_id: input.libraryId,
                user_id: ctx.session.user.id,
            });

            if (!res.success) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `API returned 'success: false' to create library attempt: "${
                        res.error ?? "No message provided"
                    }"`,
                });
            }

            // todo) How do we want this to error

            const cancelled: Job = await ctx.db.job.update({
                data: {
                    status: "CANCELLED",
                    endedAt: new Date(),
                },
                where: {
                    id: input.jobId,
                    libraryId: input.libraryId,
                    userId: ctx.session?.user.id,
                },
            });

            return cancelled;
        }),
});
