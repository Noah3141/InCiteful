import { z } from "zod";
import { AnyRouter, TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { User } from "@prisma/client";

export const usersRouter = createTRPCRouter({});
