import { type Reference, type Topic, type Document } from "@prisma/client";
import { useRouter } from "next/router";
import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from "react";
import toast from "react-hot-toast";
import {
    IoIosAddCircle,
    IoIosAddCircleOutline,
    IoIosRemoveCircle,
    IoIosRemoveCircleOutline,
} from "react-icons/io";
import { Tooltip } from "react-tooltip";
import Button from "~/components/Button";
import List, { Body, Header } from "~/components/List";
import Loading from "~/components/Loading";
import MiddleColumn from "~/components/MiddleColumn";
import Hall from "~/layouts/Hall";
import { tooltipStyles } from "~/styles/tooltips";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";

type TopicWithReferences = Topic & {
    references: (Reference & { document: Document })[];
};

const Notebook = () => {
    const { data: topics, isLoading } = api.notebook.getNotebookData.useQuery();
    const router = useRouter();
    const [viewedTopic, setViewedTopic] = useState<TopicWithReferences | null>(
        topics?.[0] ?? null,
    );

    useEffect(() => {
        if (!!topics && !isLoading) {
            if (!viewedTopic) {
                setViewedTopic(topics[0] ?? null);
            }
        }
    }, [topics, isLoading]);

    if (isLoading) return <Loading inline={false} color="secondary" />;

    if (!topics) {
        // if topics is returning undefined something is going wrong backend, most likely not signed in. Send away from this page!
        void router.push("//");
        return;
    }

    if (!viewedTopic) {
        return (
            <div className="mx-auto mt-32 flex max-w-xs flex-row justify-center gap-3 rounded-lg bg-gable-900 py-6 text-xl text-tango-500">
                Create your first topic! <AddTopic />
            </div>
        );
    }

    return (
        <>
            <title>Notebook</title>
            <div className="mx-auto max-w-[1600px] px-3 pt-12">
                <div className="flex flex-col gap-3 lg:flex-row ">
                    <List>
                        <Header className="flex flex-row items-center justify-between border-b border-b-gable-900 p-2 lg:w-60">
                            <h1 className="text-xl">Topics</h1>
                            <AddTopic />
                        </Header>
                        <Body>
                            <TopicList
                                {...{ setViewedTopic, topics, viewedTopic }}
                            />
                        </Body>
                    </List>
                    <MiddleColumn>
                        <TopicReadout topic={viewedTopic} />
                        <TopicNoteWizard topic={viewedTopic} />
                    </MiddleColumn>
                </div>
            </div>
        </>
    );
};

type TopicListProps = {
    topics: TopicWithReferences[];
    viewedTopic: TopicWithReferences | null;
    setViewedTopic: Dispatch<SetStateAction<TopicWithReferences | null>>;
};

