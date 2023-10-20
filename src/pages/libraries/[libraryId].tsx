// import "react-tooltip/dist/react-tooltip.css";
import { useRouter } from "next/router";
import React, {
    DetailedHTMLProps,
    InputHTMLAttributes,
    useRef,
    useState,
} from "react";
import toast from "react-hot-toast";
import { IoIosRemoveCircle, IoIosRemoveCircleOutline } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import Loading from "~/components/Loading";
import Hall from "~/layouts/Hall";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";
import { type Document } from "@prisma/client";
import Button from "~/components/Button";
import { type LibraryDocsAndJobs } from "~/server/api/routers/libraries";
import { JobStatus } from "~/components/JobStatus";
import { SourceType } from "~/models/all_request";
//

const LibraryPage = () => {
    const router = useRouter();
    const pathId =
        typeof router.query.libraryId == "string" ? router.query.libraryId : "";

    const { data, isLoading } = api.library.getDocuments.useQuery({
        libraryId: pathId,
    });

    if (isLoading) {
        return (
            <Hall title="...">
                <div className="flex h-16 flex-row items-center justify-between px-16">
                    <h1 className="page-title"> </h1>
                    <DeleteLibrary libraryId={pathId} />
                </div>
                <Loading inline={false} color="secondary" />
            </Hall>
        );
    }

    if (!data?.documents && !!data?.library.title) {
        return (
            <Hall title={data.library.title}>
                <div className="flex h-16 flex-row items-center justify-between px-16">
                    <h1 className="page-title"> </h1>
                    <DeleteLibrary libraryId={pathId} />
                </div>
                <AddDocumentWizard
                    notifyByEmail={data.notifyByEmail}
                    libraryId={data.library.title}
                />
            </Hall>
        );
    }

    if (!data?.library) {
        void router.push("/libraries");
        toast.error("No library found here!");
    } else
        return (
            <Hall title={data.library.title}>
                <div className="flex h-16 flex-row items-center justify-between px-16">
                    <h1 className="page-title">{data?.library.title}</h1>
                    <DeleteLibrary libraryId={pathId} />
                </div>
                <AddDocumentWizard
                    notifyByEmail={data.notifyByEmail}
                    libraryId={data.library.id}
                />
                <JobWizard data={data} />
                <DocumentList documents={data.documents} />
            </Hall>
        );
};

const DocumentList = ({ documents }: { documents: Document[] }) => {
    return (
        <div className="border-y border-sand-300 px-16  py-6">
            <div>
                <h1 className=" text-xl">Documents</h1>
            </div>
            <div className="mt-8 max-h-96 overflow-y-scroll">
                {documents.length !== 0
                    ? documents.map((document: Document) => {
                          return (
                              <div key={document.id}>
                                  <div>{document.title}</div>
                                  <div>{dtfmt.format(document.createdAt)}</div>
                              </div>
                          );
                      })
                    : "No documents added yet"}
            </div>
        </div>
    );
};

export default LibraryPage;

type DeleteLibraryProps = {
    libraryId: string;
};

const DeleteLibrary = ({ libraryId }: DeleteLibraryProps) => {
    const trpc = api.useContext();
    const router = useRouter();
    const removedFromListsToastId = "removedFromListsToast";
    const { mutate: removeLibrary, isLoading } = api.library.remove.useMutation(
        {
            onMutate: () => {
                toast.loading("Removing list...💨", {
                    id: removedFromListsToastId,
                });
            },
            onSuccess: async () => {
                toast.success("Removed from saved lists!☁️", {
                    id: removedFromListsToastId,
                });
                await router.push("/libraries");
                await trpc.library.invalidate();
            },
            onError: () => {
                toast.error("Something went wrong!⛈️", {
                    id: removedFromListsToastId,
                });
            },
        },
    );
    return (
        <>
            <div
                data-tooltip-id="remove-library-button"
                data-tooltip-content="Delete this library"
                data-tooltip-variant="info"
                onClick={() => {
                    toast((t) => {
                        return (
                            <span className="text-primary-950 cursor-default text-center">
                                Sure you want to delete this library?
                                <div className="flex flex-row justify-between pt-3">
                                    <button
                                        onClick={() => {
                                            toast.dismiss(t.id);
                                        }}
                                    >
                                        Keep!📌
                                    </button>
                                    <button
                                        onClick={() => {
                                            removeLibrary({
                                                libraryId: libraryId,
                                            });
                                            toast.dismiss(t.id);
                                        }}
                                    >
                                        Remove!🗑️
                                    </button>
                                </div>
                            </span>
                        );
                    });
                }}
                className="group flex flex-row items-center"
            >
                <IoIosRemoveCircleOutline
                    size={30}
                    className="text-gable-800 group-hover:hidden"
                />
                <IoIosRemoveCircle
                    size={30}
                    className="hidden text-gable-800 group-hover:inline"
                />
            </div>
            <Tooltip
                place="right"
                delayShow={500}
                style={{ backgroundColor: "#1c1917" }}
                id="remove-library-button"
            />
        </>
    );
};

