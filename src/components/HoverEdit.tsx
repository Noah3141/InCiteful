import React, { ReactNode } from "react";
import { VscEdit } from "react-icons/vsc";

const HoverEdit = ({
    children,
    cursorHover,
    editEvent,
    className = "",
}: {
    children: ReactNode;
    cursorHover: boolean;
    editEvent: React.MouseEventHandler<HTMLDivElement>;
    className?: string;
}) => {
    if (cursorHover) {
        return (
            <span className={`group relative text-lg ${className}`}>
                {children}
                <div
                    onClick={editEvent}
                    className={`
                        absolute right-0 top-1/2 z-10 hidden 
                        -translate-y-1/2 before:absolute before:h-8 before:w-8 before:rounded-full before:bg-neutral-700 
                        before:opacity-30 after:absolute after:top-0 after:h-8 after:w-8 after:scale-0 after:rounded-full after:bg-sushi-700 after:opacity-40 after:transition-all 
                        hover:cursor-pointer after:hover:scale-100 group-hover:inline
                    `}
                >
                    <div className="flex h-8 w-8 flex-row items-center justify-center ">
                        <VscEdit className="relative z-20" />
                    </div>
                </div>
            </span>
        );
    }
    return (
        <span className={`group relative text-base  ${className}`}>
            {children}
            <div
                onClick={editEvent}
                className={`
                        absolute right-[2px] top-[2px] z-10 hidden 
                        before:absolute before:top-0 before:h-6 before:w-6 before:rounded-full before:bg-neutral-700 before:opacity-70 
                        after:absolute after:top-0 after:h-6 after:w-6 after:scale-0 after:rounded-full after:bg-sushi-600 after:opacity-70 after:transition-all hover:cursor-pointer after:hover:scale-100 
                        group-hover:inline
                    `}
            >
                <div className="flex h-6 w-6 flex-row items-center justify-center ">
                    <VscEdit className="relative z-20 text-sushi-500" />
                </div>
            </div>
        </span>
    );
};

export default HoverEdit;
