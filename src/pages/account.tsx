import { type User } from "@prisma/client";
import React, { useState } from "react";
import HoverEdit from "~/components/HoverEdit";
import Loading from "~/components/Loading";
import Hall from "~/layouts/Hall";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";
import { AiOutlineCheckCircle } from "react-icons/ai";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

type ProfileForm = {
    name: string | null;
    email: string | null;
    image: string | null;
};

type ProfileEditState = {
    name: boolean;
    email: boolean;
    image: boolean;
};

const Account = () => {
    const session = useSession();
    const { data: user, isLoading } = api.user.getSession.useQuery();

    if (isLoading && session.status != "unauthenticated") {
        return (
            <Hall>
                <div className="px-16">
                    <h1 className="page-title">Account</h1>
                    <Loading inline={false} color="secondary" />
                </div>
            </Hall>
        );
    }
    if (!user) {
        return (
            <Hall>
                <div className="px-16">
                    <h1 className="page-title">Account</h1>
                    <div className="flex h-36 flex-row items-center justify-center text-2xl"></div>
                    No user!
                </div>
            </Hall>
        );
    }

    return (
        <Hall>
            <div className="px-16">
                <h1 className="page-title">Account</h1>
                <ProfileReadout user={user} />
            </div>
        </Hall>
    );
};

export default Account;

type ProfileReadoutProps = {
    user: User;
};

const ProfileReadout = ({ user }: ProfileReadoutProps) => {
    const trpc = api.useContext();
    const initialForm: ProfileForm = user;
    const [form, setForm] = useState<ProfileForm>({ ...initialForm });

    const closedEdits = {
        name: false,
        email: false,
        image: false,
    };
    const [editting, setEditting] = useState<ProfileEditState>(closedEdits);

    const profileSubmitToast = "profileSubmitToastId";
    const { mutate: submitProfile, isLoading: profileSubmitLoading } =
        api.user.updateSession.useMutation({
            onMutate: () => {
                toast.loading("Loading...", { id: profileSubmitToast });
            },
            onSuccess: async () => {
                await trpc.user.invalidate();
                toast.success("Profile updated!", { id: profileSubmitToast });
                setEditting(closedEdits);
            },
            onError: () => {
                toast.error("Something went wrong!", {
                    id: profileSubmitToast,
                });
            },
        });

    return (
        <>
            <div className="flex flex-row items-center justify-between gap-3">
                <div>Username:</div>
                <div className="">
                    {editting.name ? (
                        <>
                            <div className="flex flex-row items-center justify-end">
                                <input
                                    onChange={(n) => {
                                        setForm(
                                            (prev): ProfileForm => ({
                                                ...prev,
                                                name: n.target.value,
                                            }),
                                        );
                                    }}
                                    className={`border-primary-600  bg-basic-50 text-basic-900  caret-basic-800 hover:outline-primary-600 rounded-md px-3 text-2xl outline-none ring-0 hover:cursor-pointer hover:outline-1 focus:outline-none`}
                                    type="text"
                                    value={form.name ?? ""}
                                ></input>
                                <AiOutlineCheckCircle
                                    size={28}
                                    onClick={() => {
                                        submitProfile(form);
                                    }}
                                    className="bg-primary-500  text-basic-800 hover:bg-primary-600 me-2 cursor-pointer rounded-sm p-[3px] "
                                />
                            </div>
                        </>
                    ) : (
                        <HoverEdit
                            cursorHover={true}
                            editEvent={() => {
                                setEditting(
                                    (): ProfileEditState => ({
                                        ...closedEdits,
                                        name: true,
                                    }),
                                );
                            }}
                            className="pe-10"
                        >
                            <span className="cursor-default text-2xl">
                                {user.name}
                            </span>
                        </HoverEdit>
                    )}
                </div>
            </div>
            <div>
                <div className="flex flex-row items-center justify-between gap-3">
                    <div>Email:</div>
                    {editting.email ? (
                        <>
                            <div className="flex flex-row items-center justify-end">
                                <input
                                    onChange={(n) => {
                                        setForm(
                                            (prev): ProfileForm => ({
                                                ...prev,
                                                email: n.target.value,
                                            }),
                                        );
                                    }}
                                    className={`border-primary-600  bg-basic-50 text-basic-900  caret-basic-800 hover:outline-primary-600 rounded-md px-3 text-2xl outline-none ring-0 hover:cursor-pointer hover:outline-1 focus:outline-none`}
                                    type="text"
                                    value={form.email ?? ""}
                                ></input>
                                <AiOutlineCheckCircle
                                    size={28}
                                    onClick={() => {
                                        submitProfile(form);
                                    }}
                                    className="bg-primary-500  text-basic-800 hover:bg-primary-600 me-2 cursor-pointer rounded-sm p-[3px] "
                                />
                            </div>
                        </>
                    ) : (
                        <HoverEdit
                            cursorHover={true}
                            editEvent={() => {
                                setEditting(
                                    (): ProfileEditState => ({
                                        ...closedEdits,
                                        email: true,
                                    }),
                                );
                            }}
                            className="pe-10 "
                        >
                            <span className="cursor-default text-2xl ">
                                {user.email}
                            </span>
                        </HoverEdit>
                    )}
                </div>
            </div>
        </>
    );
};
