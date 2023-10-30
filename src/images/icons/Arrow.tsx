import * as React from "react";
const SvgComponent = ({
    className,
    size,
}: {
    className?: string;
    size?: number;
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        width={size ?? 32}
        height={size ?? 32}
        viewBox="0 0 32 32"
        fill="currentColor"
        className={`${className}`}
    >
        <path
            d="M-7.177 4.325a1.676 1.676 0 0 1 0-2.37l6.55-6.549a.907.907 0 0 1 1.281 0l6.522 6.522a1.68 1.68 0 0 1 0 2.375c-.725.724-1.9.724-2.624 0L-.012-.261l-4.586 4.586a1.824 1.824 0 0 1-2.579 0z"
            style={{
                stroke: "#000",
                strokeWidth: 0,
                strokeDasharray: "none",
                strokeLinecap: "butt",
                strokeDashoffset: 0,
                strokeLinejoin: "miter",
                strokeMiterlimit: 4,
                fillRule: "nonzero",
                opacity: 1,
            }}
            transform="matrix(-2.08668 0 0 -2.08668 15.456 -16.602)"
            vectorEffect="non-scaling-stroke"
        />
        <path
            d="M0 0h9.877l10.272 13.372L30.422 0h9.876L20.15 25.848z"
            style={{
                stroke: "#000",
                strokeWidth: 0,
                strokeDasharray: "none",
                strokeLinecap: "butt",
                strokeDashoffset: 0,
                strokeLinejoin: "miter",
                strokeMiterlimit: 4,
                fillRule: "nonzero",
                opacity: 1,
            }}
            transform="matrix(.79408 0 0 -.79408 -.036 25.065)"
            vectorEffect="non-scaling-stroke"
        />
    </svg>
);
export default SvgComponent;
