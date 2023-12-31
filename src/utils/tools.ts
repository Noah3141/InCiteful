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

export const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "numeric",
});

type DtfmtInput =
    | { at: Date; ifNull?: never }
    | { at: Date | null; ifNull: string };

export const dtfmt = ({ at, ifNull }: DtfmtInput) => {
    if (!at) {
        if (!ifNull) {
            throw new Error(
                "Passed no ifNull value to dtfmt, while DateTime passed was also null!",
            );
        }
        return ifNull;
    }

    const today = new Date();

    if (at.getDate() == today.getDate()) {
        at.getTime();
        return "Today, " + timeFormatter.format(at);
    }
    if (at.getDate() + 1 == today.getDate()) {
        return "Yesterday, " + timeFormatter.format(at);
    }

    const dateTime = dateTimeFormatter.format(at);

    return dateTime;
};

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
