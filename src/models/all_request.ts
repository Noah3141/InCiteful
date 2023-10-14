export const JsonHeaders = {
    Authorization: "Bearer Token temp_api_key",
    "Content-Type": "application/json",
};

export const FileFormHeaders = {
    Authorization: "Bearer temp_api_key",
    "Content-Type": "multipart/form-data",
};

/// No final slash
export const pythonPath = "https://api.agify.io/?name=meelad";

export enum SourceType {
    GoogleDrive = "google-drive",
    DropBox = "dropbox",
}
