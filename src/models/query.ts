import { z } from "zod";
import { JsonHeaders, log, PythonPath } from "./all_request";
import { ZodDocument, type DocumentAPI } from "./documents_add";

export type Request = {
    user_id: string;
    library_id: string;
    query: string;
};

export type ReferenceAPI = z.infer<typeof ZodReference>;
export type Response = z.infer<typeof ResponseSchema>;

const ZodReference = z
    .object({
        doc_id: z.string(),
        document: ZodDocument,
        pre_text: z.string(),
        focal_text: z.string(),
        post_text: z.string(),
        page_num: z.number(),
        score: z.number(),
        sentence_num: z.string(),
    })
    .strict();
const ResponseSchema = z.object({
    user_id: z.string(),
    library_id: z.string(),
    msg: z.string().optional(),
    references: z.array(ZodReference),
    success: z.boolean(),
});

export const query = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/query`, {
        method: "POST",
        mode: "cors",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const query_res = (await res.json()) as Response;
    log(res, "/query response before json");
    return query_res;
};