const TopicList = ({ topics, viewedTopic, setViewedTopic }: TopicListProps) => {
    return (
        <div>
            {topics.map((topic, idx, topics) => {
                return (
                    <div
                        key={topic.id}
                        className="flex flex-row items-center justify-between"
                    >
                        <button
                            className={`flex w-full items-center justify-between px-4 py-1 text-left hover:bg-gable-900  ${
                                viewedTopic?.id === topic.id
                                    ? "text-tango-500 hover:text-tango-500"
                                    : " hover:text-sushi-400"
                            }`}
                            onClick={() => setViewedTopic(topic)}
                        >
                            {topic.name}
                            {viewedTopic?.id === topic.id && (
                                <RemoveTopic
                                    onRemove={() => {
                                        setViewedTopic(topics[idx - 1] ?? null);
                                    }}
                                    topicId={topic.id}
                                />
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

// Reference list
const TopicReadout = ({ topic }: { topic: TopicWithReferences | null }) => {
    if (!topic) {
        return "";
    }

    return (
        <div className="max-h-[50vh] overflow-scroll rounded-sm bg-gable-950 text-neutral-50 lg:max-h-[70vh]">
            <div className=" p-6 text-2xl leading-none">{topic?.name}</div>
            <div className="flex flex-row gap-4 border-b border-b-gable-900 px-6 pb-2">
                <div className="font-medium">
                    Created: {topic?.createdAt && dtfmt.format(topic.createdAt)}
                </div>
                <div>
                    {topic?.updatedAt && (
                        <div className="font-medium">
                            <span>Last Updated: </span>{" "}
                            {dtfmt.format(topic.updatedAt)}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-12 p-6">
                {topic?.references.length !== 0
                    ? topic?.references.map((reference) => {
                          const articlePublished = reference.document
                              .publishedAt
                              ? dtfmt.format(reference.document.publishedAt)
                              : "Not found";
                          const referenceAdded = `Reference Added:
                ${dtfmt.format(reference.addedAt)}`;
                          return (
                              <div
                                  key={reference.id}
                                  className="flex flex-col justify-between gap-6 md:flex-row"
                              >
                                  <div className="w-full">
                                      <h1 className="">
                                          {reference.document.title}
                                      </h1>
                                      <div className="my-3 flex w-full flex-col gap-6 lg:flex-row">
                                          <div className="max-h-64 w-full overflow-scroll rounded bg-gable-900 p-4 font-medium">
                                              <span className="text-neutral-50">
                                                  {reference.preText}
                                              </span>
                                              <span className="text-sushi-400">
                                                  {` ${reference.focalText} `}
                                              </span>
                                              <span className="text-neutral-50">
                                                  {reference.postText}
                                              </span>
                                          </div>
                                          <ReferenceNoteWizard
                                              reference={reference}
                                          />
                                      </div>
                                      <div>{referenceAdded}</div>
                                      <div>
                                          Article Published: {articlePublished}
                                      </div>
                                  </div>
                              </div>
                          );
                      })
                    : "No references yet"}
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
    onRemove: () => void;
};

const RemoveTopic = ({ topicId, onRemove }: RemoveTopicProps) => {
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
            onRemove();
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

type TopicWizardProps = { topic: TopicWithReferences | null };

const TopicNoteWizard = ({ topic }: TopicWizardProps) => {
    const trpc = api.useContext();
    const updateTopicNotesToast = "UpdateTopicNotesToastId";
    const { mutate: updateNote, isLoading: updateLoading } =
        api.notebook.updateTopicNotes.useMutation({
            onMutate: () => {
                toast.loading("Saving...", { id: updateTopicNotesToast });
            },
            onError: (e) => {
                if (e.data?.code == "BAD_REQUEST") {
                    toast.error(e.message, { id: updateTopicNotesToast });
                } else {
                    toast.error("Something went wrong", {
                        id: updateTopicNotesToast,
                    });
                }
            },
            onSuccess: async () => {
                toast.success("Success!", {
                    id: updateTopicNotesToast,
                });
                await trpc.notebook.invalidate();
            },
        });

    const [notesField, setNotesField] = useState(topic?.notes);

    useEffect(() => {
        setNotesField(topic?.notes);
    }, [topic]);

    if (!topic || typeof topic.notes == "undefined") {
        return "";
    }

    return (
        <div className="mt-3 flex flex-col gap-3 rounded-sm">
            <textarea
                className="h-32 w-full rounded bg-neutral-50 p-2 font-medium text-neutral-950 outline-none ring-tango-500 hover:cursor-pointer hover:ring-2 focus:cursor-text focus:ring-0"
                name="topic-notes"
                onChange={(e) => {
                    setNotesField(e.target.value);
                }}
                value={notesField ?? ""}
                id="topic-notes"
            ></textarea>
            <Button
                disabled={updateLoading}
                onClick={() => {
                    if (!notesField) {
                        return;
                    }
                    updateNote({ topicId: topic.id, notes: notesField });
                }}
                className="self-end"
                color="neutral"
                text={"Save"}
            />
        </div>
    );
};

const ReferenceNoteWizard = ({ reference }: { reference: Reference }) => {
    const [notesField, setNotesField] = useState(reference.notes ?? "");
    const updateReferenceNotesToast = "updateReferenceNotesToastId";
    const trpc = api.useContext();
    const { mutate: updateReferenceNote, isLoading } =
        api.notebook.updateReferenceNotes.useMutation({
            onMutate: () => {
                toast.loading("Saving...", { id: updateReferenceNotesToast });
            },
            onError: (e) => {
                if (e.data?.code == "BAD_REQUEST") {
                    toast.error(e.message, { id: updateReferenceNotesToast });
                } else {
                    toast.error("Something went wrong", {
                        id: updateReferenceNotesToast,
                    });
                }
            },
            onSuccess: async () => {
                toast.success("Success!", {
                    id: updateReferenceNotesToast,
                });
                await trpc.notebook.invalidate();
            },
        });
    return (
        <div className="flex w-full flex-col rounded  lg:w-64 lg:transition-all xl:w-96">
            <textarea
                value={notesField}
                onChange={(e) => {
                    setNotesField(e.target.value);
                }}
                className="h-full w-full rounded bg-neutral-50 p-2 font-medium text-neutral-950 caret-neutral-950 outline-none ring-tango-500  hover:cursor-pointer hover:ring-2 focus:cursor-text focus:ring-0"
            ></textarea>
            <Button
                onClick={() => {
                    updateReferenceNote({
                        referenceId: reference.id,
                        notes: notesField,
                    });
                }}
                loading={isLoading}
                small={true}
                className="mt-2 self-end"
                color="neutral"
                text="Save"
            />
        </div>
    );
};
