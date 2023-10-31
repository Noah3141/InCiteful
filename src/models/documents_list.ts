import { z } from "zod";
import { JsonHeaders, log, PythonPath } from "./all_request";
import { DocumentAPI, ZodDocument } from "./documents_add";

export type Request = {
    user_id: string;
    library_id?: string;
};

export type Response = {
    document_list: DocumentAPI[];
    library_id: string;
    msg?: string;
    success: boolean;
    user_id: string;
};

const ResponseSchema = z
    .object({
        documents_list: z.array(ZodDocument),
        library_id: z.string(),
        msg: z.string().optional(),
        success: z.boolean(),
        user_id: z.string(),
    })
    .strict();

export const documents_list = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/documents/list`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const document_list = (await res.json()) as Response;
    log(document_list, "documents/list");
    ResponseSchema.parse(document_list);
    return document_list;
};
