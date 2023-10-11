import Link from "next/link";
import React from "react";
import Loading from "~/components/Loading";
import Hall from "~/layouts/Hall";
import { api } from "~/utils/api";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

import { IoIosAddCircleOutline, IoIosAddCircle } from "react-icons/io";

const Libraries = () => {
    const { data, isLoading } = api.library.getAllSessions.useQuery();

    if (isLoading)
        return (
            <Hall>
                <div className="flex flex-row items-center justify-between">
                    <h1 className="page-title text-neutral-800">Libraries</h1>
                    <AddLibrary />
                </div>
                <Loading color="secondary" inline={false}></Loading>
            </Hall>
        );

    if (!data)
        return (
            <Hall>
                <div className="flex flex-row items-center justify-between">
                    <h1 className="page-title text-neutral-800">Libraries</h1>
                    <AddLibrary />
                </div>
                <p>No libraries found!</p>
            </Hall>
        );

    return (
        <Hall>
            <div className="flex flex-row items-center justify-between">
                <h1 className="page-title text-neutral-800">Libraries</h1>
                <AddLibrary />
            </div>
            {data.map((library) => {
                return (
                    <div key={library.id}>
                        <Link href={`/libraries/${library.id}`}>
                            {library.title}
                        </Link>
                    </div>
                );
            })}
        </Hall>
    );
};

export default Libraries;

type AddToLibraryProps = {};

const AddLibrary = ({}: AddToLibraryProps) => {
    return (
        <>
            <div
                data-tooltip-id="add-library-button"
                data-tooltip-content="Add a library"
                data-tooltip-variant="info"
                className="group flex flex-row items-center"
                onClick={() => {
                    void "foo";
                }}
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
