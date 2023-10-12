import { type ReactNode } from "react";

type Props = {
    children: ReactNode;
    className?: string;
};

const Hall = ({ children, className = "" }: Props) => {
    return (
        <div
            className={`mx-auto h-full min-h-screen max-w-4xl border-x border-x-sand-300 pt-12 ${className}`}
        >
            {children}
        </div>
    );
};

export default Hall;
