import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import Link from 'next/link';
import { ShoppingBag, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';

const statusLabel: Record<string, string> = {
  pending: '입금 대기',
  paid: '승인 완료',
  cancelled: '취소됨',
};

const paymentMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    CARD: '카드',
    TRANSFER: '계좌이체',
    VIRTUAL_ACCOUNT: '가상계좌',
    MOBILE_PHONE: '휴대폰',
    CULTURE_GIFT_CERTIFICATE: '문화상품권',
    bank_transfer: '직접입금',
  };
  return map[method] ?? method ?? '기타';
};

const statusStyle: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600 border-amber-100',
  paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  cancelled: 'bg-gray-100 text-gray-400 border-gray-200',
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'paid') return <CheckCircle2 size={13} />;
  if (status === 'cancelled') return <XCircle size={13} />;
  return <Clock size={13} />;
};

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session) redirect('/m');

  const user = session.user as { id?: string };
  const userId = user.id || '';

  await connectMongo();
  const allOrders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();

  // 결제 완료된 자료의 pending 주문은 숨김
  const paidMaterialIds = new Set(
    allOrders.filter((o) => o.status === 'paid').map((o) => o.materialId)
  );
  const orders = allOrders.filter(
    (o) => !(o.status === 'pending' && paidMaterialIds.has(o.materialId))
  );

  return (
    <div className="min-h-screen">
      {/* ── 페이지 헤더 ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
          <h1 className="text-3xl sm:text-[2.25rem] font-black text-gray-900 tracking-tight">내 주문 내역</h1>
          <p className="text-[15px] text-gray-400 font-medium mt-2">총 <strong className="text-gray-700">{orders.length}</strong>건</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-8 space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
              <ShoppingBag size={34} className="text-gray-300" />
            </div>
            <p className="text-[17px] font-bold text-gray-400 mb-2">주문 내역이 없습니다</p>
            <Link href="/m/materials" className="mt-3 text-[14px] text-blue-600 font-bold hover:underline underline-offset-4">
              자료 둘러보기 →
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md p-7 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-mono mb-1.5 opacity-80">#{order.orderId}</p>
                  <p className="text-[17px] font-black text-gray-900 truncate tracking-tight">{order.materialTitle}</p>
                  <p className="text-[13px] text-gray-500 mt-1 font-medium">
                    {order.fileTypes.map((t: string) => t === 'problem' ? '문제지' : '답지/기타').join(' + ')}
                    {order.status !== 'pending' && (
                      <>{' · '}{paymentMethodLabel(order.paymentMethod)}</>
                    )}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full border shrink-0 ${statusStyle[order.status]}`}>
                  <StatusIcon status={order.status} />
                  {statusLabel[order.status]}
                </span>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <span className="text-[18px] font-black text-blue-600">{order.amount.toLocaleString()}원</span>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] text-gray-400 font-medium">
                    {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  {order.status === 'paid' && (
                    <Link
                      href={`/m/materials/${order.materialId}`}
                      className="flex items-center gap-1.5 text-[13px] font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 px-4 py-2 rounded-xl transition-all"
                    >
                      <Download size={14} />
                      자료 열람
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
