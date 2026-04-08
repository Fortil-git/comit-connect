export interface SubTheme {
  id: string;
  title: string;
  type: 'text' | 'checkbox' | 'select' | 'number' | 'date' | 'counter' | 'radio';
  options?: string[];
  placeholder?: string;
  max?: number;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  important?: boolean;
  subThemes: SubTheme[];
}

export const themes: Theme[] = [
  {
    id: 'info-comite',
    title: 'Informations comité',
    description: 'Informations générales et participants',
    icon: 'info',
    color: 'from-blue-500 to-cyan-500',
    important: true,
    subThemes: [
      { id: 'date', title: 'Date du Comité', type: 'date' },
      { id: 'entite', title: 'Entité FORTIL', type: 'select', options: ['FORTIL SUD EST', 'FORTIL SUD OUEST', 'FORTIL OUEST', 'FORTIL NORD', 'FORTIL ILE DE FRANCE', 'FORTIL EST', 'FORTIL TECHNOLOGIES'] },
      { id: 'invites', title: 'Avez-vous des invités d\'une autre agence ?', type: 'radio', options: ['Non', 'Oui'] },
      { id: 'agence-invites', title: 'Si oui, quelle agence ?', type: 'select', options: ['Paris', 'Lyon', 'Toulouse', 'Nantes', 'Bordeaux', 'Lille', 'Strasbourg', 'Marseille', 'Rennes', 'Grenoble'] },
      { id: 'participants', title: 'Noms des participants au Comité', type: 'text', placeholder: 'Format: NOM/Prénom (un par ligne)' },
      { id: 'femmes', title: 'Nombre de femmes présentes', type: 'counter', max: 20 },
      { id: 'hommes', title: 'Nombre d\'hommes présents', type: 'counter', max: 20 },
      { id: 'postes', title: 'Postes représentés dans le comité local', type: 'checkbox', options: ['DO', 'D.A.', 'B.M.', 'T.A.', 'Consultant(e)', 'Référent(e) RSE'] },
      { id: 'ordre-jour', title: 'Ordre du jour', type: 'text' },
    ]
  },
  {
    id: 'suivi-actions',
    title: 'Suivi actions',
    description: 'Plan d\'action et suivi des décisions',
    icon: 'settings',
    color: 'from-indigo-500 to-blue-500',
    important: true,
    subThemes: [
      { id: 'actions-precedent', title: 'Actions du comité précédent', type: 'text' },
      { id: 'nouvelles-actions', title: 'Nouvelles actions décidées', type: 'text' },
      { id: 'responsables', title: 'Responsables des actions', type: 'text' },
      { id: 'echeances', title: 'Échéances et délais', type: 'text' },
      { id: 'priorites', title: 'Niveau de priorité', type: 'select', options: ['Urgent', 'Important', 'Normal', 'Faible'] },
      { id: 'statut', title: 'Statut d\'avancement', type: 'select', options: ['À faire', 'En cours', 'Terminé', 'Bloqué'] },
    ]
  },
  {
    id: 'perf-eco',
    title: 'Performance Économique',
    description: 'Finance, BP et suivi FAE',
    icon: 'trending-up',
    color: 'from-emerald-500 to-teal-500',
    subThemes: [
      { id: 'evolution-bp', title: 'Evolution du BP', type: 'text' },
      { id: 'intercontrats', title: 'Suivi des Intercontrats', type: 'text' },
      { id: 'fidelisation', title: 'Fidélisation des clients', type: 'text' },
      { id: 'satisfaction-clients', title: 'Alertes Satisfaction & Suivi des Clients', type: 'text' },
      { id: 'suivi-fae', title: 'Suivi FAE', type: 'text' },
      { id: 'ca-impact-negatif', title: 'Monitoring CA Business dans Secteur à fort Impact Négatif', type: 'text' },
      { id: 'travailleurs-independants', title: 'Monitoring Dépassement seuil Travailleurs Indépendants', type: 'text' },
      { id: 'litiges-clients', title: 'Monitoring des Litiges clients avec impact significatif', type: 'text' },
    ]
  },
  {
    id: 'perf-sociale',
    title: 'Performance Sociale',
    description: 'RH, talents et bien-être',
    icon: 'users',
    color: 'from-violet-500 to-purple-500',
    subThemes: [
      { id: 'redistribution', title: 'Redistribution Richesse / Budget / Répartition', type: 'text' },
      { id: 'recrutement', title: 'Monitoring Recrutement / Ressources et Renouvellement', type: 'text' },
      { id: 'integration', title: 'Monitoring intégration / Qualité d\'Embarquement', type: 'text' },
      { id: 'turnover', title: 'Monitoring Turnover', type: 'text' },
      { id: 'absenteisme', title: 'Monitoring Absentéisme', type: 'text' },
      { id: 'plans-dev', title: 'Suivi des Plans de Développement individuels', type: 'text' },
      { id: 'competences', title: 'Monitoring des Besoins de Compétences', type: 'text' },
    ]
  },
  {
    id: 'perf-technique',
    title: 'Performance Technique',
    description: 'Qualité et innovation',
    icon: 'settings',
    color: 'from-orange-500 to-amber-500',
    subThemes: [
      { id: 'satisfaction-tech', title: 'Pilotage Satisfaction Technique des Collaborateurs', type: 'text' },
      { id: 'veille-techno', title: 'Suivi Veille Technologique', type: 'text' },
      { id: 'offres-structurees', title: 'Développement & Pilotage Offres Structurées', type: 'text' },
      { id: 'innovation', title: 'Innovations et Améliorations', type: 'text' },
      { id: 'qualite', title: 'Suivi Qualité et Conformité', type: 'text' },
    ]
  },
  {
    id: 'perf-gouvernance',
    title: 'Performance Gouvernance',
    description: 'Diversité et vivre-ensemble',
    icon: 'shield',
    color: 'from-rose-500 to-pink-500',
    subThemes: [
      { id: 'diversite', title: 'Diversité des Fonctions Présentes au Comité', type: 'text' },
      { id: 'vivre-ensemble', title: 'Vivre-Ensemble', type: 'text' },
      { id: 'delais-paiement', title: 'Monitoring respect des Délais Paiement Fournisseur', type: 'text' },
      { id: 'ethique', title: 'Éthique et Conformité', type: 'text' },
      { id: 'communication', title: 'Communication Interne', type: 'text' },
    ]
  },
  {
    id: 'impact-societal',
    title: 'Impact Sociétal',
    description: 'Engagement social et territoire',
    icon: 'heart',
    color: 'from-cyan-500 to-blue-500',
    subThemes: [
      { id: 'mecenat', title: 'Actions de Mécénat', type: 'text' },
      { id: 'territoire', title: 'Engagement Territorial', type: 'text' },
      { id: 'partenariats', title: 'Partenariats Sociaux', type: 'text' },
      { id: 'inclusion', title: 'Inclusion et Diversité', type: 'text' },
    ]
  },
  {
    id: 'impact-env',
    title: 'Impact Environnemental',
    description: 'RSE et développement durable',
    icon: 'leaf',
    color: 'from-green-500 to-emerald-500',
    subThemes: [
      { id: 'empreinte-carbone', title: 'Suivi Empreinte Carbone', type: 'text' },
      { id: 'energie', title: 'Consommation Énergétique', type: 'text' },
      { id: 'dechets', title: 'Gestion des Déchets', type: 'text' },
      { id: 'mobilite', title: 'Mobilité Durable', type: 'text' },
      { id: 'achats-responsables', title: 'Achats Responsables', type: 'text' },
    ]
  },
];
