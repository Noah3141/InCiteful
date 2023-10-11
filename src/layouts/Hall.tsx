import { type ReactNode } from "react";

type Props = {
    children: ReactNode;
    className?: string;
};

const Hall = ({ children, className = "" }: Props) => {
    return (
        <div className={`mx-auto max-w-4xl pt-12  ${className}`}>
            {children}
        </div>
    );
};

export default Hall;
