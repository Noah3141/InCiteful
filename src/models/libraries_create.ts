import { JsonHeaders, log, PythonPath } from "./all_request";

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

export const libraries_create = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/libraries/create`, {
        method: "POST",
        mode: "cors",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const library_created = (await res.json()) as Response;

    log(library_created, "libraries/create");
    return library_created;
};
