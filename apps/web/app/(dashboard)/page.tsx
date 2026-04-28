"use client";

import { useState } from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { add } from "@workspace/math/add";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { useMutation, useQuery } from "convex/react";

export default function Page() {
  const users = useQuery(api.users.getMany);
  const addUser = useMutation(api.users.add);
  const [error, setError] = useState<string | null>(null);

  const handleAddUser = async () => {
    setError(null);

    try {
      await addUser({ name: "Antonio" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add user.");
    }
  };

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-6 p-8">
      <UserButton />
      <OrganizationSwitcher hidePersonal />
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Hello apps web</h1>
        <p className="text-muted-foreground">2 + 2 is {add(2, 2)}</p>
      </div>
      <Button onClick={handleAddUser}>Add user</Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <pre className="w-full overflow-auto rounded-md border bg-muted p-4 text-xs">
        {JSON.stringify(users ?? null, null, 2)}
      </pre>
    </main>
  );
}
