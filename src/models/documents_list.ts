import { JsonHeaders, log, PythonPath } from "./all_request";

export type Request = {
    user_id: string;
    library_id?: string;
};

export type Response = {
    document_list: {
        authors: string[];
        doc_id: string;
        pub_date: string;
        pub_source: string;
        title: string;
    }[];
    library_id: string;
    msg?: string;
    success: boolean;
    user_id: string;
};

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
    return document_list;
};
