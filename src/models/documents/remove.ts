import { z } from "zod";
import { JsonHeaders, PythonPath, log } from "../all_requests";

export type Request = {
    user_id: string;
    library_id: string;
    document_id: string;
};

export type Response = z.infer<typeof ResponseSchema>;

const ResponseSchema = z.object({
    library_id: z.string(),
    user_id: z.string(),
    msg: z.string().optional(),
    error: z.string().optional(),
    success: z.boolean(),
});

export const documents_remove = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/documents/remove`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const document_list = (await res.json()) as Response;
    log(document_list, "documents/remove");
    ResponseSchema.parse(document_list);
    return document_list;
};
