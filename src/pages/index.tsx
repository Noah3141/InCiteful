import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Button from "~/components/Button";
import Loading from "~/components/Loading";
import Hall from "~/layouts/Hall";

import { api } from "~/utils/api";

export default function Index() {
    return (
        <>
            <Head>
                <title>Create T3 App</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main></main>
        </>
    );
}

// EXPLAIN HERE ON THIS PAGE WHAT THE APP IS
