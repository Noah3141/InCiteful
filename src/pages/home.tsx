import { Job, Library } from "@prisma/client";
import { useSession } from "next-auth/react";
import React from "react";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";

/// The page providing the dashboard to run a search against a selected library
const Dashboard = () => {
    const { session, status } = useSession();
    const { data: user, isLoading } = api.user.getDashboardData.useQuery();

    return (
        <div className="mx-auto max-w-7xl px-3">
            <div className="flex flex-row gap-3">
                <div className="h-screen  bg-neutral-600">
                    <div>
                        <h1>Libraries</h1>
                        <div className="max-h-96">
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
                    <div>
                        <h1>Jobs</h1>
                        <div className="max-h-96">
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
                <div className="h-screen w-full  bg-neutral-700"></div>
                <div className="h-screen  bg-neutral-800">Fodddddo</div>
            </div>
        </div>
    );
};

export default Dashboard;
