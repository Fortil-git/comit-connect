import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const agencies = [
  { id: 'aix', name: 'FORTIL Aix-en-Provence', city: 'Aix-en-Provence', region: "Provence-Alpes-Côte d'Azur" },
  { id: 'bordeaux', name: 'FORTIL Bordeaux', city: 'Bordeaux', region: 'Nouvelle-Aquitaine' },
  { id: 'brest', name: 'FORTIL Brest', city: 'Brest', region: 'Bretagne' },
  { id: 'caen', name: 'FORTIL Caen', city: 'Caen', region: 'Normandie' },
  { id: 'clermont', name: 'FORTIL Clermont-Ferrand', city: 'Clermont-Ferrand', region: 'Auvergne-Rhône-Alpes' },
  { id: 'grenoble', name: 'FORTIL Grenoble', city: 'Grenoble', region: 'Auvergne-Rhône-Alpes' },
  { id: 'laseyne', name: 'FORTIL La Seyne-sur-Mer', city: 'La Seyne-sur-Mer', region: "Provence-Alpes-Côte d'Azur" },
  { id: 'lille', name: 'FORTIL Lille', city: 'Lille', region: 'Hauts-de-France' },
  { id: 'lyon', name: 'FORTIL Lyon', city: 'Lyon', region: 'Auvergne-Rhône-Alpes' },
  { id: 'marseille', name: 'FORTIL Marseille', city: 'Marseille', region: "Provence-Alpes-Côte d'Azur" },
  { id: 'montpellier', name: 'FORTIL Montpellier', city: 'Montpellier', region: 'Occitanie' },
  { id: 'mulhouse', name: 'FORTIL Mulhouse', city: 'Mulhouse', region: 'Grand Est' },
  { id: 'nantes', name: 'FORTIL Nantes', city: 'Nantes', region: 'Pays de la Loire' },
  { id: 'nice', name: 'FORTIL Nice', city: 'Nice', region: "Provence-Alpes-Côte d'Azur" },
  { id: 'niort', name: 'FORTIL Niort', city: 'Niort', region: 'Nouvelle-Aquitaine' },
  { id: 'orleans', name: 'FORTIL Orléans', city: 'Orléans', region: 'Centre-Val de Loire' },
  { id: 'paris', name: 'FORTIL Paris', city: 'Paris', region: 'Île-de-France' },
  { id: 'reims', name: 'FORTIL Reims', city: 'Reims', region: 'Grand Est' },
  { id: 'rennes', name: 'FORTIL Rennes', city: 'Rennes', region: 'Bretagne' },
  { id: 'rouen', name: 'FORTIL Rouen', city: 'Rouen', region: 'Normandie' },
  { id: 'strasbourg', name: 'FORTIL Strasbourg', city: 'Strasbourg', region: 'Grand Est' },
  { id: 'toulouse', name: 'FORTIL Toulouse', city: 'Toulouse', region: 'Occitanie' },
  { id: 'tours', name: 'FORTIL Tours', city: 'Tours', region: 'Centre-Val de Loire' },
  { id: 'troyes', name: 'FORTIL Troyes', city: 'Troyes', region: 'Grand Est' },
  { id: 'valence', name: 'FORTIL Valence', city: 'Valence', region: 'Auvergne-Rhône-Alpes' },
];

// Mot de passe par défaut : "password"
const defaultPassword = hashPassword('password');

