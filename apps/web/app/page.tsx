import { add } from "@workspace/math/add";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Hello apps web</h1>
        <p className="text-muted-foreground">2 + 2 is {add(2, 2)}</p>
      </div>
      <Button>Button</Button>
    </main>
  );
}
