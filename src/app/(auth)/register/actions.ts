'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { registerLimiter } from '@/lib/rateLimit';
import { BCRYPT_COST } from '@/lib/auth/auth';

export type RegisterState = { error?: string } | undefined;

// Membuat user baru dengan password ter-hash. Dipanggil dari RegisterForm via useActionState.
export async function registerUser(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // Server Action = endpoint publik, jadi tetap perlu rate limit.
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!(await registerLimiter.check(`register:${ip}`)).success) {
    return { error: 'Too many attempts. Please try again later.' };
  }
  
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').toLowerCase().trim();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !password) return { error: 'All fields are required.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'Email is already registered.' };

  const hashed = await bcrypt.hash(password, BCRYPT_COST);
  await prisma.user.create({ data: { name, email, password: hashed } });

  return undefined; // sukses; client lanjut signIn
}
