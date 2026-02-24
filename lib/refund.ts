import connectMongo from '@/lib/mongoose';
import Order from '@/lib/models/Order';

export interface RefundOrderDoc {
  orderId: string;
  userId: string;
  status: 'pending' | 'paid' | 'cancelled';
  paymentKey: string | null;
}

export const extractTossError = (data: unknown): string => {
  if (!data || typeof data !== 'object') return '토스페이먼츠 환불 실패';
  const message = (data as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim()) return message;
  return '토스페이먼츠 환불 실패';
};

export interface ProcessRefundResult {
  success: true;
  cancelledCount: number;
  cancelledOrderIds: string[];
}

export interface ProcessRefundError {
  success: false;
  error: string;
  status: number;
  code?: string;
  failedOrderId?: string;
}

export async function processRefund(
  orderId: string,
  cancelReason: string,
): Promise<ProcessRefundResult | ProcessRefundError> {
  await connectMongo();

  const order = await Order.findOne(
    { orderId },
    { orderId: 1, userId: 1, status: 1, paymentKey: 1 },
  ).lean() as RefundOrderDoc | null;

  if (!order) {
    return { success: false, error: '주문을 찾을 수 없습니다.', status: 404 };
  }
  if (order.status !== 'paid') {
    return { success: false, error: '결제 완료 주문만 환불할 수 있습니다.', status: 400 };
  }
  if (!order.paymentKey) {
    return { success: false, error: '토스 결제 건만 환불할 수 있습니다.', status: 400 };
  }

  const secretKey = process.env.TOSS_SECRET_KEY ?? '';
  if (!secretKey) {
    return { success: false, error: '토스 시크릿 키가 설정되지 않았습니다.', status: 500 };
  }
  const encoded = Buffer.from(`${secretKey}:`).toString('base64');

  const tossRes = await fetch(
    `https://api.tosspayments.com/v1/payments/${encodeURIComponent(order.paymentKey)}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancelReason }),
    },
  );

  let tossData: unknown = null;
  try {
    tossData = await tossRes.json();
  } catch {
    tossData = null;
  }

  if (!tossRes.ok) {
    const code =
      tossData && typeof tossData === 'object' && typeof (tossData as { code?: unknown }).code === 'string'
        ? (tossData as { code: string }).code
        : undefined;
    return {
      success: false,
      error: extractTossError(tossData),
      status: 400,
      code,
      failedOrderId: order.orderId,
    };
  }

  const updateResult = await Order.updateOne(
    { orderId: order.orderId, status: 'paid' },
    {
      $set: {
        status: 'cancelled',
        paidAt: null,
      },
    },
  );

  if (updateResult.matchedCount === 0) {
    return {
      success: false,
      error: '환불 처리 중 주문 상태가 변경되었습니다. 다시 시도해 주세요.',
      status: 409,
    };
  }

  return {
    success: true,
    cancelledCount: 1,
    cancelledOrderIds: [order.orderId],
  };
}
