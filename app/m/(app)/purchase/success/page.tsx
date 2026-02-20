import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CheckCircle2, Download } from 'lucide-react';
import Link from 'next/link';
import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';

export const dynamic = 'force-dynamic';

async function confirmTossPayment(paymentKey: string, orderId: string, amount: number) {
  await connectMongo();

  // 이미 승인된 주문이면 재호출 방지 (멱등성)
  const existing = await Order.findOne({ orderId }).lean();
  if (existing?.status === 'paid') return;

  const secretKey = process.env.TOSS_SECRET_KEY ?? '';
  const encoded   = Buffer.from(`${secretKey}:`).toString('base64');

  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method:  'POST',
    headers: {
      'Authorization': `Basic ${encoded}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await tossRes.json();
  if (!tossRes.ok) throw new Error(data.message || '결제 승인 실패');

  await Order.updateOne(
    { orderId },
    {
      $set: {
        status:        'paid',
        paymentKey,
        paymentMethod: data.method || 'CARD',
        paidAt:        new Date(),
      },
    }
  );
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session) redirect('/m');

  const sp = await searchParams;

  const paymentKey = sp.paymentKey || '';
  const orderId    = sp.orderId    || '';
  const amount     = parseInt(sp.amount || '0');

  if (!paymentKey || !orderId || !amount) {
    redirect('/m/materials');
  }

  let materialId = '';
  let error      = '';

  try {
    await confirmTossPayment(paymentKey, orderId, amount);
    await connectMongo();
    const order = await Order.findOne({ orderId }).lean();
    materialId  = order?.materialId || '';
  } catch (err) {
    error = err instanceof Error ? err.message : '결제 승인 실패';
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">결제 승인 실패</h2>
          <p className="text-base text-red-500 font-medium mb-6">{error}</p>
          <Link
            href="/m/materials"
            className="inline-block px-6 py-3 bg-[var(--color-dre-blue)] text-white font-bold rounded-2xl hover:bg-[var(--color-dre-blue-dark)] transition-colors"
          >
            자료 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">결제가 완료되었습니다</h2>
        <p className="text-base text-gray-500 mb-1">주문 번호: <strong className="font-mono text-gray-800">{orderId}</strong></p>
        <p className="text-base font-black text-[var(--color-dre-blue)] mt-1">{amount.toLocaleString()}원</p>

        <div className="flex gap-3 mt-8">
          {materialId && (
            <Link
              href={`/m/materials/${materialId}`}
              className="flex-1 py-3.5 bg-[var(--color-dre-blue)] text-white font-bold rounded-2xl hover:bg-[var(--color-dre-blue-dark)] transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2"
            >
              <Download size={16} />
              자료 페이지로
            </Link>
          )}
          <Link
            href="/m/my-orders"
            className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:border-gray-300 transition-colors"
          >
            내 주문 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
