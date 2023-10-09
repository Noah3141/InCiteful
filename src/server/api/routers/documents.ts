import { z } from "zod";
import { AnyRouter, TRPCError } from "@trpc/server";
import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

import { Document } from "@prisma/client";

/// Adding a document will involve sending the refernce link to the Python
export const documentsRouter: AnyRouter = createTRPCRouter({});
