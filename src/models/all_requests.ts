import { env } from "~/env.mjs";

export const JsonHeaders = {
    Authorization: "Bearer temp_api_key",
    "Content-Type": "application/json",
    Accept: "*/*",
};

export const FileFormHeaders: HeadersInit = {
    Authorization: "Bearer temp_api_key",

    //"Content-Type": "multipart/form-data", // Do not explicitly state when body is already going to be FormData, so that boundary can be inferred and added
    // Accept: "*/*",
    // "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    // "Access-Control-Allow-Headers":
    //     "origin,X-Requested-With,content-type,accept",
    // "Access-Control-Allow-Credentials": "true",
};

/// No final slash
export const PythonPath =
    "http://ec2-18-236-172-218.us-west-2.compute.amazonaws.com";

export enum SourceType {
    GoogleDrive = "google-drive",
    DropBox = "dropbox",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (data: any, label: string) => {
    console.log(
        `
    \n
    \n
    ${label}
    \n
    Python data received: 
    \n`,
        data,
        `
    \n
    \n
    `,
    );
};
