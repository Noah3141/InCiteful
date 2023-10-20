import { createTRPCRouter } from "~/server/api/trpc";
import { documentsRouter } from "~/server/api/routers/documents";
import { jobsRouter } from "~/server/api/routers/jobs";
import { librariesRouter } from "~/server/api/routers/libraries";
import { notebooksRouter } from "~/server/api/routers/notebook";
import { usersRouter } from "~/server/api/routers/users";
import { queryRouter } from "./routers/query";
import { exampleRouter } from "./routers/example";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    job: jobsRouter,
    library: librariesRouter,
    document: documentsRouter,
    user: usersRouter,
    notebook: notebooksRouter,
    query: queryRouter,
    example: exampleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
