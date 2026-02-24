'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RotateCcw } from 'lucide-react';

interface Props {
  orderId: string;
}

export default function RefundRequestButton({ orderId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      '환불할까요?\n현재 주문 1건이 취소됩니다.',
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/m/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelReason: '사용자 환불 요청' }),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string; cancelledCount?: number }
        | null;

      if (!res.ok) {
        alert(data?.error || '환불 신청에 실패했습니다.');
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
      onClick={handleRequest}
      disabled={loading}
      className="m-detail-btn-secondary px-4 py-2 text-sm border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      title="환불"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
      환불
    </button>
  );
}
