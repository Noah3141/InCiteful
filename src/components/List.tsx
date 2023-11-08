import React, { ReactNode } from "react";

const List = ({ children }: { children: ReactNode }) => {
    return (
        <div className="h-fit rounded-lg bg-gable-950  text-neutral-100">
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
            className={`flex flex-row items-center justify-between border-b border-b-gable-900 p-4  ${className}`}
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
            className={`gable-scroller max-h-96 overflow-y-auto overflow-x-clip text-ellipsis rounded-b-lg text-lg font-medium ${className}`}
        >
            {children}
        </div>
    );
};
