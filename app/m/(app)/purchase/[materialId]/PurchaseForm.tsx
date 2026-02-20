'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

interface PurchaseFormProps {
  materialId: string;
  materialTitle: string;
  priceProblem: number;
  priceEtc: number;
  hasProblemFile?: boolean;
  hasEtcFile?: boolean;
  tossClientKey: string;
  userId: string;
  userEmail: string;
  userName: string;
  initialFileTypes?: string[];
}

export default function PurchaseForm({
  materialId, materialTitle, priceProblem, priceEtc,
  hasProblemFile = false, hasEtcFile = false,
  tossClientKey, userId, userEmail, userName,
  initialFileTypes,
}: PurchaseFormProps) {
  const showProblem = hasProblemFile || priceProblem > 0;
  const showEtc = hasEtcFile || priceEtc > 0;

  const [fileTypes] = useState<string[]>(() => {
    return [
      ...(showProblem ? ['problem'] : []),
      ...(showEtc ? ['etc'] : []),
    ];
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methodsWidgetRef = useRef<any>(null);

  const amount =
    (fileTypes.includes('problem') ? priceProblem : 0) +
    (fileTypes.includes('etc') ? priceEtc : 0);

  /* ── 결제위젯 초기화 ── */
  useEffect(() => {
    if (!tossClientKey) return;

    let cancelled = false;
    widgetRef.current = null;
    methodsWidgetRef.current = null;

    const init = async () => {
      const { loadPaymentWidget } = await import('@tosspayments/payment-widget-sdk');
      const widget = await loadPaymentWidget(tossClientKey, userId);
      if (cancelled) return;

      widgetRef.current = widget;
      methodsWidgetRef.current = widget.renderPaymentMethods(
        '#toss-payment-widget',
        { value: amount || 1000 },
      );
      widget.renderAgreement('#toss-payment-agreement');
    };

    init().catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : '위젯 초기화 실패');
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tossClientKey, userId]);

  /* ── 금액 변경 시 위젯 업데이트 ── */
  useEffect(() => {
    if (!methodsWidgetRef.current || amount <= 0) return;
    methodsWidgetRef.current.updateAmount(amount);
  }, [amount]);

  /* ── 주문 생성 ── */
  const createOrder = async () => {
    const res = await fetch('/api/m/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialId, fileTypes, paymentMethod: 'CARD' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '주문 생성 실패');
    return data.order.orderId as string;
  };

  /* ── 제출 ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fileTypes.length === 0) { setError('파일을 선택해 주세요.'); return; }
    if (amount <= 0) { setError('결제 금액이 없습니다.'); return; }
    if (!widgetRef.current) { setError('결제위젯이 준비되지 않았습니다. 잠시 후 다시 시도하세요.'); return; }
    setSubmitting(true);
    setError('');

    try {
      const orderId = await createOrder();

      await widgetRef.current.requestPayment({
        orderId,
        orderName: materialTitle.slice(0, 100),
        customerName: userName || '학생',
        customerEmail: userEmail || '',
        successUrl: `${window.location.origin}/m/purchase/success`,
        failUrl: `${window.location.origin}/m/purchase/fail`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 요청 실패');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">

      {/* 자료 요약 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-3">구매할 자료</p>
        <p className="text-[17px] font-black text-gray-900 leading-snug tracking-tight">{materialTitle}</p>
      </div>

      {/* 파일 선택 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-5">파일 선택</p>
        <div className="space-y-3">
          {showProblem && (
            <div
              className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${fileTypes.includes('problem')
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-100'
                }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${fileTypes.includes('problem') ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                  {fileTypes.includes('problem') && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-[15px] font-bold text-gray-800">문제지</span>
              </div>
              {priceProblem > 0
                ? <span className="font-black text-gray-900">{priceProblem.toLocaleString()}원</span>
                : <span className="text-[13px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">포함됨</span>
              }
            </div>
          )}
          {showEtc && (
            <div
              className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${fileTypes.includes('etc')
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-100'
                }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${fileTypes.includes('etc') ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                  }`}>
                  {fileTypes.includes('etc') && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-[15px] font-bold text-gray-800">답지 / 기타</span>
              </div>
              {priceEtc > 0
                ? <span className="font-black text-gray-900">{priceEtc.toLocaleString()}원</span>
                : <span className="text-[13px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">포함됨</span>
              }
            </div>
          )}
          {!showProblem && !showEtc && (
            <p className="text-[14px] font-medium text-gray-400 text-center py-3 bg-gray-50 rounded-2xl">파일 준비 중입니다</p>
          )}
        </div>
        {amount > 0 && (
          <div className="flex justify-between items-center mt-6 pt-5 border-t border-gray-100">
            <span className="text-[15px] font-extrabold text-gray-500">총 결제금액</span>
            <span className="text-[1.75rem] font-black tracking-tight text-blue-600">
              {amount.toLocaleString()}<span className="text-lg text-gray-600 ml-1">원</span>
            </span>
          </div>
        )}
      </div>

      {/* 결제위젯 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-4">결제 수단</p>
        <div id="toss-payment-widget" />
        <div id="toss-payment-agreement" className="mt-4" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-[14px] text-red-600 font-bold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || fileTypes.length === 0}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[16px] rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
      >
        {submitting
          ? <><Loader2 size={20} className="animate-spin" /><span>결제 요청 중...</span></>
          : <>
            <span>{amount > 0 ? `${amount.toLocaleString()}원 결제하기` : '무료 다운로드'}</span>
            <ChevronRight size={18} />
          </>
        }
      </button>
    </form>
  );
}
