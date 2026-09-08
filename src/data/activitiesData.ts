export interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'ADHD' | 'ASD' | 'DYSLEXIA';
  skill: string;
}

export const activities: Activity[] = [
  // ADHD
  { id: 'adhd-focus-1', title: 'Focus Quest', description: 'Find a target among distractions', category: 'ADHD', skill: 'Attention' },
  { id: 'adhd-focus-2', title: 'Rocket Focus', description: 'Catch only blue stars', category: 'ADHD', skill: 'Attention' },
  { id: 'adhd-focus-3', title: 'Distraction Shield', description: 'Maintain focus on a task with ambient noise', category: 'ADHD', skill: 'Attention' },
  { id: 'adhd-impulse-1', title: 'Stop-Think-Go', description: 'Wait for the signal', category: 'ADHD', skill: 'Impulse Control' },
  { id: 'adhd-impulse-2', title: 'Freeze Dance', description: 'Move to music, freeze on pause', category: 'ADHD', skill: 'Impulse Control' },
  { id: 'adhd-impulse-3', title: 'Slow-Motion Tap', description: 'Tap targets slowly', category: 'ADHD', skill: 'Impulse Control' },
  { id: 'adhd-memory-1', title: 'Memory Mission', description: 'Remember sequence of objects', category: 'ADHD', skill: 'Memory' },
  { id: 'adhd-memory-2', title: 'Find the Pair', description: 'Match hidden cards', category: 'ADHD', skill: 'Memory' },
  { id: 'adhd-memory-3', title: 'Color Sequence', description: 'Repeat color patterns', category: 'ADHD', skill: 'Memory' },
  { id: 'adhd-seq-1', title: 'Routine Builder', description: 'Order your morning steps', category: 'ADHD', skill: 'Planning' },
  { id: 'adhd-seq-2', title: 'Recipe Helper', description: 'Order steps to make a snack', category: 'ADHD', skill: 'Planning' },
  { id: 'adhd-seq-3', title: 'Story Sorter', description: 'Put story scenes in order', category: 'ADHD', skill: 'Planning' },
  { id: 'adhd-emo-1', title: 'Emotion Detective', description: 'Identify emotions', category: 'ADHD', skill: 'Emotional Regulation' },
  { id: 'adhd-emo-2', title: 'Calm Breathing', description: 'Follow the breathing rhythm', category: 'ADHD', skill: 'Emotional Regulation' },
  { id: 'adhd-emo-3', title: 'Mood Mirror', description: 'Match the mood you see', category: 'ADHD', skill: 'Emotional Regulation' },
  
  // ASD
  { id: 'asd-emo-1', title: 'Emotion Face Match', description: 'Match facial expressions', category: 'ASD', skill: 'Emotion Recognition' },
  { id: 'asd-emo-2', title: 'Feelings Explorer', description: 'Identify feelings from stories', category: 'ASD', skill: 'Emotion Recognition' },
  { id: 'asd-emo-3', title: 'Empathy Builder', description: 'Choose response to scenario', category: 'ASD', skill: 'Emotion Recognition' },
  { id: 'asd-comm-1', title: 'Conversation Builder', description: 'Pick what to say', category: 'ASD', skill: 'Communication' },
  { id: 'asd-comm-2', title: 'Needs Expresser', description: 'Select requests from icons', category: 'ASD', skill: 'Communication' },
  { id: 'asd-comm-3', title: 'Greeting Master', description: 'Practice saying hello/bye', category: 'ASD', skill: 'Communication' },
  { id: 'asd-soc-1', title: 'What Would You Do?', description: 'Social scenario roleplay', category: 'ASD', skill: 'Social Situations' },
  { id: 'asd-soc-2', title: 'School Scene', description: 'Navigate classroom social interaction', category: 'ASD', skill: 'Social Situations' },
  { id: 'asd-soc-3', title: 'Playground Buddy', description: 'Practice asking to play', category: 'ASD', skill: 'Social Situations' },
  { id: 'asd-flex-1', title: 'Flexible Day', description: 'Choose coping strategies', category: 'ASD', skill: 'Flexibility' },
  { id: 'asd-flex-2', title: 'Unexpected Change', description: 'Handle routine shifts', category: 'ASD', skill: 'Flexibility' },
  { id: 'asd-flex-3', title: 'Plan B Explorer', description: 'Identify alternate plans', category: 'ASD', skill: 'Flexibility' },
  { id: 'asd-sens-1', title: 'Calm Space', description: 'Predictable sensory calming', category: 'ASD', skill: 'Self-regulation' },
  { id: 'asd-sens-2', title: 'Visual Timer', description: 'Soothing time visualization', category: 'ASD', skill: 'Self-regulation' },
  { id: 'asd-sens-3', title: 'Sensory Selector', description: 'Choose calming sensory input', category: 'ASD', skill: 'Self-regulation' },

  // Dyslexia
  { id: 'dys-phon-1', title: 'Phonics Quest', description: 'Sound-letter relationship', category: 'DYSLEXIA', skill: 'Phonics' },
  { id: 'dys-phon-2', title: 'Sound Matcher', description: 'Identify starting sounds', category: 'DYSLEXIA', skill: 'Phonics' },
  { id: 'dys-phon-3', title: 'Sound Blending', description: 'Blend sounds into words', category: 'DYSLEXIA', skill: 'Phonics' },
  { id: 'dys-read-1', title: 'Read & Reveal', description: 'Short sentence practice', category: 'DYSLEXIA', skill: 'Reading' },
  { id: 'dys-read-2', title: 'Speedy Reader', description: 'Practice reading common words', category: 'DYSLEXIA', skill: 'Reading' },
  { id: 'dys-read-3', title: 'Audio Companion', description: 'Read while hearing audio', category: 'DYSLEXIA', skill: 'Reading' },
  { id: 'dys-spell-1', title: 'Word Builder', description: 'Arrange letters to spell', category: 'DYSLEXIA', skill: 'Spelling' },
  { id: 'dys-spell-2', title: 'Spelling Patterns', description: 'Group words with same pattern', category: 'DYSLEXIA', skill: 'Spelling' },
  { id: 'dys-spell-3', title: 'Hidden Letters', description: 'Find the missing letter', category: 'DYSLEXIA', skill: 'Spelling' },
  { id: 'dys-word-1', title: 'Word Detective', description: 'Select correct word', category: 'DYSLEXIA', skill: 'Word Recognition' },
  { id: 'dys-word-2', title: 'Sight Word Hunt', description: 'Spot sight words quickly', category: 'DYSLEXIA', skill: 'Word Recognition' },
  { id: 'dys-word-3', title: 'Word Pair Match', description: 'Match visually similar words', category: 'DYSLEXIA', skill: 'Word Recognition' },
  { id: 'dys-comp-1', title: 'Story Adventure', description: 'Interactive story quiz', category: 'DYSLEXIA', skill: 'Comprehension' },
  { id: 'dys-comp-2', title: 'Sequence Story', description: 'Put story events in order', category: 'DYSLEXIA', skill: 'Comprehension' },
  { id: 'dys-comp-3', title: 'Meaning Maker', description: 'Match words to pictures', category: 'DYSLEXIA', skill: 'Comprehension' }
];
