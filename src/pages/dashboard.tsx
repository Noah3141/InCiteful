import {
    type Reference,
    type Job,
    type Library,
    type Topic,
    Document,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { Dispatch, SetStateAction, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineInfoCircle, AiOutlineLoading3Quarters } from "react-icons/ai";
import { Tooltip } from "react-tooltip";
import { JobStatus } from "~/components/JobStatus";
import List, { Body, Header } from "~/components/List";
import Loading from "~/components/Loading";
import MiddleColumn from "~/components/MiddleColumn";
import { tooltipStyles } from "~/styles/tooltips";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";
import Image from "next/image";
import InCiteful from "~/images/logos/InCiteful";
import { ReferencesWithDocuments } from "~/server/api/routers/query";
import {
    IoIosAddCircle,
    IoIosAddCircleOutline,
    IoIosCheckmarkCircle,
    IoIosRefreshCircle,
} from "react-icons/io";

type QueryState = {
    text: string;
    orderBy: "Score" | "Date";
    topN: number;
};

type QueryDropdowns = {
    topN: boolean;
    orderBy: boolean;
};

/// The page providing the dashboard to run a search against a selected library
const Dashboard = () => {
    const router = useRouter();
    const { status } = useSession();
    const { data: user, isLoading } = api.user.getDashboardData.useQuery();
    const [selectedLibraryIdx, setSelectedLibrary] = useState(0);
    const [selectedTopicIdx, setSelectedTopic] = useState(0);
    // Query bar's dropdown UI states
    const queryDropdownsClosed = {
        topN: false,
        orderBy: false,
    };
    const [queryDropdowns, setQueryDropdowns] =
        useState<QueryDropdowns>(queryDropdownsClosed);
    // Query bar's active settings
    const [query, setQuery] = useState<QueryState>({
        text: "",
        orderBy: "Score",
        topN: 10,
    });
    // Actual reference list returned by API
    const [references, setReferences] = useState<ReferencesWithDocuments>();

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

    const selectedLibrary = user?.libraries[selectedLibraryIdx];
    const selectedTopicId = user?.topics[selectedTopicIdx]?.id ?? "";

    return (
        <>
            <title>Dashboard</title>
            <div className="mx-auto max-w-[1400px] px-3 pt-12">
                <div className="flex  flex-col gap-3  lg:flex-row">
                    <div className="flex w-full flex-col  gap-3 lg:h-screen lg:w-[450px]  lg:max-w-xs">
                        <LibrarySelector
                            {...{
                                isLoading,
                                libraries: user?.libraries,
                                selectedLibraryIdx,
                                setSelectedLibrary,
                            }}
                        />
                        <LibraryReadout {...{ isLoading, selectedLibrary }} />
                    </div>
                    <MiddleColumn>
                        <div className="relative max-h-[70vh] ">
                            <div className="absolute -z-10 mt-12 flex h-96 w-full flex-row items-end justify-center">
                                <InCiteful className=" text-sand-300" />
                            </div>
                            <QueryBar
                                {...{
                                    query,
                                    setQuery,
                                    queryDropdowns,
                                    setQueryDropdowns,
                                    queryDropdownsClosed,
                                    selectedLibrary,
                                    setSelectedLibrary,
                                    setReferences,
                                }}
                            />
                            <ReferenceList
                                {...{ references, selectedTopicId }}
                            />
                        </div>
                    </MiddleColumn>
                    <div className="">
                        <TopicsReadout
                            {...{
                                selectedTopicIdx,
                                setSelectedTopic,
                                topics: user?.topics,
                                isLoading,
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;

type LibrarySelectorProps = {
    isLoading: boolean;
    libraries: Library[] | undefined;
    selectedLibraryIdx: number;
    setSelectedLibrary: React.Dispatch<React.SetStateAction<number>>;
};

const LibrarySelector = ({
    isLoading,
    libraries,
    selectedLibraryIdx,
    setSelectedLibrary,
}: LibrarySelectorProps) => {
    return (
        <List>
            <Header>
                <h1 className="text-xl">Libraries</h1>
                <div>
                    <AiOutlineInfoCircle
                        className="hover:text-tango-500"
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
                    <Loading inline={true} color="primary" className="py-2" />
                ) : libraries?.length == 0 ? (
                    <div className="px-4 py-1 text-base">No libraries yet</div>
                ) : (
                    libraries?.map((library: Library, idx) => {
                        return (
                            <div key={library.id}>
                                <div className="flex  flex-row items-center justify-between">
                                    <button
                                        className={`flex w-full items-center justify-between  border-s-4 px-4 py-2 text-left hover:bg-gable-900  ${
                                            selectedLibraryIdx === idx
                                                ? " border-s-tango-500 text-tango-500 hover:text-tango-500"
                                                : "  hover: border-s-gable-950 hover:border-s-gable-700 hover:text-sushi-400"
                                        }`}
                                        onClick={() => setSelectedLibrary(idx)}
                                    >
                                        <div>{library.title}</div>
                                        <div className="self-end whitespace-nowrap ps-2 text-sm text-gable-800">
                                            {dtfmt.format(library.updatedAt)}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </Body>
        </List>
    );
};

type LibraryReadoutProps = {
    selectedLibrary:
        | (Library & { documents: Document[]; jobs: Job[] })
        | undefined;
    isLoading: boolean;
};

const LibraryReadout = ({
    selectedLibrary,
    isLoading,
}: LibraryReadoutProps) => {
    return (
        <List>
            <Header>
                <div>
                    <h1 className="block text-lg">Library:</h1>
                    <h2 className="text-tango-500">{selectedLibrary?.title}</h2>
                </div>
            </Header>
            <div className="px-4 py-3  font-medium">
                <h1 className="flex flex-row justify-between">
                    <span> Documents: </span>
                    <span>{selectedLibrary?.documents.length}</span>
                </h1>
                <h1 className="flex flex-row justify-between">
                    <span>Created at: </span>
                    <span>{dtfmt.format(selectedLibrary?.createdAt)}</span>
                </h1>
                <h1 className="flex flex-row justify-between">
                    <span>Last updated: </span>
                    <span>{dtfmt.format(selectedLibrary?.updatedAt)}</span>
                </h1>
            </div>
            <div className="max-h-60 overflow-x-hidden overflow-y-scroll border-t border-t-gable-800 p-4">
                <h1 className="block text-lg">Jobs</h1>
                {isLoading ? (
                    <Loading inline={true} color="primary" className="py-2" />
                ) : selectedLibrary?.jobs.length !== 0 ? (
                    selectedLibrary?.jobs.map((job: Job) => {
                        return (
                            <>
                                <div
                                    data-tooltip-id={`job-status-${job.id}`}
                                    data-tooltip-content={`Created at: ${dtfmt.format(
                                        job.createdAt,
                                    )} \nStarted: ${
                                        job.startedAt
                                            ? dtfmt.format(job.startedAt)
                                            : "Not yet"
                                    } \nFinished: ${
                                        job.endedAt
                                            ? dtfmt.format(job.endedAt)
                                            : "Not yet"
                                    }`}
                                    data-tooltip-variant="info"
                                    key={job.id}
                                    className="flex flex-row justify-between"
                                >
                                    <div>{job.status}</div>
                                    <JobStatus status={job.status} />
                                </div>
                                <Tooltip
                                    place="bottom"
                                    delayShow={500}
                                    style={tooltipStyles}
                                    id="remove-topic-button"
                                />
                            </>
                        );
                    })
                ) : (
                    "No jobs yet"
                )}
            </div>
        </List>
    );
};

type TopicsReadoutProps = {
    isLoading: boolean;
    topics:
        | (Topic & {
              references: Reference[];
          })[]
        | undefined;
    selectedTopicIdx: number;
    setSelectedTopic: Dispatch<SetStateAction<number>>;
};

const TopicsReadout = ({
    isLoading,
    topics,
    selectedTopicIdx,
    setSelectedTopic,
}: TopicsReadoutProps) => {
    return (
        <List>
            <Header>
                <h1 className="text-lg">Topics</h1>
                <div>
                    <AiOutlineInfoCircle
                        className="hover:text-tango-500"
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
                <div className="w-48">
                    {isLoading ? (
                        <Loading
                            inline={true}
                            color="primary"
                            className="py-2"
                        />
                    ) : (
                        topics?.map(
                            (
                                topic: Topic & {
                                    references: Reference[];
                                },
                                idx,
                            ) => {
                                return (
                                    <div key={topic.id} className="">
                                        <button
                                            onClick={() => {
                                                setSelectedTopic(idx);
                                            }}
                                            className={`w-full border-s-4 px-4 py-2 text-left hover:bg-gable-900 ${
                                                selectedTopicIdx === idx
                                                    ? " border-s-tango-500 text-tango-500 hover:text-tango-500"
                                                    : "  hover: border-s-gable-950 hover:border-s-gable-700 hover:text-sushi-400"
                                            }`}
                                        >
                                            <div className="">
                                                {`${topic.name} - ${topic.references.length}`}
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
    );
};

type QueryBarProps = {
    query: QueryState;
    setQuery: Dispatch<SetStateAction<QueryState>>;
    queryDropdowns: QueryDropdowns;
    setQueryDropdowns: Dispatch<SetStateAction<QueryDropdowns>>;
    queryDropdownsClosed: QueryDropdowns;
    setSelectedLibrary: Dispatch<SetStateAction<number>>;
    selectedLibrary: (Library & { documents: Document[] }) | undefined;
    setReferences: Dispatch<
        SetStateAction<ReferencesWithDocuments | undefined>
    >;
};

const QueryBar = ({
    query,
    setQuery,
    queryDropdowns,
    setQueryDropdowns,
    queryDropdownsClosed,
    setSelectedLibrary,
    selectedLibrary,
    setReferences,
}: QueryBarProps) => {
    const queryToast = "QueryToastID";
    const { mutate: sendQuery, isLoading: sendingQuery } =
        api.query.send.useMutation({
            onMutate: (input) => {
                toast.loading("Sending...", { id: queryToast });
            },
            onSuccess: (data) => {
                toast.success("Success!", { id: queryToast });
                setReferences(data);
            },
            onError: (error) => {
                if (error.data?.code == "BAD_REQUEST") {
                    toast.error(`${error.message}`, { id: queryToast });
                } else {
                    toast.error("Something went wrong!", { id: queryToast });
                }
            },
            // onSettled: (data, error, query) => {
            //     toast.success("Settled");
            // },
        });

    const disabled = false; //selectedLibrary?.documents.length === 0

    return (
        <>
            <div>
                <input
                    type="text"
                    value={query.text}
                    onChange={(e) => {
                        setQuery((p) => ({
                            ...p,
                            text: e.target.value,
                        }));
                    }}
                    placeholder="Enter a search prompt"
                    className="w-full rounded-t-sm px-2 py-1 outline-none hover:cursor-pointer hover:bg-sand-50 hover:ring-tango-500 focus:bg-neutral-50"
                />
            </div>
            <div className="flex w-full flex-row divide-x  divide-gable-800 rounded-b-sm bg-gable-700 text-neutral-100">
                <div className="relative w-full">
                    <button
                        onClick={() => {
                            setQueryDropdowns((previous) => ({
                                orderBy: !previous.orderBy,
                                topN: false,
                            }));
                        }}
                        className="w-full px-2 py-1 hover:bg-gable-600 hover:text-sushi-400"
                    >
                        <span>Sort by: </span>
                        <span className="">{query.orderBy}</span>
                    </button>
                    <div
                        className={`absolute left-1/2 w-32 -translate-x-1/2  overflow-hidden rounded-md  border-gable-600 bg-gable-950 transition-all duration-150 ${
                            queryDropdowns.orderBy
                                ? "h-16 border shadow-lg shadow-[#3635355b]"
                                : "h-0"
                        }`}
                    >
                        <div className="">
                            <div
                                onClick={() => {
                                    setQuery((p) => ({
                                        ...p,
                                        orderBy: "Score",
                                    }));
                                    setQueryDropdowns(queryDropdownsClosed);
                                }}
                                className="cursor-pointer px-4 py-1 hover:bg-gable-900 hover:text-sushi-400"
                            >
                                Score
                            </div>
                            <div
                                onClick={() => {
                                    setQuery((p) => ({
                                        ...p,
                                        orderBy: "Date",
                                    }));
                                    setQueryDropdowns(queryDropdownsClosed);
                                }}
                                className="cursor-pointer px-4 py-1 hover:bg-gable-900 hover:text-sushi-400"
                            >
                                Date
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <button
                        onClick={() => {
                            setQueryDropdowns((previous) => ({
                                topN: !previous.topN,
                                orderBy: false,
                            }));
                        }}
                        className="w-full px-2 py-1 hover:bg-gable-600 hover:text-sushi-400"
                    >
                        <span>Top Results: </span>
                        <span className="">{query.topN}</span>
                    </button>
                    <div
                        className={`absolute left-1/2 w-32  -translate-x-1/2  overflow-hidden rounded-md  border-gable-600 bg-gable-950 transition-all duration-150 ${
                            queryDropdowns.topN
                                ? "h-16 border shadow-lg shadow-[#3635355b]"
                                : "h-0"
                        }`}
                    >
                        <div className="">
                            <div
                                onClick={() => {
                                    setQuery((p) => ({
                                        ...p,
                                        topN: 10,
                                    }));
                                    setQueryDropdowns(queryDropdownsClosed);
                                }}
                                className="cursor-pointer px-4 py-1 hover:bg-gable-900 hover:text-sushi-400"
                            >
                                10
                            </div>
                            <div
                                onClick={() => {
                                    setQuery((p) => ({
                                        ...p,
                                        topN: 25,
                                    }));
                                    setQueryDropdowns(queryDropdownsClosed);
                                }}
                                className="cursor-pointer px-4 py-1 hover:bg-gable-900 hover:text-sushi-400"
                            >
                                25
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <button
                        onClick={() => {
                            if (query.text === "") {
                                toast.error(
                                    "Please enter a query!",
                                    // { id: "No query text toast" },
                                );
                                return;
                            }
                            if (!selectedLibrary) {
                                setSelectedLibrary(0);
                                return;
                            }
                            sendQuery({
                                libraryId: selectedLibrary.id,
                                query: query.text,
                            });
                        }}
                        disabled={disabled}
                        className="w-full px-2 py-1 hover:bg-gable-600 hover:text-sushi-400 disabled:bg-gable-800 disabled:hover:text-neutral-50"
                    >
                        Search
                    </button>
                </div>
            </div>
        </>
    );
};

type ReferenceListProps = {
    references: ReferencesWithDocuments | undefined;
    selectedTopicId: string;
};

const ReferenceList = ({ references, selectedTopicId }: ReferenceListProps) => {
    if (!references) {
        return;
    }

    let lengthLabel = "";
    if (references.length === 0) {
        return;
    } else if (references.length === 1) {
        lengthLabel = "1 reference";
    } else if (references.length > 1) {
        lengthLabel = `${references.length} references`;
    }
    return (
        <div className="max-h-[100vh] overflow-scroll bg-gable-950 p-4 text-neutral-50">
            <div className="border-b">
                <h1>{lengthLabel}</h1>
            </div>
            {references?.map((reference, idx) => {
                const titleWithDate = `${reference.document.title} ${
                    reference.document.publishedAt
                        ? `(${dtfmt.format(reference.document.publishedAt)})`
                        : ""
                }`;

                return (
                    <div key={reference.id} className="mt-6  py-2 ">
                        <div className="flex flex-row justify-between">
                            <div>Reference {idx + 1}</div>
                            <AddToTopicWizard
                                topicId={selectedTopicId}
                                referenceId={reference.id}
                            />
                        </div>
                        <div className="">{titleWithDate}</div>
                        <div className="my-3 max-h-64 overflow-scroll rounded bg-gable-900 p-4 font-medium">
                            <span className="text-neutral-100">
                                {reference.preText}
                            </span>
                            <span className="text-sushi-400">
                                {reference.focalText}
                            </span>
                            <span className="text-neutral-100">
                                {reference.postText}
                            </span>
                        </div>
                        <div>{`Score: ${reference.score?.toFixed(2)}`}</div>
                        <div>
                            {`Sentence number: ${reference.sentenceNumber}`}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

type AddToTopicWizardProps = { referenceId: string; topicId: string };

const AddToTopicWizard = ({ referenceId, topicId }: AddToTopicWizardProps) => {
    const [added, setAdded] = useState(false);
    const addToTopicToast = "AddToTopicToastId";
    const trpc = api.useContext();
    const { mutate: addToTopic, isLoading } =
        api.notebook.addToTopic.useMutation({
            onMutate: () => {
                toast.loading("Loading...", { id: addToTopicToast });
            },
            onSuccess: async () => {
                toast.success("Success!", { id: addToTopicToast });
                setAdded(true);
                await trpc.user.invalidate();
            },
            onError: (e) => {
                console.log("ERROR MESSAGE", e);
                toast.error(`Something went wrong!`, { id: addToTopicToast });
            },
        });
    if (isLoading)
        return (
            <div className="flex h-8 w-8 flex-row items-center justify-center">
                <AiOutlineLoading3Quarters
                    className=" animate-spin"
                    size={24}
                />
            </div>
        );

    if (added) {
        return (
            <div className="h-8 w-8">
                <IoIosCheckmarkCircle size={30} />
            </div>
        );
    } else
        return (
            <>
                <div
                    data-tooltip-id="add-to-topic-button"
                    data-tooltip-content="Add to topic"
                    data-tooltip-variant="info"
                    className="group flex h-8 w-8 flex-row items-center"
                    onClick={() => {
                        addToTopic({ referenceId, topicId });
                    }}
                >
                    <button>
                        <IoIosAddCircleOutline
                            size={30}
                            className="text-gable-200  group-hover:hidden"
                        />
                        <IoIosAddCircle
                            size={30}
                            className="hidden  text-gable-200 group-hover:inline"
                        />
                    </button>
                </div>
                <Tooltip
                    place="right"
                    delayShow={500}
                    style={{ backgroundColor: "#1c1917" }}
                    id="add-to-topic-button"
                />
            </>
        );
};
