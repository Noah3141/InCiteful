import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { type Library, type Job, type Document } from "@prisma/client";

import { libraries_create } from "~/models/libraries/create";

export const librariesRouter = createTRPCRouter({
    createEmpty: protectedProcedure
        .input(
            z.object({
                /// Signed in user
                title: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            //
            // Tell user to make non empty name, passing error to toast
            if (input.title === "") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Please enter a title!",
                });
            }
            const otherLibrariesWithName: Library[] =
                await ctx.db.library.findMany({
                    where: { userId: ctx.session.user.id, title: input.title },
                });

            // Tell user to make unique name
            if (otherLibrariesWithName.length > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Please choose a unique library name",
                });
            }

            const created: Library = await ctx.db.library.create({
                data: {
                    userId: ctx.session.user.id,
                    title: input.title,
                },
            });

            // Alert the Python
            const res = await libraries_create({
                library_id: created.id,
                user_id: ctx.session.user.id,
            });

            // If the Python says something went wrong, undo our work to keep in sync
            if (!res.success) {
                await ctx.db.library.delete({
                    where: {
                        id: created.id,
                        title: created.title,
                        userId: ctx.session.user.id,
                    },
                });
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `API returned 'success: false' to create library attempt: "${
                        res.error ?? "No message provided"
                    }"`,
                });
            }

            return created;
        }),

    getAllSessions: protectedProcedure.query(async ({ ctx }) => {
        const libraries = await ctx.db.library.findMany({
            where: { userId: ctx.session.user.id },
            orderBy: { documents: { _count: "desc" } },
            include: { _count: { select: { documents: true } } },
        });

        return libraries;
    }),

    getAllDashboard: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.library.findMany({
            where: { userId: ctx.session.user.id },
            include: {
                _count: true,
                jobs: true,
            },
        });
    }),

    /// Get all available documents while checking for job statuses. Pass
    getDocuments: protectedProcedure
        .input(z.object({ libraryId: z.string() }))
        .query(async ({ ctx, input }): Promise<LibraryDocsAndJobs> => {
            const library = await ctx.db.library.findUnique({
                where: { id: input.libraryId },
                include: { User: { select: { notifyByEmail: true } } },
            });

            if (!library) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: `Prisma lacked the specified library ID: ${input.libraryId}`,
                });
            }

            const jobs: Job[] = await ctx.db.job.findMany({
                where: {
                    libraryId: input.libraryId,
                    userId: ctx.session.user.id,
                },
                orderBy: { status: "asc" },
            });

            const documents: Document[] = await ctx.db.document.findMany({
                where: { libraryId: input.libraryId },
            });

            const user = (await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { notifyByEmail: true },
            })) ?? { notifyByEmail: null };

            return {
                jobs,
                documents,
                library,
                notifyByEmail: user.notifyByEmail,
            };
        }),

    remove: protectedProcedure
        .input(z.object({ libraryId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const removed: Library = await ctx.db.library.delete({
                where: { id: input.libraryId, userId: ctx.session.user.id },
            });

            return removed;
        }),

    updateTitle: protectedProcedure
        .input(z.object({ title: z.string(), libraryId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const updatedLibrary: Library = await ctx.db.library.update({
                where: { userId: ctx.session.user.id, id: input.libraryId },
                data: {
                    title: input.title,
                },
            });
            return updatedLibrary;
        }),
});

export type LibraryDocsAndJobs = {
    jobs: Job[];
    documents: Document[];
    library: Library;
    notifyByEmail: string | null;
};
