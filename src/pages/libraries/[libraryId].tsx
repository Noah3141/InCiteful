// import "react-tooltip/dist/react-tooltip.css";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import { IoIosRemoveCircle, IoIosRemoveCircleOutline } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import Loading from "~/components/Loading";
import Hall from "~/layouts/Hall";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";
import { Document as Doc, Document } from "@prisma/client";
import Button from "~/components/Button";
import { LibraryDocsAndJobs } from "~/server/api/routers/libraries";
import { JobStatus } from "~/components/JobStatus";
const LibraryPage = () => {
    const router = useRouter();
    const pathId =
        typeof router.query.libraryId == "string" ? router.query.libraryId : "";

    const { data, isLoading } = api.library.getDocuments.useQuery({
        libraryId: pathId,
    });

    if (isLoading) {
        return (
            <Hall>
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
            <Hall>
                <div className="flex h-16 flex-row items-center justify-between px-16">
                    <h1 className="page-title"> </h1>
                    <DeleteLibrary libraryId={pathId} />
                </div>
                <AddDocumentWizard libraryId={data.library.title} />
            </Hall>
        );
    }

    if (!data?.library) {
        void router.push("/libraries");
        toast.error("No library found here!");
    } else
        return (
            <Hall>
                <div className="flex h-16 flex-row items-center justify-between px-16">
                    <h1 className="page-title">{data?.library.title}</h1>
                    <DeleteLibrary libraryId={pathId} />
                </div>
                <AddDocumentWizard libraryId={data.library.id} />
                <JobWizard data={data} />
                <DocumentList documents={data.documents} />
            </Hall>
        );
};

const DocumentList = ({ documents }: { documents: Document[] }) => {
    return (
        <div className="mt-8 border-y border-sand-300 px-16  py-8">
            <div>
                <h1 className=" text-xl">Documents</h1>
            </div>
            <div className="mt-8 max-h-96 overflow-y-scroll">
                {documents.length !== 0
                    ? documents.map((document: Doc) => {
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

const AddDocumentWizard = ({ libraryId }: { libraryId: string }) => {
    return (
        <div className="w-full">
            <div className="flex  justify-between border-sand-300 px-16 py-8">
                <input type="text" />
                <Button color="secondary" text="Upload File"></Button>
            </div>
            <div className="flex  justify-between border-sand-300 px-16 py-8">
                <input type="text" />
                <Button color="secondary" text="Upload Folder"></Button>
            </div>
        </div>
    );
};

const JobWizard = ({ data }: { data: LibraryDocsAndJobs }) => {
    return (
        <div className="border-t border-sand-300 px-16 py-8">
            <h1 className="text-xl">Jobs</h1>
            <div>
                {data.jobs.map((job) => {
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
                })}
            </div>
        </div>
    );
};
