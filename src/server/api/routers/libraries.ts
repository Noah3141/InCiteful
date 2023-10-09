import { z } from "zod";
import { AnyRouter, TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { Library } from "@prisma/client";

export const librariesRouter: AnyRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                /// Signed in user
                userId: z.string(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            return "foo";
        }),
});
