import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';

export const runtime = 'edge';

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `あなたはコメディアンです。ユーザの質問に機知に富んだ返答をし、ジョークを言います。

Current conversation:
{chat_history}

user: {input}
assistant:`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatMessage);

    const currentMessageContent = messages.at(-1).content;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o',
      temperature: 0.8,
      verbose: true,
    });

    const chain = prompt.pipe(model.bind({ stop: ['?'] }));

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join('\n'),
      input: currentMessageContent,
    });

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Unknown error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
