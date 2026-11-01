// Token sekali pakai untuk tautan di email (verifikasi pendaftaran, atur ulang
// kata sandi, ganti email). Yang dikirim token mentahnya; yang disimpan di
// database hanya hash-nya, jadi isi tabel yang bocor tidak bisa dipakai.
import { createHash, randomBytes } from 'node:crypto';

export const newToken = () => randomBytes(32).toString('base64url');
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
