import { Reference, type Job, type Library, type Topic } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import { JobStatus } from "~/components/JobStatus";
import List, { Body, Header } from "~/components/List";
import Loading from "~/components/Loading";
import MiddleColumn from "~/components/MiddleColumn";
import { tooltipStyles } from "~/styles/tooltips";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";

/// The page providing the dashboard to run a search against a selected library
const Dashboard = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { data: user, isLoading } = api.user.getDashboardData.useQuery();
    const [selectedLibrary, setSelectedLibrary] = useState(0);
    const [selectedTopic, setSelectedTopic] = useState(0);

    if (status == "loading")
        return <Loading inline={false} color="secondary" />;

    if (status == "unauthenticated") {
        void router.push("//");
        return <Loading inline={false} color="secondary" />;
    }

    if (!user && !isLoading) {
        void router.push("//");
        return <Loading inline={false} color="secondary" />;
    }

    const currentSelectedLibrary = user?.libraries[selectedLibrary];

    return (
        <div className="mx-auto max-w-7xl px-3 pt-12">
            <div className="flex  flex-col gap-3  lg:flex-row">
                <div className="flex w-full flex-col gap-3 lg:h-screen lg:w-fit">
                    <List>
                        <Header>
                            <h1 className="text-xl">Libraries</h1>
                            <div>
                                <AiOutlineInfoCircle
                                    data-tooltip-id="dashboard-libraries-info"
                                    data-tooltip-content="Select a library to search for your prompt"
                                    data-tooltip-variant="info"
                                    size={18}
                                />
                                <Tooltip
                                    place="top"
                                    delayShow={500}
                                    style={{
                                        ...tooltipStyles,
                                        translate: "0px -5px",
                                    }}
                                    id="dashboard-libraries-info"
                                />
                            </div>
                        </Header>
                        <Body>
                            {isLoading ? (
                                <Loading
                                    inline={true}
                                    color="primary"
                                    className="py-2"
                                />
                            ) : (
                                user?.libraries.map((library: Library, idx) => {
                                    return (
                                        <div key={library.id}>
                                            <div className="flex flex-row items-center justify-between">
                                                <button
                                                    className={`flex w-full items-center justify-between px-2 py-2 text-left hover:bg-gable-900  ${
                                                        selectedLibrary === idx
                                                            ? "text-tango-500 hover:text-tango-500"
                                                            : " hover:text-sushi-400"
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedLibrary(idx)
                                                    }
                                                >
                                                    <div>{library.title}</div>
                                                    <div className="self-end whitespace-nowrap text-sm text-gable-700">
                                                        {dtfmt.format(
                                                            library.updatedAt,
                                                        )}
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </Body>
                    </List>
                    <List>
                        <Header>
                            <div>
                                <h1 className="block text-lg">Library:</h1>
                                <h2>
                                    {user?.libraries[selectedLibrary]?.title}
                                </h2>
                            </div>
                        </Header>
                        <div className="px-2 py-3">
                            <h1 className="flex flex-row justify-between">
                                <span> Documents: </span>
                                <span>
                                    {currentSelectedLibrary?.documents.length}
                                </span>
                            </h1>
                            <h1 className="flex flex-row justify-between">
                                <span>Created at: </span>
                                <span>
                                    {dtfmt.format(
                                        currentSelectedLibrary?.createdAt,
                                    )}
                                </span>
                            </h1>
                            <h1 className="flex flex-row justify-between">
                                <span>Last updated: </span>
                                <span>
                                    {dtfmt.format(
                                        currentSelectedLibrary?.updatedAt,
                                    )}
                                </span>
                            </h1>
                        </div>
                        <div className="max-h-60 overflow-x-hidden overflow-y-scroll border-t border-t-gable-800 p-2">
                            <h1 className="block text-lg">Jobs</h1>
                            {isLoading ? (
                                <Loading
                                    inline={true}
                                    color="primary"
                                    className="py-2"
                                />
                            ) : user?.libraries[selectedLibrary]?.jobs
                                  .length !== 0 ? (
                                user?.libraries[selectedLibrary]?.jobs.map(
                                    (job: Job) => {
                                        return (
                                            <>
                                                <div
                                                    data-tooltip-id={`job-status-${job.id}`}
                                                    data-tooltip-content={`Created at: ${dtfmt.format(
                                                        job.createdAt,
                                                    )} \nStarted: ${
                                                        job.startedAt
                                                            ? dtfmt.format(
                                                                  job.startedAt,
                                                              )
                                                            : "Not yet"
                                                    } \nFinished: ${
                                                        job.endedAt
                                                            ? dtfmt.format(
                                                                  job.endedAt,
                                                              )
                                                            : "Not yet"
                                                    }`}
                                                    data-tooltip-variant="info"
                                                    key={job.id}
                                                    className="flex flex-row justify-between"
                                                >
                                                    <div>{job.status}</div>
                                                    <JobStatus
                                                        status={job.status}
                                                    />
                                                </div>
                                                <Tooltip
                                                    place="bottom"
                                                    delayShow={500}
                                                    style={tooltipStyles}
                                                    id="remove-topic-button"
                                                />
                                            </>
                                        );
                                    },
                                )
                            ) : (
                                "No jobs yet"
                            )}
                        </div>
                    </List>
                </div>
                <MiddleColumn>
                    <div className="max-h-[70vh] ">
                        <div>
                            <input
                                type="text"
                                placeholder="Enter a search query"
                                className="w-full rounded-sm px-2 py-1 outline-none hover:ring-1 hover:ring-tango-500 focus:ring-0"
                            />
                        </div>
                        <div className="w-full pt-56 text-center">
                            BIG LOGO UNTIL LIST SLIGHTLY DARKER THAN BG
                        </div>
                        <div></div>
                        <div></div>
                    </div>
                </MiddleColumn>
                <div>
                    <List>
                        <Header>
                            <h1 className="text-lg">Topics</h1>
                            <div>
                                <AiOutlineInfoCircle
                                    data-tooltip-id="dashboard-topics-info"
                                    data-tooltip-content="Select a topic to add references to"
                                    data-tooltip-variant="info"
                                    size={18}
                                />
                                <Tooltip
                                    place="right"
                                    delayShow={500}
                                    style={tooltipStyles}
                                    id="dashboard-topics-info"
                                />
                            </div>
                        </Header>
                        <Body>
                            <div className="w-96">
                                {isLoading ? (
                                    <Loading
                                        inline={true}
                                        color="primary"
                                        className="py-2"
                                    />
                                ) : (
                                    user?.topics.map(
                                        (
                                            topic: Topic & {
                                                references: Reference[];
                                            },
                                            idx,
                                        ) => {
                                            return (
                                                <div
                                                    key={topic.id}
                                                    className=""
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTopic(
                                                                idx,
                                                            );
                                                        }}
                                                        className={`w-full p-2 text-left hover:bg-gable-900 ${
                                                            selectedTopic ===
                                                            idx
                                                                ? "text-tango-500"
                                                                : ""
                                                        }`}
                                                    >
                                                        <div>
                                                            {topic.name} -{" "}
                                                            {
                                                                topic.references
                                                                    .length
                                                            }
                                                        </div>
                                                    </button>
                                                </div>
                                            );
                                        },
                                    )
                                )}
                            </div>
                        </Body>
                    </List>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
