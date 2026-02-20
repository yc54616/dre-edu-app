import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp      = await searchParams;
  const code    = sp.code    || '';
  const message = sp.message || '결제가 취소되었습니다.';
  const orderId = sp.orderId || '';

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">결제에 실패했습니다</h2>
        <p className="text-base text-gray-500 mb-2">{message}</p>
        {code && (
          <p className="text-xs text-gray-400 font-mono">에러 코드: {code}</p>
        )}
        {orderId && (
          <p className="text-xs text-gray-400 mt-1">주문 번호: <span className="font-mono">{orderId}</span></p>
        )}

        <div className="flex gap-3 mt-8">
          <Link
            href="/m/materials"
            className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-gray-300 transition-colors"
          >
            자료 목록
          </Link>
          <Link
            href="/m/my-orders"
            className="flex-1 py-3.5 bg-[var(--color-dre-blue)] text-white font-bold rounded-2xl hover:bg-[var(--color-dre-blue-dark)] transition-colors shadow-md shadow-blue-200"
          >
            주문 내역
          </Link>
        </div>
      </div>
    </div>
  );
}
