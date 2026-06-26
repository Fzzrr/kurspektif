'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export type RegisterState = { error?: string } | undefined;

// Membuat user baru dengan password ter-hash. Dipanggil dari RegisterForm via useActionState.
export async function registerUser(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').toLowerCase().trim();
  const password = String(formData.get('password') ?? '');

  if (!name || !email || !password) return { error: 'Semua field wajib diisi.' };
  if (password.length < 8) return { error: 'Password minimal 8 karakter.' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'Email sudah terdaftar.' };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, password: hashed } });

  return undefined; // sukses; client lanjut signIn
}
