import { TRPCError } from "@trpc/server";
import { FileFormHeaders, JsonHeaders, log, PythonPath } from "./all_request";
import { z } from "zod";

export type Request = {
    user_id: string;
    library_id: string;
    file: FileAPI;
};
// Wherever imported, marked with -API to indicate that it is a subordinate model of a Request, not the probably intended DB model
export type FileAPI = {
    contents: string;
    filename: string;
    size: number;
};

export type Response = {
    added_file: string;
    document: DocumentAPI;
    library_id: string;
    user_id: string;
    msg?: string;
    num_doclets: number;
    success: boolean;
};

export type DocumentAPI = {
    authors: string[];
    doc_id: string;
    pub_date: string;
    pub_source: string;
    title: string;
};

export const documents_add = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/documents/add`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    try {
        const document_added = (await res.json()) as Response;
        log(document_added, "documents/add");
        return document_added;
    } catch (error) {
        log(res, "Failed to parse JSON, from this response:");
        throw new Error("Document add fail");
    }
};
