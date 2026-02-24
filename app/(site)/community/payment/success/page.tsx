import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import connectMongo from '@/lib/mongoose';
import CommunityUpgradeOrder from '@/lib/models/CommunityUpgradeOrder';

export const dynamic = 'force-dynamic';

async function confirmCommunityPayment(paymentKey: string, orderId: string, amount: number) {
  await connectMongo();

  const existing = await CommunityUpgradeOrder.findOne({ orderId }).lean();
  if (!existing) throw new Error('주문을 찾을 수 없습니다.');
  if (existing.amount !== amount) throw new Error('결제 금액이 일치하지 않습니다.');
  if (existing.status === 'paid') return existing;

  const secretKey = process.env.TOSS_SECRET_KEY ?? '';
  if (!secretKey) throw new Error('토스 시크릿 키가 설정되지 않았습니다.');

  const encoded = Buffer.from(`${secretKey}:`).toString('base64');
  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const tossData = await tossRes.json();
  if (!tossRes.ok) throw new Error(tossData.message || '결제 승인 실패');

  await CommunityUpgradeOrder.updateOne(
    { orderId },
    {
      $set: {
        status: 'paid',
        paymentKey,
        paymentMethod: tossData.method || 'CARD',
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );

  return CommunityUpgradeOrder.findOne({ orderId }).lean();
}

export default async function CommunityPaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp = await searchParams;
  const paymentKey = sp.paymentKey || '';
  const orderId = sp.orderId || '';
  const amount = parseInt(sp.amount || '0', 10);

  let error = '';
  let productName = '';
  let applicantName = '';

  if (!paymentKey || !orderId || !amount) {
    error = '결제 정보가 올바르지 않습니다.';
  } else {
    try {
      const order = await confirmCommunityPayment(paymentKey, orderId, amount);
      productName = order?.productName || '';
      applicantName = order?.applicantName || '';
    } catch (err) {
      error = err instanceof Error ? err.message : '결제 승인 실패';
    }
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900">결제 승인 실패</h1>
          <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
          <Link href="/community" className="mt-6 inline-flex rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-black">
            커뮤니티로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
          <CheckCircle2 size={34} />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-gray-900">결제가 완료되었습니다</h1>
        <p className="mt-2 text-sm text-gray-600">
          {applicantName ? `${applicantName}님,` : ''} 상품 결제가 정상 접수되었습니다.
        </p>

        <div className="mt-6 space-y-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-left">
          <p className="text-sm text-gray-600">주문번호: <strong className="font-mono text-gray-900">{orderId}</strong></p>
          <p className="text-sm text-gray-600">상품명: <strong className="text-gray-900">{productName || '-'}</strong></p>
          <p className="text-sm text-gray-600">결제금액: <strong className="text-blue-600">{amount.toLocaleString()}원</strong></p>
        </div>

        <p className="mt-4 text-xs text-gray-500">관리자 확인 후 신청 내역이 순차 처리됩니다.</p>
        <Link href="/community" className="mt-6 inline-flex rounded-xl bg-[var(--color-dre-blue)] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
          커뮤니티로 돌아가기
        </Link>
      </div>
    </main>
  );
}
