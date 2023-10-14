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
            ? ` rounded-sm  text-tango-500
            hover:bg-tango-500 hover:text-neutral-950`
            : color == "secondary"
            ? `rounded-sm  text-neutral-800
            bg-sushi-500 hover:bg-sushi-600  hover:text-neutral-900`
            : color == "neutral"
            ? `bg-neutral-700 rounded-sm text-neutral-100
            hover:bg-neutral-800 hover:text-neutral-100`
            : null;
    const sizeClasses = small ? "py-1 px-2" : "py-2 px-3";
    const loaderColor =
        color == "primary"
            ? `primary`
            : color == "secondary"
            ? `secondary`
            : color == "neutral"
            ? `neutral`
            : "neutral";
    return (
        <button
            {...props}
            className={`  ${className} ${sizeClasses} ${colorClasses}`}
        >
            {loading ? <Loading color={loaderColor} inline={true} /> : text}
        </button>
    );
};

export default Button;
