export type Request = {
    user_id: string;
    library_id: string;
    file: Blob;
    ///
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
