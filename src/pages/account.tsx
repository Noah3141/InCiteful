import { type User } from "@prisma/client";
import React, { useState } from "react";
import HoverEdit from "~/components/HoverEdit";
import Loading from "~/components/Loading";
import Hall from "~/layouts/Hall";
import { api } from "~/utils/api";
import { dateTimeFormatter as dtfmt } from "~/utils/tools";

import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Button from "~/components/Button";
import { BiSolidCheckCircle } from "react-icons/bi";

type ProfileForm = {
    name: string | null;
    email: string | null;
    image: string | null;
    notifyByEmail: string | null;
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
            <Hall title="...">
                <div className="px-3 transition-all duration-300 lg:px-16">
                    <h1 className="page-title">Account</h1>
                    <Loading inline={false} color="secondary" />
                </div>
            </Hall>
        );
    }
    if (!user) {
        return (
            <Hall title="Account">
                <div className="px-3 transition-all duration-300 lg:px-16">
                    <h1 className="page-title">Account</h1>
                    <div className="flex h-36 flex-row items-center justify-center text-2xl"></div>
                    No user!
                </div>
            </Hall>
        );
    }

    return (
        <Hall title="Account">
            <div className="px-3 transition-all duration-300 lg:px-16">
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

const unsavedChanges = ({
    form,
    savedForm,
}: {
    form: ProfileForm;
    savedForm: ProfileForm;
}): boolean => {
    let unsavedChanges = false;
    let k: keyof typeof form;
    for (k in form) {
        if (form[k] != savedForm[k]) {
            unsavedChanges = true;
        }
    }
    return unsavedChanges;
};

const ProfileReadout = ({ user }: ProfileReadoutProps) => {
    const trpc = api.useContext();
    const initialForm: ProfileForm = user;
    const [savedForm, setSavedForm] = useState<ProfileForm>({ ...initialForm });
    const [form, setForm] = useState<ProfileForm>({ ...initialForm });
    const closedEdits = {
        name: false,
        email: false,
        image: false,
    };
    const [editting, setEditting] = useState<ProfileEditState>(closedEdits);

    const profileSubmitToast = "profileSubmitToastId";
    const { mutate: submitProfile, isLoading: submitLoading } =
        api.user.updateSession.useMutation({
            onMutate: () => {
                toast.loading("Loading...", { id: profileSubmitToast });
            },
            onSuccess: async () => {
                await trpc.user.invalidate();
                toast.success("Profile updated!", { id: profileSubmitToast });
                setEditting(closedEdits);
                setSavedForm(form);
            },
            onError: () => {
                toast.error("Something went wrong!", {
                    id: profileSubmitToast,
                });
            },
        });

    return (
        <div className="">
            {/* Rows */}
            <div className="flex flex-col gap-6  py-12">
                <div className="flex flex-col items-start gap-3 text-2xl  sm:flex-row sm:items-center">
                    <span>Username:</span>
                    <span className="font-medium">
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
                                        className={`
                                        w-full  max-w-md rounded-md  bg-sand-50 px-3   text-2xl text-sand-950 caret-sand-900 outline-none ring-0 ring-tango-600 hover:cursor-pointer 
                                        hover:ring-1 hover:ring-tango-500 focus:cursor-text focus:ring-0
                                        `}
                                        type="text"
                                        value={form.name ?? ""}
                                    ></input>
                                    <BiSolidCheckCircle
                                        size={28}
                                        onClick={() => {
                                            setEditting(closedEdits);
                                        }}
                                        className=" me-2 translate-x-1 cursor-pointer rounded-sm p-[3px]"
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
                                <span className="cursor-default rounded-lg px-2 py-1 text-2xl  ">
                                    {form.name}
                                </span>
                            </HoverEdit>
                        )}
                    </span>
                </div>
                <div>
                    <div className="flex flex-col items-start gap-3 text-2xl sm:flex-row sm:items-center">
                        <span>Email:</span>
                        <span className="font-medium">
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
                                            className={`
                                            w-full  max-w-md rounded-md  bg-sand-50  px-3 text-2xl text-sand-950 caret-sand-900 outline-none ring-0 ring-tango-600 hover:cursor-pointer 
                                            hover:ring-1 hover:ring-tango-500 focus:cursor-text focus:ring-0
                                            `}
                                            type="text"
                                            value={form.email ?? ""}
                                        ></input>
                                        <BiSolidCheckCircle
                                            size={28}
                                            onClick={() => {
                                                setEditting(closedEdits);
                                            }}
                                            className="me-2 translate-x-1 cursor-pointer rounded-sm p-[3px] text-sand-950 hover:text-sand-900 "
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
                                        {form.email}
                                    </span>
                                </HoverEdit>
                            )}
                        </span>
                    </div>
                </div>
                <div className="">
                    <div className="flex flex-col  gap-3 pe-0 text-2xl lg:flex-row lg:items-center   lg:pe-10">
                        <div>Notify by Email:</div>
                        <div className="group">
                            <Button
                                small={true}
                                color="neutral"
                                onClick={() => {
                                    setForm((p) => ({
                                        ...p,
                                        notifyByEmail: p.notifyByEmail
                                            ? null
                                            : p.email,
                                    }));
                                    setEditting(closedEdits);
                                }}
                                className="text-xl"
                                text={form.notifyByEmail ? "Yes" : "No"}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex flex-row justify-end pe-0 lg:pe-10">
                        <Button
                            loading={submitLoading}
                            disabled={!unsavedChanges({ form, savedForm })}
                            color="secondary"
                            className=""
                            onClick={() => {
                                submitProfile(form);
                            }}
                            text="Submit"
                        ></Button>
                    </div>
                </div>
            </div>
            <div className="py-12">
                <div>Usage:</div>

                <div>
                    Membership status:{" "}
                    {user.membership == "Paid" ? "Active" : "Inactive"}
                </div>
            </div>
        </div>
    );
};
