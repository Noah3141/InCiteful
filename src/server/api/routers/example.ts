import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { type User } from "@prisma/client";

export const exampleRouter = createTRPCRouter({
    ///  protectedProcedure = must be signed in to fire off
    ///  .input() takes in a zod declaration, like env.mjs. The idiomatic technique is to use a z.object() no matter what, pass it an object {}, and name the variables/parameters desired, providing self-explanatory API's.
    ///  .query() and .mutation() take an async callback function as input ()=>{}
    ///  the input variable here is an object, usually destructured into ctx and input. The value of input is declared in the previous .input(zod)
    declaredFunctionName: protectedProcedure

        .input(
            z.object({
                nameDeclaredHere: z
                    .number()
                    .min(0)
                    .max(100, "Please provide a number below 100!")
                    .nullable()
                    .optional(),
            }),
        )
        /// The type declared above is now made available in the callback below:
        .mutation(async ({ ctx, input }) => {
            // By default, most APIs are designed with objects, so that parameters are named
            const createdResource: User = await ctx.db.user.create({
                // That data which fills in the created user
                data: {}, // Here all fields declared in Prisma file are auto-suggested (once 'npx prisma db push' is run from command line with npm installed)
                include: {}, // "include" allows packaging subordinate or tethered data structures into the createdResource, in the form createdResource.includedResource[0].fieldName
            });

            if (!createdResource.id) {
                // TRPCErrors will show in the developer tools on the deployed site, while console.log() statements will only show in the terminal during "npm run dev"
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Something went wrong creating your user!",
                });
                /// This error is what will be passed forward and available in the callback function provided to the onError field in the {}input to "api.table.declaredFunctionName.useMutation({})"
            }

            return "";
        }),
});
