'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';

interface Props {
  entryId: string;
  isPublished: boolean;
}

export default function EntryActions({ entryId, isPublished }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const togglePublished = async () => {
    setLoading(true);
    const res = await fetch(`/api/m/admin/hall-of-fame/${entryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    setLoading(false);
    if (!res.ok) {
      alert('노출 상태 변경에 실패했습니다.');
      return;
    }
    router.refresh();
  };

  const removeEntry = async () => {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return;
    setLoading(true);
    const res = await fetch(`/api/m/admin/hall-of-fame/${entryId}`, { method: 'DELETE' });
    setLoading(false);
    if (!res.ok) {
      alert('삭제에 실패했습니다.');
      return;
    }
    router.refresh();
  };

  return (
    <div className="inline-flex items-center justify-end gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
      <Link
        href={`/m/admin/hall-of-fame/${entryId}/edit`}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
        title="수정"
      >
        <Edit2 size={15} />
      </Link>
      <button
        onClick={togglePublished}
        disabled={loading}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
        title={isPublished ? '비공개로 전환' : '공개로 전환'}
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
      <button
        onClick={removeEntry}
        disabled={loading}
        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
        title="삭제"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
