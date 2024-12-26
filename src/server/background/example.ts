import { logger, task, wait } from "@trigger.dev/sdk/v3";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { ElevenLabsClient } from "elevenlabs";
import { env } from "~/env";

const elevenlabs = new ElevenLabsClient({
  apiKey: env.ELEVENLABS_API_KEY,
});

const s3Client = new S3Client({
  region: "auto",
  endpoint: "https://fly.storage.tigris.dev",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

async function saveAudioFile(audioBuffer: Buffer, fileName: string): Promise<string> {
  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: env.AWS_S3_BUCKET,
        Key: `audio/${fileName}`,
        Body: audioBuffer,
        ContentType: 'audio/mpeg',
      },
    });

    await upload.done();
    return `https://fly.storage.tigris.dev/${env.AWS_S3_BUCKET}/audio/${fileName}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error(`Failed to upload audio file: ${(error as Error).message}`);
  }
}

async function generateAudio(text: string) {
  const audio = await elevenlabs.generate({
    voice: "e1QlSdXpS6HwesZvYHND",
    model_id: 'eleven_multilingual_v2',
    text,
  });

  // Convert the stream to a buffer
  const chunks: (Buffer & ArrayBufferLike)[] = [];
  for await (const chunk of audio) {
    chunks.push(Buffer.from(chunk) as Buffer & ArrayBufferLike);
  }
  const audioBuffer = Buffer.concat(chunks) as Buffer & ArrayBufferLike;

  // Save the audio file
  const fileName = `test-audio-file-${Date.now()}.mp3`;
  const audioPath = await saveAudioFile(audioBuffer, fileName);

  return audioPath;
}

export const generateAudioTask = task({
  id: "generate-audio",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: { message: string }, { ctx }) => {
    logger.log("Hello, world!", { payload, ctx });
    logger.log("Test the env", { env: env.AWS_S3_BUCKET });
    logger.log("Test the env", { env: process.env.AWS_S3_BUCKET });

    const path = await generateAudio(payload.message);

    return {
      message: path,
    }
  },
});