"use client";

import { useState, useTransition } from "react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AuthPanel() {
  const { isAuthenticated, signIn, signOut, signUp, userEmail } = useApp();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);

        if (!result.success) {
          setFeedback(result.error ?? "Impossible de terminer cette action.");
          return;
        }

        setFeedback(mode === "signin" ? "Connexion reussie." : "Compte cree. Verifiez votre email si besoin.");
      })();
    });
  }

  if (isAuthenticated) {
    return (
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Session connectee</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {userEmail} est actuellement synchronise avec Supabase.
          </p>
        </div>
        <Button
          onClick={() => {
            startTransition(() => {
              void signOut();
            });
          }}
          variant="secondary"
        >
          {isPending ? "Deconnexion..." : "Se deconnecter"}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setMode("signin")} variant={mode === "signin" ? "primary" : "secondary"}>
          Login
        </Button>
        <Button onClick={() => setMode("signup")} variant={mode === "signup" ? "primary" : "secondary"}>
          Signup
        </Button>
      </div>

      <div className="rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--muted-foreground)]">
        <p className="font-medium text-[var(--foreground)]">Compte demo</p>
        <p className="mt-1">Email: demo.atlas.personnel@yopmail.com</p>
        <p>Mot de passe: Demo123456x</p>
        <Button
          className="mt-3"
          onClick={() => {
            setMode("signin");
            setEmail("demo.atlas.personnel@yopmail.com");
            setPassword("Demo123456x");
            setFeedback(null);
          }}
          variant="secondary"
        >
          Utiliser le compte demo
        </Button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Email" required>
          <Input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        </Field>

        <Field label="Mot de passe" required>
          <Input onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
        </Field>

        {feedback ? <p className="text-sm text-[var(--muted-foreground)]">{feedback}</p> : null}

        <Button disabled={isPending} type="submit">
          {isPending ? "Chargement..." : mode === "signin" ? "Se connecter" : "Creer le compte"}
        </Button>
      </form>
    </Card>
  );
}
