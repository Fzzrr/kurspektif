import { prisma } from './prisma';

// Bukan di file 'use server' — fungsi yang diekspor dari sana jadi endpoint
// publik, dan siapa pun bisa memanggilnya dengan userId orang lain.
export async function watchedPairs(userId: string): Promise<string[]> {
  const rows = await prisma.watchedPair.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  return rows.map((row) => `${row.base}/${row.quote}`);
}
