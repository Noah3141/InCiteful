import { Author, Document as PrismaDocument, Reference } from "@prisma/client";

export const asCitation = (input: EitherDocumentOrReference) => {
    if (!!input.document) {
        const authors = input.document.authors.map((author) => {
            return `${author.name}, `;
        });
        return (
            <span>
                {authors} ({input.document.publishedAt?.getFullYear()}).{" "}
                {input.document.title}.{" "}
                <span className="italic">
                    {" "}
                    {input.document.publicationSource}
                </span>
            </span>
        );
    } else {
        return <span></span>;
    }

    return "";
};

type EitherDocumentOrReference =
    | { document: PrismaDocument & { authors: Author[] }; reference: undefined }
    | { document: undefined; reference: Reference & { authors: Author[] } };
