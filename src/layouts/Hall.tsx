import { type ReactNode } from "react";

type Props = {
    children: ReactNode;
    title?: string;
    className?: string;
};

const Hall = ({ children, className = "", title }: Props) => {
    return (
        <>
            <title>{title ?? "InCiteful"}</title>
            <div
                className={`mx-auto h-full min-h-screen max-w-4xl pt-12 ${className}`}
            >
                {children}
            </div>
        </>
    );
};

export default Hall;
