import Image from "next/image";

export const ConversationsView = () => {
  return (
    <div className="flex flex-1 items-center justify-center gap-x-2">
      <Image alt="Logo" height={40} src="/logo.svg" width={40} />
      <p className="font-semibold text-lg">Echo</p>
    </div>
  );
};
