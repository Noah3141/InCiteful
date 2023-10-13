export type Request = {
    user_id: string;
    library_id: string;
    source_type: string;
    source_location: string;
    notify_by_email: string | null;
};

export type Response = {
    user_id: string;
    job_id: string;
    library_id: string;
    msg: string;
    notify_by_email: string | null;
    num_docs: number;
    est_duration: string;
    start_time: string;
    success: boolean;
};

// Request:
// ```
// {
//     "user_id": "2",
//     "library_name": "test7",
//     "source_type": "google-drive",
//     "source_location": "https://drive.google.com/drive/folders/1ejDcgTRUvk9Fcb4g3fFYXIMBgEIEihd-"
// }
// ```

// Response:
// ```
// {
//     "job_id" : "xyz1234"
//     library_name": "test7",
//     "msg": "",
//     "notify_email" : "asteckley@comcast.net",   // no notify if absent
//     "num_docs": 43  // optional... would require a bit longer turnaround on this request though
//     "est_duration": "24 min"  // optional... rough estimate of job duration based on num_docs
//     "start_time": "2023-10-10 12:38:43"   // This will be provided in end-user's timezone
//     "success": true,
//     "user_id": "2"
// }
