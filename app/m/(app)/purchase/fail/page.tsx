import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const code = sp.code || '';
  const message = sp.message || '결제가 취소되었습니다.';
  const orderId = sp.orderId || '';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-10 sm:p-12 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100">
          <XCircle size={36} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">결제에 실패했습니다</h2>

        <div className="bg-gray-50 rounded-2xl p-4 mb-8">
          <p className="text-[15px] text-gray-700 font-bold mb-2">{message}</p>
          {code && (
            <p className="text-[12px] text-gray-500 font-mono">에러 코드: {code}</p>
          )}
          {orderId && (
            <p className="text-[12px] text-gray-500 font-mono mt-1">주문 번호: {orderId}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/m/materials"
            className="flex-1 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold text-[15px] rounded-2xl transition-all hover:bg-gray-50 hover:border-gray-300"
          >
            자료 목록 보기
          </Link>
          <Link
            href="/m/my-orders"
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[15px] rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            주문 내역 확인
          </Link>
        </div>
      </div>
    </div>
  );
}
