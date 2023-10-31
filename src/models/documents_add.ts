import { TRPCError } from "@trpc/server";
import { FileFormHeaders, JsonHeaders, log, PythonPath } from "./all_request";
import { z } from "zod";

export type Request = {
    user_id: string;
    library_id: string;
    file: FileAPI;
};
// Wherever imported, marked with -API to indicate that it is a subordinate model of a Request, not the probably intended DB model
export type FileAPI = z.infer<typeof ZodFile>;
export type Response = z.infer<typeof ResponseSchema>;
export type DocumentAPI = z.infer<typeof ZodDocument>;

const ZodFile = z.object({
    contents: z.string(),
    filename: z.string(),
    size: z.number(),
});

export const ZodDocument = z.object({
    authors: z.array(z.string()),
    doc_id: z.string(),
    pub_date: z.string(), // todo NUMBER??
    pub_source: z.string(),
    title: z.string(),
});

const ResponseSchema = z
    .object({
        /// Filename
        added_file: z.string(),
        document: ZodDocument,
        library_id: z.string(),
        user_id: z.string(),
        msg: z.string().optional(),
        num_doclets: z.number(),
        success: z.boolean(),
        file: z.object({
            filename: z.string(),
            size: z.number(),
        }),
    })
    .strict();

export const documents_add = async (params: Request): Promise<Response> => {
    const res = await fetch(`${PythonPath}/documents/add`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: JsonHeaders,
        body: JSON.stringify(params),
    });

    const document_added = (await res.json()) as Response;
    log(document_added, "documents/add");
    ResponseSchema.parse(document_added);
    return document_added;
};
