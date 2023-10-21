import { TRPCError } from "@trpc/server";
import { FileFormHeaders, log, PythonPath } from "./all_request";

export type Request = {
    user_id: string;
    library_id: string;
    file: Blob;
    filename: string;
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
    const { file, filename, ...body } = params;

    const formData = new FormData();
    formData.append("file", file, filename);
    for (const [key, value] of Object.entries(body)) {
        formData.append(key, value);
    }

    const res = await fetch(`${PythonPath}/documents/add`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: FileFormHeaders,
        body: formData,
    });
    console.log(await res.text());

    try {
        const document_added = (await res.json()) as Response;
        log(document_added, "documents/add");
        return document_added;
    } catch (error) {
        log(res.bodyUsed, "Failed to de-json from Python at documents/add");
        throw new TRPCError({ code: "CONFLICT" });
    }
};
