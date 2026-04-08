export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role?: string;
}

export const persons: Person[] = [
  { id: '1', firstName: 'Marie', lastName: 'Dubois', fullName: 'Marie Dubois', role: 'Manager' },
  { id: '2', firstName: 'Pierre', lastName: 'Martin', fullName: 'Pierre Martin', role: 'Développeur' },
  { id: '3', firstName: 'Sophie', lastName: 'Bernard', fullName: 'Sophie Bernard', role: 'Chef de projet' },
  { id: '4', firstName: 'Thomas', lastName: 'Petit', fullName: 'Thomas Petit', role: 'Développeur' },
  { id: '5', firstName: 'Julie', lastName: 'Robert', fullName: 'Julie Robert', role: 'Designer' },
  { id: '6', firstName: 'Nicolas', lastName: 'Richard', fullName: 'Nicolas Richard', role: 'DevOps' },
  { id: '7', firstName: 'Camille', lastName: 'Durand', fullName: 'Camille Durand', role: 'Manager' },
  { id: '8', firstName: 'Alexandre', lastName: 'Moreau', fullName: 'Alexandre Moreau', role: 'Développeur' },
  { id: '9', firstName: 'Laura', lastName: 'Simon', fullName: 'Laura Simon', role: 'Chef de projet' },
  { id: '10', firstName: 'Julien', lastName: 'Laurent', fullName: 'Julien Laurent', role: 'Développeur' },
  { id: '11', firstName: 'Emma', lastName: 'Lefebvre', fullName: 'Emma Lefebvre', role: 'Designer' },
  { id: '12', firstName: 'Lucas', lastName: 'Michel', fullName: 'Lucas Michel', role: 'Développeur' },
  { id: '13', firstName: 'Chloé', lastName: 'Garcia', fullName: 'Chloé Garcia', role: 'Manager' },
  { id: '14', firstName: 'Maxime', lastName: 'David', fullName: 'Maxime David', role: 'DevOps' },
  { id: '15', firstName: 'Léa', lastName: 'Bertrand', fullName: 'Léa Bertrand', role: 'Chef de projet' },
  { id: '16', firstName: 'Antoine', lastName: 'Roux', fullName: 'Antoine Roux', role: 'Développeur' },
  { id: '17', firstName: 'Manon', lastName: 'Vincent', fullName: 'Manon Vincent', role: 'Designer' },
  { id: '18', firstName: 'Hugo', lastName: 'Fournier', fullName: 'Hugo Fournier', role: 'Développeur' },
  { id: '19', firstName: 'Clara', lastName: 'Morel', fullName: 'Clara Morel', role: 'Manager' },
  { id: '20', firstName: 'Théo', lastName: 'Girard', fullName: 'Théo Girard', role: 'DevOps' },
  { id: '21', firstName: 'Inès', lastName: 'Andre', fullName: 'Inès Andre', role: 'Chef de projet' },
  { id: '22', firstName: 'Louis', lastName: 'Leroy', fullName: 'Louis Leroy', role: 'Développeur' },
  { id: '23', firstName: 'Sarah', lastName: 'Garnier', fullName: 'Sarah Garnier', role: 'Designer' },
  { id: '24', firstName: 'Arthur', lastName: 'Chevalier', fullName: 'Arthur Chevalier', role: 'Développeur' },
  { id: '25', firstName: 'Lucie', lastName: 'François', fullName: 'Lucie François', role: 'Manager' },
  { id: '26', firstName: 'Nathan', lastName: 'Blanc', fullName: 'Nathan Blanc', role: 'DevOps' },
  { id: '27', firstName: 'Océane', lastName: 'Guerin', fullName: 'Océane Guerin', role: 'Chef de projet' },
  { id: '28', firstName: 'Gabriel', lastName: 'Boyer', fullName: 'Gabriel Boyer', role: 'Développeur' },
  { id: '29', firstName: 'Anaïs', lastName: 'Lambert', fullName: 'Anaïs Lambert', role: 'Designer' },
  { id: '30', firstName: 'Raphaël', lastName: 'Fontaine', fullName: 'Raphaël Fontaine', role: 'Développeur' },
];
