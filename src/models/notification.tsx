import { createId } from "@paralleldrive/cuid2";
import { Notification, NotificationType } from "@prisma/client";
import toast from "react-hot-toast";
import { AiOutlineClose } from "react-icons/ai";
import { api } from "~/utils/api";

type Notify = (notifications: Notification[]) => void;

export const notify: Notify = (notifications: Notification[]) => {
    const { mutate } = api.user.dismissNotification.useMutation({
        onMutate: (input) => {
            toast.loading("", { id: input.toastId });
            toast.dismiss(input.toastId);
        },
    });
    notifications.map((notification) => {
        switch (notification.type) {
            // Toast to show for notifications of type JOB_UPDATE
            case "JOB_UPDATE":
                toast(
                    (t) => {
                        return (
                            <div className="flex flex-row items-center justify-between gap-2">
                                <div>{notification.message}</div>
                                <button
                                    onClick={() => {
                                        mutate({
                                            notificationId: notification.id,
                                            toastId: t.id,
                                        });
                                    }}
                                    className={`
                                    relative flex h-6 w-6 flex-row items-center justify-center text-neutral-600 after:absolute
                                    after:left-0 after:top-0 after:h-6 after:w-6 after:scale-0 after:rounded-full after:bg-gable-700 after:opacity-20 after:transition-all hover:text-neutral-700 after:hover:scale-100 
                                    `}
                                >
                                    <AiOutlineClose
                                        color="currentColor"
                                        className="z-10"
                                    />
                                </button>
                            </div>
                        );
                    },
                    { duration: 120_000, icon: "🔔" },
                );
                break;

            // Toast to show for notifications of type MEMBERSHIP_UPDATE
            case "MEMBERSHIP_UPDATE":
                toast((t) => {
                    return <div></div>;
                });
                break;
        }
    });
};

export const test = (type: NotificationType): Notification[] => {
    switch (type) {
        case "JOB_UPDATE":
            return [
                {
                    createdAt: new Date(),
                    dismissed: false,
                    id: createId(),
                    jobId: "fee",
                    message: "Your job is now PENDING",
                    type,
                    userId: "test",
                },
                {
                    createdAt: new Date(),
                    dismissed: false,
                    id: createId(),
                    message: "Your job is now PROCESSING",
                    type,
                    jobId: "fie",
                    userId: "test",
                },
                {
                    createdAt: new Date(),
                    dismissed: false,
                    id: createId(),
                    jobId: "foe",
                    message: "Your job is now COMPLETED",
                    type,
                    userId: "test",
                },
            ];
        case "MEMBERSHIP_UPDATE":
            return [
                {
                    createdAt: new Date(),
                    dismissed: false,
                    id: createId(),
                    message: "Your membership will expire in 1 week",
                    type,
                    jobId: "fum",
                    userId: "test",
                },
                {
                    createdAt: new Date(),
                    dismissed: false,
                    id: createId(),
                    jobId: "uhm",
                    message: "Your usage has reached your pre-set limit",
                    type,
                    userId: "test",
                },
            ];
    }
};
