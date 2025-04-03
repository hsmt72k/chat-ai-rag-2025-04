import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { LangChainAdapter } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // リクエストボディからメッセージを取得
    const { messages } = await req.json();
    const userMessage = messages.at(-1).content;

    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // LangChain でプロンプトテンプレートを作成
    const prompt = PromptTemplate.fromTemplate('{message}');

    // LangChain で OpenAI モデルを初期化
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4o',
      temperature: 0.8,
    });

    // LangChainのプロンプトとモデルをパイプライン化
    const chain = prompt.pipe(model);

    // ストリームを生成
    const stream = await chain.stream({ message: userMessage });

    // 動作確認用：ここでログ出力してしまうと、ストリームを消費してしまうため、
    // レスポンスとして返すストリームは空になってしまう
    // for await (const chunk of stream) {
    //   if (chunk?.content) {
    //     console.log(chunk.content);
    //   }
    // }

    // AI SDK のLangChainAdapter を使用してストリームレスポンスを返却
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
