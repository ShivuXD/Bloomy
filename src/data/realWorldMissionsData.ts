export type RealWorldSkill =
  | 'Communication'
  | 'Social Interaction'
  | 'Comprehension'
  | 'Memory'
  | 'Focus'
  | 'Decision Making'
  | 'Asking for Help'
  | 'Emotional Regulation'
  | 'Multi-Skill';

export interface RealWorldOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface RealWorldMissionItem {
  id: string;
  skill: RealWorldSkill;
  title: string;
  badgeIcon: string;
  scenario: string;
  instructions?: string;
  challenge: string;
  options: RealWorldOption[];
  correctAnswerId: 'A' | 'B' | 'C' | 'D';
  hint: string;
  pecoCheer: string;
  learningPoint: string;
  xpReward: number;
}

// Activity ID to primary skill mapping
export const ACTIVITY_SKILL_MAP: Record<string, RealWorldSkill> = {
  // Communication & Social
  'asd-comm-1': 'Communication',
  'asd-comm-2': 'Communication',
  'asd-comm-3': 'Communication',
  'GREETING_MASTER': 'Communication',
  'asd-soc-1': 'Social Interaction',
  'asd-soc-2': 'Social Interaction',
  'asd-soc-3': 'Social Interaction',
  'WHAT_WOULD_YOU_DO': 'Social Interaction',
  'SOCIAL': 'Communication',

  // Reading Comprehension & Phonics
  'dys-comp-1': 'Comprehension',
  'dys-comp-2': 'Comprehension',
  'dys-comp-3': 'Comprehension',
  'STORY_ADVENTURE': 'Comprehension',
  'dys-read-1': 'Comprehension',
  'dys-read-2': 'Comprehension',
  'dys-read-3': 'Comprehension',
  'READING': 'Comprehension',
  'dys-spell-1': 'Comprehension',
  'WORD_BUILDER': 'Comprehension',
  'dys-phon-1': 'Comprehension',

  // Memory & Recall
  'adhd-memory-1': 'Memory',
  'adhd-memory-2': 'Memory',
  'adhd-memory-3': 'Memory',
  'MEMORY_MISSION': 'Memory',

  // Focus & Attention
  'adhd-focus-1': 'Focus',
  'adhd-focus-2': 'Focus',
  'adhd-focus-3': 'Focus',
  'ROCKET_FOCUS': 'Focus',
  'FOCUS': 'Focus',

  // Emotional Regulation & Impulse Control
  'adhd-impulse-1': 'Emotional Regulation',
  'adhd-impulse-2': 'Emotional Regulation',
  'adhd-impulse-3': 'Emotional Regulation',
  'STOP_THINK_GO': 'Emotional Regulation',
  'adhd-emo-1': 'Emotional Regulation',
  'adhd-emo-2': 'Emotional Regulation',
  'adhd-emo-3': 'Emotional Regulation',
  'asd-emo-1': 'Emotional Regulation',
  'asd-emo-2': 'Emotional Regulation',
  'asd-emo-3': 'Emotional Regulation',

  // Decision Making & Planning
  'adhd-seq-1': 'Decision Making',
  'adhd-seq-2': 'Decision Making',
  'adhd-seq-3': 'Decision Making',
  'asd-flex-1': 'Decision Making',
  'asd-flex-2': 'Decision Making',
  'asd-flex-3': 'Decision Making',
};

