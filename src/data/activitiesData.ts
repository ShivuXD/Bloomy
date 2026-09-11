export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'ADHD' | 'ASD' | 'DYSLEXIA';
  skill: string;
}

export const activities: Activity[] = [
  // ADHD
  {
    id: 'adhd-focus-1',
    title: 'Focus Quest',
    description: 'Find a target among distractions',
    category: 'ADHD',
    skill: 'Attention',
  },
  {
    id: 'adhd-focus-2',
    title: 'Rocket Focus',
    description: 'Catch only blue stars',
    category: 'ADHD',
    skill: 'Attention',
  },
  {
    id: 'adhd-impulse-1',
    title: 'Stop-Think-Go',
    description: 'Wait for the signal',
    category: 'ADHD',
    skill: 'Impulse Control',
  },
  {
    id: 'adhd-memory-1',
    title: 'Memory Mission',
    description: 'Remember sequence of objects',
    category: 'ADHD',
    skill: 'Memory',
  },

  // ASD
  {
    id: 'asd-comm-3',
    title: 'Greeting Master',
    description: 'Practice saying hello/bye',
    category: 'ASD',
    skill: 'Communication',
  },
  {
    id: 'asd-soc-1',
    title: 'What Would You Do?',
    description: 'Social scenario roleplay',
    category: 'ASD',
    skill: 'Social Situations',
  },
  {
    id: 'asd-emo-1',
    title: 'Feelings & Empathy',
    description: 'Explore feelings and empathy through stories',
    category: 'ASD',
    skill: 'Emotion Recognition',
  },

  // Dyslexia
  {
    id: 'dys-phon-1',
    title: 'Phonics Quest',
    description: 'Sound-letter relationship',
    category: 'DYSLEXIA',
    skill: 'Phonics',
  },
  {
    id: 'dys-spell-1',
    title: 'Word Builder',
    description: 'Arrange letters to spell',
    category: 'DYSLEXIA',
    skill: 'Spelling',
  },
  {
    id: 'dys-comp-1',
    title: 'Story Adventure',
    description: 'Interactive story quiz',
    category: 'DYSLEXIA',
    skill: 'Comprehension',
  },
];