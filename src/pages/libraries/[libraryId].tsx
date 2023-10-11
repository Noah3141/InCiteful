import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";

const LibraryPage = () => {
    const router = useRouter();
    const pathId =
        typeof router.query.libraryId == "string" ? router.query.libraryId : "";

    const { data, isLoading } = api.library.getDocuments.useQuery({
        libraryId: pathId,
    });

    return <div>{data?.library.title}</div>;
};

export default LibraryPage;
