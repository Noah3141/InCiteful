import toast from "react-hot-toast";
import { api } from "./api";
import { ZodError, typeToFlattenedError } from "zod";

export const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
});

export function defaultOpts(toastId: string) {
    const trpc = api.useContext();

    return {
        onMutate: () => {
            toast.loading("Loading...", {
                id: toastId,
            });
        },
        onSuccess: async () => {
            toast.success("Success!", {
                id: toastId,
            });
            await trpc.invalidate();
        },
        onError: () => {
            toast.error("Something went wrong!", {
                id: toastId,
            });
        },
    };
}
