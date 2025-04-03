import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Message as VercelChatMessage, LangChainAdapter } from 'ai';

export const runtime = 'edge';

/**
 * 基本的なメモリフォーマッタで、メッセージ履歴を文字列化してモデルに直接渡す
 */
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `お前はパッチーという名前のノーベル経済学賞を取った経済学者だ。すべての返答は非常に冗長で理屈っぽいがすべてに根拠があり論文を引用している。話の頭から結論が単純明快で、話はすべて大阪弁である。

Current conversation:
{chat_history}

user: {input}
assistant:`;

export async function POST(req: Request) {
  try {
    // リクエストボディからメッセージを取得
    const body = await req.json();
    const messages = body.messages ?? [];

    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatMessage);

    const currentMessageContent = messages[messages.length - 1].content;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o',
      temperature: 0.8,
    });

    // LangChain のプロンプトとモデルをパイプライン化
    const chain = prompt.pipe(model);

    // ストリームを生成
    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join('\n'),
      input: currentMessageContent,
    });

    // 動作確認用：ここでログ出力してしまうと、ストリームを消費してしまうため、
    // レスポンスとして返すストリームは空になってしまう
    // for await (const chunk of stream) {
    //   if (chunk?.content) {
    //     console.log(chunk.content);
    //   }
    // }

    // AI SDK の LangChainAdapter を使用してストリームレスポンスを返却
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
