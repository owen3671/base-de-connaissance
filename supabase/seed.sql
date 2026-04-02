-- Create or sign in a user through Supabase Auth first.
-- This seed only inserts demo notes for the first existing auth user.

with first_user as (
  select id
  from auth.users
  order by created_at asc nulls last, id asc
  limit 1
),
seed_notes (
  title,
  category,
  subcategory,
  summary,
  key_idea,
  content,
  example,
  source,
  tags,
  importance,
  status
) as (
  values
    (
      'Le soft power ne remplace pas la puissance dure',
      'Geopolitique',
      'Relations internationales',
      'Un Etat influence durablement quand il combine attractivite culturelle, credibilite economique et capacite a proteger ses interets.',
      'Le soft power amplifie une strategie, il ne corrige pas une faiblesse structurelle.',
      'Dans un podcast sur les rivalites internationales, l''intervenant rappelait que l''image d''un pays fonctionne surtout quand elle repose sur des institutions solides, une economie lisible et une diplomatie constante. Sans base materielle, l''influence narrative reste fragile.',
      'Les series, universites et medias d''un pays peuvent attirer, mais ils ont plus d''effet quand ils s''appuient sur une stabilite politique et des alliances fiables.',
      'Podcast Le Collimateur',
      array['soft power', 'diplomatie', 'strategie'],
      'eleve',
      'en_cours'
    ),
    (
      'Ce qui est fragile deteste la volatilite',
      'Citations',
      'Antifragilite',
      'La fragilite se revele surtout quand un systeme subit du stress, de l''incertitude ou des chocs repetes.',
      'Observer une reaction au stress en dit plus que l''apparence de solidite.',
      'Citation issue de Taleb. Elle invite a juger une idee, une organisation ou un modele economique selon sa resistance aux perturbations plutot que selon son apparence de stabilite.',
      'Une entreprise tres rentable en periode calme peut etre fragile si une petite hausse des taux ou un probleme logistique suffit a casser son modele.',
      'Lecture Antifragile',
      array['taleb', 'fragilite', 'risque'],
      'moyen',
      'maitrise'
    ),
    (
      'Les traites de Westphalie structurent l''idee d''Etat souverain',
      'Histoire',
      'Europe moderne',
      'Westphalie est souvent utilise comme repere symbolique pour expliquer la souverainete territoriale et la non-ingerence.',
      'Un evenement historique devient parfois plus important par son usage conceptuel que par son detail juridique exact.',
      'La paix de Westphalie ne cree pas a elle seule le monde moderne, mais elle sert de point d''appui pedagogique pour comprendre l''equilibre entre souverainete, frontieres et diplomatie entre Etats.',
      'En geopo, on mobilise Westphalie pour expliquer pourquoi les Etats defendent jalousement leurs competences territoriales.',
      'Cours d''histoire politique',
      array['westphalie', 'souverainete', 'etat'],
      'eleve',
      'a_apprendre'
    ),
    (
      'L''effet Cantillon distribue inegalement l''argent nouvellement cree',
      'Economie',
      'Monnaie',
      'La creation monetaire n''affecte pas tout le monde au meme moment ni de la meme facon.',
      'L''ordre d''arrivee de la monnaie compte autant que sa quantite.',
      'Les premiers receveurs de monnaie nouvellement injectee peuvent depenser avant que les prix n''aient completement ajuste. Les derniers subissent plus souvent la hausse des prix sans beneficier du meme pouvoir d''achat.',
      'Des acteurs financiers ou institutionnels proches du credit peuvent reagir avant les menages qui voient surtout l''inflation se diffuser ensuite.',
      'Podcast economie monetaire',
      array['monnaie', 'inflation', 'cantillon'],
      'eleve',
      'en_cours'
    ),
    (
      'L''effet Lindy comme heuristique de duree',
      'Concepts',
      'Heuristiques',
      'Plus une idee non perissable a dure longtemps, plus elle a des chances de continuer a durer.',
      'Le temps sert de filtre robuste pour les idees, les livres et certains usages.',
      'L''effet Lindy s''applique surtout a ce qui ne vieillit pas biologiquement: idees, technologies de base, textes, habitudes culturelles. Ce n''est pas une loi absolue, mais un raccourci utile pour evaluer la robustesse.',
      'Un livre lu depuis cinquante ans a souvent plus de probabilite d''etre encore lu demain qu''un ouvrage a la mode depuis deux mois.',
      'Notes de lecture',
      array['lindy', 'heuristique', 'decision'],
      'moyen',
      'maitrise'
    ),
    (
      'Le canal de Suez reste un point de passage strategique',
      'Culture G',
      'Routes commerciales',
      'Un goulet d''etranglement maritime peut modifier tres vite les couts, les delais et les priorites geopolitiques.',
      'Les infrastructures critiques faconnent la geopolitique autant que les ideologies.',
      'Le canal de Suez concentre une partie majeure du commerce mondial. Sa perturbation rallonge les routes, perturbe les chaines d''approvisionnement et rappelle le lien direct entre geographie et economie.',
      'Quand un blocage se produit, certaines cargaisons doivent contourner l''Afrique, ce qui change immediatement les delais et les couts du fret.',
      'Article de synthese',
      array['suez', 'commerce', 'logistique'],
      'moyen',
      'a_apprendre'
    ),
    (
      'Une habitude tient mieux quand le contexte la rend evidente',
      'Podcasts',
      'Apprentissage',
      'Les habitudes durables reposent moins sur la motivation que sur la friction minimale et les bons declencheurs.',
      'Modifier l''environnement est souvent plus efficace que compter sur la volonte.',
      'Podcast sur les routines cognitives. L''idee centrale: pour retenir une information ou appliquer une methode, il faut reduire l''effort d''acces, ritualiser le moment et lier l''action a un contexte stable.',
      'Laisser une page de recap visible apres un podcast augmente les chances de transformer l''ecoute en fiche exploitable.',
      'Podcast The Knowledge Project',
      array['habitudes', 'apprentissage', 'friction'],
      'faible',
      'en_cours'
    ),
    (
      'Checklist de decision rapide avant d''accepter une idee',
      'Revisions',
      'Methode',
      'Verifier la source, le contexte, l''horizon temporel et les incentives evite de memoriser trop vite une idee seduisante.',
      'Une bonne fiche commence par une bonne question sur la fiabilite de l''information.',
      'Quand une idee parait brillante, je dois verifier qui parle, sur quelles donnees, pour quel public et avec quelles limites. Cette micro-checklist me force a ralentir avant de stocker l''information comme vraie.',
      'Avant d''enregistrer un chiffre economique dans l''app, je note si c''est une moyenne, une tendance ou un point de donnees isole.',
      'Systeme personnel',
      array['revision', 'checklist', 'esprit critique'],
      'eleve',
      'a_apprendre'
    )
),
inserted as (
  insert into public.notes (
    user_id,
    title,
    category,
    subcategory,
    summary,
    key_idea,
    content,
    example,
    source,
    tags,
    importance,
    status
  )
  select
    first_user.id,
    seed_notes.title,
    seed_notes.category,
    seed_notes.subcategory,
    seed_notes.summary,
    seed_notes.key_idea,
    seed_notes.content,
    seed_notes.example,
    seed_notes.source,
    seed_notes.tags,
    seed_notes.importance,
    seed_notes.status
  from first_user
  cross join seed_notes
  where not exists (
    select 1
    from public.notes n
    where n.user_id = first_user.id
      and n.title = seed_notes.title
  )
  returning title
)
select count(*) as inserted_count from inserted;
