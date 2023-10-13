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
                <AddDocumentWizard libraryId={data.library.title} />
                <DocumentList documents={data.documents} />
            </Hall>
        );
};

const DocumentList = ({ documents }: { documents: Document[] }) => {
    return (
        <div className="max-h-96 overflow-y-scroll">
            {documents.map((document: Doc) => {
                return (
                    <div key={document.id}>
                        <div>{document.title}</div>
                        <div>{dtfmt.format(document.createdAt)}</div>
                    </div>
                );
            })}
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
    return <div>Foo</div>;
};
