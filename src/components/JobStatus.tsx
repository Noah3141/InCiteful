import { Status } from "@prisma/client";
import { MoonLoader } from "react-spinners";
import { Tooltip } from "react-tooltip";
import { tooltipStyles } from "~/styles/tooltips";

export const JobStatus = ({ status }: { status: Status }) => {
    const classes = "h-4 w-4 cursor-default";

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
                <div className={classes}>
                    <MoonLoader
                        data-tooltip-id={`status-tooltip`}
                        data-tooltip-content={`Processing now!`}
                        data-tooltip-variant="info"
                        color="currentColor"
                        className="text-sushi-500"
                        speedMultiplier={0.5}
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
