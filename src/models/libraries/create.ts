import { z } from "zod";
import { JsonHeaders, log, PythonPath } from "../all_requests";

export type Request = {
    user_id: string;
    library_id: string;
};

export type Response = z.infer<typeof ResponseSchema>;

const ResponseSchema = z
    .object({
        library_id: z.string(),
        user_id: z.string(),
        success: z.boolean(),
        msg: z.string().optional(),
        error: z.string().optional(),
    })
    .strict();

export const libraries_create = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/libraries/create`, {
        method: "POST",
        mode: "cors",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const library_created: Response = ResponseSchema.parse(await res.json());
    log(library_created, "libraries/create");

    return library_created;
};
