import { Membership, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Loading from "~/components/Loading";
import Hall from "~/layouts/Hall";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";

type Menu = {
    libraries: boolean;
    jobs: boolean;
    sessions: boolean;
    accounts: boolean;
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
        jobs: false,
        accounts: false,
        sessions: false,
    };
    data?.map((user) => {
        const v: Menu = { ...defaultMenu };
        map.set(user.id, v);
    });

    const [dataUnfolded, setDataUnfolded] = useState<Map<string, Menu>>(
        new Map(map),
    );

    if (status === "loading" || !session)
        return (
            <Hall>
                <Loading color="secondary" inline={false} />
            </Hall>
        );

    if (session.user.role !== "Admin") {
        void router.push("//");
    }

    if (isLoading)
        return (
            <Hall>
                <Loading color="secondary" inline={false} />
            </Hall>
        );

    if (session.user.role === "Admin")
        return (
            <Hall>
                <h1 className="page-title">Admin</h1>
                {isLoading ? (
                    <Loading color="neutral" inline={false} />
                ) : (
                    <div>
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
                                                Jobs - {user._count.jobs}
                                            </h1>
                                            <button
                                                className="pb-3"
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
                                                                    jobs: !menu.jobs,
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
                                            >
                                                {menu.jobs ? "Hide" : "Expand"}
                                            </button>
                                        </div>

                                        <div
                                            className={`border-x transition-all duration-300 ${
                                                menu.jobs
                                                    ? "h-96 overflow-y-scroll"
                                                    : "h-0"
                                            }`}
                                        >
                                            <ol
                                                type="1"
                                                className="divide-y bg-sand-300"
                                            >
                                                {user.jobs.map((job) => {
                                                    return (
                                                        <li
                                                            key={job.id}
                                                            className="px-2 py-6"
                                                        >
                                                            <div>
                                                                {job.status}
                                                            </div>
                                                            <div>
                                                                Started at{" "}
                                                                {dtfmt.format(
                                                                    job.startedAt ??
                                                                        undefined,
                                                                )}
                                                            </div>

                                                            <div>
                                                                Finished at{" "}
                                                                {dtfmt.format(
                                                                    job.endedAt ??
                                                                        undefined,
                                                                )}
                                                            </div>
                                                            <div>
                                                                Message:{" "}
                                                                {job.message}
                                                            </div>
                                                            <div>
                                                                Document count:{" "}
                                                                {
                                                                    job.documentCount
                                                                }
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ol>
                                        </div>
                                    </div>
                                    <div>
                                        <div>
                                            <h1 className="mt-3 text-xl">
                                                Sessions -{" "}
                                                {user._count.sessions}
                                            </h1>
                                            <button
                                                className="pb-3"
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
                                            >
                                                {menu.sessions
                                                    ? "Hide"
                                                    : "Expand"}
                                            </button>
                                        </div>

                                        <div
                                            className={`border-x transition-all duration-300 ${
                                                menu.sessions
                                                    ? "h-96 overflow-y-scroll"
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
                                                                    User ID:
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
                                            <button
                                                className="pb-3"
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
                                            >
                                                {menu.accounts
                                                    ? "Hide"
                                                    : "Expand"}
                                            </button>
                                        </div>

                                        <div
                                            className={`border-x transition-all duration-300 ${
                                                menu.accounts
                                                    ? "h-96 overflow-y-scroll"
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
                                                                    Type:
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
                                                                    Account ID:
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
                                                Libraries -
                                                {user._count.libraries}
                                            </h1>
                                            <button
                                                className="pb-3"
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
                                            >
                                                {menu.libraries
                                                    ? "Hide"
                                                    : "Expand"}
                                            </button>
                                        </div>

                                        <div
                                            className={`border-x transition-all duration-300 ${
                                                menu.libraries
                                                    ? "h-96 overflow-y-scroll"
                                                    : "h-0 overflow-hidden"
                                            }`}
                                        >
                                            <ol
                                                type="1"
                                                className="divide-y bg-sand-300"
                                            >
                                                {user.libraries.map(
                                                    (library) => {
                                                        return (
                                                            <li
                                                                key={library.id}
                                                                className="flex flex-col px-2 py-6  "
                                                            >
                                                                <span>
                                                                    Library ID:{" "}
                                                                    {library.id}
                                                                </span>
                                                                <span>
                                                                    Title:{" "}
                                                                    {
                                                                        library.title
                                                                    }
                                                                </span>
                                                                <span>
                                                                    {dtfmt.format(
                                                                        library.createdAt,
                                                                    )}
                                                                </span>
                                                                <span>
                                                                    Documents:{" "}
                                                                    {
                                                                        library
                                                                            ._count
                                                                            .documents
                                                                    }
                                                                </span>
                                                            </li>
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
            </Hall>
        );
};

export default Admin;
