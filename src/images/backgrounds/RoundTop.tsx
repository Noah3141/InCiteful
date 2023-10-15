import * as React from "react";
const SvgComponent = ({ className }: { className: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        width={"100vw"}
        viewBox="0 0 1200 1200"
        className={` ${className}`}
    >
        <path
            d="M0 0h1200v336.843c-.059-155.209-268.836-281.167-600-281.167-331.2 0-600 125.986-600 281.218z"
            style={{
                stroke: "#9f3b91",
                strokeWidth: 0,
                strokeDasharray: "none",
                strokeLinecap: "butt",
                strokeDashoffset: 0,
                strokeLinejoin: "miter",
                strokeMiterlimit: 4,
                fill: "#dcb492",
                fillRule: "nonzero",
                opacity: 1,
            }}
        />
        <path
            d="M0 .051v.051V0v.051z"
            style={{
                stroke: "#9f3b91",
                strokeWidth: 0,
                strokeDasharray: "none",
                strokeLinecap: "butt",
                strokeDashoffset: 0,
                strokeLinejoin: "miter",
                strokeMiterlimit: 4,
                fill: "#8669fc",
                fillRule: "nonzero",
                opacity: 1,
            }}
            transform="translate(1200 336.843)"
        />
    </svg>
);
export default SvgComponent;
