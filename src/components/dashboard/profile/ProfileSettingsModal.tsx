'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import PasswordInput from '@/components/ui/PasswordInput';
import { bareInputClass } from '@/components/ui/styles';
import { UserIcon, PencilIcon, CameraIcon, CloseIcon } from '@/components/ui/icons';
import { getInitials } from '@/lib/avatar';
import {
  strengthOf,
  strengthBarColor,
  strengthColor,
  strengthLabel,
  strengthHint,
} from '@/lib/passwordStrength';
import {
  updateProfileAction,
  changePasswordAction,
  requestEmailChangeAction,
} from '@/app/dashboard/profile-actions';

const MAX_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5MB

// Baru ada satu tab; tambahkan entri di sini saat pengaturan lain menyusul
// (keamanan, notifikasi, dst) — panel kanan tinggal di-switch lewat `tab`.
const TABS = [{ id: 'profil', label: 'Profil', icon: UserIcon }] as const;

const ghostButtonClass =
  'rounded-lg border border-line px-3 py-2 font-mono text-xs text-ink transition-colors hover:bg-paper disabled:opacity-60';
const solidButtonClass =
  'rounded-lg bg-ink px-4 py-2 font-mono text-xs font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-60';

type User = {
  name: string;
  email: string;
  image: string | null;
  hasPassword: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  user: User;
};

export default function ProfileSettingsModal({ open, onClose, user }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('profil');
  const refresh = () => router.refresh();

  return (
    <Modal open={open} onClose={onClose} title="Profil" size="xl" padded={false}>
      <div className="flex max-h-[90vh] flex-col sm:flex-row">
        {/* Navigasi kiri — jadi baris tab horizontal di layar kecil. */}
        <nav className="shrink-0 border-b border-line bg-paper p-3 sm:w-56 sm:border-b-0 sm:border-r sm:p-4">
          <p className="hidden px-3 pb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted sm:block">
            Pengaturan
          </p>
          <div className="flex gap-1 sm:flex-col">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-sm transition-colors ${
                  tab === id
                    ? 'bg-surface font-medium text-ink shadow-sm'
                    : 'text-muted hover:bg-ink/5 hover:text-ink'
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* Panel kanan */}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-ink">Profil</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="-m-1 rounded-lg p-1 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>

          <AvatarUpload user={user} onSaved={refresh} />

          <div className="mt-6 divide-y divide-line border-y border-line">
            <NameRow user={user} onSaved={refresh} />
            <EmailRow user={user} />
            {user.hasPassword && <PasswordRow />}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// --- Kerangka baris pengaturan --------------------------------------------

// Label kiri + isi kanan, seperti daftar pengaturan pada umumnya. Saat sebuah
// baris masuk mode edit, isinya melebar penuh ke sisa lebar baris.
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-6">
      <p className="font-mono text-sm text-ink sm:w-40 sm:shrink-0">{label}</p>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

// Isi baris dalam keadaan diam: nilai di kanan, aksi di ujung kanan.
function RowValue({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 sm:justify-end">
      {children}
      {action}
    </div>
  );
}

function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-ink/5 hover:text-ink"
    >
      <PencilIcon className="size-4" />
    </button>
  );
}

function FormActions({ pending, submitLabel, pendingLabel, onCancel }: {
  pending: boolean;
  submitLabel: string;
  pendingLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className={ghostButtonClass}>
        Batal
      </button>
      <button type="submit" disabled={pending} className={solidButtonClass}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </div>
  );
}

