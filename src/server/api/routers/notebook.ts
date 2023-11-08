import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { type Topic } from "@prisma/client";
import { TRPCError } from "@trpc/server";

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
        const topics = await ctx.db.topic.findMany({
            where: { notebookUserId: ctx.session.user.id },
            include: {
                references: {
                    orderBy: { addedAt: "desc" },
                    include: { document: true, authors: true },
                },
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

    addToTopic: protectedProcedure
        .input(z.object({ topicId: z.string(), referenceId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.topic.update({
                where: { id: input.topicId },
                data: { references: { connect: { id: input.referenceId } } },
            });
        }),

    getTopicNotes: protectedProcedure
        .input(z.object({ topicId: z.string() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.topic.findUnique({
                where: {
                    id: input.topicId,
                    userId: ctx.session.user.id,
                },
            });
        }),

    updateTopicNotes: protectedProcedure
        .input(z.object({ topicId: z.string(), notes: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (input.notes.length > 50_000) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Note field is too long!",
                });
            }

            return await ctx.db.topic.update({
                where: { id: input.topicId },
                data: {
                    notes: input.notes,
                },
            });
        }),

    updateReferenceNotes: protectedProcedure
        .input(z.object({ referenceId: z.string(), notes: z.string() }))
        .mutation(async ({ ctx, input }) => {
            if (input.notes.length > 50_000) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Note field is too long!",
                });
            }

            return await ctx.db.reference.update({
                where: { id: input.referenceId },
                data: {
                    notes: input.notes,
                },
            });
        }),
});
