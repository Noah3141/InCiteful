// import "react-tooltip/dist/react-tooltip.css";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoIosRemoveCircle, IoIosRemoveCircleOutline } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import Loading from "~/components/Loading";
import Hall from "~/layouts/Hall";
import { api } from "~/utils/api";
import { defaultOpts, dateTimeFormatter as dtfmt } from "~/utils/tools";
import { Status, type Document, Library } from "@prisma/client";
import Button from "~/components/Button";
import { type LibraryDocsAndJobs } from "~/server/api/routers/libraries";
import { JobStatus, toTitleCase } from "~/components/JobStatus";
import { type FileAPI } from "~/models/documents/add";
import Arrow from "~/images/icons/Arrow";
import Link from "next/link";
import { BiEditAlt, BiSolidCheckCircle } from "react-icons/bi";
import { IoCloseCircle } from "react-icons/io5";
import { thinTooltipStyles } from "~/styles/tooltips";
import { TRPCClientError } from "@trpc/client";
import HoverEdit from "~/components/HoverEdit";
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
            <Hall className="text-sand-950" title="...">
                <div className="flex h-16 flex-row items-center justify-between px-4 sm:px-16">
                    <h1 className="page-title"></h1>
                </div>
                <Loading inline={false} color="secondary" />
            </Hall>
        );
    }

    if (!data?.documents && !!data?.library.title) {
        return (
            <Hall className="text-sand-950" title={data.library.title}>
                <div className="flex h-16 flex-row items-center justify-between px-4 sm:px-16">
                    <h1 className="page-title"></h1>
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
            <Hall className="text-sand-950" title={data.library.title}>
                <div className="flex  flex-row items-start justify-between px-4  sm:px-16">
                    <LibraryTitle library={data.library} />
                    <div className="pt-2">
                        <DeleteLibrary libraryId={pathId} />
                    </div>
                </div>
                <AddDocumentWizard
                    notifyByEmail={data.notifyByEmail}
                    libraryId={data.library.id}
                />
                <JobWizard data={data} />
                <DocumentList documents={data.documents} />
                <div className="h-16"></div>
            </Hall>
        );
};

function LibraryTitle({ library }: { library: Library }) {
    const trpc = api.useContext();
    const [titleForm, setTitleForm] = useState(library.title);
    const [titleEditting, setTitleEditting] = useState(false);
    const updateLibraryTitleToast = "UpdateLibraryTitleToastID";
    const { mutate: updateLibraryTitle, isLoading: titleUpdating } =
        api.library.updateTitle.useMutation({
            onMutate: () => {
                toast.loading("Updating title...", {
                    id: updateLibraryTitleToast,
                });
            },
            onSuccess: async () => {
                toast.success("Title updated!", {
                    id: updateLibraryTitleToast,
                });
                await trpc.library.invalidate();
                setTitleEditting(false);
            },
            onError: (e) => {
                if (e.data?.code == "BAD_REQUEST") {
                    toast.error(e.message, {
                        id: updateLibraryTitleToast,
                    });
                    return;
                }
                toast.error("Something went wrong!", {
                    id: updateLibraryTitleToast,
                });
            },
        });

    if (titleEditting) {
        return (
            <div className="mb-6 flex flex-row gap-3">
                <input
                    type="text"
                    value={titleForm}
                    onChange={(e) => {
                        setTitleForm(e.target.value);
                    }}
                    className="w-full rounded-lg bg-sand-50 px-2 py-2 outline-none selection:bg-sand-200"
                />
                <div
                    onClick={() => {
                        updateLibraryTitle({
                            libraryId: library.id,
                            title: titleForm,
                        });
                    }}
                    className="grid items-center justify-center text-sand-950 hover:cursor-pointer hover:text-sand-900"
                >
                    <BiSolidCheckCircle size={24} />
                </div>
                <div
                    onClick={() => {
                        setTitleForm(library.title);
                        setTitleEditting(false);
                    }}
                    className="grid items-center justify-center text-sand-950 hover:cursor-pointer hover:text-sand-900"
                >
                    <IoCloseCircle size={24} />
                </div>
            </div>
        );
    } else
        return (
            <HoverEdit
                editEvent={() => {
                    setTitleEditting(true);
                }}
                cursorHover
                iconClasses="-translate-y-6"
            >
                <h1 className="page-title max-w-full overflow-x-clip overflow-y-visible text-ellipsis">
                    {library.title}
                </h1>
            </HoverEdit>
        );
}

