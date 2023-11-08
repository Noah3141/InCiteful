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
import { randomInt } from "crypto";

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

            if (res.msg == "No job with that job_id is active") {
                await ctx.db.job.update({
                    data: {
                        status: "FAILED",
                        message:
                            "Something went wrong with this job before it was cancelled.",
                    },
                    where: {
                        id: input.jobId,
                        libraryId: input.libraryId,
                        userId: ctx.session?.user.id,
                    },
                });

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Mis-sync!",
                });
            }

            if (!res.success) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `API returned 'success: false' to cancel job attempt: "${
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

    generateTestJob: protectedProcedure
        .input(z.object({ libraryId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const random = randomInt(0, 5);

            switch (random) {
                case 0:
                    const createdJob1: Job = await ctx.db.job.create({
                        data: {
                            status: Status.CANCELLED,
                            documentCount: randomInt(1, 30),
                            message:
                                "Created by random job function in admin panel",
                            libraryId: input.libraryId,
                            userId: ctx.session.user.id,
                        },
                    });
                    return createdJob1;
                case 1:
                    const createdJob2: Job = await ctx.db.job.create({
                        data: {
                            status: Status.COMPLETED,
                            documentCount: randomInt(1, 30),
                            message:
                                "Created by random job function in admin panel",
                            libraryId: input.libraryId,
                            userId: ctx.session.user.id,
                        },
                    });
                    return createdJob2;
                case 2:
                    const createdJob3: Job = await ctx.db.job.create({
                        data: {
                            status: Status.FAILED,
                            documentCount: randomInt(1, 30),
                            message:
                                "Created by random job function in admin panel",
                            libraryId: input.libraryId,
                            userId: ctx.session.user.id,
                        },
                    });
                    return createdJob3;
                case 3:
                    const createdJob4: Job = await ctx.db.job.create({
                        data: {
                            status: Status.PENDING,
                            documentCount: randomInt(1, 30),
                            message:
                                "Created by random job function in admin panel",
                            libraryId: input.libraryId,
                            userId: ctx.session.user.id,
                        },
                    });
                    return createdJob4;
                case 4:
                    const createdJob5: Job = await ctx.db.job.create({
                        data: {
                            status: Status.RUNNING,
                            documentCount: randomInt(1, 30),
                            message:
                                "Created by random job function in admin panel",
                            libraryId: input.libraryId,
                            userId: ctx.session.user.id,
                        },
                    });
                    return createdJob5;
                case 5:
                    const createdJob6: Job = await ctx.db.job.create({
                        data: {
                            status: Status.UNKNOWN,
                            documentCount: randomInt(1, 30),
                            message:
                                "Created by random job function in admin panel",
                            libraryId: input.libraryId,
                            userId: ctx.session.user.id,
                        },
                    });
                    return createdJob6;
            }

            throw new TRPCError({ code: "NOT_IMPLEMENTED" });
        }),
});
