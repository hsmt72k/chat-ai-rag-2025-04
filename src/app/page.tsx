import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="font-extrabold">RAG を使った AI チャットアプリ</h1>
        <Button
          size="xl"
          variant="destructive"
          className="text-6xl font-host-grotesk hover:cursor-pointer hover:opacity-60"
        >
          Click me!
        </Button>
      </div>
    </div>
  );
}
