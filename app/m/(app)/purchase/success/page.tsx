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
  const encoded = Buffer.from(`${secretKey}:`).toString('base64');

  const tossRes = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });

  const data = await tossRes.json();
  if (!tossRes.ok) throw new Error(data.message || '결제 승인 실패');

  await Order.updateOne(
    { orderId },
    {
      $set: {
        status: 'paid',
        paymentKey,
        paymentMethod: data.method || 'CARD',
        paidAt: new Date(),
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
  const orderId = sp.orderId || '';
  const amount = parseInt(sp.amount || '0');

  if (!paymentKey || !orderId || !amount) {
    redirect('/m/materials');
  }

  let materialId = '';
  let error = '';

  try {
    await confirmTossPayment(paymentKey, orderId, amount);
    await connectMongo();
    const order = await Order.findOne({ orderId }).lean();
    materialId = order?.materialId || '';
  } catch (err) {
    error = err instanceof Error ? err.message : '결제 승인 실패';
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-10 sm:p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100">
            <span className="text-[2rem]">⚠️</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">결제 승인 실패</h2>
          <p className="text-[15px] text-red-500 font-bold mb-8 bg-red-50 py-3 rounded-2xl">{error}</p>
          <Link
            href="/m/materials"
            className="inline-flex items-center justify-center w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[16px] rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            자료 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-10 sm:p-12 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-100">
          <CheckCircle2 size={36} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4">결제가 완료되었습니다</h2>
        <div className="bg-gray-50 rounded-2xl p-4 mb-8">
          <p className="text-[13px] text-gray-500 mb-1.5 font-medium">주문 번호: <strong className="font-mono text-gray-800">{orderId}</strong></p>
          <p className="text-2xl font-black text-blue-600 tracking-tight">{amount.toLocaleString()}<span className="text-base text-gray-500 ml-1">원</span></p>
        </div>

        <div className="flex flex-col gap-3">
          {materialId && (
            <Link
              href={`/m/materials/${materialId}`}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[16px] rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
            >
              <Download size={18} />
              자료 보기 및 다운로드
            </Link>
          )}
          <Link
            href="/m/my-orders"
            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold text-[16px] rounded-2xl transition-all hover:bg-gray-50 hover:border-gray-300"
          >
            내 주문 내역 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
