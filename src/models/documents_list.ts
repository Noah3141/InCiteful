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
