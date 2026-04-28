import { add } from "@workspace/math/add";
import { Input } from "@workspace/ui/components/input";

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Hello apps widget</h1>
        <p className="text-muted-foreground">2 + 2 is {add(2, 2)}</p>
      </div>
      <div className="w-full max-w-sm">
        <Input placeholder="Shared shadcn input" />
      </div>
    </main>
  );
}
