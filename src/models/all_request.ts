export const JsonHeaders = {
    Authorization: "Bearer temp_api_key",
    "Content-Type": "application/json",
};

export const FileFormHeaders = {
    Authorization: "Bearer temp_api_key",
    "Content-Type": "multipart/form-data",
};

/// No final slash
export const pythonPath =
    "http://ec2-18-236-172-218.us-west-2.compute.amazonaws.com";

export enum SourceType {
    GoogleDrive = "google-drive",
    DropBox = "dropbox",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (data: any, label: string) => {
    console.log(`\n\n\n${label}\nPython data received: \n`, data, "\n");
};
