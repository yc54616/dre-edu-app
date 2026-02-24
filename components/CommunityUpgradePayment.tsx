'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp, CreditCard, Loader2 } from 'lucide-react';

interface CommunityUpgradeProductOption {
  key: string;
  name: string;
  shortLabel: string;
  amount: number;
}

interface Props {
  tossClientKey: string;
  cafeUrl?: string;
  products: CommunityUpgradeProductOption[];
}

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

type FormState = {
  applicantName: string;
  phone: string;
  cafeNickname: string;
};

function getGuestCustomerKey() {
  const makeFallbackKey = () =>
    `guest_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;

  if (typeof window === 'undefined') return makeFallbackKey();
  const storageKey = 'dre_community_customer_key';

  try {
    const prev = window.localStorage.getItem(storageKey);
    if (prev) return prev;
  } catch {
    return makeFallbackKey();
  }

  const uuid =
    typeof window.crypto !== 'undefined' && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID().replace(/-/g, '')
      : makeFallbackKey().replace('guest_', '');

  const next = `guest_${uuid}`;

  try {
    window.localStorage.setItem(storageKey, next);
  } catch {
    return next;
  }

  return next;
}

export default function CommunityUpgradePayment({
  tossClientKey,
  cafeUrl = 'https://cafe.naver.com/dremath',
  products,
}: Props) {
  const [selectedKey, setSelectedKey] = useState<string>(products[0]?.key || '');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    applicantName: '',
    phone: '',
    cafeNickname: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [widgetReady, setWidgetReady] = useState(false);

  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  const methodsWidgetRef = useRef<PaymentMethodsWidget | null>(null);
  const selectedProduct = useMemo(
    () => products.find((product) => product.key === selectedKey) ?? null,
    [products, selectedKey],
  );
  const selectedAmount = selectedProduct?.amount ?? 0;
  const hasProducts = products.length > 0;
  const hasTossKey = Boolean(tossClientKey);

  const toggleButtonLabel = isOpen ? '결제 상품 닫기' : '결제 상품 열기';
  const toggleButtonClass = 'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50 sm:w-auto sm:px-6 sm:text-base';
  const payButtonLabel = selectedProduct
    ? `${selectedProduct.amount.toLocaleString()}원 결제하기`
    : '상품 준비 중';
  const payButtonClass = 'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-dre-blue)] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl sm:py-4 sm:text-base lg:text-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:bg-[var(--color-dre-blue)] disabled:hover:shadow-lg';

  useEffect(() => {
    if (!products.length) {
      if (selectedKey) setSelectedKey('');
      return;
    }
    if (!products.some((product) => product.key === selectedKey)) {
      setSelectedKey(products[0].key);
    }
  }, [products, selectedKey]);

  useEffect(() => {
    if (!isOpen || !tossClientKey || !selectedProduct) return;
    let cancelled = false;
    setWidgetReady(false);
    widgetRef.current = null;
    methodsWidgetRef.current = null;

    const init = async () => {
      const customerKey = getGuestCustomerKey();
      const { loadPaymentWidget } = await import('@tosspayments/payment-widget-sdk');
      const widget = await loadPaymentWidget(tossClientKey, customerKey) as unknown as PaymentWidgetInstance;
      if (cancelled) return;

      widgetRef.current = widget;
      methodsWidgetRef.current = widget.renderPaymentMethods('#community-toss-widget', {
        value: selectedAmount,
      });
      widget.renderAgreement('#community-toss-agreement');
      setWidgetReady(true);
    };

    init().catch(() => {
      if (!cancelled) setError('결제 위젯을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    });

    return () => {
      cancelled = true;
      widgetRef.current = null;
      methodsWidgetRef.current = null;
    };
  }, [isOpen, tossClientKey, selectedAmount, selectedProduct]);

  useEffect(() => {
    if (!isOpen || !methodsWidgetRef.current || !selectedProduct) return;
    methodsWidgetRef.current.updateAmount(selectedAmount);
  }, [isOpen, selectedAmount, selectedProduct]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedProduct || !selectedKey) {
      setError('현재 결제 가능한 상품이 없습니다.');
      return;
    }
    if (!form.applicantName.trim()) {
      setError('신청자 이름을 입력해 주세요.');
      return;
    }
    if (!form.phone.trim()) {
      setError('연락처를 입력해 주세요.');
      return;
    }
    if (!form.cafeNickname.trim()) {
      setError('신청자 식별 정보를 입력해 주세요.');
      return;
    }
    if (!hasTossKey) {
      setError('결제 설정이 준비되지 않았습니다. 관리자에게 문의해 주세요.');
      return;
    }
    if (!widgetRef.current || !widgetReady) {
      setError('결제 위젯 준비 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const createOrderRes = await fetch('/api/community/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productKey: selectedKey,
          applicantName: form.applicantName.trim(),
          phone: form.phone.trim(),
          cafeNickname: form.cafeNickname.trim(),
        }),
      });
      const createOrderData = await createOrderRes.json().catch(() => ({}));
      if (!createOrderRes.ok) {
        setError(typeof createOrderData?.error === 'string' ? createOrderData.error : '주문 생성에 실패했습니다.');
        setSubmitting(false);
        return;
      }

      const orderId = String(createOrderData?.order?.orderId || '');
      const orderName = String(createOrderData?.order?.orderName || selectedProduct.shortLabel);
      if (!orderId) {
        setError('주문 정보 생성에 실패했습니다.');
        setSubmitting(false);
        return;
      }

      await widgetRef.current.requestPayment({
        orderId,
        orderName,
        customerName: form.applicantName.trim(),
        customerEmail: '',
        successUrl: `${window.location.origin}/community/payment/success`,
        failUrl: `${window.location.origin}/community/payment/fail`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 요청에 실패했습니다.');
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500 sm:text-sm">Product Checkout</p>
              <h3 className="mt-1 text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                상품 결제 안내
              </h3>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                네이버 카페 등업과 온라인 특강 등 필요한 상품을 선택해 결제하세요.
              </p>
            </div>
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <a
                href={cafeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100 sm:w-auto sm:px-6 sm:text-base"
              >
                관련 채널 바로가기
              </a>
              <button
                type="button"
                onClick={() => {
                  setIsOpen((prev) => !prev);
                  setError('');
                }}
                className={toggleButtonClass}
              >
                {isOpen ? (
                  <>
                    {toggleButtonLabel}
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    {toggleButtonLabel}
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {!isOpen && (
          <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
            <p className="text-sm text-gray-500 sm:text-base">
              {hasProducts
                ? '결제 상품을 열면 상품 선택과 결제 항목이 표시됩니다.'
                : '현재 활성화된 상품이 없습니다. 관리자 페이지에서 상품을 등록해 주세요.'}
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              {!hasProducts ? (
                <div className="px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
                  <p className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm font-medium text-gray-600 sm:text-base">
                    현재 결제 가능한 상품이 없습니다. 관리자 페이지에서 상품을 활성화해 주세요.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-4 md:grid-cols-2 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
                    {products.map((product) => {
                      const active = selectedKey === product.key;
                      return (
                        <button
                          key={product.key}
                          type="button"
                          onClick={() => {
                            setSelectedKey(product.key);
                            setError('');
                          }}
                          className={`rounded-2xl border px-4 py-4 text-left transition-all ${active
                            ? 'border-blue-200 bg-blue-50/50'
                            : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-500 sm:text-base">결제 상품</p>
                              <p className="mt-0.5 text-base font-extrabold text-gray-900 sm:text-lg">{product.shortLabel}</p>
                            </div>
                            {active && <CheckCircle2 size={18} className="text-blue-500" />}
                          </div>
                          <p className="mt-2 text-sm text-gray-600 sm:text-base">{product.name}</p>
                          <p className="mt-3 text-xl font-extrabold text-gray-900 sm:text-2xl">{product.amount.toLocaleString()}원</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:gap-6 lg:px-8 lg:py-8 xl:grid-cols-[1fr_1.15fr]">
                    <div>
                      <form onSubmit={handlePay} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 lg:p-6">
                        <label className="space-y-1 block">
                          <span className="text-sm font-semibold text-gray-700 sm:text-base">신청자 이름</span>
                          <input
                            type="text"
                            required
                            value={form.applicantName}
                            onChange={(e) => setForm((prev) => ({ ...prev, applicantName: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:px-3.5 sm:py-3 sm:text-base"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-sm font-semibold text-gray-700 sm:text-base">연락처</span>
                          <input
                            type="tel"
                            required
                            placeholder="010-0000-0000"
                            value={form.phone}
                            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:px-3.5 sm:py-3 sm:text-base"
                          />
                        </label>
                        <label className="space-y-1 block">
                          <span className="text-sm font-semibold text-gray-700 sm:text-base">신청자 식별 정보</span>
                          <input
                            type="text"
                            required
                            placeholder="예: 카페 닉네임 또는 수강자명"
                            value={form.cafeNickname}
                            onChange={(e) => setForm((prev) => ({ ...prev, cafeNickname: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:px-3.5 sm:py-3 sm:text-base"
                          />
                        </label>

                        {!hasTossKey && (
                          <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-700 sm:text-base">
                            결제키가 설정되지 않아 결제를 진행할 수 없습니다.
                          </p>
                        )}

                        {error && (
                          <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 sm:text-base">
                            {error}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={submitting || !widgetReady || !hasTossKey || !selectedProduct}
                          className={payButtonClass}
                        >
                          {submitting ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                          {payButtonLabel}
                        </button>
                      </form>
                    </div>

                    <div>
                      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-4">
                        <div id="community-toss-widget" className="min-h-[150px]" />

                        <div className="mt-2">
                          <div id="community-toss-agreement" className="min-h-[90px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
