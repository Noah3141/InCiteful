import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { JsonHeaders, log, pythonPath } from "~/models/all_request";

import {
    type Request as QueryReq,
    type Response as QueryRes,
} from "~/models/query";
import { type Reference, type Document } from "@prisma/client";

const query = async (params: QueryReq): Promise<QueryRes> => {
    const res = await fetch(`${pythonPath}/query`, {
        method: "POST",
        mode: "cors",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const query_res = (await res.json()) as QueryRes;

    log(query_res, "/query");
    return query_res;
};

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
            const dateTime = new Date().toISOString();
            const idList: string[] = [];
            const referenceData = res.references.map((reference) => {
                const refId = reference.focal_text + dateTime;
                idList.push(refId);
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
                    id: refId,
                };
            });
            // Convert and create references and pass THAT back to front end
            const references = await ctx.db.reference.createMany({
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
