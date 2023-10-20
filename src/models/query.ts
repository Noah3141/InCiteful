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
