'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, RotateCcw } from 'lucide-react';

interface Props {
  orderId: string;
  processStatus: 'pending' | 'completed';
}

export default function ProcessActions({ orderId, processStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setStatus = async (nextStatus: 'pending' | 'completed') => {
    if (loading || nextStatus === processStatus) return;
    setLoading(true);
    const res = await fetch(`/api/m/admin/community-upgrade-orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ processStatus: nextStatus }),
    });
    setLoading(false);

    if (!res.ok) {
      alert('처리 상태 변경에 실패했습니다.');
      return;
    }
    router.refresh();
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
      <button
        onClick={() => setStatus('completed')}
        disabled={loading || processStatus === 'completed'}
        className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
          processStatus === 'completed'
            ? 'bg-emerald-50 text-emerald-600'
            : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
        } disabled:cursor-not-allowed disabled:opacity-70`}
        title="처리 완료"
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
        완료
      </button>
      <button
        onClick={() => setStatus('pending')}
        disabled={loading || processStatus === 'pending'}
        className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
          processStatus === 'pending'
            ? 'bg-gray-100 text-gray-700'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        } disabled:cursor-not-allowed disabled:opacity-70`}
        title="대기 상태로 변경"
      >
        <RotateCcw size={13} />
        대기
      </button>
    </div>
  );
}
