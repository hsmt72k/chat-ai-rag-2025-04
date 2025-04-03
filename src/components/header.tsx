import { Dog } from 'lucide-react';

export const Header = () => {
  return (
    <div className="sticky top-0 z-10 p-4 flex items-center justify-center gap-4 bg-zinc-900/90 shadow-md">
      <Dog className="text-white" />
      <h1 className="text-xl text-white font-host-grotesk font-extrabold">
        RAGGER AI
      </h1>
    </div>
  );
};
