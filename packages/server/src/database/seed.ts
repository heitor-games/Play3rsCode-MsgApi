import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      passwordHash,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      passwordHash,
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      username: 'charlie',
      passwordHash,
    },
  });

  const general = await prisma.channel.upsert({
    where: { name: 'general' },
    update: {},
    create: {
      name: 'general',
      description: 'Canal geral de discussão',
      isPublic: true,
      ownerId: alice.id,
    },
  });

  await prisma.channelMember.createMany({
    data: [
      { channelId: general.id, userId: alice.id, role: 'OWNER' },
      { channelId: general.id, userId: bob.id, role: 'MEMBER' },
      { channelId: general.id, userId: charlie.id, role: 'MEMBER' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completed!');
  console.log({ alice: alice.id, bob: bob.id, charlie: charlie.id, general: general.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
