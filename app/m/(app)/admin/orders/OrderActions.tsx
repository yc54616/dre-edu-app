'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RotateCcw } from 'lucide-react';

interface Props {
  orderId: string;
  status: 'pending' | 'paid' | 'cancelled';
}

export default function OrderActions({ orderId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-500">
        환불 완료
      </span>
    );
  }

  if (status !== 'paid') return null;

  const handleRefund = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      '환불할까요?\n현재 주문 1건이 취소됩니다.',
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/m/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelReason: '관리자 환불' }),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string; cancelledCount?: number }
        | null;

      if (!res.ok) {
        alert(data?.error || '환불 처리에 실패했습니다.');
        return;
      }

      alert(`환불 완료 (${data?.cancelledCount ?? 0}건)`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRefund}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
      title="환불"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
      환불
    </button>
  );
}
