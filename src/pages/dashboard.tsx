import { Job, Library } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";

/// The page providing the dashboard to run a search against a selected library
const Dashboard = () => {
    const { data: session, status } = useSession();
    const { data: user, isLoading } = api.user.getDashboardData.useQuery();

    return (
        <div className="mx-auto max-w-7xl px-3">
            <div className="flex flex-row gap-3">
                <div className="flex h-screen w-40 flex-col gap-3">
                    <div className="h-96   bg-neutral-600">
                        <h1>Libraries</h1>
                        <div>
                            {user?.libraries.map((library: Library) => {
                                return (
                                    <div
                                        key={library.id}
                                        className="flex flex-row justify-between"
                                    >
                                        <div>{library.title}</div>
                                        <div>
                                            {dtfmt.format(library.updatedAt)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="h-40   bg-neutral-500">
                        <h1>Jobs</h1>
                        <div className="h-32">
                            {user?.jobs.map((job: Job) => {
                                return (
                                    <div key={job.id}>
                                        <div>{job.status}</div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="h-screen w-full  bg-neutral-700">
                    <div>Search Bar</div>
                    <div>List of REsponses</div>
                    <div></div>
                    <div></div>
                </div>
                <div className="h-screen w-40 bg-neutral-800">Notebook</div>
            </div>
        </div>
    );
};

export default Dashboard;
