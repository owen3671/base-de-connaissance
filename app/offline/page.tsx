export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="max-w-md rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Vous etes hors ligne</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
          L'application reste installable et reactive, mais certaines donnees distantes demanderont une reconnexion pour etre rafraichies.
        </p>
      </div>
    </main>
  );
}
