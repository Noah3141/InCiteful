import { Reference, Topic } from "@prisma/client";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
    IoIosAddCircle,
    IoIosAddCircleOutline,
    IoIosRemoveCircle,
    IoIosRemoveCircleOutline,
} from "react-icons/io";
import { Tooltip } from "react-tooltip";
import List, { Body, Header } from "~/components/List";
import Loading from "~/components/Loading";
import MiddleColumn from "~/components/MiddleColumn";
import Hall from "~/layouts/Hall";
import { tooltipStyles } from "~/styles/tooltips";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";

const Notebook = () => {
    const { data: notebook, isLoading } =
        api.notebook.getNotebookData.useQuery();

    const [viewedTopic, setViewedTopic] = useState(0);

    if (isLoading) return <Loading inline={false} color="secondary" />;

    if (!notebook)
        return (
            <Hall>
                <div className="px-12">No notebook!</div>
            </Hall>
        );

    const topic: (Topic & { references: Reference[] }) | undefined =
        notebook[viewedTopic];
    if (!topic) setViewedTopic(0);

    return (
        <div className="mx-auto max-w-7xl px-3 pt-12">
            <div className="flex flex-row gap-3 ">
                <List>
                    <Header className="flex  flex-row items-center justify-between border-b border-b-gable-900 p-2">
                        <h1 className="text-xl">Topics</h1>
                        <AddTopic />
                    </Header>
                    <Body>
                        {notebook.map((topic, idx) => {
                            return (
                                <div
                                    key={topic.id}
                                    className="flex flex-row items-center justify-between"
                                >
                                    <button
                                        className={`flex w-full items-center justify-between px-2 py-1 text-left hover:bg-gable-900  ${
                                            viewedTopic === idx
                                                ? "text-tango-500 hover:text-tango-500"
                                                : " hover:text-sushi-400"
                                        }`}
                                        onClick={() => setViewedTopic(idx)}
                                    >
                                        {topic.name}
                                        {viewedTopic === idx && (
                                            <RemoveTopic
                                                idx={idx}
                                                setViewedTopic={setViewedTopic}
                                                topicId={topic.id}
                                            />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </Body>
                </List>
                <MiddleColumn>
                    <div className="max-h-[70vh] bg-baltic-900 text-neutral-50">
                        <div className="p-2 text-2xl leading-none">
                            {notebook[viewedTopic]?.name}
                        </div>
                        <div className="flex flex-row gap-4 px-2 pb-2">
                            <div>
                                Created:{" "}
                                {topic?.createdAt &&
                                    dtfmt.format(topic.createdAt)}
                            </div>
                            <div>
                                {topic?.updatedAt && (
                                    <div>
                                        <span>Last Updated: </span>{" "}
                                        {dtfmt.format(topic.updatedAt)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {topic?.references.map((reference) => {
                            return (
                                <div
                                    key={reference.id}
                                    className="flex flex-row justify-between"
                                >
                                    <div className="w-full border">
                                        <div>{reference.articleTitle}</div>
                                        <div>
                                            Reference Added:
                                            {dtfmt.format(reference.addedAt)}
                                        </div>
                                        <div>
                                            Article Published:
                                            {dtfmt.format(
                                                reference.articlePublishedDate,
                                            )}
                                        </div>
                                        <div></div>
                                    </div>
                                    <ReferenceNoteWizard
                                        referenceId={reference.id}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <TopicNoteWizard topicId={topic?.id ?? ""} />
                </MiddleColumn>
            </div>
        </div>
    );
};

export default Notebook;

type AddTopicProps = {
    foo?: string;
};

const AddTopic = ({}: AddTopicProps) => {
    const trpc = api.useContext();
    const createTopicId = "createTopic";
    const { mutate: createTopic } = api.notebook.createTopic.useMutation({
        onMutate: () => {
            toast.loading("Creating...", { id: createTopicId });
        },
        onError: (e) => {
            if (e.data?.code == "BAD_REQUEST") {
                toast.error(e.message, { id: createTopicId });
            } else {
                toast.error("Something went wrong", { id: createTopicId });
            }
        },
        onSuccess: async () => {
            toast.success("Success!", { id: createTopicId, duration: 2000 });
            toast.dismiss("topicModal");
            await trpc.notebook.invalidate();
        },
    });
    const [titleInput, setTitleInput] = useState("");
    const ref = useRef<HTMLInputElement>(null);
    const saveToast = () => {
        toast(
            (t) => {
                return (
                    <div className="">
                        <span className=" text-neutral-900">
                            Enter a topic name:
                        </span>
                        <input
                            name="titlefield"
                            type="text"
                            ref={ref}
                            id="titlefield"
                            className="my-2 w-full rounded-md bg-sand-50 px-2 py-1 hover:cursor-pointer hover:outline hover:outline-4 hover:outline-gable-600 focus:cursor-text focus:outline-none"
                        />
                        <div className="flex flex-row justify-between ">
                            <button
                                className="text-neutral-900 hover:text-tango-500"
                                onClick={() => {
                                    toast.dismiss(t.id);
                                }}
                            >
                                🗑️Cancel
                            </button>
                            <button
                                className="text-neutral-900 hover:text-tango-500"
                                onClick={() => {
                                    if (ref.current !== null) {
                                        createTopic({
                                            topicName: ref.current.value,
                                        });
                                    }
                                    setTitleInput("");
                                }}
                            >
                                Save🔖
                            </button>
                        </div>
                    </div>
                );
            },
            {
                duration: 60_000,
                style: {
                    backgroundColor: "rgb(96 123 55)",
                },
                id: "topicModal",
            },
        );
    };

    return (
        <>
            <div
                data-tooltip-id="add-topic-button"
                data-tooltip-content="Add a topic"
                data-tooltip-variant="info"
                className="group flex flex-row items-center"
                onClick={saveToast}
            >
                <button>
                    <IoIosAddCircleOutline
                        size={28}
                        className="text-tango-500 group-hover:hidden"
                    />
                    <IoIosAddCircle
                        size={28}
                        className="hidden text-tango-500 group-hover:block"
                    />
                </button>
            </div>
            <Tooltip
                place="bottom"
                delayShow={500}
                style={{ backgroundColor: "#1c1917" }}
                id="add-topic-button"
            />
        </>
    );
};

type RemoveTopicProps = {
    topicId: string;
    idx: number;
    setViewedTopic: React.Dispatch<React.SetStateAction<number>>;
};

const RemoveTopic = ({ topicId, setViewedTopic, idx }: RemoveTopicProps) => {
    const trpc = api.useContext();
    const removeTopicId = "createTopic";
    const { mutate: removeTopic } = api.notebook.removeTopic.useMutation({
        onMutate: () => {
            toast.loading("Removing...", { id: removeTopicId });
        },
        onError: (e) => {
            if (e.data?.code == "BAD_REQUEST") {
                toast.error(e.message, { id: removeTopicId });
            } else {
                toast.error("Something went wrong", { id: removeTopicId });
            }
        },
        onSuccess: async () => {
            toast.success("Removed!", { id: removeTopicId, duration: 2000 });
            toast.dismiss("topicModal");
            await trpc.notebook.invalidate();
            setViewedTopic(idx - 1);
        },
    });

    return (
        <>
            <div
                data-tooltip-id="remove-topic-button"
                data-tooltip-content="Remove topic"
                data-tooltip-variant="info"
                className="group flex flex-row items-center"
                onClick={() => {
                    toast(
                        (t) => {
                            return (
                                <span className="cursor-default bg-pomegranate-900 text-neutral-50">
                                    Sure you want to remove this topic from your
                                    notebook?
                                    <div className="flex flex-row justify-between pt-3">
                                        <button
                                            className="hover:text-neutral-900"
                                            onClick={() => {
                                                toast.dismiss(t.id);
                                            }}
                                        >
                                            🛟Keep!
                                        </button>
                                        <button
                                            className="hover:text-neutral-900"
                                            onClick={() => {
                                                removeTopic({
                                                    topicId: topicId,
                                                });
                                            }}
                                        >
                                            Remove!🌊
                                        </button>
                                    </div>
                                </span>
                            );
                        },
                        {
                            duration: 10_000,
                            style: {
                                backgroundColor: "rgb(104 58 55)",
                            },
                            id: "topicModal",
                        },
                    );
                }}
            >
                <button className="">
                    <IoIosRemoveCircleOutline
                        size={24}
                        className="text-tango-500 group-hover:hidden"
                    />
                    <IoIosRemoveCircle
                        size={24}
                        className="hidden text-tango-500 group-hover:block"
                    />
                </button>
            </div>
            <Tooltip
                place="bottom"
                delayShow={500}
                style={tooltipStyles}
                id="remove-topic-button"
            />
        </>
    );
};

const TopicNoteWizard = ({ topicId }: { topicId: string }) => {
    return <div></div>;
};

const ReferenceNoteWizard = ({ referenceId }: { referenceId: string }) => {
    return <div className="w-96 border">notes box</div>;
};
