export const ConversationsView = () => {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto px-6 py-8 text-center">
      <div className="flex max-w-full shrink-0 items-center justify-center gap-2.5">
        {/* Plain img: Next/Image can let SVGs ignore size in flex layouts */}
        <img
          alt=""
          className="h-9 w-9 shrink-0 object-contain"
          decoding="async"
          height={36}
          src="/logo.svg"
          width={36}
        />
        <p className="shrink-0 font-semibold text-foreground text-lg">Echo</p>
      </div>
      <p className="max-w-xs text-muted-foreground text-sm leading-snug">
        Select a conversation from the list to open it.
      </p>
    </div>
  );
};
