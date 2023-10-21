import React, { ReactNode } from "react";

const List = ({ children }: { children: ReactNode }) => {
    return (
        <div className="h-fit  rounded-sm bg-gable-950  text-neutral-100">
            {children}
        </div>
    );
};

export default List;

export const Header = ({
    children,
    className,
}: {
    className?: string;
    children: ReactNode;
}) => {
    return (
        <div
            className={`flex  flex-row items-center justify-between border-b border-b-gable-900 p-2  ${className}`}
        >
            {children}
        </div>
    );
};
export const Body = ({
    children,
    className,
}: {
    className?: string;
    children: ReactNode;
}) => {
    return (
        <div
            className={`max-h-96 overflow-x-clip overflow-y-scroll text-ellipsis text-lg font-medium ${className}`}
        >
            {children}
        </div>
    );
};
