import { PrismaClient, PromptCategory } from '@prisma/client';

const prisma = new PrismaClient();

const PROMPTS: { text: string; category: PromptCategory }[] = [
  { text: 'A penguin on a skateboard', category: 'FUNNY' },
  { text: 'A cat wearing a top hat', category: 'FUNNY' },
  { text: 'A dog driving a tiny car', category: 'FUNNY' },
  { text: 'A squirrel with sunglasses', category: 'FUNNY' },
  { text: 'A bear riding a bicycle', category: 'FUNNY' },
  { text: 'An elephant on a surfboard', category: 'FUNNY' },
  { text: 'A chicken crossing a highway', category: 'FUNNY' },
  { text: 'A llama in a spacesuit', category: 'FUNNY' },
  { text: 'A frog playing the piano', category: 'FUNNY' },
  { text: 'A shark wearing a bow tie', category: 'FUNNY' },
  { text: 'A toaster', category: 'OBJECT' },
  { text: 'A red bicycle', category: 'OBJECT' },
  { text: 'A lighthouse', category: 'OBJECT' },
  { text: 'A coffee mug with legs', category: 'OBJECT' },
  { text: 'A treasure chest', category: 'OBJECT' },
  { text: 'A grandfather clock', category: 'OBJECT' },
  { text: 'A rubber duck army', category: 'OBJECT' },
  { text: 'A vending machine', category: 'OBJECT' },
  { text: 'Someone juggling flaming torches', category: 'ACTION' },
  { text: 'A person slipping on a banana peel', category: 'ACTION' },
  { text: 'Two people high-fiving', category: 'ACTION' },
  { text: 'A chef flipping a giant pancake', category: 'ACTION' },
  { text: 'A dancer doing the worm', category: 'ACTION' },
  { text: 'Someone building a sandcastle', category: 'ACTION' },
  { text: 'A wizard casting a spell', category: 'ACTION' },
  { text: 'A robot doing yoga', category: 'ACTION' },
  { text: 'A pirate ship in a bathtub', category: 'POP_CULTURE' },
  { text: 'A superhero stuck in traffic', category: 'POP_CULTURE' },
  { text: 'An alien at a coffee shop', category: 'POP_CULTURE' },
  { text: 'A dragon grilling barbecue', category: 'POP_CULTURE' },
  { text: 'A knight on a Roomba', category: 'POP_CULTURE' },
  { text: 'A vampire at the beach', category: 'POP_CULTURE' },
  { text: 'A time traveler at the DMV', category: 'POP_CULTURE' },
  { text: 'A yeti in a hot tub', category: 'POP_CULTURE' },
];

const ACHIEVEMENTS = [
  {
    code: 'FIRST_GAME',
    name: 'First Echo',
    description: 'Complete your first game',
    criteria: { type: 'gamesPlayed', threshold: 1 },
  },
  {
    code: 'CHAIN_MASTER',
    name: 'Chain Master',
    description: 'Complete 10 chains',
    criteria: { type: 'chainsCompleted', threshold: 10 },
  },
  {
    code: 'ARTIST',
    name: 'Artist',
    description: 'Submit 25 drawings',
    criteria: { type: 'turnsSubmitted', threshold: 25 },
  },
  {
    code: 'WINNER',
    name: 'Crowd Favorite',
    description: 'Win the vote 5 times',
    criteria: { type: 'gamesWon', threshold: 5 },
  },
  {
    code: 'VETERAN',
    name: 'Veteran',
    description: 'Play 50 games',
    criteria: { type: 'gamesPlayed', threshold: 50 },
  },
];

async function main(): Promise<void> {
  console.log('Seeding PromptPool...');

  for (const prompt of PROMPTS) {
    const existing = await prisma.promptPool.findFirst({
      where: { text: prompt.text },
    });

    if (!existing) {
      await prisma.promptPool.create({
        data: {
          text: prompt.text,
          category: prompt.category,
          isActive: true,
          language: 'en',
        },
      });
    }
  }

  console.log(`Seeded ${PROMPTS.length} prompts`);

  console.log('Seeding Achievements...');

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      create: {
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        criteria: achievement.criteria,
        isActive: true,
      },
      update: {
        name: achievement.name,
        description: achievement.description,
        criteria: achievement.criteria,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${ACHIEVEMENTS.length} achievements`);
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