const AddDocumentWizard = ({
    libraryId,
    notifyByEmail,
}: {
    libraryId: string;
    notifyByEmail: string | null;
}) => {
    const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
    const [batchUrl, setBatchUrl] = useState<string>("");
    const [sourceType, sourceTypeDisplay] = parseForType(batchUrl);

    const addDocToast = "addDocToastId";
    const { mutate: addDocument, isLoading: singleLoading } =
        api.document.postOne.useMutation({
            onMutate: () => {
                toast.loading("Loading...", { id: addDocToast });
            },
            onSuccess: () => {
                toast.success("Success!", { id: addDocToast });
            },
            onError: () => {
                toast.error(`Something went wrong`, { id: addDocToast });
            },
        });

    const upload = () => {
        const file = uploadFiles?.item(0);
        const contents = (file as Blob).toString();
        addDocument({
            file: contents,
            libraryId: libraryId,
            filename: file?.name ?? "Not found",
        });
    };

    // Create a reference to the hidden file input element
    const hiddenFileInput = useRef<HTMLInputElement>(null);

    const addBatchToast = "addBatchToastId";
    const { mutate: addBatchDocument, isLoading: batchLoading } =
        api.document.postBatch.useMutation({
            onMutate: () => {
                toast.loading("Loading...", { id: addBatchToast });
            },
            onSuccess: () => {
                toast.success("Success!", { id: addBatchToast });
            },
            onError: () => {
                toast.error(`Something went wrong`, { id: addBatchToast });
            },
        });

    return (
        <div className="w-full py-6">
            <div className="px-16">
                <h1 className="text-xl">Add Documents</h1>
            </div>
            <div className="mt-8 flex flex-col gap-3">
                <div className="flex  h-full items-center justify-between border-sand-300 px-16">
                    <input
                        ref={hiddenFileInput}
                        className="hidden"
                        onChange={(e) => {
                            setUploadFiles(e.target.files);
                        }}
                        type="file"
                        placeholder="Upload a single file"
                    />
                    <div>
                        <Button
                            text="Select a single file"
                            color="neutral"
                            className="bg"
                            onClick={(e) => hiddenFileInput?.current?.click()}
                        />
                        <span className="ps-3">
                            {hiddenFileInput.current?.files?.item(0)?.name}
                        </span>
                    </div>
                    <Button
                        disabled={!uploadFiles}
                        onClick={upload}
                        className=""
                        color="secondary"
                        text="Upload File"
                    ></Button>
                </div>
                <div className="mt-6 flex h-full flex-col items-start justify-between gap-3 border-sand-300 px-16 lg:mt-0 lg:flex-row lg:items-center">
                    <div>
                        <input
                            className="h-full w-72 text-ellipsis rounded-sm p-1 px-2 outline-none hover:cursor-pointer hover:ring-1 hover:ring-tango-500 focus:cursor-text focus:ring-0"
                            type="text"
                            value={batchUrl}
                            onChange={(e) => {
                                setBatchUrl(e.target.value);
                            }}
                            placeholder="Provide a link to a folder of files"
                        />
                        <span className="ps-3">{sourceTypeDisplay}</span>
                    </div>
                    <Button
                        disabled={sourceType === null}
                        onClick={() => {
                            if (!!sourceType) {
                                addBatchDocument({
                                    batchUrl,
                                    libraryId,
                                    notifyByEmail,
                                    sourceType,
                                });
                            }
                        }}
                        className=" "
                        color="secondary"
                        text="Upload Folder"
                    ></Button>
                </div>
            </div>
        </div>
    );
};

const JobWizard = ({ data }: { data: LibraryDocsAndJobs }) => {
    return (
        <div className="border-t border-sand-300 px-16 py-6">
            <h1 className="text-xl">Jobs</h1>
            <div className="mt-8">
                {data.jobs.length !== 0
                    ? data.jobs.map((job) => {
                          return (
                              <div key={job.id}>
                                  <div className="flex flex-row justify-between">
                                      <div>{dtfmt.format(job.createdAt)}</div>
                                      <JobStatus status={job.status} />
                                  </div>
                                  <div>{job.message}</div>
                                  <div>
                                      Started:
                                      {job.startedAt
                                          ? dtfmt.format(job.startedAt)
                                          : "Not yet"}
                                  </div>
                                  <div>
                                      Finished:
                                      {job.endedAt
                                          ? dtfmt.format(job.endedAt)
                                          : "Not yet"}
                                  </div>
                                  <div>Cost:</div>
                              </div>
                          );
                      })
                    : "No jobs"}
            </div>
        </div>
    );
};

/// SourceType is the Data parsed form, string is the display form shown
const parseForType = (url: string): [SourceType | null, string] => {
    if (url === "") return [null, ""];

    if (url.includes("google.com/drive/u/0/folders/")) {
        toast.error(
            `Please do not use the searchbar URL, instead use: \n"Share > Get link > Copy Link" `,
            { duration: 10_000, id: "Wrong Dropbox Link Toast" },
        );
        return [null, "Not a valid URL"];
    }

    if (url.includes("https://drive.google.com/drive")) {
        return [SourceType.GoogleDrive, "Google Drive"];
    } else {
        return [null, "Not a valid URL"];
    }
};
