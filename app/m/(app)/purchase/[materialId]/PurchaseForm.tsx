'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

interface PurchaseFormProps {
  materialId:        string;
  materialTitle:     string;
  priceProblem:      number;
  priceEtc:          number;
  hasProblemFile?:   boolean;
  hasEtcFile?:       boolean;
  tossClientKey:     string;
  userId:            string;
  userEmail:         string;
  userName:          string;
  initialFileTypes?: string[];
}

export default function PurchaseForm({
  materialId, materialTitle, priceProblem, priceEtc,
  hasProblemFile = false, hasEtcFile = false,
  tossClientKey, userId, userEmail, userName,
  initialFileTypes,
}: PurchaseFormProps) {
  // 파일 존재 여부 OR 가격 설정 여부로 표시 여부 결정
  const showProblem = hasProblemFile || priceProblem > 0;
  const showEtc     = hasEtcFile     || priceEtc     > 0;

  const [fileTypes,  setFileTypes]  = useState<string[]>(() => {
    if (initialFileTypes && initialFileTypes.length > 0) return initialFileTypes;
    // 기본 선택: 존재하는 파일 모두
    return [
      ...(showProblem ? ['problem'] : []),
      ...(showEtc     ? ['etc']     : []),
    ];
  });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetRef        = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methodsWidgetRef = useRef<any>(null);

  const toggleFileType = (t: string) =>
    setFileTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const amount =
    (fileTypes.includes('problem') ? priceProblem : 0) +
    (fileTypes.includes('etc')     ? priceEtc     : 0);

  /* ── 결제위젯 초기화 ── */
  useEffect(() => {
    if (!tossClientKey) return;

    let cancelled = false;
    widgetRef.current        = null;
    methodsWidgetRef.current = null;

    const init = async () => {
      const { loadPaymentWidget } = await import('@tosspayments/payment-widget-sdk');
      const widget = await loadPaymentWidget(tossClientKey, userId);
      if (cancelled) return;

      widgetRef.current        = widget;
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
      method:  'POST',
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
    if (amount <= 0)             { setError('결제 금액이 없습니다.'); return; }
    if (!widgetRef.current)      { setError('결제위젯이 준비되지 않았습니다. 잠시 후 다시 시도하세요.'); return; }
    setSubmitting(true);
    setError('');

    try {
      const orderId = await createOrder();

      await widgetRef.current.requestPayment({
        orderId,
        orderName:     materialTitle.slice(0, 100),
        customerName:  userName  || '학생',
        customerEmail: userEmail || '',
        successUrl: `${window.location.origin}/m/purchase/success`,
        failUrl:    `${window.location.origin}/m/purchase/fail`,
      });
      // 토스 SDK가 리다이렉트 처리 — 이 이하는 실행되지 않음

    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 요청 실패');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">

      {/* 자료 요약 */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">구매할 자료</p>
        <p className="text-base font-bold text-gray-900 leading-snug">{materialTitle}</p>
      </div>

      {/* 파일 선택 */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">파일 선택</p>
        <div className="space-y-3">
          {showProblem && (
            <label className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
              fileTypes.includes('problem') ? 'border-[var(--color-dre-blue)] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={fileTypes.includes('problem')} onChange={() => toggleFileType('problem')} className="w-4 h-4 accent-[var(--color-dre-blue)]" />
                <span className="text-base font-semibold text-gray-800">문제지</span>
              </div>
              {priceProblem > 0
                ? <span className="font-bold text-gray-900">{priceProblem.toLocaleString()}원</span>
                : <span className="text-sm font-medium text-gray-400">포함</span>
              }
            </label>
          )}
          {showEtc && (
            <label className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
              fileTypes.includes('etc') ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={fileTypes.includes('etc')} onChange={() => toggleFileType('etc')} className="w-4 h-4 accent-violet-500" />
                <span className="text-base font-semibold text-gray-800">답지 / 기타</span>
              </div>
              {priceEtc > 0
                ? <span className="font-bold text-gray-900">{priceEtc.toLocaleString()}원</span>
                : <span className="text-sm font-medium text-gray-400">포함</span>
              }
            </label>
          )}
          {!showProblem && !showEtc && (
            <p className="text-sm text-gray-400 text-center py-2">파일 준비 중입니다</p>
          )}
        </div>
        {amount > 0 && (
          <div className="flex justify-between items-center mt-5 pt-5 border-t border-gray-100">
            <span className="text-base font-bold text-gray-700">합계</span>
            <span className="text-2xl font-black text-[var(--color-dre-blue)]">{amount.toLocaleString()}원</span>
          </div>
        )}
      </div>

      {/* 결제위젯 */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">결제 수단</p>
        <div id="toss-payment-widget" />
        <div id="toss-payment-agreement" className="mt-3" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || fileTypes.length === 0}
        className="w-full py-4 bg-[var(--color-dre-navy)] text-white font-bold rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-[var(--color-dre-blue)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {submitting
          ? <><Loader2 size={18} className="animate-spin relative z-10" /><span className="relative z-10">처리 중...</span></>
          : <>
              <span className="relative z-10">
                {amount > 0 ? `${amount.toLocaleString()}원 결제하기` : '결제하기'}
              </span>
              <ChevronRight size={18} className="relative z-10" />
            </>
        }
      </button>
    </form>
  );
}