const DocumentList = ({ documents }: { documents: Document[] }) => {
    return (
        <div className="mb-36 border-y border-sand-300 px-4 py-6 transition-all  sm:px-16">
            <div className="flex flex-row items-center">
                <h1 className=" text-2xl">
                    Documents{documents.length > 0 && `: ${documents.length}`}
                </h1>
            </div>
            <div className="mt-4 flex max-h-96 flex-col gap-1 ">
                {documents.length !== 0
                    ? documents.map((document: Document, i) => (
                          <DocumentRow key={i} i={i} document={document} />
                      ))
                    : "No documents added yet"}
            </div>
        </div>
    );
};

export default LibraryPage;

type DocumentUpdateForm = {
    link: string;
    notes: string;
};

function DocumentRow({ document, i }: { document: Document; i: number }) {
    const trpc = api.useContext();
    const removeDocumentToast = "removeDocumentToastId";
    const { mutate: removeDocument, isLoading: docRemoving } =
        api.document.remove.useMutation({
            onMutate: () => {
                toast.loading("Removing document...", {
                    id: removeDocumentToast,
                });
            },
            onSuccess: async () => {
                toast.success("Document removed from library!", {
                    id: removeDocumentToast,
                });
                await trpc.document.invalidate();
                await trpc.library.invalidate();
            },
            onError: () => {
                toast.error("Something went wrong!", {
                    id: removeDocumentToast,
                });
            },
        });

    const [expanded, setExpanded] = useState(false);
    const [editting, setEditting] = useState(false);

    const [docUpdateForm, setDocUpdateForm] = useState<DocumentUpdateForm>({
        link: document.link ?? "",
        notes: document.notes ?? "",
    });

    const documentUpdateToast = "DocumentUpdateToastId";
    const { mutate: submitDocForm, isLoading: docFormUpdating } =
        api.document.updateForm.useMutation({
            onMutate: () => {
                toast.loading("Updating document...", {
                    id: documentUpdateToast,
                });
            },
            onError: (e) => {
                if (e.data?.code == "BAD_REQUEST") {
                    void toast.error(e.message, { id: documentUpdateToast });
                    return;
                }
                toast.error("Something went wrong!", {
                    id: documentUpdateToast,
                });
            },
            onSuccess: async () => {
                toast.success("Document updated!", { id: documentUpdateToast });
                await trpc.library.invalidate();
                await trpc.document.invalidate();
            },
        });

    const title = document.link ? (
        <Link
            data-tooltip-place="left"
            data-tooltip-delay-show={300}
            data-tooltip-id={`doc-link-${i}`}
            target="_blank"
            className="text-gable-600 hover:text-gable-700 hover:underline"
            href={document.link}
        >
            {document.title}
            <Tooltip style={thinTooltipStyles} id={`doc-link-${i}`}>
                <span>Open in new tab</span>
            </Tooltip>
        </Link>
    ) : (
        <span className="">{document.title}</span>
    );

    return (
        <div
            key={document.id}
            className={`group/row ${
                expanded ? "my-1" : "cursor-pointer"
            } rounded-[20px] bg-sand-200 shadow-md transition-all  hover:bg-sand-100 `}
        >
            <div
                onClick={() => {
                    setExpanded(true);
                }}
                className="flex flex-row justify-between px-3 py-1"
            >
                <div className="flex flex-row items-center">
                    <div>
                        <span>{title}</span>
                        <span className="ps-2 font-medium">
                            ({document.publicationSource})
                        </span>
                    </div>
                </div>
                <div
                    id={`clickEdit-${i}`}
                    className={` group relative z-20 
                        ms-2 grid h-8 w-8 shrink-0 items-center justify-center   
                    
                        ${
                            editting
                                ? "after:bg-baltic-700"
                                : "after:scale-0 after:bg-baltic-800 after:opacity-25 hover:after:scale-100"
                        }
                        after:absolute after:left-0 after:top-0 after:z-0 after:h-8 after:w-8  after:rounded-full   after:transition-all 

                    `}
                >
                    <div
                        className={`transition-opacity ${
                            editting
                                ? "opacity-100 duration-0"
                                : " duration-150 group-hover/row:opacity-100 group-focus:opacity-100 sm:opacity-0"
                        }`}
                    >
                        <BiEditAlt
                            className={`relative z-30 transition-colors   ${
                                editting ? "text-baltic-50 " : "text-sand-950 "
                            }`}
                            size={24}
                        />
                    </div>
                    <Tooltip
                        style={{
                            borderRadius: "8px",
                            background: "rgb(245 230 214)",
                            boxShadow: " 0px 10px 15px rgb(0,0,0,.15)",
                            maxWidth: "95vw",
                        }}
                        border={"1px solid rgb(65 60 80)"}
                        openOnClick
                        opacity={1}
                        anchorSelect={`#clickEdit-${i}`}
                        clickable
                        afterHide={() => {
                            setEditting(false);
                        }}
                        afterShow={() => {
                            setEditting(true);
                        }}
                        className=""
                    >
                        <div className="flex flex-col gap-3 divide-y divide-baltic-800  pt-2 text-baltic-950 ">
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-row  items-center gap-2 ">
                                    <span className="w-10">Link:</span>
                                    <input
                                        value={docUpdateForm.link}
                                        onChange={(e) => {
                                            setDocUpdateForm((p) => ({
                                                ...p,
                                                link: e.target.value,
                                            }));
                                        }}
                                        className="w-full rounded-md bg-baltic-800 px-2 py-1 text-baltic-50 caret-tango-500 outline-none  hover:cursor-pointer hover:bg-baltic-900 focus:cursor-text focus:bg-baltic-800 "
                                        type="url"
                                        name=""
                                        id=""
                                    />
                                </div>
                                <div className="flex flex-row justify-between gap-1">
                                    <span className="w-10">Notes: </span>
                                    <textarea
                                        value={docUpdateForm.notes}
                                        onChange={(e) => {
                                            setDocUpdateForm((p) => ({
                                                ...p,
                                                notes: e.target.value,
                                            }));
                                        }}
                                        className="baltic-scroller h-40 w-[450px] resize-none overflow-y-auto  whitespace-pre-wrap rounded-lg bg-baltic-800 p-2 text-baltic-50 caret-tango-500 outline-none"
                                        id=""
                                    ></textarea>
                                </div>
                                <div className="mt-2 flex flex-row justify-end">
                                    <Button
                                        onClick={() => {
                                            const link =
                                                docUpdateForm.link !== ""
                                                    ? docUpdateForm.link
                                                    : null;

                                            const notes =
                                                docUpdateForm.notes !== ""
                                                    ? docUpdateForm.notes
                                                    : null;

                                            submitDocForm({
                                                documentId: document.id,
                                                libraryId: document.libraryId,
                                                link,
                                                notes,
                                            });
                                        }}
                                        loading={docFormUpdating}
                                        text="Submit"
                                        small
                                        color="neutral"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row justify-center">
                                <Button
                                    loading={docRemoving}
                                    onClick={() => {
                                        toast((t) => {
                                            return (
                                                <span className="cursor-default text-center text-neutral-950">
                                                    Remove this document?
                                                    <div className="flex flex-row justify-between pt-3">
                                                        <button
                                                            onClick={() => {
                                                                toast.dismiss(
                                                                    t.id,
                                                                );
                                                            }}
                                                        >
                                                            Keep!🗃️
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                removeDocument({
                                                                    documentId:
                                                                        document.id,
                                                                    libraryId:
                                                                        document.libraryId,
                                                                });
                                                                toast.dismiss(
                                                                    t.id,
                                                                );
                                                            }}
                                                        >
                                                            Remove!🪓
                                                        </button>
                                                    </div>
                                                </span>
                                            );
                                        });
                                    }}
                                    className="mt-3 self-end"
                                    small
                                    color="neutral"
                                    text="Remove Document"
                                />
                            </div>
                        </div>
                    </Tooltip>
                </div>
            </div>

            <div
                className={`sand-scroller whitespace-pre-wrap px-5 font-medium transition-all ${
                    expanded
                        ? ` overflow-y-auto pb-2 ${
                              document.notes ? "h-60" : "h-28" // expanded with notes vs without
                          } `
                        : "h-0 overflow-hidden"
                }`}
            >
                <div>
                    <span className="inline-block w-24">Added:</span>
                    <span>{dtfmt.format(document.createdAt)}</span>
                </div>
                <div>
                    <span className="inline-block w-24">Published: </span>
                    <span>
                        {document.publishedAt
                            ? dtfmt.format(document.publishedAt)
                            : "Not found"}
                    </span>
                </div>
                <div>
                    <span className="inline-block w-24">Link: </span>
                    <span>{document.link ?? "None"}</span>
                </div>

                <div className=" mt-1 cursor-default border-t border-t-sand-300 pt-1 ">
                    <span className="inline-block w-24">Notes: </span>
                    <span>{!document.notes && "None"}</span>
                    <div>{document.notes}</div>
                </div>
            </div>
            <div
                className={`group/tab transtion-all flex cursor-pointer flex-row justify-center rounded-b-[20px] bg-sand-300 hover:bg-sand-400 ${
                    expanded ? "py-1" : "h-0 overflow-hidden"
                }`}
                onClick={() => {
                    setExpanded(false);
                }}
            >
                <Arrow
                    size={12}
                    className={`text-sand-500 group-hover/tab:text-sand-50`}
                />
            </div>
        </div>
    );
}

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
                toast.loading("Removing library...💨", {
                    id: removedFromListsToastId,
                });
            },
            onSuccess: async () => {
                toast.success("Removed library!☁️", {
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
                            <span className="cursor-default text-center text-neutral-950">
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
enum UploadType {
    Single,
    Multiple,
}
type SingleDocForm = {
    notes: string;
    link: string;
};

const AddDocumentWizard = ({
    libraryId,
    notifyByEmail,
}: {
    libraryId: string;
    notifyByEmail: string | null;
}) => {
    const trpc = api.useContext();
    const [uploadFile, setUploadFile] = useState<FileList | null>(null);
    const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
    // const [sourceType, sourceTypeDisplay] = parseForType(batchUrl);
    const [uploadType, setUploadType] = useState(UploadType.Single);
    const [singleDocForm, setSingleDocForm] = useState<SingleDocForm>({
        notes: "",
        link: "",
    });
    const addDocToast = "addDocToastId";
    const { mutate: addDocument, isLoading: singleLoading } =
        api.document.postOne.useMutation({
            onMutate: () => {
                toast.loading("Loading...", { id: addDocToast });
            },
            onSuccess: async () => {
                toast.success("Document added!", { id: addDocToast });
                await trpc.library.invalidate();
                await trpc.job.invalidate();
            },
            onError: (e) => {
                if (e.data?.code == "BAD_REQUEST") {
                    void toast.error(e.message, { id: addDocToast });
                    return;
                }

                console.log("ERROR MESSAGE", e);
                void toast.error(`Something went wrong!`, {
                    id: addDocToast,
                });
            },
        });

    const addBatchToast = "addBatchToastId";
    const { mutate: addDocuments, isLoading: multiLoading } =
        api.document.postBatch.useMutation({
            onMutate: () => {
                toast.loading("Loading...", { id: addBatchToast });
            },
            onSuccess: () => {
                toast.success("Documents received! Check status in jobs.", {
                    id: addBatchToast,
                });
            },
            onError: () => {
                toast.error(`Something went wrong!`, { id: addBatchToast });
            },
        });

    const upload = () => {
        const file = uploadFile?.item(0);
        if (!file) {
            throw new Error("No file");
        }
        const reader = new FileReader();

        reader.onload = (event) => {
            if (event.target && typeof event.target.result === "string") {
                const contents = event.target.result.split(",")[1] ?? "";

                if (new Blob([contents]).size > 1_000_000 * 10) {
                    toast.error(`File too large for single upload!`, {
                        id: addDocToast,
                    });
                } else {
                    const link =
                        singleDocForm.link !== ""
                            ? singleDocForm.link
                            : undefined;

                    const notes =
                        singleDocForm.notes !== ""
                            ? singleDocForm.notes
                            : undefined;

                    addDocument({
                        file: contents,
                        libraryId: libraryId,
                        filename: file?.name ?? "Not found",
                        link,
                        notes,
                    });
                }
            }
        };

        reader.readAsDataURL(file);
    };

    const uploadMany = () => {
        if (!uploadFiles) {
            throw new Error("No files");
        }
        const files: FileAPI[] = [];

        for (const file of uploadFiles) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === "string") {
                    const contents = event.target.result.split(",")[1] ?? "";

                    if (new Blob([contents]).size > 1_000_000 * 10) {
                        toast.error(
                            `File ${file?.name} too large for single upload!`,
                            {
                                id: addDocToast,
                            },
                        );
                        throw new Error("File too large");
                    } else {
                        files.push({
                            contents,
                            filename: file.name,
                            size: file.size,
                        });
                    }
                }
            };
            reader.onerror = () => {
                toast.error(`Error reading file: ${file.name}`);
                throw new Error(`Error reading file during multiple upload`);
            };
            reader.readAsDataURL(file);
        }

        addDocuments({
            files,
            libraryId,
            notifyByEmail,
        });
    };

    // Create a reference to the hidden file input element
    const singleFileInput = useRef<HTMLInputElement>(null);
    const multiFileInput = useRef<HTMLInputElement>(null);
    const fileName = singleFileInput.current?.files?.item(0)?.name;

    const active = "rounded-md px-2 py-1 text-sand-50 bg-sand-950";
    const inactive =
        "border font-medium rounded-md px-2 py-1 hover:bg-sand-300";
    return (
        <div className=" px-4 pb-12 transition-all sm:px-16">
            <div className=" w-full rounded-xl bg-sand-200 py-6 shadow">
                <div className="px-6 transition-all sm:px-16">
                    <h1 className="mb-3 text-xl">Add Documents</h1>
                    <div className="mb-6 flex flex-row gap-3">
                        <h2
                            onClick={() => {
                                setUploadType(UploadType.Single);
                            }}
                            className={`cursor-pointer ${
                                uploadType == UploadType.Single
                                    ? active
                                    : inactive
                            }`}
                        >
                            Single File
                        </h2>
                        <h2
                            onClick={() => {
                                setUploadType(UploadType.Multiple);
                            }}
                            className={`cursor-pointer ${
                                uploadType == UploadType.Multiple
                                    ? active
                                    : inactive
                            }`}
                        >
                            Multiple Files
                        </h2>
                    </div>
                </div>
                {uploadType == UploadType.Single && (
                    <div className="flex h-full flex-col justify-between  overflow-hidden px-6 transition-all sm:px-16">
                        <div></div>
                        <div className="">
                            <span>Link: </span>
                            <input
                                value={singleDocForm.link}
                                onChange={(e) => {
                                    setSingleDocForm((p) => ({
                                        ...p,
                                        link: e.target.value,
                                    }));
                                }}
                                type="url"
                                name=""
                                placeholder="Optional link to this document"
                                id=""
                                className="mb-3 w-full rounded-md bg-sand-50 px-3 py-1 outline-none"
                            />
                            <span>Notes: </span>
                            <textarea
                                value={singleDocForm.notes}
                                onChange={(e) => {
                                    setSingleDocForm((p) => ({
                                        ...p,
                                        notes: e.target.value,
                                    }));
                                }}
                                placeholder="Optional notes for this document"
                                id=""
                                className="mb-3 h-28 max-h-96 w-full rounded-md bg-sand-50 p-3 outline-none"
                            />
                        </div>
                        <div>
                            <input
                                name="Hidden file input button"
                                ref={singleFileInput}
                                className="hidden"
                                onChange={(e) => {
                                    setUploadFile(e.target.files);
                                }}
                                type="file"
                                placeholder="Upload a single file"
                            />
                            <div className="flex flex-col md:flex-row md:items-center">
                                <Button
                                    name="Shown file input button"
                                    text="Select File"
                                    color="neutral"
                                    className="me-3"
                                    onClick={(e) =>
                                        singleFileInput?.current?.click()
                                    }
                                />
                                <div className="truncate ">{fileName}</div>
                            </div>
                        </div>
                        <Button
                            disabled={!uploadFile || singleLoading}
                            onClick={upload}
                            className="self-end"
                            color="secondary"
                            text="Upload"
                        ></Button>
                    </div>
                )}
                {uploadType == UploadType.Multiple && (
                    <div className=" flex h-full flex-col border-sand-300 px-6 transition-all sm:px-16">
                        <div className="mb-3">
                            Uploading multiple files will take some time to
                            finish. You can check the status of the upload in
                            your jobs.
                        </div>
                        <div>
                            <input
                                className="hidden"
                                type="file"
                                multiple
                                ref={multiFileInput}
                                onChange={(e) => {
                                    setUploadFiles(e.target.files);
                                }}
                                placeholder="Provide a link to a folder of files"
                            />
                            <Button
                                text="Select Files"
                                color="neutral"
                                className=""
                                onClick={(e) =>
                                    multiFileInput?.current?.click()
                                }
                            />
                        </div>
                        <Button
                            disabled={!uploadFiles || multiLoading}
                            onClick={uploadMany}
                            className=" self-end"
                            color="secondary"
                            text="Upload"
                        ></Button>
                    </div>
                )}
            </div>
        </div>
    );
};

