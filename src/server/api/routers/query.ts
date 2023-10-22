import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createId } from "@paralleldrive/cuid2";
import { query } from "~/models/query";
import { type Reference, type Document } from "@prisma/client";

export const queryRouter = createTRPCRouter({
    send: protectedProcedure
        .input(z.object({ libraryId: z.string(), query: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const res = await query({
                library_id: input.libraryId,
                query: input.query,
                user_id: ctx.session.user.id,
            });

            if (!res.success) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `API returned 'success: false' to query: "${
                        res.msg ?? "No message provided"
                    }"`,
                });
            }

            if (res.msg?.includes("Library contains no documents")) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Library doesn't have any documents to search!",
                });
            }

            const idList: string[] = [];
            const referenceData = res.references.map((reference) => {
                const referenceId = createId();
                idList.push(referenceId);
                return {
                    notebookUserId: ctx.session.user.id,
                    userId: ctx.session.user.id,
                    documentId: reference.document.doc_id,

                    focalText: reference.focal_text,
                    postText: reference.post_text,
                    preText: reference.pre_text,

                    score: reference.score,
                    sentenceNumber: parseInt(reference.sentence_num),
                    pageNumber: reference.page_num,
                    id: referenceId,
                };
            });
            // Convert and create references and pass THAT back to front end
            await ctx.db.reference.createMany({
                data: referenceData,
            });

            const created: ReferencesWithDocuments =
                await ctx.db.reference.findMany({
                    where: { id: { in: idList } },
                    include: { document: true },
                });
            return created;
        }),
});

export type ReferencesWithDocuments = (Reference & { document: Document })[];
