'use client';

// 관리자 주문 관리 액션 없음 — 결제/취소 모두 토스페이먼츠에서 처리
export default function OrderActions({ status }: { orderId: string; status: string }) {
  void status;
  return null;
}
