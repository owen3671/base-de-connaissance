"use client";

import Link from "next/link";
import { NoteCard } from "@/components/knowledge/note-card";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { dashboardTips } from "@/data/demo-data";
import { buildDashboardData } from "@/lib/note-utils";

export default function HomePage() {
  const { notes } = useApp();
  const dashboard = buildDashboardData(notes);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Votre base de connaissances, claire et actionnable"
        description="Retrouvez vos dernieres fiches, les categories les plus nourries et les notes a reviser aujourd'hui dans une interface pensee d'abord pour smartphone."
        actions={
          <Link href="/ajouter">
            <Button size="lg">Ajouter une fiche</Button>
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        {dashboard.metrics.map((metric) => (
          <Card key={metric.label} className="space-y-2">
            <p className="text-sm font-semibold text-[var(--muted-foreground)]">{metric.label}</p>
            <p className="text-3xl font-semibold text-[var(--foreground)]">{metric.value}</p>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">{metric.detail}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr,0.95fr]">
        <Card className="space-y-4 overflow-hidden p-0">
          <div className="bg-[radial-gradient(circle_at_top_right,rgba(12,74,110,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(238,242,246,0.96))] px-5 py-6 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Flux recent</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Dernieres fiches ajoutees</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
              Continuez votre lecture ou votre revision en repartant de vos captures les plus recentes.
            </p>
          </div>
          <div className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
            {dashboard.recentNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                  Categories
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">Ce que vous nourrissez le plus</h2>
              </div>
              <Link className="text-sm font-semibold text-[var(--accent)]" href="/recherche">
                Voir tout
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {dashboard.categoryCounts.map((item) => (
                <div key={item.category} className="flex items-center justify-between rounded-[1.2rem] bg-[var(--card-strong)] px-4 py-3">
                  <span className="font-semibold text-[var(--foreground)]">{item.category}</span>
                  <span className="text-sm text-[var(--muted-foreground)]">{item.count} fiche(s)</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Bonnes pratiques</p>
            <div className="mt-4 space-y-3">
              {dashboardTips.map((tip) => (
                <div key={tip} className="rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  {tip}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Fiches importantes</h2>
            <Link className="text-sm font-semibold text-[var(--accent)]" href="/recherche">
              Explorer
            </Link>
          </div>
          <div className="space-y-4">
            {dashboard.importantNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">A revoir aujourd'hui</h2>
            <Link className="text-sm font-semibold text-[var(--accent)]" href="/revision">
              Ouvrir la revision
            </Link>
          </div>
          <div className="space-y-4">
            {dashboard.reviewNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