type JobListState = Record<string, boolean>;
const JobWizard = ({ data }: { data: LibraryDocsAndJobs }) => {
    const trpc = api.useContext();
    const initialList: JobListState = {};
    data.jobs.forEach((job) => {
        initialList[job.id] = false;
    });
    const [listState, setListState] = useState<JobListState>(initialList);

    const cancelJobToast = "CancelJobToastId";
    const { mutate: cancelJob, isLoading: jobCancelLoading } =
        api.job.cancel.useMutation({
            onMutate: () => {
                toast.loading("Loading...", { id: cancelJobToast });
            },
            onSuccess: async () => {
                toast.success("Job cancelled!", { id: cancelJobToast });
                await trpc.library.invalidate();
            },
            onError: async (e) => {
                if (e.data?.code == "BAD_REQUEST") {
                    void toast.error(e.message, { id: cancelJobToast });
                } else {
                    console.log("ERROR MESSAGE", e);
                    void toast.error(`Something went wrong!`, {
                        id: cancelJobToast,
                    });
                }
                await trpc.library.invalidate();
            },
        });

    if (data.jobs.length == 0) {
        return (
            <div className="border-t border-sand-300 px-4 py-8 transition-all sm:px-16">
                <h1 className="text-2xl">No Jobs</h1>
            </div>
        );
    }

    return (
        <div className="border-t border-sand-300 px-4 py-12 transition-all sm:px-16">
            <h1 className="text-2xl">Jobs</h1>
            <div className=" mb-1 mt-4 flex flex-row gap-3  px-2 py-1 pe-4  ">
                <div className="w-5"></div>
                <div className="w-40">Created</div>
                <div className="hidden w-28 sm:block">Documents</div>
                <div className="hidden w-36 md:block">Started</div>
                <div className="w-36">Finished</div>
            </div>
            <div className="sand-scroller flex max-h-[548px] flex-col gap-1 overflow-y-auto px-3 py-2">
                {data.jobs.map((job, i, list) => {
                    //
                    const cancellable =
                        job.status == Status.PENDING ||
                        job.status == Status.RUNNING;
                    const startedAt = job.startedAt
                        ? dtfmt.format(job.startedAt)
                        : "Not yet";

                    const rowMarginClasses =
                        i === 0
                            ? "mb-1"
                            : i === list.length - 1
                            ? "mt-1"
                            : "my-1";
                    return (
                        <div
                            key={job.id}
                            className={`rounded-[15px] bg-sand-200 shadow transition-all ease-in-out hover:bg-sand-100  ${
                                listState[job.id]
                                    ? `${rowMarginClasses} shadow-md`
                                    : ""
                            }`}
                        >
                            <div
                                onClick={(e) => {
                                    setListState({
                                        ...initialList,
                                        [job.id]: true,
                                    });
                                }}
                                className={`flex  flex-row gap-3 px-2 py-1 pe-4 font-medium  ${
                                    listState[job.id]
                                        ? "cursor-default"
                                        : "cursor-pointer"
                                }`}
                            >
                                <div className="w-5">
                                    <JobStatus status={job.status} />
                                </div>
                                <div className="w-40">
                                    {dtfmt.format(job.createdAt)}
                                </div>
                                <div className="hidden w-28 sm:block">
                                    {job.documentCount}
                                </div>
                                <div className="hidden w-36 md:block">
                                    {startedAt}
                                </div>
                                <div className="w-36">
                                    {job.endedAt
                                        ? dtfmt.format(job.endedAt)
                                        : "Not yet"}
                                </div>
                            </div>
                            <div
                                className={`sand-scroller cursor-default font-medium transition-all ${
                                    listState[job.id]
                                        ? "h-32 overflow-y-auto "
                                        : "h-0 overflow-hidden"
                                }`}
                            >
                                <div className="flex h-full flex-row px-2">
                                    <div className="w-full ">
                                        <div className="font-semibold">
                                            {toTitleCase(job.status)}
                                        </div>
                                        <div>{job.message ?? "No message"}</div>
                                        <div className="sm:hidden">
                                            Documents: {job.documentCount}
                                        </div>
                                        <div className="md:hidden">
                                            Started: {startedAt}
                                        </div>
                                        <div></div>
                                    </div>
                                    <div className="flex h-full w-40 shrink-0 justify-end pb-4 pe-4">
                                        {cancellable ? (
                                            <Button
                                                onClick={() => {
                                                    cancelJob({
                                                        jobId: job.id,
                                                        libraryId:
                                                            job.libraryId,
                                                    });
                                                }}
                                                className=" self-end"
                                                small={true}
                                                color="secondary"
                                                text="Cancel Job"
                                            />
                                        ) : (
                                            ""
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={() => {
                                    setListState((p) => ({
                                        ...p,
                                        [job.id]: false,
                                    }));
                                }}
                                className={`group flex w-full flex-row items-center justify-center rounded-b-[15px] bg-sand-300 transition-all hover:cursor-pointer  hover:bg-sand-400 ${
                                    listState[job.id]
                                        ? "h-10 sm:h-6"
                                        : "h-0 overflow-hidden"
                                }`}
                            >
                                <Arrow
                                    size={12}
                                    className="mt-1 text-sand-500 group-hover:text-sand-100"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// /// SourceType is the Data parsed form, string is the display form shown
// const parseForType = (url: string): [SourceType | null, string] => {
//     if (url === "") return [null, ""];

//     if (url.includes("google.com/drive/u/0/folders/")) {
//         toast.error(
//             `Please do not use the searchbar URL, instead use: \n"Share > Get link > Copy Link" `,
//             { duration: 10_000, id: "Wrong Dropbox Link Toast" },
//         );
//         return [null, "Not a valid URL"];
//     }

//     if (url.includes("https://drive.google.com/drive")) {
//         return [SourceType.GoogleDrive, "Google Drive"];
//     } else {
//         return [null, "Not a valid URL"];
//     }
// };
