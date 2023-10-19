import * as React from "react";
const InCiteful = ({
    className,
    size = "large",
}: {
    className?: string;
    size?: "small" | "large";
}) => {
    if (size == "large")
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlSpace="preserve"
                width={300}
                height={300}
                fill="currentColor"
                className={` ${className}`}
                viewBox="0 0 600 600"
            >
                <path
                    d="m65.25-81.666-40.71 2.847-89.79 160.485 42.09-2.944z"
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
                    transform="rotate(4 -4164.84 2681.158) scale(2.31782)"
                />
                <path
                    d="M44.626-76.415H2.216l-98.884 152.83H96.668L78.06 48.55H-37.781z"
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
                    transform="translate(363.133 297.055) scale(2.31782)"
                />
            </svg>
        );
    else
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlSpace="preserve"
                width={600}
                className={` ${className}`}
                height={600}
                viewBox="0 0 600 600"
                fill="currentColor"
            >
                <path
                    d="m65.25-81.666-40.71 2.847-89.79 160.485 42.09-2.944z"
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
                    transform="rotate(4 -4171.078 2502.491) scale(2.31782)"
                />
                <path
                    d="M44.626-76.415H2.216l-98.884 152.83H96.668L78.06 48.55H-37.781z"
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
                    transform="translate(368.96 297.055) scale(2.31782)"
                />
            </svg>
        );
};
export default InCiteful;
