import { JsonHeaders, log, PythonPath } from "./all_request";
import { type DocumentAPI } from "./documents_add";

export type Request = {
    user_id: string;
    library_id: string;
    query: string;
};

export type Response = {
    user_id: string;
    library_id: string;
    msg?: string;
    references: ReferenceAPI[];
    success: boolean;
};

export type ReferenceAPI = {
    doc_id: string;
    document: DocumentAPI;
    pre_text: string;
    focal_text: string;
    post_text: string;
    page_num: number;
    score: number;
    sentence_num: string;
};

export const query = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/query`, {
        method: "POST",
        mode: "cors",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    try {
        const query_res = (await res.json()) as Response;
        log(query_res, "/query");
        return query_res;
    } catch (error) {
        log(res, "/query response before json");
        throw new Error("Failed to parse data above as JSON");
    }
};
