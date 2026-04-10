import type { NavigationItem } from "@/types";

export const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "Accueil",
    shortLabel: "Accueil",
    description: "Dashboard, stats et raccourcis vers les fiches importantes.",
  },
  {
    href: "/calendrier",
    label: "Calendrier",
    shortLabel: "Calendrier",
    description: "Planifier vos journees, semaines et mois dans une seule vue simple.",
  },
  {
    href: "/ajouter",
    label: "Ajouter",
    shortLabel: "Ajouter",
    description: "Capture rapide d'une nouvelle fiche depuis mobile ou desktop.",
  },
  {
    href: "/recherche",
    label: "Recherche",
    shortLabel: "Recherche",
    description: "Parcourir, filtrer et retrouver une fiche en quelques secondes.",
  },
  {
    href: "/revision",
    label: "Revision",
    shortLabel: "Revision",
    description: "Revoir les fiches selon leur priorite d'apprentissage.",
  },
  {
    href: "/profil",
    label: "Profil",
    shortLabel: "Profil",
    description: "Connexion Supabase, mode local et preferences.",
  },
];

export const mobileNavigationItems = navigationItems.filter((item) => item.href !== "/ajouter");