// -------------------------------------------------------------
// WORD EXPLORER REAL-WORLD CHALLENGES (Dedicated & Vocabulary-Specific)
// -------------------------------------------------------------
export const WORD_EXPLORER_CHALLENGES: RealWorldMissionItem[] = [
  {
    id: 'word-read-the-sign',
    skill: 'Comprehension',
    title: 'Read the Sign',
    badgeIcon: '🏛️',
    scenario: 'You are visiting the neighborhood community center looking for a quiet room to read storybooks. Above the door is a big blue sign that says "LIBRARY".',
    challenge: 'What does this sign say?',
    options: [
      {
        id: 'A',
        text: 'Library',
        isCorrect: true,
        feedback: 'Spot on! L-I-B-R-A-R-Y spells Library, the quiet place for books.',
      },
      {
        id: 'B',
        text: 'Bakery',
        isCorrect: false,
        feedback: 'Bakery starts with B-A-K. Look closely at L-I-B-R-A-R-Y!',
      },
      {
        id: 'C',
        text: 'Garden',
        isCorrect: false,
        feedback: 'Garden starts with G-A-R. Look at the letters on the blue sign.',
      },
      {
        id: 'D',
        text: 'Hospital',
        isCorrect: false,
        feedback: 'Hospital starts with H-O-S-P. Let us look at L-I-B-R-A-R-Y again!',
      },
    ],
    correctAnswerId: 'A',
    hint: 'Look at each letter carefully and sound out the word: L-I-B-R-A-R-Y.',
    pecoCheer: 'Awesome reading! You sounded out the letters and found the library!',
    learningPoint: 'Reading signs helps you recognize places and navigate everyday environments.',
    xpReward: 20,
  },
  {
    id: 'word-build-shopping-list',
    skill: 'Comprehension',
    title: 'Build the Shopping List',
    badgeIcon: '🛒',
    scenario: 'You are going to the shop with a family member and helping write the grocery list. You want to add the crunchy red fruit.',
    challenge: 'Which word correctly spells the fruit for your shopping list?',
    options: [
      {
        id: 'A',
        text: 'APLE',
        isCorrect: false,
        feedback: 'Almost! Remember, this fruit has two Ps in the middle: A-P-P-L-E.',
      },
      {
        id: 'B',
        text: 'APPLE',
        isCorrect: true,
        feedback: 'Perfect! A-P-P-L-E spells APPLE. Your shopping list is ready!',
      },
      {
        id: 'C',
        text: 'ALPEP',
        isCorrect: false,
        feedback: 'The letters are a bit mixed up here. Try sounding out A-P-P-L-E.',
      },
      {
        id: 'D',
        text: 'APEL',
        isCorrect: false,
        feedback: 'Good try, but remember the double P and ending L-E: APPLE!',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Think about the letters we practiced: A-P-P-L-E.',
    pecoCheer: 'Great spelling! You added APPLE to the real-life shopping list!',
    learningPoint: 'Writing clear words on shopping lists helps you remember items accurately.',
    xpReward: 20,
  },
  {
    id: 'word-make-right-word',
    skill: 'Comprehension',
    title: 'Make the Right Word',
    badgeIcon: '🐶',
    scenario: 'At home, your puppy is wagging its tail next to letter magnets on the fridge: "D - O - G".',
    challenge: 'What word do these letters form in real life?',
    options: [
      {
        id: 'A',
        text: 'DIG',
        isCorrect: false,
        feedback: 'DIG has an "I" in the middle. Here the middle letter is "O"!',
      },
      {
        id: 'B',
        text: 'DOG',
        isCorrect: true,
        feedback: 'You got it! D-O-G spells DOG, the friendly pet!',
      },
      {
        id: 'C',
        text: 'DOT',
        isCorrect: false,
        feedback: 'DOT ends with "T", but our letters end with "G".',
      },
      {
        id: 'D',
        text: 'GOD',
        isCorrect: false,
        feedback: 'In English, we read left-to-right starting with D, then O, then G: DOG.',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Sound out the letters from left to right: D... O... G...',
    pecoCheer: 'Spot on! You unjumbled the letters to make the right word!',
    learningPoint: 'Reading letters in left-to-right order forms real words we use every day.',
    xpReward: 20,
  },
  {
    id: 'word-match-object',
    skill: 'Comprehension',
    title: 'Match Word to Object',
    badgeIcon: '📖',
    scenario: 'Your teacher asks you to pick up the rectangular item with colorful paper pages for quiet reading time.',
    challenge: 'Which word label matches this object?',
    options: [
      {
        id: 'A',
        text: 'BOOK',
        isCorrect: true,
        feedback: 'Exactly right! B-O-O-K labels the book you read.',
      },
      {
        id: 'B',
        text: 'BOOT',
        isCorrect: false,
        feedback: 'A boot is footwear for your feet, not pages to read!',
      },
      {
        id: 'C',
        text: 'BARK',
        isCorrect: false,
        feedback: 'Bark is on trees or what dogs do. Look for B-O-O-K.',
      },
      {
        id: 'D',
        text: 'BELL',
        isCorrect: false,
        feedback: 'A bell makes a ringing chime. We are looking for B-O-O-K!',
      },
    ],
    correctAnswerId: 'A',
    hint: 'Look for the word starting with B and having double O: B-O-O-K.',
    pecoCheer: 'Super job! You connected the written word to the real-life object!',
    learningPoint: 'Matching words to objects makes classroom and home labeling simple.',
    xpReward: 20,
  },
  {
    id: 'word-find-the-word',
    skill: 'Comprehension',
    title: 'Find the Word on the Map',
    badgeIcon: '🐟',
    scenario: 'You are exploring a local botanical aquarium and looking for the indoor pond with swimming fish.',
    challenge: 'Which path sign should you follow?',
    options: [
      {
        id: 'A',
        text: 'FERN PATH',
        isCorrect: false,
        feedback: 'Fern path leads to green leafy plants, not the swimming fish.',
      },
      {
        id: 'B',
        text: 'FISH POND',
        isCorrect: true,
        feedback: 'Hurray! F-I-S-H P-O-N-D is where the swimming creatures are!',
      },
      {
        id: 'C',
        text: 'FOOD COURT',
        isCorrect: false,
        feedback: 'Food court is where people eat lunch. Look for F-I-S-H.',
      },
      {
        id: 'D',
        text: 'FROG ROCK',
        isCorrect: false,
        feedback: 'Frog rock has amphibians, but we want the fish pond!',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Sound out the letters F-I-S-H: Fish!',
    pecoCheer: 'You found the word! You can now navigate real-life map signs easily.',
    learningPoint: 'Looking for familiar keywords on signs guides your way in public parks.',
    xpReward: 20,
  },
  {
    id: 'word-complete-everyday-sentence',
    skill: 'Comprehension',
    title: 'Complete the Everyday Sentence',
    badgeIcon: '⭐',
    scenario: 'A colorful motivational poster in your hallway says: "Keep trying your best and reach for the _____!"',
    challenge: 'Which word completes the sentence to describe what shines high at night?',
    options: [
      {
        id: 'A',
        text: 'STAR',
        isCorrect: true,
        feedback: 'Fantastic! S-T-A-R completes the phrase: Reach for the STAR!',
      },
      {
        id: 'B',
        text: 'STOP',
        isCorrect: false,
        feedback: 'Stop means pausing. The sentence is about reaching high into the sky!',
      },
      {
        id: 'C',
        text: 'STIR',
        isCorrect: false,
        feedback: 'Stir is what you do with a spoon. Look for S-T-A-R.',
      },
      {
        id: 'D',
        text: 'STAY',
        isCorrect: false,
        feedback: 'Stay means remaining in one place. We want the shining star!',
      },
    ],
    correctAnswerId: 'A',
    hint: 'Think about the 4 letters we practiced: S-T-A-R.',
    pecoCheer: 'Magnificent! You used your vocabulary to complete a real-world sentence!',
    learningPoint: 'Filling in missing words improves sentence reading and conversational speech.',
    xpReward: 20,
  },
  {
    id: 'word-read-simple-notice',
    skill: 'Comprehension',
    title: 'Read the Simple Notice',
    badgeIcon: '🌳',
    scenario: 'A park notice board says: "Nature Club: Meet under the tall shade TREE for storytelling."',
    challenge: 'Where should everyone gather for the storytelling?',
    options: [
      {
        id: 'A',
        text: 'Under the TREE',
        isCorrect: true,
        feedback: 'You got it! T-R-E-E is the meeting spot mentioned in the notice.',
      },
      {
        id: 'B',
        text: 'Inside the bus',
        isCorrect: false,
        feedback: 'The notice does not mention a bus. Look for the word TREE.',
      },
      {
        id: 'C',
        text: 'Near the car',
        isCorrect: false,
        feedback: 'The notice asks to meet by the tree, not a car.',
      },
      {
        id: 'D',
        text: 'At the gate',
        isCorrect: false,
        feedback: 'The notice specifically asks to meet under the tree!',
      },
    ],
    correctAnswerId: 'A',
    hint: 'Look for the keyword with T-R-E-E in the notice.',
    pecoCheer: 'Terrific reading! You identified the important instruction in the notice.',
    learningPoint: 'Reading notice boards helps you follow community activities with confidence.',
    xpReward: 20,
  },
];

// Full catalog of Contextual Real-World Missions organized by skill
export const ALL_REAL_WORLD_MISSIONS: RealWorldMissionItem[] = [
  ...WORD_EXPLORER_CHALLENGES,
  // -------------------------------------------------------------
  // 1. COMMUNICATION MISSIONS
  // -------------------------------------------------------------
  {
    id: 'comm-friendly-hello',
    skill: 'Communication',
    title: 'The Friendly Hello',
    badgeIcon: '👋',
    scenario: 'You see a classmate you know while walking into college or school.',
    challenge: 'What would you do?',
    options: [
      {
        id: 'A',
        text: 'Ignore them and walk away.',
        isCorrect: false,
        feedback: "Walking away might make them feel ignored. Let's try a warmer choice!",
      },
      {
        id: 'B',
        text: 'Smile and say "Hi!"',
        isCorrect: true,
        feedback: 'Wonderful! A friendly smile and greeting is a simple, warm way to acknowledge someone.',
      },
      {
        id: 'C',
        text: 'Shout their name loudly across the hall.',
        isCorrect: false,
        feedback: 'Shouting can startle people nearby. A polite conversational tone works best.',
      },
      {
        id: 'D',
        text: 'Walk away without acknowledging them.',
        isCorrect: false,
        feedback: 'Acknowledging people helps build friendships and connections.',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Think about how you would like someone to greet you when they see you.',
    pecoCheer: 'Great job! You used the communication skill you have been practicing!',
    learningPoint: 'A friendly greeting can help start a positive everyday interaction.',
    xpReward: 15,
  },
  {
    id: 'comm-introducing-yourself',
    skill: 'Communication',
    title: 'Introducing Yourself',
    badgeIcon: '🤝',
    scenario: 'You sit at a new study table or project team where you do not know anyone yet.',
    challenge: 'How would you introduce yourself?',
    options: [
      {
        id: 'A',
        text: 'Sit with arms crossed and say nothing the entire time.',
        isCorrect: false,
        feedback: 'Staying completely silent makes it hard for teammates to get to know you.',
      },
      {
        id: 'B',
        text: 'Smile, say your name, and ask what they are working on.',
        isCorrect: true,
        feedback: 'Fantastic! Saying your name with a smile breaks the ice naturally.',
      },
      {
        id: 'C',
        text: 'Speak very loudly and take over the discussion right away.',
        isCorrect: false,
        feedback: 'Taking over without listening can make others feel uncomfortable.',
      },
      {
        id: 'D',
        text: 'Look at the floor and wait for someone to confront you.',
        isCorrect: false,
        feedback: 'You do not have to wait to be confronted—a gentle greeting invites friendly teamwork.',
      },
    ],
    correctAnswerId: 'B',
    hint: 'A gentle smile and saying your name breaks the ice naturally.',
    pecoCheer: 'Awesome introduction! You made joining the group so welcoming.',
    learningPoint: 'Sharing your name and asking an open question opens doors to new friendships.',
    xpReward: 15,
  },
  {
    id: 'comm-joining-conversation',
    skill: 'Social Interaction',
    title: 'Joining a Conversation',
    badgeIcon: '🗣️',
    scenario: 'You are standing near a group of classmates discussing an interesting topic you enjoy.',
    challenge: 'How would you join in?',
    options: [
      {
        id: 'A',
        text: 'Interrupt the person speaking immediately.',
        isCorrect: false,
        feedback: 'Interrupting breaks their train of thought. Waiting for a pause is more respectful.',
      },
      {
        id: 'B',
        text: 'Wait for a natural pause, then politely share a thought.',
        isCorrect: true,
        feedback: 'Spot on! Waiting for a natural pause shows great conversational timing and respect.',
      },
      {
        id: 'C',
        text: 'Stand very close silently without ever speaking.',
        isCorrect: false,
        feedback: 'Standing silently without greeting anyone can feel awkward for everyone.',
      },
      {
        id: 'D',
        text: 'Walk away angrily because you were not asked first.',
        isCorrect: false,
        feedback: 'People often welcome new friends who politely join in when there is a pause!',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Listening first helps you notice when there is a natural pause.',
    pecoCheer: 'Great patience and timing! You handled that group situation like a pro.',
    learningPoint: 'Active listening and waiting for natural conversational pauses makes group interactions smooth.',
    xpReward: 15,
  },

  // -------------------------------------------------------------
  // 2. READING COMPREHENSION MISSIONS
  // -------------------------------------------------------------
  {
    id: 'comp-important-message',
    skill: 'Comprehension',
    title: 'The Important Message',
    badgeIcon: '✉️',
    scenario: 'You receive a message from your teacher: "Remember to bring your project notebook tomorrow at 10 AM."',
    challenge: 'What is the most important thing to remember?',
    options: [
      {
        id: 'A',
        text: "The teacher's favorite subject.",
        isCorrect: false,
        feedback: 'The message is about an assignment deadline, not personal preferences.',
      },
      {
        id: 'B',
        text: 'Bring the project notebook tomorrow at 10 AM.',
        isCorrect: true,
        feedback: 'Spot on! You pulled the key action item and deadline straight from the text.',
      },
      {
        id: 'C',
        text: 'Go home early.',
        isCorrect: false,
        feedback: 'The message does not mention leaving early.',
      },
      {
        id: 'D',
        text: 'Bring a different book.',
        isCorrect: false,
        feedback: 'The message specifically asked for the project notebook.',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Look carefully at the key instructions and details in the message.',
    pecoCheer: 'Excellent reading comprehension! You spotted the crucial detail right away.',
    learningPoint: 'Focusing on the "what" and "when" in messages prevents forgotten items and missed deadlines.',
    xpReward: 15,
  },
  {
    id: 'comp-campus-notice',
    skill: 'Comprehension',
    title: 'Reading a Campus Notice',
    badgeIcon: '📋',
    scenario: 'A sign on the library door reads: "Quiet Study Zone — Please silence your phone and use headphones."',
    challenge: 'What should you do before walking inside?',
    options: [
      {
        id: 'A',
        text: 'Call a friend to talk loudly on speakerphone.',
        isCorrect: false,
        feedback: 'Speakerphone calls violate the quiet study rule.',
      },
      {
        id: 'B',
        text: 'Switch your phone to silent mode and put on headphones.',
        isCorrect: true,
        feedback: 'Exactly right! You followed the posted notice and respected other students studying.',
      },
      {
        id: 'C',
        text: 'Ignore the sign completely.',
        isCorrect: false,
        feedback: 'Reading and following public signs makes shared spaces comfortable for everyone.',
      },
      {
        id: 'D',
        text: 'Turn up your ringtone volume so you do not miss calls.',
        isCorrect: false,
        feedback: 'The notice specifically asked to silence phones in this quiet zone.',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Think about what the sign asks visitors to do to respect others.',
    pecoCheer: 'Awesome reading! You applied written instructions directly to real life.',
    learningPoint: 'Notices in public spaces help everyone share rooms respectfully and productively.',
    xpReward: 15,
  },
  {
    id: 'comp-understanding-instructions',
    skill: 'Comprehension',
    title: 'Understanding Instructions',
    badgeIcon: '🔬',
    scenario: 'Your science lab guide says: "Step 1: Put on safety glasses before opening the supply kit."',
    challenge: 'What is your very first action?',
    options: [
      {
        id: 'A',
        text: 'Open the supply kit immediately.',
        isCorrect: false,
        feedback: 'Step 1 requires safety glasses before opening the kit.',
      },
      {
        id: 'B',
        text: 'Put on your safety glasses.',
        isCorrect: true,
        feedback: 'Perfect! Following Step 1 protects your eyes and shows careful listening.',
      },
      {
        id: 'C',
        text: 'Skip to Step 3.',
        isCorrect: false,
        feedback: 'Lab steps build on each other in numerical order for safety.',
      },
      {
        id: 'D',
        text: 'Leave the room without doing anything.',
        isCorrect: false,
        feedback: 'You are ready to do the lab—just follow the numbered steps one by one!',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Pay close attention to what step 1 specifically instructs.',
    pecoCheer: 'Great comprehension! Step-by-step reading keeps you safe and successful.',
    learningPoint: 'Reading numbered steps in order ensures accuracy and safety in hands-on activities.',
    xpReward: 15,
  },

  // -------------------------------------------------------------
  // 3. MEMORY MISSIONS
  // -------------------------------------------------------------
  {
    id: 'mem-before-you-leave',
    skill: 'Memory',
    title: 'Remember Before You Leave',
    badgeIcon: '🎒',
    scenario: 'Peco tells you: "Remember these three items before leaving class: your notebook, water bottle, and ID card."',
    challenge: 'Which three things did you need to remember?',
    options: [
      {
        id: 'A',
        text: 'Phone, umbrella, and house keys.',
        isCorrect: false,
        feedback: 'Those are useful, but not the 3 items Peco mentioned for leaving class.',
      },
      {
        id: 'B',
        text: 'Notebook, water bottle, and ID card.',
        isCorrect: true,
        feedback: 'You remembered all three! Your working memory is super sharp.',
      },
      {
        id: 'C',
        text: 'Laptop, warm jacket, and afternoon snack.',
        isCorrect: false,
        feedback: 'Check back to the items Peco specifically listed.',
      },
      {
        id: 'D',
        text: 'Water bottle, sunglasses, and pencil case.',
        isCorrect: false,
        feedback: 'You remembered the water bottle, but what were the other two items?',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Try remembering the three items Peco told you earlier: two study items and one hydration item.',
    pecoCheer: 'Super memory power! You recalled all 3 items without missing a beat.',
    learningPoint: 'Mental checklists help ensure you never leave essential belongings behind.',
    xpReward: 15,
  },
  {
    id: 'mem-remember-instructions',
    skill: 'Memory',
    title: 'Remember the Room Number',
    badgeIcon: '🚪',
    scenario: 'Your instructor says: "Turn in worksheet A, keep worksheet B, and meet us at Room 204."',
    challenge: 'Which room should you go to?',
    options: [
      {
        id: 'A',
        text: 'Room 101',
        isCorrect: false,
        feedback: 'That is on the first floor. Recall the number the teacher said.',
      },
      {
        id: 'B',
        text: 'Room 204',
        isCorrect: true,
        feedback: 'Spot on! You remembered the exact room number from spoken instructions.',
      },
      {
        id: 'C',
        text: 'Room 305',
        isCorrect: false,
        feedback: 'Not Room 305. Think back to the instructor\'s room number.',
      },
      {
        id: 'D',
        text: 'The campus cafeteria.',
        isCorrect: false,
        feedback: 'The teacher specified a classroom number on the second floor.',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Recall the room number given in the instructor\'s verbal instructions (starts with 2).',
    pecoCheer: 'Terrific recall! You held onto important verbal directions easily.',
    learningPoint: 'Repeating spoken directions silently to yourself helps cement them in short-term memory.',
    xpReward: 15,
  },
  {
    id: 'mem-what-peco-told',
    skill: 'Memory',
    title: 'What Did Peco Tell You?',
    badgeIcon: '🧠',
    scenario: 'Peco gave you a 3-step morning sequence: 1. Pack backpack, 2. Check schedule, 3. Put on shoes.',
    challenge: 'What was step 2 in Peco\'s checklist?',
    options: [
      {
        id: 'A',
        text: 'Check schedule.',
        isCorrect: true,
        feedback: 'Bingo! Step 2 was checking your schedule so you are ready for the day.',
      },
      {
        id: 'B',
        text: 'Put on shoes.',
        isCorrect: false,
        feedback: 'Putting on shoes was Step 3, right before walking out the door.',
      },
      {
        id: 'C',
        text: 'Eat lunch.',
        isCorrect: false,
        feedback: 'Eating lunch was not part of this 3-step morning checklist.',
      },
      {
        id: 'D',
        text: 'Pack backpack.',
        isCorrect: false,
        feedback: 'Packing the backpack was Step 1!',
      },
    ],
    correctAnswerId: 'A',
    hint: 'Recall the second item in the morning preparation sequence.',
    pecoCheer: 'Brilliant sequential memory! You kept all the steps in perfect order.',
    learningPoint: 'Remembering step sequences helps daily routines run smoothly and calmly.',
    xpReward: 15,
  },

  // -------------------------------------------------------------
  // 4. DECISION MAKING & PROBLEM SOLVING MISSIONS
  // -------------------------------------------------------------
  {
    id: 'dec-busy-morning',
    skill: 'Decision Making',
    title: 'The Busy Morning',
    badgeIcon: '⏳',
    scenario: 'You have two things to do before class starts: 1. Submit your assignment due in 10 minutes, 2. Fill your water bottle.',
    challenge: 'What should you do first?',
    options: [
      {
        id: 'A',
        text: 'Submit your assignment first, then fill your water bottle.',
        isCorrect: true,
        feedback: 'Smart decision! The assignment has an urgent deadline, while water can be filled right after.',
      },
      {
        id: 'B',
        text: 'Spend 15 minutes filling your water bottle and turn in the assignment late.',
        isCorrect: false,
        feedback: 'Turning in work late can impact grades when it only takes a minute to submit first.',
      },
      {
        id: 'C',
        text: 'Do neither and sit down in frustration.',
        isCorrect: false,
        feedback: 'Doing nothing creates more stress. Tackling the urgent one first relieves pressure.',
      },
      {
        id: 'D',
        text: 'Panic and leave the campus.',
        isCorrect: false,
        feedback: 'No need to panic! Taking action on the highest priority task solves the problem.',
      },
    ],
    correctAnswerId: 'A',
    hint: 'Think about which task has an urgent deadline that cannot be delayed.',
    pecoCheer: 'Outstanding prioritization! You chose the time-sensitive task first.',
    learningPoint: 'Prioritizing time-sensitive tasks prevents unnecessary stress and missed deadlines.',
    xpReward: 15,
  },
  {
    id: 'dec-choosing-first',
    skill: 'Decision Making',
    title: 'Focus Before Fun',
    badgeIcon: '🎯',
    scenario: 'You have two choices for this evening: prepare for tomorrow morning\'s quiz or play video games.',
    challenge: 'What is the best order to do these tasks?',
    options: [
      {
        id: 'A',
        text: 'Play video games all night and skip studying entirely.',
        isCorrect: false,
        feedback: 'Skipping study will make tomorrow morning very stressful.',
      },
      {
        id: 'B',
        text: 'Study for the quiz first, then enjoy playing your game guilt-free.',
        isCorrect: true,
        feedback: 'Spot on! Finishing your study first allows you to relax and truly enjoy gaming.',
      },
      {
        id: 'C',
        text: 'Do neither and sleep all afternoon.',
        isCorrect: false,
        feedback: 'Procrastinating both tasks creates an unfinished feeling.',
      },
      {
        id: 'D',
        text: 'Try to play video games and read flashcards at the exact same second.',
        isCorrect: false,
        feedback: 'Multitasking games and study makes both harder. One at a time works best!',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Think about which choice gives you complete peace of mind while enjoying your free time.',
    pecoCheer: 'Mature decision making! "Focus before fun" is a superpower.',
    learningPoint: 'Handling responsibilities first makes free time much more enjoyable and relaxing.',
    xpReward: 15,
  },
  {
    id: 'dec-unexpected-problem',
    skill: 'Decision Making',
    title: 'The Missing Lunch',
    badgeIcon: '🥪',
    scenario: 'You arrive at school and realize you accidentally left your lunchbox at home.',
    challenge: 'What is the most constructive choice?',
    options: [
      {
        id: 'A',
        text: 'Refuse to talk to anyone and stay hungry all day.',
        isCorrect: false,
        feedback: 'Going hungry all day hurts your energy and focus. Help is always available!',
      },
      {
        id: 'B',
        text: 'Let a teacher or campus helper know so they can help you get a meal or snack.',
        isCorrect: true,
        feedback: 'Great problem solving! Teachers and helpers are there to support you with food and solutions.',
      },
      {
        id: 'C',
        text: 'Take food from someone else without asking.',
        isCorrect: false,
        feedback: 'Taking without asking violates trust. Asking for help is the honest path.',
      },
      {
        id: 'D',
        text: 'Blame your friend who rode the bus with you.',
        isCorrect: false,
        feedback: 'Mistakes happen to everyone. Focusing on a solution is the best next step.',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Think about who is available to help when an unexpected problem happens.',
    pecoCheer: 'Excellent problem solving! You found a supportive solution rather than struggling alone.',
    learningPoint: 'When an unexpected problem arises, communicating with a trusted helper resolves it quickly.',
    xpReward: 15,
  },

  // -------------------------------------------------------------
  // 5. ASKING FOR HELP MISSIONS
  // -------------------------------------------------------------
  {
    id: 'help-need-some-help',
    skill: 'Asking for Help',
    title: 'I Need Some Help',
    badgeIcon: '🗺️',
    scenario: 'You are looking for Room 402 on campus, but you cannot find the right hallway.',
    challenge: 'What would you do?',
    options: [
      {
        id: 'A',
        text: 'Ask a teacher or campus staff member politely for directions.',
        isCorrect: true,
        feedback: 'Yes! Asking for directions saves time and gets you where you need to go with ease.',
      },
      {
        id: 'B',
        text: 'Keep walking in circles without asking anyone for 30 minutes.',
        isCorrect: false,
        feedback: 'Wandering in circles is exhausting. Staff members are happy to point you in the right direction.',
      },
      {
        id: 'C',
        text: 'Give up, walk outside, and go home.',
        isCorrect: false,
        feedback: 'No need to give up—asking one quick question solves the problem in 10 seconds!',
      },
      {
        id: 'D',
        text: 'Get angry and kick a nearby locker.',
        isCorrect: false,
        feedback: 'Physical frustration can damage things and get you into trouble. Asking politely is easier.',
      },
    ],
    correctAnswerId: 'A',
    hint: 'Asking staff or teachers for directions saves time and gets you where you need to go.',
    pecoCheer: 'Courageous and polite! Asking for help is a sign of practical strength.',
    learningPoint: 'Asking for directions politely is a superpower that prevents wasted time and confusion.',
    xpReward: 15,
  },
  {
    id: 'help-classroom-clarifier',
    skill: 'Asking for Help',
    title: 'The Classroom Clarifier',
    badgeIcon: '🙋',
    scenario: 'The teacher gives homework instructions, but you are not sure when the assignment is due.',
    challenge: 'What could you say?',
    options: [
      {
        id: 'A',
        text: '"Excuse me, could you please clarify when this assignment is due?"',
        isCorrect: true,
        feedback: 'Clear, polite, and confident! Teachers love when students ask for clarification.',
      },
      {
        id: 'B',
        text: 'Say nothing, guess a random date, and hope for the best.',
        isCorrect: false,
        feedback: 'Guessing often leads to late submissions. Clarifying takes only a moment.',
      },
      {
        id: 'C',
        text: '"I am not doing this because you didn\'t explain it well!"',
        isCorrect: false,
        feedback: 'Blaming tone sounds defensive. A polite question gets you the answer respectfully.',
      },
      {
        id: 'D',
        text: 'Complain loudly to your neighbor while the teacher is speaking.',
        isCorrect: false,
        feedback: 'Talking over the teacher disrupts the class and still leaves you with unanswered questions.',
      },
    ],
    correctAnswerId: 'A',
    hint: 'Think about a response that lets you communicate politely that you need clarification.',
    pecoCheer: 'Polite self-advocacy! You asked for what you needed respectfully.',
    learningPoint: 'Asking for clarification is a natural part of learning and shows self-awareness.',
    xpReward: 15,
  },

  // -------------------------------------------------------------
  // 6. FOCUS & ATTENTION MISSIONS
  // -------------------------------------------------------------
  {
    id: 'focus-distraction-challenge',
    skill: 'Focus',
    title: 'The Distraction Challenge',
    badgeIcon: '🔕',
    scenario: 'You are completing an important assignment, but your phone keeps buzzing with notifications.',
    challenge: 'What would be the best strategy?',
    options: [
      {
        id: 'A',
        text: 'Keep checking your phone every 30 seconds.',
        isCorrect: false,
        feedback: 'Frequent phone checks interrupt your focus loop and make tasks take 3x longer.',
      },
      {
        id: 'B',
        text: 'Put your phone aside on silent mode and work for a focused 15-minute block.',
        isCorrect: true,
        feedback: 'Masterful focus! Removing the vibrating trigger lets your brain enter deep concentration.',
      },
      {
        id: 'C',
        text: 'Stop doing the assignment entirely.',
        isCorrect: false,
        feedback: 'Quitting leaves the task hanging. A brief phone pause solves the problem.',
      },
      {
        id: 'D',
        text: 'Try to text 3 friends while typing your essay simultaneously.',
        isCorrect: false,
        feedback: 'Splitting attention leads to mistakes and mental fatigue.',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Removing immediate distractions helps your brain enter deep focus.',
    pecoCheer: 'Rockstar concentration! Managing distractions is how high-achievers work.',
    learningPoint: 'Setting digital devices to silent mode creates a calm space for efficient work.',
    xpReward: 15,
  },
  {
    id: 'focus-study-space',
    skill: 'Focus',
    title: 'Quiet Study Space',
    badgeIcon: '🎧',
    scenario: 'You are trying to read a textbook chapter, but the television is playing loudly in the same room.',
    challenge: 'What is the best way to maintain focus?',
    options: [
      {
        id: 'A',
        text: 'Move to a quiet room or put on noise-dampening headphones until you finish.',
        isCorrect: true,
        feedback: 'Excellent adaptation! Changing your environment or dampening noise shields your attention.',
      },
      {
        id: 'B',
        text: 'Stare at the TV and pretend to read the book.',
        isCorrect: false,
        feedback: 'Pretending to read leaves the chapter unlearned. Adjusting your space works better.',
      },
      {
        id: 'C',
        text: 'Throw the textbook on the ground.',
        isCorrect: false,
        feedback: 'Taking a proactive step with your environment keeps frustration away.',
      },
      {
        id: 'D',
        text: 'Reread the same sentence 20 times without absorbing it.',
        isCorrect: false,
        feedback: 'Rereading in noise is tiring. Moving to quiet lets comprehension flow naturally.',
      },
    ],
    correctAnswerId: 'A',
    hint: 'Changing your environment to reduce background noise boosts concentration.',
    pecoCheer: 'Great environmental awareness! You protected your focus zone.',
    learningPoint: 'Proactively finding a quiet study zone makes reading faster and less exhausting.',
    xpReward: 15,
  },

  // -------------------------------------------------------------
  // 7. EMOTIONAL REGULATION MISSIONS
  // -------------------------------------------------------------
  {
    id: 'emo-take-a-breath',
    skill: 'Emotional Regulation',
    title: 'Take a Breath',
    badgeIcon: '🧘',
    scenario: 'You make an unexpected mistake on a task and start feeling a surge of frustration.',
    challenge: 'What could you do?',
    options: [
      {
        id: 'A',
        text: 'Take a slow, deep breath, acknowledge the mistake, and try again calmly.',
        isCorrect: true,
        feedback: 'Beautiful regulation! One deep breath resets your nervous system and restores calm.',
      },
      {
        id: 'B',
        text: 'Rip up your work and give up immediately.',
        isCorrect: false,
        feedback: 'Mistakes are how our brains learn. Tearing up work throws away your progress.',
      },
      {
        id: 'C',
        text: 'Blame someone sitting near you.',
        isCorrect: false,
        feedback: 'Mistakes are normal for everyone! Taking gentle ownership builds confidence.',
      },
      {
        id: 'D',
        text: 'Yell loudly in the room.',
        isCorrect: false,
        feedback: 'Yelling disrupts others. A private deep breath gives you the calm control you need.',
      },
    ],
    correctAnswerId: 'A',
    hint: 'Taking one calm breath resets your nervous system and gives you clarity.',
    pecoCheer: 'Incredible emotional strength! Pausing to breathe transforms frustration into focus.',
    learningPoint: 'Taking a mindful breath when making a mistake helps our brains reset and learn without shame.',
    xpReward: 15,
  },
  {
    id: 'emo-routine-shift',
    skill: 'Emotional Regulation',
    title: 'Handling a Routine Shift',
    badgeIcon: '🔄',
    scenario: 'Your normal class schedule was changed unexpectedly, and you must go to a different building today.',
    challenge: 'How should you respond to the unexpected change?',
    options: [
      {
        id: 'A',
        text: 'Refuse to go and sit in the hallway.',
        isCorrect: false,
        feedback: 'Sitting in the hallway misses the lesson. Changes can be handled step by step.',
      },
      {
        id: 'B',
        text: 'Take a moment to adjust, check the new room number, and walk there calmly.',
        isCorrect: true,
        feedback: 'Super flexible! You acknowledged the change, checked your directions, and navigated it calmly.',
      },
      {
        id: 'C',
        text: 'Panic and run around in circles.',
        isCorrect: false,
        feedback: 'Running around increases stress. Pausing to look at the new building name helps.',
      },
      {
        id: 'D',
        text: 'Blame your peers for the schedule change.',
        isCorrect: false,
        feedback: 'Your peers did not make the schedule change. Staying calm helps everyone adapt.',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Changes happen often in everyday life. Taking a breath helps you adapt flexibly.',
    pecoCheer: 'Remarkable adaptability! You proved that you can navigate unexpected shifts smoothly.',
    learningPoint: 'Flexibility is a life skill that allows you to handle sudden changes with confidence.',
    xpReward: 15,
  },

  // -------------------------------------------------------------
  // 8. MULTI-SKILL MISSIONS (Combined skills)
  // -------------------------------------------------------------
  {
    id: 'multi-first-day',
    skill: 'Multi-Skill',
    title: 'Your First Day Challenge',
    badgeIcon: '🌟',
    scenario: 'You arrive at a new building and need to find Room 302. You see a room directory sign on the wall and a friendly student advisor at a welcome desk.',
    challenge: 'What is the best sequence of actions?',
    options: [
      {
        id: 'A',
        text: 'Panic, turn around, and leave the building immediately.',
        isCorrect: false,
        feedback: 'No need to leave! You have two great resources right in front of you.',
      },
      {
        id: 'B',
        text: 'Check the directory sign, approach the advisor with a polite smile, and ask: "Excuse me, could you point me to Room 302, please?"',
        isCorrect: true,
        feedback: 'Brilliant! You combined reading the sign, memory of the room number, and a polite greeting!',
      },
      {
        id: 'C',
        text: 'Shout "Room 302!" across the courtyard at the top of your lungs.',
        isCorrect: false,
        feedback: 'Shouting startles visitors. Approaching the welcome desk is much more effective.',
      },
      {
        id: 'D',
        text: 'Wander down every hallway randomly without looking at signs or asking.',
        isCorrect: false,
        feedback: 'Random wandering takes a long time. Using signs and asking people gets you there quickly.',
      },
    ],
    correctAnswerId: 'B',
    hint: 'Combine reading the sign with a polite, friendly greeting to the advisor.',
    pecoCheer: 'Masterful multi-skill application! You combined memory, reading, and polite social communication.',
    learningPoint: 'Combining multiple skills—reading signs, remembering details, and asking politely—makes any new environment easy to navigate.',
    xpReward: 20,
  },
];

/**
 * Intelligent, non-random contextual mission selector:
 * 1. Counts frequencies of recently practiced skills.
 * 2. If multiple distinct skill categories were practiced (e.g. 3 different skills), considers the Multi-Skill mission.
 * 3. Otherwise, identifies the dominant or most recent skill.
 * 4. Filters uncompleted missions for that skill (avoiding repeats).
 * 5. Falls back cleanly to next uncompleted or fresh mission.
 */
export function selectContextualMission(
  recentSkills: RealWorldSkill[],
  completedMissionIds: string[] = []
): RealWorldMissionItem {
  if (!recentSkills || recentSkills.length === 0) {
    // Default fallback
    return ALL_REAL_WORLD_MISSIONS[0];
  }

  // Count distinct skill families
  const uniqueSkills = Array.from(new Set(recentSkills));

  // If student practiced 3 or more distinct skills and has not done the multi-skill mission yet:
  if (uniqueSkills.length >= 3) {
    const multiSkillMission = ALL_REAL_WORLD_MISSIONS.find(
      (m) => m.skill === 'Multi-Skill' && !completedMissionIds.includes(m.id)
    );
    if (multiSkillMission) {
      return multiSkillMission;
    }
  }

  // Calculate weighted score for each skill (most recent gets higher weight)
  const skillScores: Record<string, number> = {};
  recentSkills.forEach((skill, idx) => {
    const recencyWeight = idx + 1; // Later items in the list get higher weight
    skillScores[skill] = (skillScores[skill] || 0) + recencyWeight;
  });

  // Sort skills by score descending
  const sortedSkills = Object.keys(skillScores).sort(
    (a, b) => skillScores[b] - skillScores[a]
  ) as RealWorldSkill[];

  const dominantSkill = sortedSkills[0] || 'Communication';

  // Find missions for dominant skill
  const matchingSkillMissions = ALL_REAL_WORLD_MISSIONS.filter(
    (m) => m.skill === dominantSkill || (dominantSkill === 'Social Interaction' && m.skill === 'Communication')
  );

  // Filter uncompleted ones
  const uncompleted = matchingSkillMissions.filter(
    (m) => !completedMissionIds.includes(m.id)
  );

  if (uncompleted.length > 0) {
    return uncompleted[0];
  }

  // If all for dominant skill are completed, check the second most practiced skill
  if (sortedSkills.length > 1) {
    const secondSkill = sortedSkills[1];
    const secondMissions = ALL_REAL_WORLD_MISSIONS.filter(
      (m) => m.skill === secondSkill && !completedMissionIds.includes(m.id)
    );
    if (secondMissions.length > 0) {
      return secondMissions[0];
    }
  }

  // Fallback: any uncompleted mission in the entire catalog
  const anyUncompleted = ALL_REAL_WORLD_MISSIONS.filter(
    (m) => !completedMissionIds.includes(m.id)
  );
  if (anyUncompleted.length > 0) {
    return anyUncompleted[0];
  }

  // If everything has been completed once, cycle back to the dominant skill's first mission
  return matchingSkillMissions[0] || ALL_REAL_WORLD_MISSIONS[0];
}

// Backward compatibility aliases
export const REAL_WORLD_MISSIONS = ALL_REAL_WORLD_MISSIONS;

export const PRACTICED_SKILLS = [
  { label: 'Communication', icon: '👋' },
  { label: 'Social Interaction', icon: '🤝' },
  { label: 'Comprehension', icon: '📖' },
  { label: 'Memory', icon: '🧠' },
  { label: 'Focus & Attention', icon: '🎯' },
  { label: 'Emotional Regulation', icon: '🧘' },
];

export interface ActivityChallengeConfig {
  activityId: string;
  title: string;
  skill: RealWorldSkill;
  requiredExercises: number;
  completionPecoMessage: string;
  challengeCategoryTitle: string;
  challenges: RealWorldMissionItem[];
}

export const ACTIVITY_CHALLENGE_CONFIGS: Record<string, ActivityChallengeConfig> = {
  WORD_BUILDER: {
    activityId: 'WORD_BUILDER',
    title: 'Word Explorer',
    skill: 'Comprehension',
    requiredExercises: 7,
    completionPecoMessage: "You've been exploring lots of new words! Now let's see how you can use your word skills in the real world.",
    challengeCategoryTitle: 'Word Explorer Real-World Challenge',
    challenges: WORD_EXPLORER_CHALLENGES,
  },
  GREETING_MASTER: {
    activityId: 'GREETING_MASTER',
    title: 'Greeting Master',
    skill: 'Communication',
    requiredExercises: 6,
    completionPecoMessage: "You've practiced friendly greetings and conversations! Ready to take your communication skills into the real world?",
    challengeCategoryTitle: 'Communication Real-World Challenge',
    challenges: ALL_REAL_WORLD_MISSIONS.filter(m => m.skill === 'Communication' || m.skill === 'Social Interaction'),
  },
  'asd-comm-3': {
    activityId: 'GREETING_MASTER',
    title: 'Greeting Master',
    skill: 'Communication',
    requiredExercises: 6,
    completionPecoMessage: "You've practiced friendly greetings and conversations! Ready to take your communication skills into the real world?",
    challengeCategoryTitle: 'Communication Real-World Challenge',
    challenges: ALL_REAL_WORLD_MISSIONS.filter(m => m.skill === 'Communication' || m.skill === 'Social Interaction'),
  },
  STORY_ADVENTURE: {
    activityId: 'STORY_ADVENTURE',
    title: 'Story Adventure',
    skill: 'Comprehension',
    requiredExercises: 6,
    completionPecoMessage: "You've completed wonderful stories! Now let's see how you understand notices and signs in the real world.",
    challengeCategoryTitle: 'Reading & Comprehension Real-World Challenge',
    challenges: ALL_REAL_WORLD_MISSIONS.filter(m => m.skill === 'Comprehension'),
  },
  'dys-comp-1': {
    activityId: 'STORY_ADVENTURE',
    title: 'Story Adventure',
    skill: 'Comprehension',
    requiredExercises: 6,
    completionPecoMessage: "You've completed wonderful stories! Now let's see how you understand notices and signs in the real world.",
    challengeCategoryTitle: 'Reading & Comprehension Real-World Challenge',
    challenges: ALL_REAL_WORLD_MISSIONS.filter(m => m.skill === 'Comprehension'),
  },
  MEMORY_MISSION: {
    activityId: 'MEMORY_MISSION',
    title: 'Memory Mission',
    skill: 'Memory',
    requiredExercises: 6,
    completionPecoMessage: "Your memory superpowers are shining! Ready to remember everyday steps in a real-world situation?",
    challengeCategoryTitle: 'Memory Real-World Challenge',
    challenges: ALL_REAL_WORLD_MISSIONS.filter(m => m.skill === 'Memory'),
  },
  'adhd-memory-1': {
    activityId: 'MEMORY_MISSION',
    title: 'Memory Mission',
    skill: 'Memory',
    requiredExercises: 6,
    completionPecoMessage: "Your memory superpowers are shining! Ready to remember everyday steps in a real-world situation?",
    challengeCategoryTitle: 'Memory Real-World Challenge',
    challenges: ALL_REAL_WORLD_MISSIONS.filter(m => m.skill === 'Memory'),
  },
  ROCKET_FOCUS: {
    activityId: 'ROCKET_FOCUS',
    title: 'Rocket Focus',
    skill: 'Focus',
    requiredExercises: 6,
    completionPecoMessage: "Stellar focus! Now let's see how you stay tuned in during everyday tasks.",
    challengeCategoryTitle: 'Focus Real-World Challenge',
    challenges: ALL_REAL_WORLD_MISSIONS.filter(m => m.skill === 'Focus'),
  },
  STOP_THINK_GO: {
    activityId: 'STOP_THINK_GO',
    title: 'Stop, Think, Go!',
    skill: 'Emotional Regulation',
    requiredExercises: 6,
    completionPecoMessage: "You mastered taking a calm breath before acting! Ready for a real-life situation?",
    challengeCategoryTitle: 'Calm & Regulation Real-World Challenge',
    challenges: ALL_REAL_WORLD_MISSIONS.filter(m => m.skill === 'Emotional Regulation'),
  },
  WHAT_WOULD_YOU_DO: {
    activityId: 'WHAT_WOULD_YOU_DO',
    title: 'Social Pathways',
    skill: 'Social Interaction',
    requiredExercises: 7,
    completionPecoMessage: "You practiced some great ways to communicate with others! Ready to try a real-world social moment?",
    challengeCategoryTitle: 'Social Pathways Real-World Challenge',
    challenges: ALL_REAL_WORLD_MISSIONS.filter(
      (m) =>
        m.id === 'comm-friendly-hello' ||
        m.id === 'help-classroom-clarifier' ||
        m.id === 'comm-joining-conversation' ||
        m.id === 'comm-introducing-yourself' ||
        m.id === 'help-need-some-help'
    ),
  },
};

/**
 * Retrieve the next uncompleted challenge specific to an activity,
 * ensuring challenges don't repeat unnecessarily.
 */
export function getActivityChallenge(
  activityId: string,
  completedIds: string[] = []
): RealWorldMissionItem {
  const config =
    ACTIVITY_CHALLENGE_CONFIGS[activityId] ||
    ACTIVITY_CHALLENGE_CONFIGS['WORD_BUILDER'];

  const uncompleted = config.challenges.filter(
    (c) => !completedIds.includes(c.id)
  );

  if (uncompleted.length > 0) {
    return uncompleted[0];
  }

  // If all completed, return first in the list
  return config.challenges[0] || ALL_REAL_WORLD_MISSIONS[0];
}
