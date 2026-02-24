import Link from 'next/link';
import { XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CommunityPaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const code = sp.code || '';
  const message = sp.message || '결제가 취소되었습니다.';
  const orderId = sp.orderId || '';

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <XCircle size={34} />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-gray-900">결제에 실패했습니다</h1>

        <div className="mt-6 space-y-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-left">
          <p className="text-sm text-gray-700">{message}</p>
          {code && <p className="text-xs text-gray-500">에러 코드: {code}</p>}
          {orderId && <p className="text-xs text-gray-500">주문번호: {orderId}</p>}
        </div>

        <Link href="/community" className="mt-6 inline-flex rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-black">
          커뮤니티로 돌아가기
        </Link>
      </div>
    </main>
  );
}
