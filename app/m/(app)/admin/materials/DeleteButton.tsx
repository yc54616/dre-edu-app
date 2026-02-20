'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

export default function DeleteButton({ materialId }: { materialId: string }) {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('이 자료를 삭제하시겠습니까?')) return;

    setLoading(true);
    const res = await fetch(`/api/m/materials/${materialId}`, { method: 'DELETE' });
    setLoading(false);

    if (res.ok) {
      router.refresh();
    } else {
      alert('삭제 실패');
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
