import React from "react";

const MiddleColumn = ({ children }: { children: React.ReactNode }) => {
    return <div className="w-full  lg:h-screen  ">{children}</div>;
};

export default MiddleColumn;
