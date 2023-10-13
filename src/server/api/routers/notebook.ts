import { z } from "zod";
import { AnyRouter, TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { Notebook, Reference, Topic } from "@prisma/client";

export const notebooksRouter = createTRPCRouter({
    createTopic: protectedProcedure
        .input(
            z.object({
                topicName: z.string().min(1, "Please enter a topic name!"),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const _ = await ctx.db.notebook.upsert({
                where: { userId: ctx.session.user.id },
                create: {
                    userId: ctx.session.user.id,
                    topics: {
                        create: {
                            name: input.topicName,
                            userId: ctx.session.user.id,
                        },
                    },
                },
                update: {
                    userId: ctx.session.user.id,
                    topics: {
                        create: {
                            name: input.topicName,
                            userId: ctx.session.user.id,
                        },
                    },
                },
            });

            return _;
        }),

    getNotebookData: protectedProcedure.query(async ({ ctx }) => {
        const topics: (Topic & { references: Reference[] })[] =
            await ctx.db.topic.findMany({
                where: { notebookUserId: ctx.session.user.id },
                include: {
                    references: { orderBy: { addedAt: "desc" } },
                    _count: true,
                },
            });

        return topics;
    }),

    removeTopic: protectedProcedure
        .input(
            z.object({
                topicId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }): Promise<Topic> => {
            const removed: Topic = await ctx.db.topic.delete({
                where: {
                    userId: ctx.session.user.id,
                    id: input.topicId,
                    notebookUserId: ctx.session.user.id,
                },
            });

            return removed;
        }),
});
