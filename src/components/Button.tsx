import { type ReactNode } from "react";
import Loading from "./Loading";

type Props = {
    small?: boolean;
    text: string;
    loading?: boolean;
    className?: string;
    color: "primary" | "secondary" | "neutral";
    children?: ReactNode;
} & React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>;

const Button = ({
    small = false,
    color,
    text,
    loading = false,
    className = "",
    children,
    ...props
}: Props) => {
    const colorClasses =
        color == "primary"
            ? ` rounded-sm  text-tango-500 border-4 border-tango-500
            hover:bg-tango-500 hover:text-sand-100`
            : color == "secondary"
            ? `rounded-sm  text-gable-900
            bg-sushi-500 hover:bg-sushi-600  hover:text-gable-950 disabled:bg-neutral-500 disabled:text-neutral-900`
            : color == "neutral"
            ? `bg-neutral-700 rounded-sm text-neutral-100
            hover:bg-neutral-800 hover:text-neutral-100`
            : null;
    const sizeClasses = small ? "py-1 px-4 w-fit" : "py-3 px-5 w-fit";
    const loaderColor =
        color == "primary"
            ? `neutral`
            : color == "secondary"
            ? `neutral`
            : color == "neutral"
            ? `primary`
            : "neutral";
    return (
        <button
            {...props}
            className={`relative w-fit  ${className} ${sizeClasses} ${colorClasses}`}
        >
            {loading ? (
                <Loading
                    className="absolute -right-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 "
                    color={loaderColor}
                    inline={true}
                />
            ) : (
                ""
            )}{" "}
            {loading ? (
                <span className={`text-[#fff0]`}>{text}</span>
            ) : (
                <span>{text}</span>
            )}
        </button>
    );
};

export default Button;
