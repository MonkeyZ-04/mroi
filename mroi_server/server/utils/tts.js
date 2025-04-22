import { nanoid } from "nanoid";
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "node:fs";
import path from "node:path";

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: "./dist-server/keys/hyperhub-chat-62b326e03696.json",
  projectId: "hyperhub-chat",
});

export default async (text, languageCode) => {
  const request = {
    input: { text },
    voice: { languageCode, ssmlGender: "NEURAL" },
    audioConfig: { audioEncoding: "MP3" },
  };
  const [response] = await client.synthesizeSpeech(request);

  const fileName = `${nanoid(64)}.mp3`;
  const filePath = path.resolve(__dirname, "..", "uploads", fileName);
  await fs.writeFileSync(filePath, response.audioContent, "binary");
  return { fileName, filePath };
};
