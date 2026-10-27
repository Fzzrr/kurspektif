'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleWatchAction } from '@/app/dashboard/watchlist-actions';

export default function RemovePairButton({ pair }: { pair: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function remove() {
    const [base, quote] = pair.split('/');
    startTransition(async () => {
      const result = await toggleWatchAction(base, quote);
      if ('error' in result) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="bg-accent-soft px-3 py-2 text-sm text-muted hover:text-ink disabled:opacity-50"
      >
        {pending ? 'Menghapus…' : 'Hapus'}
      </button>
      {error && <span className="text-sm text-down">{error}</span>}
    </>
  );
}
