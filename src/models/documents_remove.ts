export type Request = {
    user_id: string;
    library_id: string;
    doc_id: string;
};

export type Response = {
    library_name: string;
    msg?: string;
    success: boolean;
    user_id: string;
};