const persons = [
  { id: '1', firstName: 'Marie', lastName: 'Dubois', fullName: 'Marie Dubois', jobTitle: 'Manager', email: 'marie.dubois@fortil.fr', password: defaultPassword, userRole: 'SUPER_ADMIN' as const, isActive: true, agencyId: 'paris' },
  { id: '2', firstName: 'Pierre', lastName: 'Martin', fullName: 'Pierre Martin', jobTitle: 'Développeur', email: 'pierre.martin@fortil.fr', password: defaultPassword, userRole: 'ADMIN' as const, isActive: true, agencyId: 'lyon' },
  { id: '3', firstName: 'Sophie', lastName: 'Bernard', fullName: 'Sophie Bernard', jobTitle: 'Chef de projet', email: 'sophie.bernard@fortil.fr', password: defaultPassword, userRole: 'ADMIN' as const, isActive: true, agencyId: 'marseille' },
  { id: '4', firstName: 'Thomas', lastName: 'Petit', fullName: 'Thomas Petit', jobTitle: 'Développeur', email: 'thomas.petit@fortil.fr', password: defaultPassword, userRole: 'MEMBRE_PERMANENT' as const, isActive: true, agencyId: 'bordeaux' },
  { id: '5', firstName: 'Julie', lastName: 'Robert', fullName: 'Julie Robert', jobTitle: 'Designer', email: 'julie.robert@fortil.fr', password: defaultPassword, userRole: 'MEMBRE_PERMANENT' as const, isActive: true, agencyId: 'nantes' },
  { id: '6', firstName: 'Nicolas', lastName: 'Richard', fullName: 'Nicolas Richard', jobTitle: 'DevOps', email: 'nicolas.richard@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'toulouse' },
  { id: '7', firstName: 'Camille', lastName: 'Durand', fullName: 'Camille Durand', jobTitle: 'Manager', email: 'camille.durand@fortil.fr', password: defaultPassword, userRole: 'ADMIN' as const, isActive: true, agencyId: 'lille' },
  { id: '8', firstName: 'Alexandre', lastName: 'Moreau', fullName: 'Alexandre Moreau', jobTitle: 'Développeur', email: 'alexandre.moreau@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'grenoble' },
  { id: '9', firstName: 'Laura', lastName: 'Simon', fullName: 'Laura Simon', jobTitle: 'Chef de projet', email: 'laura.simon@fortil.fr', password: defaultPassword, userRole: 'MEMBRE_PERMANENT' as const, isActive: true, agencyId: 'rennes' },
  { id: '10', firstName: 'Julien', lastName: 'Laurent', fullName: 'Julien Laurent', jobTitle: 'Développeur', email: 'julien.laurent@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'strasbourg' },
  { id: '11', firstName: 'Emma', lastName: 'Lefebvre', fullName: 'Emma Lefebvre', jobTitle: 'Designer', email: 'emma.lefebvre@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'montpellier' },
  { id: '12', firstName: 'Lucas', lastName: 'Michel', fullName: 'Lucas Michel', jobTitle: 'Développeur', email: 'lucas.michel@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'nice' },
  { id: '13', firstName: 'Chloé', lastName: 'Garcia', fullName: 'Chloé Garcia', jobTitle: 'Manager', email: 'chloe.garcia@fortil.fr', password: defaultPassword, userRole: 'ADMIN' as const, isActive: true, agencyId: 'aix' },
  { id: '14', firstName: 'Maxime', lastName: 'David', fullName: 'Maxime David', jobTitle: 'DevOps', email: 'maxime.david@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'clermont' },
  { id: '15', firstName: 'Léa', lastName: 'Bertrand', fullName: 'Léa Bertrand', jobTitle: 'Chef de projet', email: 'lea.bertrand@fortil.fr', password: defaultPassword, userRole: 'MEMBRE_PERMANENT' as const, isActive: true, agencyId: 'caen' },
  { id: '16', firstName: 'Antoine', lastName: 'Roux', fullName: 'Antoine Roux', jobTitle: 'Développeur', email: 'antoine.roux@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'rouen' },
  { id: '17', firstName: 'Manon', lastName: 'Vincent', fullName: 'Manon Vincent', jobTitle: 'Designer', email: 'manon.vincent@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'reims' },
  { id: '18', firstName: 'Hugo', lastName: 'Fournier', fullName: 'Hugo Fournier', jobTitle: 'Développeur', email: 'hugo.fournier@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'mulhouse' },
  { id: '19', firstName: 'Clara', lastName: 'Morel', fullName: 'Clara Morel', jobTitle: 'Manager', email: 'clara.morel@fortil.fr', password: defaultPassword, userRole: 'ADMIN' as const, isActive: true, agencyId: 'orleans' },
  { id: '20', firstName: 'Théo', lastName: 'Girard', fullName: 'Théo Girard', jobTitle: 'DevOps', email: 'theo.girard@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'tours' },
  { id: '21', firstName: 'Inès', lastName: 'Andre', fullName: 'Inès Andre', jobTitle: 'Chef de projet', email: 'ines.andre@fortil.fr', password: defaultPassword, userRole: 'MEMBRE_PERMANENT' as const, isActive: true, agencyId: 'troyes' },
  { id: '22', firstName: 'Louis', lastName: 'Leroy', fullName: 'Louis Leroy', jobTitle: 'Développeur', email: 'louis.leroy@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'valence' },
  { id: '23', firstName: 'Sarah', lastName: 'Garnier', fullName: 'Sarah Garnier', jobTitle: 'Designer', email: 'sarah.garnier@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'niort' },
  { id: '24', firstName: 'Arthur', lastName: 'Chevalier', fullName: 'Arthur Chevalier', jobTitle: 'Développeur', email: 'arthur.chevalier@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'brest' },
  { id: '25', firstName: 'Lucie', lastName: 'François', fullName: 'Lucie François', jobTitle: 'Manager', email: 'lucie.francois@fortil.fr', password: defaultPassword, userRole: 'ADMIN' as const, isActive: true, agencyId: 'laseyne' },
  { id: '26', firstName: 'Nathan', lastName: 'Blanc', fullName: 'Nathan Blanc', jobTitle: 'DevOps', email: 'nathan.blanc@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'paris' },
  { id: '27', firstName: 'Océane', lastName: 'Guerin', fullName: 'Océane Guerin', jobTitle: 'Chef de projet', email: 'oceane.guerin@fortil.fr', password: defaultPassword, userRole: 'MEMBRE_PERMANENT' as const, isActive: true, agencyId: 'lyon' },
  { id: '28', firstName: 'Gabriel', lastName: 'Boyer', fullName: 'Gabriel Boyer', jobTitle: 'Développeur', email: 'gabriel.boyer@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'marseille' },
  { id: '29', firstName: 'Anaïs', lastName: 'Lambert', fullName: 'Anaïs Lambert', jobTitle: 'Designer', email: 'anais.lambert@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'bordeaux' },
  { id: '30', firstName: 'Raphaël', lastName: 'Fontaine', fullName: 'Raphaël Fontaine', jobTitle: 'Développeur', email: 'raphael.fontaine@fortil.fr', password: defaultPassword, userRole: 'UTILISATEUR' as const, isActive: true, agencyId: 'nantes' },
];

const themesData = [
  {
    id: 'info-comite', title: 'Informations comité', description: 'Informations générales et participants',
    icon: 'info', color: 'from-blue-500 to-cyan-500', important: true, order: 0,
    subThemes: [
      { id: 'date', title: 'Date du Comité', type: 'date', order: 0 },
      { id: 'entite', title: 'Entité FORTIL', type: 'select', options: ['FORTIL SUD EST', 'FORTIL SUD OUEST', 'FORTIL OUEST', 'FORTIL NORD', 'FORTIL ILE DE FRANCE', 'FORTIL EST', 'FORTIL TECHNOLOGIES'], order: 1 },
      { id: 'invites', title: "Avez-vous des invités d'une autre agence ?", type: 'radio', options: ['Non', 'Oui'], order: 2 },
      { id: 'agence-invites', title: 'Si oui, quelle agence ?', type: 'select', options: ['Paris', 'Lyon', 'Toulouse', 'Nantes', 'Bordeaux', 'Lille', 'Strasbourg', 'Marseille', 'Rennes', 'Grenoble'], order: 3 },
      { id: 'participants', title: 'Noms des participants au Comité', type: 'text', placeholder: 'Format: NOM/Prénom (un par ligne)', order: 4 },
      { id: 'femmes', title: 'Nombre de femmes présentes', type: 'counter', max: 20, order: 5 },
      { id: 'hommes', title: "Nombre d'hommes présents", type: 'counter', max: 20, order: 6 },
      { id: 'postes', title: 'Postes représentés dans le comité local', type: 'checkbox', options: ['DO', 'D.A.', 'B.M.', 'T.A.', 'Consultant(e)', 'Référent(e) RSE'], order: 7 },
      { id: 'ordre-jour', title: 'Ordre du jour', type: 'text', order: 8 },
    ]
  },
  {
    id: 'suivi-actions', title: 'Suivi actions', description: "Plan d'action et suivi des décisions",
    icon: 'settings', color: 'from-indigo-500 to-blue-500', important: true, order: 1,
    subThemes: [
      { id: 'actions-precedent', title: 'Actions du comité précédent', type: 'text', order: 0 },
      { id: 'nouvelles-actions', title: 'Nouvelles actions décidées', type: 'text', order: 1 },
      { id: 'responsables', title: 'Responsables des actions', type: 'text', order: 2 },
      { id: 'echeances', title: 'Échéances et délais', type: 'text', order: 3 },
      { id: 'priorites', title: 'Niveau de priorité', type: 'select', options: ['Urgent', 'Important', 'Normal', 'Faible'], order: 4 },
      { id: 'statut', title: "Statut d'avancement", type: 'select', options: ['À faire', 'En cours', 'Terminé', 'Bloqué'], order: 5 },
    ]
  },
  {
    id: 'perf-eco', title: 'Performance Économique', description: 'Finance, BP et suivi FAE',
    icon: 'trending-up', color: 'from-emerald-500 to-teal-500', important: false, order: 2,
    subThemes: [
      { id: 'evolution-bp', title: 'Evolution du BP', type: 'text', order: 0 },
      { id: 'intercontrats', title: 'Suivi des Intercontrats', type: 'text', order: 1 },
      { id: 'fidelisation', title: 'Fidélisation des clients', type: 'text', order: 2 },
      { id: 'satisfaction-clients', title: 'Alertes Satisfaction & Suivi des Clients', type: 'text', order: 3 },
      { id: 'suivi-fae', title: 'Suivi FAE', type: 'text', order: 4 },
      { id: 'ca-impact-negatif', title: 'Monitoring CA Business dans Secteur à fort Impact Négatif', type: 'text', order: 5 },
      { id: 'travailleurs-independants', title: 'Monitoring Dépassement seuil Travailleurs Indépendants', type: 'text', order: 6 },
      { id: 'litiges-clients', title: 'Monitoring des Litiges clients avec impact significatif', type: 'text', order: 7 },
    ]
  },
  {
    id: 'perf-sociale', title: 'Performance Sociale', description: 'RH, talents et bien-être',
    icon: 'users', color: 'from-violet-500 to-purple-500', important: false, order: 3,
    subThemes: [
      { id: 'redistribution', title: 'Redistribution Richesse / Budget / Répartition', type: 'text', order: 0 },
      { id: 'recrutement', title: 'Monitoring Recrutement / Ressources et Renouvellement', type: 'text', order: 1 },
      { id: 'integration', title: "Monitoring intégration / Qualité d'Embarquement", type: 'text', order: 2 },
      { id: 'turnover', title: 'Monitoring Turnover', type: 'text', order: 3 },
      { id: 'absenteisme', title: 'Monitoring Absentéisme', type: 'text', order: 4 },
      { id: 'plans-dev', title: 'Suivi des Plans de Développement individuels', type: 'text', order: 5 },
      { id: 'competences', title: 'Monitoring des Besoins de Compétences', type: 'text', order: 6 },
    ]
  },
  {
    id: 'perf-technique', title: 'Performance Technique', description: 'Qualité et innovation',
    icon: 'settings', color: 'from-orange-500 to-amber-500', important: false, order: 4,
    subThemes: [
      { id: 'satisfaction-tech', title: 'Pilotage Satisfaction Technique des Collaborateurs', type: 'text', order: 0 },
      { id: 'veille-techno', title: 'Suivi Veille Technologique', type: 'text', order: 1 },
      { id: 'offres-structurees', title: 'Développement & Pilotage Offres Structurées', type: 'text', order: 2 },
      { id: 'innovation', title: 'Innovations et Améliorations', type: 'text', order: 3 },
      { id: 'qualite', title: 'Suivi Qualité et Conformité', type: 'text', order: 4 },
    ]
  },
  {
    id: 'perf-gouvernance', title: 'Performance Gouvernance', description: 'Diversité et vivre-ensemble',
    icon: 'shield', color: 'from-rose-500 to-pink-500', important: false, order: 5,
    subThemes: [
      { id: 'diversite', title: 'Diversité des Fonctions Présentes au Comité', type: 'text', order: 0 },
      { id: 'vivre-ensemble', title: 'Vivre-Ensemble', type: 'text', order: 1 },
      { id: 'delais-paiement', title: 'Monitoring respect des Délais Paiement Fournisseur', type: 'text', order: 2 },
      { id: 'ethique', title: 'Éthique et Conformité', type: 'text', order: 3 },
      { id: 'communication', title: 'Communication Interne', type: 'text', order: 4 },
    ]
  },
  {
    id: 'impact-societal', title: 'Impact Sociétal', description: 'Engagement social et territoire',
    icon: 'heart', color: 'from-cyan-500 to-blue-500', important: false, order: 6,
    subThemes: [
      { id: 'mecenat', title: 'Actions de Mécénat', type: 'text', order: 0 },
      { id: 'territoire', title: 'Engagement Territorial', type: 'text', order: 1 },
      { id: 'partenariats', title: 'Partenariats Sociaux', type: 'text', order: 2 },
      { id: 'inclusion', title: 'Inclusion et Diversité', type: 'text', order: 3 },
    ]
  },
  {
    id: 'impact-env', title: 'Impact Environnemental', description: 'RSE et développement durable',
    icon: 'leaf', color: 'from-green-500 to-emerald-500', important: false, order: 7,
    subThemes: [
      { id: 'empreinte-carbone', title: 'Suivi Empreinte Carbone', type: 'text', order: 0 },
      { id: 'energie', title: 'Consommation Énergétique', type: 'text', order: 1 },
      { id: 'dechets', title: 'Gestion des Déchets', type: 'text', order: 2 },
      { id: 'mobilite', title: 'Mobilité Durable', type: 'text', order: 3 },
      { id: 'achats-responsables', title: 'Achats Responsables', type: 'text', order: 4 },
    ]
  },
];

async function main() {
  console.log('Début du seed...');

  // Upsert des agences
  for (const agency of agencies) {
    await prisma.agency.upsert({
      where: { id: agency.id },
      update: agency,
      create: agency,
    });
  }
  console.log(`${agencies.length} agences insérées/mises à jour`);

  // Upsert des personnes
  for (const person of persons) {
    await prisma.person.upsert({
      where: { id: person.id },
      update: person,
      create: person,
    });
  }
  console.log(`${persons.length} personnes insérées/mises à jour`);
  console.log('Mot de passe par défaut pour tous les utilisateurs : "password"');

  // Upsert des thèmes et sous-thèmes
  for (const themeData of themesData) {
    const { subThemes, ...theme } = themeData;
    await prisma.theme.upsert({
      where: { id: theme.id },
      update: { title: theme.title, description: theme.description, icon: theme.icon, color: theme.color, important: theme.important, order: theme.order },
      create: theme,
    });

    for (const st of subThemes) {
      const { options, placeholder, max, ...base } = st as any;
      await prisma.subTheme.upsert({
        where: { id: st.id },
        update: { title: st.title, type: st.type, options: options || [], placeholder: placeholder || null, max: max || null, order: st.order, themeId: theme.id },
        create: { id: st.id, title: st.title, type: st.type, options: options || [], placeholder: placeholder || null, max: max || null, order: st.order, themeId: theme.id },
      });
    }
  }
  console.log(`${themesData.length} thèmes avec sous-thèmes insérés/mis à jour`);

  console.log('Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
