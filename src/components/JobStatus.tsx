import { Status } from "@prisma/client";
import { MoonLoader } from "react-spinners";

export const JobStatus = ({ status }: { status: Status }) => {
    const classes = "h-4 w-4";
    switch (status) {
        case "COMPLETED":
            return (
                <div title="Complete!" className={classes}>
                    ✅
                </div>
            );
        case "FAILED":
            return (
                <div title="Failed" className={classes}>
                    ❌
                </div>
            );
        case "PENDING":
            return (
                <div title="In queue" className={classes}>
                    🗓️
                </div>
            );
        case "RUNNING":
            return (
                <div>
                    <MoonLoader
                        title="Processing now"
                        color="currentColor"
                        className="text-sushi-500"
                        speedMultiplier={0.5}
                    />
                </div>
            );
        case "CANCELLED":
            return (
                <div title="Cancelled" className={classes}>
                    🛑
                </div>
            );
        case "UNKNOWN":
            return (
                <div title="Unknown!" className={classes}>
                    🐒
                </div>
            );

        default:
            break;
    }

    return;
};
