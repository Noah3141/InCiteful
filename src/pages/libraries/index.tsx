import "react-tooltip/dist/react-tooltip.css";
import Link from "next/link";
import React, { useRef, useState } from "react";
import Loading from "~/components/Loading";
import Hall from "~/layouts/Hall";
import { api } from "~/utils/api";
import { Tooltip } from "react-tooltip";

import { IoIosAddCircleOutline, IoIosAddCircle } from "react-icons/io";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const Libraries = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { data, isLoading } = api.library.getAllSessions.useQuery();

    if (isLoading)
        return (
            <Hall title="...">
                <div className="flex flex-row items-center justify-between px-16">
                    <h1 className="page-title text-neutral-800">Libraries</h1>
                    <AddLibrary />
                </div>
                <Loading color="secondary" inline={false}></Loading>
            </Hall>
        );

    if (!data)
        return (
            <Hall title="Libraries">
                <div className="flex flex-row items-center justify-between px-16">
                    <h1 className="page-title text-neutral-800">Libraries</h1>
                    <AddLibrary />
                </div>
                <p className="px-16">No libraries found!</p>
            </Hall>
        );

    if (status == "unauthenticated") {
        void router.push("//");
        return <div></div>;
    }

    return (
        <Hall title="Libraries">
            <div className="flex flex-row items-center justify-between px-16">
                <h1 className="page-title text-neutral-800">Libraries</h1>
                <AddLibrary />
            </div>
            <div className="">
                {data.map((library) => {
                    return (
                        <div
                            key={library.id}
                            className="flex flex-row justify-between  border-y-sand-600 border-opacity-20 px-6 py-2 "
                        >
                            <Link
                                className="text-2xl hover:text-neutral-700"
                                href={`/libraries/${library.id}`}
                            >
                                {library.title}
                            </Link>
                        </div>
                    );
                })}
            </div>
        </Hall>
    );
};

export default Libraries;

type AddLibraryProps = {
    foo?: string;
};

const AddLibrary = ({}: AddLibraryProps) => {
    const trpc = api.useContext();
    const createLibId = "createLib";
    const { mutate: createLibrary } = api.library.createEmpty.useMutation({
        onMutate: () => {
            toast.loading("Creating...", { id: createLibId });
        },
        onError: (e) => {
            if (e.data?.code == "BAD_REQUEST") {
                toast.error(e.message, { id: createLibId });
            } else {
                toast.error("Something went wrong", { id: createLibId });
            }
        },
        onSuccess: async () => {
            toast.success("Success!", { id: createLibId, duration: 2_000 });
            toast.dismiss("titleModal");
            await trpc.library.invalidate();
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
                            Enter a library title:
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
                                🍂Cancel
                            </button>
                            <button
                                className="text-neutral-900 hover:text-tango-500"
                                onClick={() => {
                                    if (ref.current !== null) {
                                        createLibrary({
                                            title: ref.current.value,
                                        });
                                    }
                                    setTitleInput("");
                                }}
                            >
                                Save🧾
                            </button>
                        </div>
                    </div>
                );
            },
            {
                duration: 50000,
                style: {
                    backgroundColor: "rgb(96 123 55)",
                },
                id: "titleModal",
            },
        );
    };

    return (
        <>
            <div
                data-tooltip-id="add-library-button"
                data-tooltip-content="Add a library"
                data-tooltip-variant="info"
                className="group flex flex-row items-center"
                onClick={saveToast}
            >
                <button>
                    <IoIosAddCircleOutline
                        size={30}
                        className="text-gable-800  group-hover:hidden"
                    />
                    <IoIosAddCircle
                        size={30}
                        className="hidden  text-gable-800 group-hover:inline"
                    />
                </button>
            </div>
            <Tooltip
                place="right"
                delayShow={500}
                style={{ backgroundColor: "#1c1917" }}
                id="add-library-button"
            />
        </>
    );
};
