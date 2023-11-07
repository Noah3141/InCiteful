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
        msg: z.string().optional(),
        endpoint: z.string(),
        error: z.string().optional(),
    })
    .strict();

export const libraries_remove = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/libraries/remove`, {
        method: "POST",
        mode: "cors",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const library_removed: Response = ResponseSchema.parse(await res.json());
    log(library_removed, "libraries/remove");

    return library_removed;
};
