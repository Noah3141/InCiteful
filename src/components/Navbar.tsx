import { signIn, signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import Loading from "./Loading";
import Link from "next/link";
import { useRouter } from "next/router";
import InCiteful from "~/images/logos/InCiteful";
import { GiHamburgerMenu } from "react-icons/gi";

const Navbar = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const mobileSize = `lg:hidden`;
    const fullSize = `hidden lg:flex`;

    const [mobileExpanded, setMobileExpanded] = useState(false);

    if (status == "loading")
        return (
            <>
                <div
                    className={`flex-row justify-between bg-gable-950 px-6 leading-none  ${fullSize}`}
                >
                    <div className="flex flex-row items-center  whitespace-nowrap py-2 text-tango-500">
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className="px-1 py-3 text-3xl transition-all hover:text-tango-600 xl:px-3"
                            href={`/`}
                        >
                            <InCiteful
                                size="small"
                                className="inline h-12 w-12"
                            />
                            InCiteful
                        </Link>
                    </div>
                    <div className="flex flex-row items-center">
                        <Loading color="primary" inline={true}></Loading>
                    </div>
                </div>

                <div
                    className={`gable-scroller flex flex-col bg-gable-950 p-5 text-tango-500 transition-[height] duration-300 ease-in-out ${
                        mobileExpanded
                            ? "h-[320px] overflow-y-auto"
                            : "h-20 overflow-hidden"
                    }    ${mobileSize}`}
                >
                    <div className="flex flex-row items-center justify-between">
                        <div>
                            <Loading color="primary" inline={true} />
                        </div>
                        <div className="h-full">
                            <button
                                onClick={() => {
                                    setMobileExpanded((p) => !p);
                                }}
                                className="text-tango-500 hover:text-tango-600"
                            >
                                <GiHamburgerMenu size={36} />
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    if (status == "unauthenticated")
        return (
            <>
                <div
                    className={`flex-row justify-between bg-gable-950 px-6 leading-none  ${fullSize}`}
                >
                    <div className="flex flex-row items-center whitespace-nowrap py-2 text-tango-500">
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className="px-1 py-3 text-3xl transition-all hover:text-tango-600 xl:px-3"
                            href={`/`}
                        >
                            <InCiteful
                                size="small"
                                className="inline h-12 w-12"
                            />
                            InCiteful
                        </Link>
                    </div>
                    <div className="flex flex-row items-center">
                        <button
                            className=" px-1 py-3 text-xl text-tango-500 transition-all hover:text-tango-600 xl:px-3"
                            onClick={() => {
                                void signIn();
                            }}
                        >
                            Sign In
                        </button>
                    </div>
                </div>

                <div
                    className={`flex flex-col bg-gable-950 text-tango-500 transition-[height] duration-300 ease-in-out ${
                        mobileExpanded
                            ? "h-[205px] overflow-hidden"
                            : "h-20 overflow-hidden"
                    }    ${mobileSize}`}
                >
                    <div className="flex flex-row items-center  justify-end p-5">
                        <div className="h-full">
                            <button
                                onClick={() => {
                                    setMobileExpanded((p) => !p);
                                }}
                                className="text-tango-500 hover:text-tango-600"
                            >
                                <GiHamburgerMenu size={36} />
                            </button>
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-row whitespace-nowrap  text-tango-500 ">
                            <Link
                                onClick={() => {
                                    setMobileExpanded(false);
                                }}
                                className="block w-full px-2 py-3 text-3xl transition-all hover:bg-gable-900 hover:text-tango-600"
                                href={`/`}
                            >
                                <InCiteful
                                    size="small"
                                    className="inline h-12 w-12"
                                />
                                InCiteful
                            </Link>
                        </div>
                        <div className="flex flex-row items-center ">
                            <button
                                className="block w-full px-2 py-3 text-left text-xl text-tango-500 transition-all hover:bg-gable-900  hover:text-tango-600"
                                onClick={() => {
                                    void signIn();
                                }}
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    // (status == "authenticated")
    else
        return (
            <>
                <div
                    className={`flex-row justify-between bg-gable-950 px-6 leading-none  ${fullSize}`}
                >
                    <div className="flex flex-row items-center gap-6 whitespace-nowrap py-2 text-tango-500 transition-all xl:text-xl">
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className="px-1 py-3 text-3xl transition-all hover:text-tango-600 xl:px-3"
                            href={`/`}
                        >
                            <InCiteful
                                size="small"
                                className="inline h-12 w-12"
                            />
                            InCiteful
                        </Link>
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className="px-1 py-3 transition-all hover:text-tango-600 xl:px-3"
                            href="/dashboard"
                        >
                            Dashboard
                        </Link>
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className="px-1 py-3 transition-all hover:text-tango-600 xl:px-3"
                            href="/libraries"
                        >
                            Libraries
                        </Link>
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className=" px-1 py-3 transition-all hover:text-tango-600 xl:px-3"
                            href="/notebook"
                        >
                            Notebook
                        </Link>
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className="px-1 py-3 transition-all hover:text-tango-600 xl:px-3"
                            href="/account"
                        >
                            Account
                        </Link>
                        {session?.user.role === "Admin" ? (
                            <Link
                                onClick={() => {
                                    setMobileExpanded(false);
                                }}
                                className="px-1 py-3 transition-all hover:text-tango-600 xl:px-3"
                                href="/admin"
                            >
                                Admin
                            </Link>
                        ) : (
                            ""
                        )}
                    </div>
                    <div className="flex flex-row items-center gap-6">
                        <span className="cursor-default truncate whitespace-nowrap text-2xl text-tango-500">
                            {session?.user.name}
                        </span>
                        <button
                            onClick={() => {
                                void signOut();
                                void router.push("/dashboard");
                            }}
                            className="whitespace-pre px-1 py-3 text-xl text-tango-500 transition-all hover:text-tango-600 xl:px-3"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
                <div
                    className={`gable-scroller flex flex-col bg-gable-950 text-tango-500 transition-[height] duration-300 ease-in-out ${
                        mobileExpanded
                            ? "h-[400px] overflow-y-auto"
                            : "h-20 overflow-hidden"
                    }    ${mobileSize}`}
                >
                    <div className="flex flex-row items-center  justify-end p-5">
                        <div className="h-full">
                            <button
                                onClick={() => {
                                    setMobileExpanded((p) => !p);
                                }}
                                className="text-tango-500 hover:text-tango-600"
                            >
                                <GiHamburgerMenu size={36} />
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className="px-2 py-3 text-3xl transition-all  hover:bg-gable-900 hover:text-tango-600 xl:px-3"
                            href={`/`}
                        >
                            <InCiteful
                                size="small"
                                className="inline h-12 w-12"
                            />
                            InCiteful
                        </Link>
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className="px-2 py-3 transition-all hover:bg-gable-900 hover:text-tango-600 xl:px-3"
                            href="/dashboard"
                        >
                            Dashboard
                        </Link>
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className="px-2 py-3 transition-all hover:bg-gable-900 hover:text-tango-600 xl:px-3"
                            href="/libraries"
                        >
                            Libraries
                        </Link>
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className=" px-2 py-3 transition-all hover:bg-gable-900 hover:text-tango-600 xl:px-3"
                            href="/notebook"
                        >
                            Notebook
                        </Link>
                        <Link
                            onClick={() => {
                                setMobileExpanded(false);
                            }}
                            className="px-2 py-3 transition-all hover:bg-gable-900 hover:text-tango-600 xl:px-3"
                            href="/account"
                        >
                            Account
                        </Link>

                        <div className="flex flex-row-reverse items-center justify-end gap-6">
                            <span className="cursor-default truncate whitespace-nowrap text-2xl text-tango-500">
                                {session?.user.name}
                            </span>
                            <button
                                onClick={() => {
                                    void signOut();
                                    void router.push("/dashboard");
                                }}
                                className="whitespace-pre px-2 py-3 text-xl text-tango-500 transition-all hover:text-tango-600 xl:px-3"
                            >
                                Sign Out
                            </button>
                        </div>
                        {session?.user.role === "Admin" ? (
                            <Link
                                onClick={() => {
                                    setMobileExpanded(false);
                                }}
                                className="px-2 py-3 transition-all hover:bg-gable-900 hover:text-tango-600 xl:px-3"
                                href="/admin"
                            >
                                Admin
                            </Link>
                        ) : (
                            ""
                        )}
                    </div>
                </div>
            </>
        );
};

export default Navbar;
