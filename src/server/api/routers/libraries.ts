import { z } from "zod";
import { AnyRouter, TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { type Library, type Job, type Document } from "@prisma/client";

export const librariesRouter = createTRPCRouter({
    createEmpty: protectedProcedure
        .input(
            z.object({
                /// Signed in user
                title: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const created: Library = await ctx.db.library.create({
                data: {
                    userId: ctx.session.user.id,
                    title: input.title,
                },
            });
            return created;
        }),

    getAllSessions: protectedProcedure.query(async ({ ctx }) => {
        const libraries: Library[] = await ctx.db.library.findMany({
            where: { userId: ctx.session.user.id },
            orderBy: { documents: { _count: "desc" } },
        });

        return libraries;
    }),

    /// Get all available documents while checking for job statuses. Pass
    getDocuments: protectedProcedure
        .input(z.object({ libraryId: z.string() }))
        .query(async ({ ctx, input }): Promise<LibraryDocsAndJobs> => {
            const library: Library | null = await ctx.db.library.findUnique({
                where: { id: input.libraryId },
            });

            if (!library) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const jobStatuses: Job[] = await ctx.db.job.findMany({
                where: {
                    libraryId: input.libraryId,
                    userId: ctx.session.user.id,
                },
                orderBy: { status: "desc" },
            });

            const documents: Document[] = await ctx.db.document.findMany({
                where: { libraryId: input.libraryId },
            });

            return {
                jobStatuses,
                documents,
                library,
            };
        }),
});

type LibraryDocsAndJobs = {
    jobStatuses: Job[];
    documents: Document[];
    library: Library;
};
