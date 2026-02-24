'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { val: 'pending', label: '접수' },
  { val: 'contacted', label: '연락 완료' },
  { val: 'scheduled', label: '상담 예정' },
  { val: 'completed', label: '완료' },
  { val: 'cancelled', label: '취소' },
];

interface Props {
  consultationId: string;
  currentStatus: string;
  currentMemo: string;
}

export default function StatusActions({ consultationId, currentStatus, currentMemo }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [memo, setMemo] = useState(currentMemo);
  const [saving, setSaving] = useState(false);
  const [showMemo, setShowMemo] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    setSaving(true);
    try {
      const res = await fetch(`/api/consult/${consultationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setStatus(currentStatus);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMemo = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/consult/${consultationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminMemo: memo }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      setShowMemo(false);
    } catch {
      alert('메모 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={saving}
          className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm font-semibold outline-none focus:border-blue-400 disabled:opacity-50"
        >
          {STATUS_OPTIONS.map(({ val, label }) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowMemo(!showMemo)}
          className="text-sm font-medium text-gray-400 hover:text-blue-500"
        >
          {showMemo ? '닫기' : '메모'}
        </button>
      </div>
      {showMemo && (
        <div className="flex gap-2">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="h-16 flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="관리자 메모"
          />
          <button
            onClick={handleSaveMemo}
            disabled={saving}
            className="self-end rounded-lg bg-blue-500 px-3 py-2 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
