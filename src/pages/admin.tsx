import { Document, Job, Library, Membership, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Button from "~/components/Button";
import Loading from "~/components/Loading";
import Hall from "~/layouts/Hall";
import { api } from "~/utils/api";
import { defaultOpts, dateTimeFormatter as dtfmt } from "~/utils/tools";

type Menu = {
    libraries: boolean;
    sessions: boolean;
    accounts: boolean;
    documents: boolean;
};

type AdminSearchParams = {
    membership: Membership | undefined;
    role: Role | undefined;
    createdAfter: Date | undefined;
    email: string | undefined;
};

const Admin = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [search, setSearch] = useState<AdminSearchParams>({
        createdAfter: undefined,
        email: undefined,
        membership: undefined,
        role: undefined,
    });
    const { data, isLoading } = api.user.getAdminPanel.useQuery(search);

    const map = new Map<string, Menu>();

    const defaultMenu: Menu = {
        libraries: false,
        accounts: false,
        sessions: false,
        documents: false,
    };
    data?.map((user) => {
        const v: Menu = { ...defaultMenu };
        map.set(user.id, v);
    });

    const [dataUnfolded, setDataUnfolded] = useState<Map<string, Menu>>(
        new Map(map),
    );

    if (status === "loading")
        return (
            <Hall>
                <Loading color="secondary" inline={false} />
            </Hall>
        );

    if (session?.user.role !== "Admin" || !session) {
        void router.push("//");
        return "";
    }

    if (isLoading)
        return (
            <Hall>
                <Loading color="secondary" inline={false} />
            </Hall>
        );

    if (session.user.role === "Admin")
        return (
            <div className="min-h-[200vh] p-6">
                <h1 className="page-title px-2">Admin</h1>
                {isLoading ? (
                    <Loading color="neutral" inline={false} />
                ) : (
                    <div className="px-2">
                        {data?.map((user) => {
                            const menu =
                                dataUnfolded.get(user.id) ?? defaultMenu;

                            return (
                                <div key={user.id} className="border-t pb-12">
                                    <div>User ID: {user.id}</div>
                                    <div>Name: {user.name}</div>
                                    <div>Email: {user.email}</div>
                                    <div>Membership: {user.membership}</div>
                                    <div>Role: {user.role}</div>
                                    <div>
                                        Created: {dtfmt.format(user.createdAt)}
                                    </div>

                                    <div>
                                        <div>
                                            <h1 className="mt-3 text-xl">
                                                Sessions -{" "}
                                                {user._count.sessions}
                                            </h1>
                                            <Button
                                                text={
                                                    menu.sessions
                                                        ? "Hide"
                                                        : "Expand"
                                                }
                                                small={true}
                                                color="neutral"
                                                className="mb-3"
                                                onClick={() => {
                                                    setDataUnfolded(
                                                        (prevMap) => {
                                                            const menu =
                                                                prevMap.get(
                                                                    user.id,
                                                                ) ??
                                                                defaultMenu;
                                                            const updatedMenu =
                                                                {
                                                                    ...menu,
                                                                    sessions:
                                                                        !menu.sessions,
                                                                };
                                                            const newMap =
                                                                new Map(
                                                                    prevMap,
                                                                );
                                                            newMap.set(
                                                                user.id,
                                                                updatedMenu,
                                                            );
                                                            return newMap;
                                                        },
                                                    );
                                                }}
                                            ></Button>
                                        </div>

                                        <div
                                            className={`rounded-lg border-x transition-all duration-300 ${
                                                menu.sessions
                                                    ? "h-96 overflow-y-scroll border"
                                                    : "h-0 overflow-hidden"
                                            }`}
                                        >
                                            <ol
                                                type="1"
                                                className="divide-y bg-sand-300"
                                            >
                                                {user.sessions.map(
                                                    (session) => {
                                                        return (
                                                            <li
                                                                key={session.id}
                                                                className="flex flex-col px-2 py-6"
                                                            >
                                                                <span>
                                                                    Session ID:{" "}
                                                                    {session.id}
                                                                </span>
                                                                <span>
                                                                    User ID:{" "}
                                                                    {
                                                                        session.userId
                                                                    }
                                                                </span>
                                                            </li>
                                                        );
                                                    },
                                                )}
                                            </ol>
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <h1 className="mt-3 text-xl">
                                                Accounts -{" "}
                                                {user._count.accounts}
                                            </h1>
                                            <Button
                                                text={
                                                    menu.accounts
                                                        ? "Hide"
                                                        : "Expand"
                                                }
                                                color="neutral"
                                                small={true}
                                                className="mb-3"
                                                onClick={() => {
                                                    setDataUnfolded(
                                                        (prevMap) => {
                                                            const menu =
                                                                prevMap.get(
                                                                    user.id,
                                                                ) ??
                                                                defaultMenu;
                                                            const updatedMenu =
                                                                {
                                                                    ...menu,
                                                                    accounts:
                                                                        !menu.accounts,
                                                                };
                                                            const newMap =
                                                                new Map(
                                                                    prevMap,
                                                                );
                                                            newMap.set(
                                                                user.id,
                                                                updatedMenu,
                                                            );
                                                            return newMap;
                                                        },
                                                    );
                                                }}
                                            ></Button>
                                        </div>

                                        <div
                                            className={`rounded-lg border-x transition-all duration-300 ${
                                                menu.accounts
                                                    ? "h-96 overflow-y-scroll border"
                                                    : "h-0 overflow-hidden"
                                            }`}
                                        >
                                            <ol
                                                type="1"
                                                className="divide-y bg-sand-300"
                                            >
                                                {user.accounts.map(
                                                    (account) => {
                                                        return (
                                                            <li
                                                                key={account.id}
                                                                className="flex flex-col px-2 py-6"
                                                            >
                                                                <span>
                                                                    Type:{" "}
                                                                    {
                                                                        account.type
                                                                    }
                                                                </span>
                                                                <span>
                                                                    {" "}
                                                                    Session
                                                                    state:
                                                                    {
                                                                        account.session_state
                                                                    }
                                                                </span>
                                                                <span>
                                                                    Account ID:{" "}
                                                                    {account.id}
                                                                </span>
                                                                <span>
                                                                    Provider:{" "}
                                                                    {
                                                                        account.provider
                                                                    }
                                                                </span>
                                                            </li>
                                                        );
                                                    },
                                                )}
                                            </ol>
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <h1 className="mt-3 text-xl">
                                                Libraries -{" "}
                                                {user._count.libraries}
                                            </h1>
                                            <Button
                                                text={
                                                    menu.libraries
                                                        ? "Hide"
                                                        : "Expand"
                                                }
                                                color="neutral"
                                                small={true}
                                                className="mb-3"
                                                onClick={() => {
                                                    setDataUnfolded(
                                                        (prevMap) => {
                                                            const menu =
                                                                prevMap.get(
                                                                    user.id,
                                                                ) ??
                                                                defaultMenu;
                                                            const updatedMenu =
                                                                {
                                                                    ...menu,
                                                                    libraries:
                                                                        !menu.libraries,
                                                                };
                                                            const newMap =
                                                                new Map(
                                                                    prevMap,
                                                                );
                                                            newMap.set(
                                                                user.id,
                                                                updatedMenu,
                                                            );
                                                            return newMap;
                                                        },
                                                    );
                                                }}
                                            ></Button>
                                        </div>

                                        <div
                                            className={`rounded-lg border-x  transition-all duration-300 ${
                                                menu.libraries
                                                    ? `h-[80vh] overflow-y-scroll scroll-smooth border shadow-lg`
                                                    : "h-0 overflow-hidden"
                                            }`}
                                        >
                                            <ol
                                                type="1"
                                                className="divide-y bg-sand-300"
                                            >
                                                {user.libraries.map(
                                                    (library, i) => {
                                                        return (
                                                            <LibraryReadout
                                                                sessionId={
                                                                    session.user
                                                                        .id
                                                                }
                                                                userId={
                                                                    library.userId
                                                                }
                                                                key={i}
                                                                library={
                                                                    library
                                                                }
                                                            />
                                                        );
                                                    },
                                                )}
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
};

export default Admin;

type LibraryPlus = {
    id: string;
    title: string;
    createdAt: Date;
} & {
    documents: Document[];
    jobs: Job[];
    _count: {
        User: number;
        documents: number;
        jobs: number;
    };
};

const LibraryReadout = ({
    library,
    userId,
    sessionId,
}: {
    library: LibraryPlus;
    userId: string;
    sessionId: string;
}) => {
    const [documentExpanded, setDocumentExpanded] = useState(false);

    const generateJobToast = "GenerateJobToastId";
    const { mutate: generateJob } = api.job.generateTestJob.useMutation({
        ...defaultOpts(generateJobToast),
    });

    const [jobsExpanded, setJobsExpanded] = useState(false);

    return (
        <li key={library.id} className="flex flex-col p-2 sm:p-6 ">
            <span className="text-2xl">Library ID: {library.id}</span>
            <span>Title: {library.title}</span>
            <span>Created: {dtfmt.format(library.createdAt)}</span>
            <div className="">
                <Button
                    className="my-3"
                    small={true}
                    color="secondary"
                    text={`Documents: ${library._count.documents}`}
                    onClick={() => {
                        setDocumentExpanded((p) => !p);
                    }}
                />
                {userId === sessionId && (
                    <Button
                        onClick={() => {
                            generateJob({ libraryId: library.id });
                        }}
                        className=" ms-3"
                        small
                        color="neutral"
                        text="Generate Random Prisma Job (UI only)"
                    />
                )}
                <div
                    className={` overflow-hidden scroll-smooth rounded-lg  text-sand-50 shadow-inner shadow-gable-950 ring-baltic-800 transition-all   hover:ring-2  ${
                        documentExpanded
                            ? "h-[600px] overflow-scroll overscroll-contain "
                            : "h-0 overflow-hidden"
                    }`}
                >
                    {library.documents.map((document, i) => {
                        return (
                            <>
                                <DocumentReadout
                                    key={i}
                                    document={document}
                                    i={i}
                                />
                            </>
                        );
                    })}
                </div>
                <Button
                    className="my-3"
                    small={true}
                    color="secondary"
                    text={`Jobs: ${library._count.jobs}`}
                    onClick={() => {
                        setJobsExpanded((p) => !p);
                    }}
                />
                <div
                    className={` overflow-hidden scroll-smooth rounded-lg  text-sand-50 shadow-inner shadow-gable-950 ring-baltic-800 transition-all   hover:ring-2  ${
                        jobsExpanded
                            ? "h-[600px] overflow-scroll overscroll-contain "
                            : "h-0 overflow-hidden"
                    }`}
                >
                    {library.jobs.map((job, i) => {
                        return (
                            <>
                                <JobReadout key={i} job={job} i={i} />
                            </>
                        );
                    })}
                </div>
            </div>
        </li>
    );
};

const DocumentReadout = ({
    document,
    i,
}: {
    document: Document;
    i: number;
}) => {
    const docId = `${document.id}`;
    const docTitle = `${document.title}`;
    const docJobId = `${document.jobId}`;
    const docPubSource = `${document.publicationSource}`;
    const docLibraryId = `${document.libraryId}`;
    const docPublishedAt = `${
        document.publishedAt ? dtfmt.format(document.publishedAt) : "null"
    }`;
    const docLink = `${document.link ?? null}`;
    const docNotes = `${document.notes ?? null}`;
    return (
        <>
            <div
                key={i}
                className="flex flex-col divide-y divide-baltic-950 p-8  font-medium  odd:bg-gable-900 even:bg-gable-950"
            >
                <div className="flex flex-row py-1 font-semibold">
                    <span className="w-40 ">Document ID: </span>
                    <span>{docId}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40">Title: </span>
                    <span>{docTitle}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40">Doc Job ID: </span>
                    <span>{docJobId}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40">Publication Source: </span>
                    <span>{docPubSource}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40">Library ID: </span>
                    <span>{docLibraryId}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40">Published: </span>
                    <span>{docPublishedAt}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40">Link: </span>
                    <span>{docLink}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40">Notes: </span>
                    <span>{docNotes}</span>
                </div>
            </div>
        </>
    );
};

const JobReadout = ({ job, i }: { job: Job; i: number }) => {
    return (
        <>
            <div
                key={i}
                className="flex flex-col divide-y divide-baltic-950 p-8  font-medium  odd:bg-gable-900 even:bg-gable-950"
            >
                <div className="flex flex-row py-1 font-semibold">
                    <span className="w-40 ">Job ID: </span>
                    <span>{job.id}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40 ">Message: </span>
                    <span>{job.message}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40 ">Status: </span>
                    <span>{job.status}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40 ">Document count: </span>
                    <span>{job.documentCount}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40 ">Created: </span>
                    <span>{dtfmt.format(job.createdAt)}</span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40 ">Started: </span>
                    <span>
                        {job.startedAt ? dtfmt.format(job.startedAt) : "null"}
                    </span>
                </div>
                <div className="flex flex-row py-1">
                    <span className="w-40 ">Finished: </span>
                    <span>
                        {job.endedAt ? dtfmt.format(job.endedAt) : "null"}
                    </span>
                </div>
            </div>
        </>
    );
};
