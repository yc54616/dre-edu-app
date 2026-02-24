'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, Loader2, CreditCard, FileText, ShieldCheck, Check, CheckCircle2 } from 'lucide-react';

interface PurchaseFormProps {
  materialId: string;
  materialTitle: string;
  priceProblem: number;
  priceEtc: number;
  hasProblemFile?: boolean;
  hasEtcFile?: boolean;
  isTeacherMaterial?: boolean;
  tossClientKey: string;
  userId: string;
  userEmail: string;
  userName: string;
  initialFileTypes?: string[];
  purchasedFileTypes?: string[];
}

type PurchasableType = 'problem' | 'etc';

interface PaymentMethodsWidget {
  updateAmount: (value: number) => void;
}

interface PaymentWidgetInstance {
  renderPaymentMethods: (selector: string, amount: { value: number }) => PaymentMethodsWidget;
  renderAgreement: (selector: string) => void;
  requestPayment: (options: {
    orderId: string;
    orderName: string;
    customerName: string;
    customerEmail: string;
    successUrl: string;
    failUrl: string;
  }) => Promise<void>;
}

export default function PurchaseForm({
  materialId, materialTitle, priceProblem, priceEtc,
  hasProblemFile = false, hasEtcFile = false,
  isTeacherMaterial = false,
  tossClientKey, userId, userEmail, userName,
  initialFileTypes,
  purchasedFileTypes = [],
}: PurchaseFormProps) {
  const showProblem = hasProblemFile || priceProblem > 0;
  const showEtc = hasEtcFile || priceEtc > 0;
  const packageAmount = (priceProblem || 0) + (priceEtc || 0);
  const purchasedSet = new Set(
    purchasedFileTypes.filter((type): type is PurchasableType => type === 'problem' || type === 'etc')
  );
  const hasPurchasedPackage = isTeacherMaterial ? purchasedSet.size > 0 : false;
  const canBuyProblem = !isTeacherMaterial && showProblem && !purchasedSet.has('problem');
  const canBuyEtc = !isTeacherMaterial && showEtc && !purchasedSet.has('etc');
  const hasBuyableFiles = isTeacherMaterial ? !hasPurchasedPackage : (canBuyProblem || canBuyEtc);

  const [fileTypes, setFileTypes] = useState<PurchasableType[]>(() => {
    if (isTeacherMaterial) return ['problem', 'etc'];

    const defaults = [
      ...(canBuyProblem ? (['problem'] as PurchasableType[]) : []),
      ...(canBuyEtc ? (['etc'] as PurchasableType[]) : []),
    ];

    if (!initialFileTypes || initialFileTypes.length === 0) return defaults;

    const filtered = initialFileTypes.filter((type): type is PurchasableType => {
      if (type === 'problem') return canBuyProblem;
      if (type === 'etc') return canBuyEtc;
      return false;
    });

    return filtered.length > 0 ? filtered : defaults;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  const methodsWidgetRef = useRef<PaymentMethodsWidget | null>(null);

  const amount =
    isTeacherMaterial
      ? packageAmount
      : (
        (fileTypes.includes('problem') ? priceProblem : 0) +
        (fileTypes.includes('etc') ? priceEtc : 0)
      );

  const toggleFileType = (type: PurchasableType) => {
    if (isTeacherMaterial) return;
    if ((type === 'problem' && !canBuyProblem) || (type === 'etc' && !canBuyEtc)) return;
    setFileTypes((prev) => {
      if (prev.includes(type)) return prev.filter((item) => item !== type);
      return [...prev, type];
    });
    setError('');
  };

  /* ── 결제위젯 초기화 ── */
  useEffect(() => {
    if (!tossClientKey || !hasBuyableFiles) return;

    let cancelled = false;
    widgetRef.current = null;
    methodsWidgetRef.current = null;

    const init = async () => {
      const { loadPaymentWidget } = await import('@tosspayments/payment-widget-sdk');
      const widget = await loadPaymentWidget(tossClientKey, userId) as unknown as PaymentWidgetInstance;
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
  }, [hasBuyableFiles, tossClientKey, userId]);

  /* ── 금액 변경 시 위젯 업데이트 ── */
  useEffect(() => {
    if (!hasBuyableFiles || !methodsWidgetRef.current || amount <= 0) return;
    methodsWidgetRef.current.updateAmount(amount);
  }, [amount, hasBuyableFiles]);

  /* ── 주문 생성 ── */
  const createOrder = async () => {
    const res = await fetch('/api/m/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        materialId,
        ...(isTeacherMaterial ? {} : { fileTypes: [...fileTypes] }),
        paymentMethod: 'CARD',
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '주문 생성 실패');
    return data.order.orderId as string;
  };

  /* ── 제출 ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasBuyableFiles) { setError('이미 모든 파일을 구매한 자료입니다.'); return; }
    if (!isTeacherMaterial && fileTypes.length === 0) { setError('파일을 선택해 주세요.'); return; }
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
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-4 pb-8">

      {/* 자료 요약 */}
      <div className="m-detail-card overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100/80 px-5 py-4 sm:px-6">
          <p className="m-detail-kicker flex items-center gap-2">
            <FileText size={14} />
            구매할 자료
          </p>
        </div>
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-base font-extrabold leading-snug tracking-tight text-gray-900 sm:text-[17px]">{materialTitle}</p>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {isTeacherMaterial
              ? '선택한 교사용 자료 패키지를 한 번에 결제합니다.'
              : '선택한 파일 구성과 결제 금액을 확인한 뒤 결제를 진행해 주세요.'}
          </p>
        </div>
      </div>

      {/* 파일 선택 */}
      <div className="m-detail-card p-5 sm:p-6">
        <p className="m-detail-kicker mb-5">파일 선택</p>
        <div className="space-y-3">
          {isTeacherMaterial ? (
            <div className="m-detail-soft rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800 sm:text-[15px]">교사용 자료 패키지</span>
                {hasBuyableFiles
                  ? <span className="font-extrabold text-gray-900">{packageAmount.toLocaleString()}원</span>
                  : <span className="text-[13px] font-semibold text-blue-500 bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-lg">구매완료</span>
                }
              </div>
              <p className="mt-2 text-xs text-gray-500">현재 자료의 본문/부가 파일을 묶음으로 결제합니다.</p>
            </div>
          ) : (
            <>
              {showProblem && (
                <button
                  type="button"
                  disabled={!canBuyProblem}
                  onClick={() => toggleFileType('problem')}
                  className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3.5 transition-all duration-200 sm:px-5 sm:py-4 ${
                    !canBuyProblem
                      ? 'border-gray-100 bg-gray-50/90 cursor-not-allowed opacity-80'
                      : fileTypes.includes('problem')
                        ? 'border-blue-300 bg-blue-50/80 shadow-sm'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      !canBuyProblem
                        ? 'border-blue-200 bg-blue-100'
                        : fileTypes.includes('problem')
                          ? 'border-blue-400 bg-blue-400'
                          : 'border-gray-300'
                      }`}>
                      {!canBuyProblem
                        ? <Check size={12} className="text-blue-500" />
                        : fileTypes.includes('problem') && <Check size={12} className="text-white" />
                      }
                    </div>
                    <span className="text-sm font-bold text-gray-800 sm:text-[15px]">문제지</span>
                  </div>
                  {!canBuyProblem
                    ? <span className="text-[13px] font-semibold text-blue-500 bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-lg">구매완료</span>
                    : priceProblem > 0
                      ? <span className="font-extrabold text-gray-900">{priceProblem.toLocaleString()}원</span>
                      : <span className="text-[13px] font-semibold text-blue-500 bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-lg">포함됨</span>
                  }
                </button>
              )}
              {showEtc && (
                <button
                  type="button"
                  disabled={!canBuyEtc}
                  onClick={() => toggleFileType('etc')}
                  className={`flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3.5 transition-all duration-200 sm:px-5 sm:py-4 ${
                    !canBuyEtc
                      ? 'border-gray-100 bg-gray-50/90 cursor-not-allowed opacity-80'
                      : fileTypes.includes('etc')
                        ? 'border-blue-300 bg-blue-50/80 shadow-sm'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/40'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      !canBuyEtc
                        ? 'border-blue-200 bg-blue-100'
                        : fileTypes.includes('etc')
                          ? 'border-blue-400 bg-blue-400'
                          : 'border-gray-300'
                      }`}>
                      {!canBuyEtc
                        ? <Check size={12} className="text-blue-500" />
                        : fileTypes.includes('etc') && <Check size={12} className="text-white" />
                      }
                    </div>
                    <span className="text-sm font-bold text-gray-800 sm:text-[15px]">답지 / 기타</span>
                  </div>
                  {!canBuyEtc
                    ? <span className="text-[13px] font-semibold text-blue-500 bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-lg">구매완료</span>
                    : priceEtc > 0
                      ? <span className="font-extrabold text-gray-900">{priceEtc.toLocaleString()}원</span>
                      : <span className="text-[13px] font-semibold text-blue-500 bg-blue-50/80 border border-blue-100 px-2 py-1 rounded-lg">포함됨</span>
                  }
                </button>
              )}
              {!showProblem && !showEtc && (
                <p className="text-[14px] font-medium text-gray-400 text-center py-3 bg-gray-50 rounded-2xl">파일 준비 중입니다</p>
              )}
            </>
          )}
        </div>
        {!hasBuyableFiles && (
          <p className="mt-3 text-sm font-semibold text-blue-500">이미 모든 파일을 구매했습니다. 상세 페이지에서 다운로드할 수 있습니다.</p>
        )}
        {hasBuyableFiles && !isTeacherMaterial && fileTypes.length === 0 && (
          <p className="mt-3 text-sm font-semibold text-red-500">최소 1개 파일을 선택해 주세요.</p>
        )}
      </div>

      {/* 금액 요약 */}
      <div className="m-detail-card p-5 sm:p-6">
        <p className="m-detail-kicker mb-4">결제 금액</p>
        <div className="m-detail-soft p-4 sm:p-5">
          {isTeacherMaterial ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">교사용 자료 패키지</span>
              <span className="font-semibold text-gray-900">
                {hasBuyableFiles ? `${packageAmount.toLocaleString()}원` : '구매완료'}
              </span>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">문제지</span>
                <span className="font-semibold text-gray-900">
                  {!showProblem
                    ? '-'
                    : !canBuyProblem
                      ? '구매완료'
                      : fileTypes.includes('problem')
                        ? (priceProblem > 0 ? `${priceProblem.toLocaleString()}원` : '포함')
                        : '-'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">답지 / 기타</span>
                <span className="font-semibold text-gray-900">
                  {!showEtc
                    ? '-'
                    : !canBuyEtc
                      ? '구매완료'
                      : fileTypes.includes('etc')
                        ? (priceEtc > 0 ? `${priceEtc.toLocaleString()}원` : '포함')
                        : '-'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
        {hasBuyableFiles && amount > 0 && (
          <div className="flex justify-between items-center mt-6 pt-5 border-t border-gray-100">
            <span className="text-[15px] font-extrabold text-gray-500">총 결제금액</span>
            <span className="text-[1.45rem] font-extrabold tracking-tight text-blue-500 sm:text-[1.75rem]">
              {amount.toLocaleString()}<span className="ml-1 text-base text-gray-600 sm:text-lg">원</span>
            </span>
          </div>
        )}
      </div>

      {/* 결제위젯 */}
      {hasBuyableFiles ? (
        <div className="m-detail-card p-5 sm:p-6">
          <p className="m-detail-kicker mb-4 flex items-center gap-2">
            <CreditCard size={14} />
            결제 수단
          </p>
          <div id="toss-payment-widget" />
          <div id="toss-payment-agreement" className="mt-4" />
        </div>
      ) : (
        <div className="m-detail-card p-5 sm:p-6">
          <div className="m-detail-soft p-4 sm:p-5">
            <p className="text-[15px] font-bold text-blue-600 flex items-center gap-2">
              <CheckCircle2 size={16} />
              {isTeacherMaterial ? '교사용 자료 구매 완료' : '전체 파일 구매 완료'}
            </p>
            <p className="mt-2 text-sm text-gray-500">자료 상세 페이지에서 바로 다운로드를 진행해 주세요.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-[15px] text-red-600 font-semibold">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || (!isTeacherMaterial && fileTypes.length === 0) || !hasBuyableFiles}
        className="m-detail-btn-primary w-full py-4 text-[16px] rounded-2xl disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
      >
        {submitting
          ? <><Loader2 size={20} className="animate-spin" /><span>결제 요청 중...</span></>
          : !hasBuyableFiles
            ? <span>{isTeacherMaterial ? '이미 구매 완료' : '이미 전체 구매 완료'}</span>
            : <>
              <span>
                {amount > 0
                  ? `${amount.toLocaleString()}원 결제하기`
                  : (isTeacherMaterial ? '교사용 자료 결제하기' : '선택한 파일 결제하기')}
              </span>
              <ChevronRight size={18} />
            </>
        }
      </button>
      {hasBuyableFiles && (
        <p className="flex items-center justify-center gap-2 text-xs font-medium text-gray-400">
          <ShieldCheck size={13} />
          결제 정보는 토스페이먼츠 보안 기준으로 안전하게 처리됩니다.
        </p>
      )}
    </form>
  );
}
