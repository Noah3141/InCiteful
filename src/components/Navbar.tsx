import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import Loading from "./Loading";
import Link from "next/link";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

const Navbar = () => {
    const { data: session, status } = useSession();
    const { data: user, isLoading } = api.user.getSession.useQuery();
    const router = useRouter();

    const mobileSize = `lg:hidden`;
    const fullSize = `hidden lg:flex`;

    if (status == "loading")
        return (
            <>
                <div
                    className={`flex-row justify-between bg-gable-950 px-6  ${fullSize}`}
                >
                    <div className="flex flex-row py-2 text-tango-500">
                        <Link
                            className="px-3 py-3 text-3xl hover:text-tango-600"
                            href={`/`}
                        >
                            Quill
                        </Link>
                    </div>
                    <div className="flex flex-row items-center">
                        <Loading color="primary" inline={true}></Loading>
                    </div>
                </div>

                <div className={`    ${mobileSize}`}></div>
            </>
        );
    if (status == "unauthenticated" || !user)
        return (
            <>
                <div
                    className={`flex-row justify-between bg-gable-950 px-6  ${fullSize}`}
                >
                    <div className="flex flex-row py-2 text-tango-500">
                        <Link
                            className="px-3 py-3 text-3xl hover:text-tango-600"
                            href={`/`}
                        >
                            Quill
                        </Link>
                    </div>
                    <div className="flex flex-row items-center">
                        <button
                            className=" px-3 py-3 text-xl text-tango-500 hover:text-tango-600"
                            onClick={() => {
                                void signIn();
                            }}
                        >
                            Sign In
                        </button>
                    </div>
                </div>

                <div className={`    ${mobileSize}`}></div>
            </>
        );
    // (status == "authenticated")
    else
        return (
            <>
                <div
                    className={`flex-row justify-between bg-gable-950 px-6  ${fullSize}`}
                >
                    <div className="flex flex-row items-center gap-6 py-2 text-xl text-tango-500">
                        <Link
                            className="px-3 py-3 text-3xl hover:text-tango-600"
                            href={`/`}
                        >
                            Quill
                        </Link>
                        <Link
                            className="px-3 py-3 hover:text-tango-600"
                            href="/dashboard"
                        >
                            Dashboard
                        </Link>
                        <Link
                            className="px-3 py-3 hover:text-tango-600"
                            href="/libraries"
                        >
                            Libraries
                        </Link>
                        <Link
                            className="px-3 py-3 hover:text-tango-600"
                            px-2
                            href="/notebook"
                        >
                            Notebook
                        </Link>
                        <Link
                            className="px-3 py-3 hover:text-tango-600"
                            px-2
                            href="/account"
                        >
                            Account
                        </Link>
                    </div>
                    <div className="flex flex-row items-center gap-6">
                        <span className="cursor-default text-2xl text-tango-500">
                            {user?.name}
                        </span>
                        <button
                            onClick={() => {
                                void signOut();
                                void router.push("/dashboard");
                            }}
                            className="px-3 py-3 text-xl text-tango-500 hover:text-tango-600"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
                <div className={`    ${mobileSize}`}></div>
            </>
        );
};

export default Navbar;
