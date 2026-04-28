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
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleAddUser = async () => {
    setError(null);
    setStatus("saving");

    try {
      await addUser({ name: "Antonio" });
      setStatus("saved");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to add user.");
      setStatus("idle");
    }
  };

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-6 p-8">
      <UserButton />
      <OrganizationSwitcher hidePersonal />
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Hello apps web</h1>
        <p className="text-muted-foreground">2 + 2 is {add(2, 2)}</p>
        <p className="text-xs text-muted-foreground">
          Users in list: {users?.length ?? 0}
        </p>
      </div>
      <Button onClick={handleAddUser} disabled={status === "saving"}>
        {status === "saving" ? "Adding..." : "Add user"}
      </Button>
      {status === "saved" && !error ? (
        <p className="text-sm text-emerald-600">User added successfully.</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </main>
  );
}
