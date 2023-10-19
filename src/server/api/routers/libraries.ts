import { z } from "zod";
import { AnyRouter, TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { type Library, type Job, type Document } from "@prisma/client";

import {
    type Request as LibCreateReq,
    type Response as LibCreateRes,
} from "../../../models/libraries_create";
import { JsonHeaders, log, pythonPath } from "~/models/all_request";

const libraries_create = async (
    params: LibCreateReq,
): Promise<LibCreateRes> => {
    const res = await fetch(`${pythonPath}/libraries/create`, {
        method: "POST",
        mode: "cors",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const libraryCreatedRes = (await res.json()) as LibCreateRes;

    log(libraryCreatedRes, "libraries/create");
    return libraryCreatedRes;
};

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
                library_name: created.title,
                user_id: ctx.session.user.id,
            });

            // If the Python says something went wrong, undo our work to keep in sync
            if (!res.success) {
                const deleted: Library = await ctx.db.library.delete({
                    where: { id: created.id, title: created.title },
                });
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `API returned 'success: false' to create library attempt: ${
                        res.msg ?? "No message provided"
                    }`,
                });
            }

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
                orderBy: { status: "desc" },
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
});

export type LibraryDocsAndJobs = {
    jobs: Job[];
    documents: Document[];
    library: Library;
    notifyByEmail: string | null;
};
