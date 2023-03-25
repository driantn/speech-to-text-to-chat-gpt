import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import { createReadStream } from 'fs';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const config = {
  api: {
    bodyParser: false,
  },
};

const getFile = (req: NextApiRequest): Promise<File> =>
  new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({
      keepExtensions: true,
    });
    form.parse(req, async (err, fields, files) => {
      if (err) reject(err);
      resolve(files['file'] as File);
    });
  });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(404).end();
  const file = await getFile(req);
  const transcriptionReq = await openai.createTranscription(
    createReadStream(file.filepath) as any,
    'whisper-1',
  );

  const promptReq = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    max_tokens: 500,
    messages: [{ role: 'user', content: transcriptionReq.data.text }],
  });

  const results = promptReq.data.choices.map(
    (choice) => choice.message?.content,
  );

  res.status(200).json({ results });
}
