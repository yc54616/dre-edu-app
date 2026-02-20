import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';
import Link from 'next/link';
import { ShoppingBag, CheckCircle2, Clock, XCircle, Download } from 'lucide-react';

const statusLabel: Record<string, string> = {
  pending:   '입금 대기',
  paid:      '승인 완료',
  cancelled: '취소됨',
};

const paymentMethodLabel = (method: string) => {
  const map: Record<string, string> = {
    CARD:             '카드',
    TRANSFER:         '계좌이체',
    VIRTUAL_ACCOUNT:  '가상계좌',
    MOBILE_PHONE:     '휴대폰',
    CULTURE_GIFT_CERTIFICATE: '문화상품권',
    bank_transfer:    '직접입금',
  };
  return map[method] ?? method ?? '기타';
};

const statusStyle: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-600 border-amber-100',
  paid:      'bg-emerald-50 text-emerald-600 border-emerald-100',
  cancelled: 'bg-gray-100 text-gray-400 border-gray-200',
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'paid')      return <CheckCircle2 size={13} />;
  if (status === 'cancelled') return <XCircle size={13} />;
  return <Clock size={13} />;
};

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session) redirect('/m');

  const user   = session.user as { id?: string };
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
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-dre-navy)]">내 주문 내역</h1>
          <p className="text-base text-gray-400 mt-2">총 {orders.length}건</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 sm:px-8 py-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-32">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 border border-gray-100">
              <ShoppingBag size={34} className="text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-400 mb-2">주문 내역이 없습니다</p>
            <Link href="/m/materials" className="mt-3 text-sm text-[var(--color-dre-blue)] font-semibold hover:underline">
              자료 둘러보기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-mono mb-1">#{order.orderId}</p>
                    <p className="text-base font-bold text-gray-900 truncate">{order.materialTitle}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {order.fileTypes.map((t: string) => t === 'problem' ? '문제지' : '답지/기타').join(' + ')}
                      {order.status !== 'pending' && (
                        <>{' · '}{paymentMethodLabel(order.paymentMethod)}</>
                      )}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${statusStyle[order.status]}`}>
                    <StatusIcon status={order.status} />
                    {statusLabel[order.status]}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-lg font-black text-[var(--color-dre-blue)]">{order.amount.toLocaleString()}원</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    {order.status === 'paid' && (
                      <Link
                        href={`/m/materials/${order.materialId}`}
                        className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-dre-blue)] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Download size={13} />
                        다운로드
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
