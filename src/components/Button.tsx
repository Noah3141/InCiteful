import { useState, type ReactNode } from "react";
import Loading from "./Loading";
import { IoIosCheckmarkCircle } from "react-icons/io";

type Props = {
    small?: boolean;
    text: string;
    className?: string;
    state?: "loading" | "success" | "error" | "idle";
    color: "primary" | "secondary" | "neutral";
    children?: ReactNode;
} & React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>;

const Button = ({
    small = false,
    color,
    state = "idle",
    text,
    className = "",
    children,
    ...props
}: Props) => {
    const colorClasses =
        color == "primary"
            ? // PRIMARY CLASSES
              ` rounded  text-tango-500 border-4 border-tango-500
            hover:bg-tango-500 hover:text-sand-100`
            : color == "secondary"
            ? // SECONDARY CLASSES
              `text-sushi-600 border-2 border-sushi-600 rounded-lg 
            ${
                state == "loading"
                    ? ""
                    : " enabled:hover:bg-sushi-500 enabled:hover:border-sushi-500 enabled:hover:text-sand-50"
            }
            disabled:opacity-50 disabled:hover:bg-opacity-0 disabled:cursor-default`
            : color == "neutral"
            ? // NEUTRAL CLASSES
              `bg-baltic-700  text-neutral-100 rounded-lg
            hover:bg-baltic-800 hover:text-neutral-50`
            : null;
    const sizeClasses = small ? "py-1 px-4 w-fit" : "py-3 px-6 w-fit";
    const loaderColor =
        color == "primary"
            ? `neutral`
            : color == "secondary"
            ? `secondary`
            : color == "neutral"
            ? `primary`
            : "neutral";

    const [mouseDown, setMouseDown] = useState(false);
    return (
        <button
            disabled={state !== "idle"}
            {...props}
            onMouseDown={() => {
                setMouseDown(true);
            }}
            onMouseUp={() => {
                setMouseDown(false);
            }}
            className={`relative w-fit cursor-pointer whitespace-nowrap transition-transform duration-100 ${
                mouseDown ? "translate-y-[2px]" : "translate-y-0"
            }  ${className} ${sizeClasses} ${colorClasses}`}
        >
            {state === "error" && (
                <div className="absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2">
                    ❌
                </div>
            )}
            {state === "success" && (
                <IoIosCheckmarkCircle
                    className={`absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2 ${
                        color === "primary"
                            ? "text-tango-500"
                            : color === "secondary"
                            ? "text-sushi-600"
                            : "text-tango-500"
                    }`}
                    size={24}
                />
            )}
            {state === "loading" && (
                <Loading
                    className={`absolute  -right-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                        small ? "scale-75" : ""
                    } `}
                    color={loaderColor}
                    inline={true}
                />
            )}
            {state !== "idle" ? (
                <span className={`text-[#fff0]`}>{text}</span>
            ) : (
                <span>{text}</span>
            )}
        </button>
    );
};

export default Button;
