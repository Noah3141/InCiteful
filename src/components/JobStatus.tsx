import { Status } from "@prisma/client";
import { TailSpin } from "react-loader-spinner";

import { Tooltip } from "react-tooltip";
import { tooltipStyles } from "~/styles/tooltips";

//! GPT generated
export const toTitleCase = (input: string): string => {
    // Split the input string into words
    const words = input.split(" ");

    // Capitalize the first letter of each word and convert the rest to lowercase
    const titleCaseWords = words.map((word) => {
        if (word.length > 0) {
            const firstLetter = word.at(0)?.toUpperCase();
            const restOfWord = word.slice(1).toLowerCase();
            return firstLetter + restOfWord;
        }
        return word; // Handle empty words gracefully
    });

    // Join the title case words back into a single string
    const titleCaseString = titleCaseWords.join(" ");

    return titleCaseString;
};

export const JobStatus = ({ status }: { status: Status }) => {
    const classes = "h-6 w-6 cursor-default ";
    const tooltip = (
        <Tooltip
            place="top"
            delayShow={500}
            style={tooltipStyles}
            id="status-tooltip"
        />
    );
    switch (status) {
        case "COMPLETED":
            return (
                <div
                    data-tooltip-id={`status-tooltip`}
                    data-tooltip-content={`Completed!`}
                    data-tooltip-variant="info"
                    className={classes}
                >
                    ✅ {tooltip}
                </div>
            );
        case "FAILED":
            return (
                <div
                    data-tooltip-id={`status-tooltip`}
                    data-tooltip-content={`Failed!`}
                    data-tooltip-variant="info"
                    className={classes}
                >
                    ❌ {tooltip}
                </div>
            );
        case "PENDING":
            return (
                <div
                    data-tooltip-id={`status-tooltip`}
                    data-tooltip-content={`In queue!`}
                    data-tooltip-variant="info"
                    className={classes}
                >
                    🗓️ {tooltip}
                </div>
            );
        case "RUNNING":
            return (
                <div
                    className={`flex scale-75 items-center justify-center rounded-full bg-gable-800 text-tango-500 ${classes}`}
                >
                    <TailSpin
                        height="24"
                        width="24"
                        color="currentColor"
                        ariaLabel="tail-spin-loading"
                        radius=".9"
                        strokeWidth={8}
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                    />
                </div>
            );
        case "CANCELLED":
            return (
                <div
                    data-tooltip-id={`status-tooltip`}
                    data-tooltip-content={`Cancelled!`}
                    data-tooltip-variant="info"
                    className={classes}
                >
                    🛑 {tooltip}
                </div>
            );
        case "UNKNOWN":
            return (
                <div
                    data-tooltip-id={`status-tooltip`}
                    data-tooltip-content={`Unknown!`}
                    data-tooltip-variant="info"
                    className={classes}
                >
                    🐒 {tooltip}
                </div>
            );

        default:
            break;
    }

    return;
};
