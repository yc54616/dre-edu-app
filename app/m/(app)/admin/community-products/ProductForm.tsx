'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit2, Loader2, PlusCircle, Save, Trash2, X } from 'lucide-react';

export type AdminCommunityProduct = {
  productId: string;
  key: string;
  name: string;
  shortLabel: string;
  amount: number;
  sortOrder: number;
  isActive: boolean;
};

type FormState = {
  key: string;
  name: string;
  shortLabel: string;
  amount: string;
  sortOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  key: '',
  name: '',
  shortLabel: '',
  amount: '',
  sortOrder: '0',
  isActive: true,
};

interface Props {
  products: AdminCommunityProduct[];
}

const normalizeKeyInput = (value: string) => value.trim().toLowerCase();
const formatMoney = (value: number) => `${value.toLocaleString()}원`;

export default function ProductForm({ products }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submitLabel = editingProductId ? '상품 수정하기' : '상품 추가하기';
  const titleLabel = editingProductId ? '상품 수정' : '새 상품 추가';

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name)),
    [products],
  );

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingProductId(null);
  };

  const startEdit = (product: AdminCommunityProduct) => {
    setError('');
    setSuccess('');
    setEditingProductId(product.productId);
    setForm({
      key: product.key,
      name: product.name,
      shortLabel: product.shortLabel,
      amount: String(product.amount),
      sortOrder: String(product.sortOrder),
      isActive: product.isActive,
    });
  };

  const validate = () => {
    const key = normalizeKeyInput(form.key);
    const name = form.name.trim();
    const shortLabel = form.shortLabel.trim();
    const amount = Number(form.amount);
    const sortOrder = Number(form.sortOrder);

    if (!/^[a-z0-9][a-z0-9_-]{1,39}$/.test(key)) {
      setError('상품 키는 영문 소문자/숫자/하이픈/언더스코어 조합(2~40자)만 가능합니다.');
      return null;
    }
    if (!name || name.length > 120) {
      setError('상품명을 확인해 주세요. (1~120자)');
      return null;
    }
    if (!shortLabel || shortLabel.length > 40) {
      setError('짧은 라벨을 확인해 주세요. (1~40자)');
      return null;
    }
    if (!Number.isInteger(amount) || amount < 0 || amount > 1000000000) {
      setError('금액은 0원 이상 정수만 입력할 수 있습니다.');
      return null;
    }
    if (!Number.isFinite(sortOrder)) {
      setError('정렬 순서를 확인해 주세요.');
      return null;
    }

    return {
      key,
      name,
      shortLabel,
      amount,
      sortOrder: Math.trunc(sortOrder),
      isActive: form.isActive,
    };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = validate();
    if (!payload) return;

    setSaving(true);
    try {
      const endpoint = editingProductId
        ? `/api/m/admin/community-products/${editingProductId}`
        : '/api/m/admin/community-products';
      const method = editingProductId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({} as { error?: string }));

      if (!res.ok) {
        setError(data.error || '상품 저장에 실패했습니다.');
        setSaving(false);
        return;
      }

      setSuccess(editingProductId ? '상품이 수정되었습니다.' : '상품이 추가되었습니다.');
      resetForm();
      router.refresh();
    } catch {
      setError('네트워크 오류로 저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: AdminCommunityProduct) => {
    if (deletingId) return;
    if (!confirm(`"${product.shortLabel}" 상품을 삭제하시겠습니까?`)) return;

    setDeletingId(product.productId);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/m/admin/community-products/${product.productId}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setError(data.error || '상품 삭제에 실패했습니다.');
        setDeletingId(null);
        return;
      }
      setSuccess('상품이 삭제되었습니다.');
      if (editingProductId === product.productId) resetForm();
      router.refresh();
    } catch {
      setError('네트워크 오류로 삭제하지 못했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="m-detail-card space-y-4 p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-gray-900">{titleLabel}</h2>
          <p className="text-sm font-medium text-gray-500">활성 상품만 커뮤니티 결제 화면에 노출됩니다.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="block text-xs font-semibold text-gray-500">상품 키 *</span>
            <input
              type="text"
              value={form.key}
              onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))}
              placeholder="예: premium"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
              required
            />
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs font-semibold text-gray-500">상품명 *</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="예: 네이버 dre수학 교사용 프리미엄회원 인증"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
              required
            />
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs font-semibold text-gray-500">짧은 라벨 *</span>
            <input
              type="text"
              value={form.shortLabel}
              onChange={(e) => setForm((prev) => ({ ...prev, shortLabel: e.target.value }))}
              placeholder="예: 프리미엄회원 인증"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
              required
            />
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs font-semibold text-gray-500">금액(원) *</span>
            <input
              type="number"
              min={0}
              step={1}
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              placeholder="예: 50000"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
              required
            />
          </label>
          <label className="space-y-1.5">
            <span className="block text-xs font-semibold text-gray-500">정렬 순서</span>
            <input
              type="number"
              step={1}
              value={form.sortOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10"
            />
          </label>
          <label className="flex items-center gap-2 self-end rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-[var(--color-dre-blue)] focus:ring-[var(--color-dre-blue)]"
            />
            활성 상품
          </label>
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="m-detail-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm disabled:opacity-60 sm:w-auto"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : editingProductId ? <Save size={16} /> : <PlusCircle size={16} />}
            {saving ? '저장 중...' : submitLabel}
          </button>
          {editingProductId && (
            <button
              type="button"
              onClick={resetForm}
              className="m-detail-btn-secondary inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm sm:w-auto"
            >
              <X size={16} />
              수정 취소
            </button>
          )}
        </div>
      </form>

      <div className="m-detail-card overflow-hidden">
        {sortedProducts.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm font-medium text-gray-500">등록된 상품이 없습니다.</div>
        ) : (
          <>
            <div className="hidden grid-cols-[130px_minmax(0,1fr)_130px_110px_110px_120px] items-center gap-4 border-b border-gray-100 bg-gray-50/80 px-6 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 md:grid">
              <div>상품 키</div>
              <div>상품명</div>
              <div className="text-right">금액</div>
              <div className="text-right">정렬</div>
              <div>상태</div>
              <div className="text-right">관리</div>
            </div>

            <div className="divide-y divide-gray-100">
              {sortedProducts.map((product) => (
                <div key={product.productId} className="grid gap-3 px-4 py-4 transition-colors hover:bg-blue-50/30 md:grid-cols-[130px_minmax(0,1fr)_130px_110px_110px_120px] md:items-center md:gap-4 md:px-6">
                  <div className="font-mono text-xs font-semibold text-gray-500">{product.key}</div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold text-gray-900">{product.shortLabel}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{product.name}</p>
                  </div>
                  <div className="text-left text-sm font-extrabold text-blue-600 md:text-right">{formatMoney(product.amount)}</div>
                  <div className="text-left text-sm font-bold tabular-nums text-gray-700 md:text-right">{product.sortOrder}</div>
                  <div>
                    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${
                      product.isActive
                        ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                        : 'border border-gray-200 bg-gray-50 text-gray-600'
                    }`}>
                      {product.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      title="수정"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product)}
                      disabled={deletingId === product.productId}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-60"
                      title="삭제"
                    >
                      {deletingId === product.productId ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
