export const JsonHeaders = {
    Authorization: "Bearer Token temp_api_key",
    "Content-Type": "application/json",
};

export const FileFormHeaders = {
    Authorization: "Bearer temp_api_key",
    "Content-Type": "multipart/form-data",
};

/// No final slash
export const pythonPath = "ec2-18-236-172-218.us-west-2.compute.amazonaws.com";

export enum SourceType {
    GoogleDrive = "google-drive",
    DropBox = "dropbox",
}
