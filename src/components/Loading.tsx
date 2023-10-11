import React from "react";
import { ClipLoader } from "react-spinners";

const Loading = ({
    inline = true,
    hideOnce = false,
    color = "neutral",
}: {
    inline: boolean;
    hideOnce?: boolean;
    color: "neutral" | "primary" | "secondary";
}) => {
    const colorVal =
        color == "neutral"
            ? "text-neutral-800"
            : color == "primary"
            ? "text-tango-500"
            : color == "secondary"
            ? "text-sushi-500"
            : undefined;

    if (inline)
        return (
            <div className="flex w-full justify-center">
                <ClipLoader
                    color="currentColor"
                    className={` ${colorVal}`}
                    hidden={hideOnce}
                    size={24}
                />
            </div>
        );
    else
        return (
            <div className="flex h-96 flex-row items-center justify-center ">
                <ClipLoader
                    color="currentColor"
                    className={` ${colorVal}`}
                    hidden={hideOnce}
                    size={60}
                />
            </div>
        );
};

export default Loading;
