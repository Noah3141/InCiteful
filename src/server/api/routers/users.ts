import { z } from "zod";
import { AnyRouter, TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { Membership, Role, type User } from "@prisma/client";

export const usersRouter = createTRPCRouter({
    getSession: protectedProcedure.query(async ({ ctx }) => {
        const user: User | null = await ctx.db.user.findUnique({
            where: { id: ctx.session.user.id },
            include: {
                jobs: true,
            },
        });

        if (!user) {
            throw new TRPCError({
                code: "PRECONDITION_FAILED",
                cause: "Signed in user not found by own ID",
            });
        }

        return user;
    }),

    updateSession: protectedProcedure
        .input(
            z.object({
                email: z.string().nullable(),
                name: z.string().nullable(),
                image: z.string().nullable(),
                notifyByEmail: z.string().nullable(),
            }),
        )
        .mutation(async ({ ctx, input }): Promise<User> => {
            const user: User = await ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data: {
                    email: input.email ?? undefined,
                    name: input.name ?? undefined,
                    image: input.image ?? undefined,
                    notifyByEmail: input.notifyByEmail,
                },
            });

            return user;
        }),

    getDashboardData: protectedProcedure.query(async ({ ctx }) => {
        const dashboardData = await ctx.db.user.findUnique({
            where: { id: ctx.session.user.id },
            include: {
                jobs: { orderBy: [{ status: "desc" }, { createdAt: "desc" }] },
                libraries: {
                    orderBy: { updatedAt: "desc" },
                    include: {
                        documents: { orderBy: { createdAt: "desc" } },
                        jobs: {
                            orderBy: [
                                { status: "desc" },
                                { createdAt: "desc" },
                            ],
                        },
                    },
                },
                topics: {
                    orderBy: { updatedAt: { sort: "desc", nulls: "last" } },
                    include: { references: true },
                },
            },
        });

        return dashboardData;
    }),

    getAdminPanel: protectedProcedure
        .input(
            z.object({
                membership: z.nativeEnum(Membership).optional(),
                role: z.nativeEnum(Role).optional(),
                createdAfter: z.date().optional(),
                email: z.string().optional(),
            }),
        )
        .query(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "Admin") {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            const data = await ctx.db.user.findMany({
                include: {
                    _count: true,
                    jobs: true,
                    libraries: {
                        include: {
                            _count: true,
                            documents: true,
                        },
                    },
                    sessions: true,
                    accounts: true,
                },
                orderBy: { createdAt: "desc" },
                where: {
                    membership: input.membership,
                    email: input.email,
                    role: input.role,
                    createdAt: { gt: input.createdAfter },
                },
            });

            return data;
        }),
});
