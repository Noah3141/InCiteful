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
            ? `outline outline-tango-500 text-tango-500
            hover:bg-tango-500 hover:text-neutral-950`
            : color == "secondary"
            ? `outline outline-sushi-500 text-sushi-500
            hover:bg-sushi-500  hover:text-neutral-950`
            : color == "neutral"
            ? `outline outline-neutral-500 text-neutral-500
            hover:bg-neutral-500 hover:text-neutral-100`
            : null;
    const sizeClasses = small ? "py-1 px-2" : "py-2 px-3";

    return (
        <button
            {...props}
            className={`  ${className} ${sizeClasses} ${colorClasses}`}
        >
            {loading ? <Loading inline={true} /> : text}
        </button>
    );
};

export default Button;
