import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { runs } from "@trigger.dev/sdk/v3";

import { generateAudioTask } from "~/server/background/example";

export const documentRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // const handle = await generateAudioTask.trigger({ message: 'Ini adalah audio yang akan di generate!'});
    const runId = "run_k7qmm3ge1o1xiyfts1zip";
    const run = await runs.retrieve<typeof generateAudioTask>(runId);
    console.log('run result', run.output?.message);

    // console.log('Trigget at handle', handle.id);
    // console.log('document api')
    return [];
  }),
});
