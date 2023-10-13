export type Request = {
    user_id: string;
    library_id: string;
    library_name: string;
};

export type Response = {
    library_id: string;
    library_name: string;
    success: boolean;
    msg?: string;
};
