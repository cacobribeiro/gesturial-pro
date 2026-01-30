'use client';

type FabProps = {
  onClick: () => void;
};

export function Fab({ onClick }: FabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-soft"
      aria-label="Adicionar"
    >
      +
    </button>
  );
}