// --- Foto ------------------------------------------------------------------

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function AvatarUpload({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [preview, setPreview] = useState(user.image);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Foto langsung tersimpan begitu dipilih — tidak ada tombol "Simpan" terpisah.
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');

    if (file.size > MAX_FILE_BYTES) {
      setError('Foto maksimal 1.5MB.');
      return;
    }

    const dataUrl = await readAsDataUrl(file);
    setPreview(dataUrl);
    setPending(true);
    const res = await updateProfileAction(user.name, dataUrl);
    setPending(false);

    if (res?.error) {
      setPreview(user.image);
      setError(res.error);
      return;
    }
    onSaved();
  }

  return (
    <div className="mt-6 flex items-center gap-4">
      {/* Avatar itu sendiri tombolnya — overlay "ganti foto" muncul saat hover/fokus. */}
      <button
        type="button"
        disabled={pending}
        onClick={() => fileInputRef.current?.click()}
        aria-label="Ganti foto profil"
        className="group relative size-20 shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-20 rounded-full object-cover" />
        ) : (
          <span className="flex size-20 items-center justify-center rounded-full bg-ink font-mono text-lg font-semibold text-paper">
            {getInitials(user.name)}
          </span>
        )}

        <span
          className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full bg-ink/65 text-paper transition-opacity ${
            pending ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
          }`}
        >
          {pending ? (
            <span className="font-mono text-[10px]">Mengunggah…</span>
          ) : (
            <>
              <CameraIcon className="size-5" />
              <span className="font-mono text-[10px] leading-none">Ganti</span>
            </>
          )}
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="min-w-0">
        <p className="font-mono text-sm text-ink">Foto profil</p>
        <p className="mt-0.5 font-mono text-[11px] text-muted">
          Klik foto untuk mengganti
        </p>
        {error && <p className="mt-1 text-xs text-down">{error}</p>}
      </div>
    </div>
  );
}

// --- Nama ------------------------------------------------------------------

function NameRow({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  function cancel() {
    setName(user.name);
    setError('');
    setEditing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPending(true);
    const res = await updateProfileAction(name);
    setPending(false);

    if (res?.error) {
      setError(res.error);
      return;
    }
    setEditing(false);
    onSaved();
  }

  if (!editing) {
    return (
      <Row label="Nama">
        <RowValue action={<EditButton label="Ubah nama" onClick={() => setEditing(true)} />}>
          <p className="truncate font-mono text-sm text-muted">{user.name}</p>
        </RowValue>
      </Row>
    );
  }

  return (
    <Row label="Nama">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          autoFocus
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Nama"
          className={bareInputClass}
        />
        {error && <p className="text-xs text-down">{error}</p>}
        <FormActions pending={pending} submitLabel="Simpan" pendingLabel="Menyimpan…" onCancel={cancel} />
      </form>
    </Row>
  );
}

// --- Email -----------------------------------------------------------------

function EmailRow({ user }: { user: User }) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Akun Google tidak punya password, jadi emailnya dikunci ke provider.
  if (!user.hasPassword) {
    return (
      <Row label="Email">
        <RowValue
          action={
            <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[11px] text-accent">
              Google
            </span>
          }
        >
          <p className="truncate font-mono text-sm text-muted">{user.email}</p>
        </RowValue>
      </Row>
    );
  }

  function cancel() {
    setEmail(user.email);
    setError('');
    setSuccess('');
    setEditing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPending(true);
    const res = await requestEmailChangeAction(email);
    setPending(false);

    if (res?.error) {
      setError(res.error);
      return;
    }
    setSuccess(res?.success ?? 'Cek inbox untuk konfirmasi.');
    setEditing(false);
  }

  if (!editing) {
    return (
      <Row label="Email">
        <RowValue action={<EditButton label="Ubah email" onClick={() => setEditing(true)} />}>
          <p className="truncate font-mono text-sm text-muted">{user.email}</p>
        </RowValue>
        {success && <p className="mt-1 text-right text-xs text-up">{success}</p>}
      </Row>
    );
  }

  return (
    <Row label="Email">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          autoFocus
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
          className={bareInputClass}
        />
        <p className="font-mono text-[11px] text-muted">
          Email baru aktif setelah kamu klik link verifikasi yang kami kirim.
        </p>
        {error && <p className="text-xs text-down">{error}</p>}
        <FormActions
          pending={pending}
          submitLabel="Kirim link verifikasi"
          pendingLabel="Mengirim…"
          onCancel={cancel}
        />
      </form>
    </Row>
  );
}

// --- Kata sandi ------------------------------------------------------------

function PasswordRow() {
  const [editing, setEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const score = strengthOf(newPassword);

  function reset() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  function cancel() {
    reset();
    setError('');
    setSuccess('');
    setEditing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setPending(true);
    const res = await changePasswordAction(currentPassword, newPassword, confirmPassword);
    setPending(false);

    if (res?.error) {
      setError(res.error);
      return;
    }
    reset();
    setSuccess(res?.success ?? 'Kata sandi diperbarui.');
    setEditing(false);
  }

  if (!editing) {
    return (
      <Row label="Kata sandi">
        <RowValue action={<EditButton label="Ubah kata sandi" onClick={() => setEditing(true)} />}>
          <p className="font-mono text-sm tracking-widest text-muted">••••••••</p>
        </RowValue>
        {success && <p className="mt-1 text-right text-xs text-up">{success}</p>}
      </Row>
    );
  }

  return (
    <Row label="Kata sandi">
      <form onSubmit={handleSubmit} className="space-y-3">
        <PasswordInput
          id="current-password"
          name="currentPassword"
          label="Kata sandi saat ini"
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <div>
          <PasswordInput
            id="new-password"
            name="newPassword"
            label="Kata sandi baru"
            value={newPassword}
            onChange={setNewPassword}
          />
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{ backgroundColor: strengthBarColor(i, score) }}
              />
            ))}
          </div>
          {newPassword && (
            <p className="mt-1 text-xs">
              <span style={{ color: strengthColor(score) }}>{strengthLabel(score)}</span>
              <span className="text-muted"> · {strengthHint(newPassword)}</span>
            </p>
          )}
        </div>
        <PasswordInput
          id="confirm-password"
          name="confirmPassword"
          label="Konfirmasi kata sandi baru"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

        {error && <p className="text-xs text-down">{error}</p>}
        <FormActions pending={pending} submitLabel="Ubah kata sandi" pendingLabel="Mengubah…" onCancel={cancel} />
      </form>
    </Row>
  );
}
