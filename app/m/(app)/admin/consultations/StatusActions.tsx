'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, CalendarClock, StickyNote, X } from 'lucide-react';

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
  scheduledDate?: string;
  scheduledTime?: string;
}

export default function StatusActions({ consultationId, currentStatus, currentMemo, scheduledDate: initDate, scheduledTime: initTime }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [memo, setMemo] = useState(currentMemo);
  const [saving, setSaving] = useState(false);
  const [showMemo, setShowMemo] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedDate, setSchedDate] = useState(initDate || '');
  const [schedTime, setSchedTime] = useState(initTime || '');
  const [scheduleSaving, setScheduleSaving] = useState(false);

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

  const handleSchedule = async () => {
    if (!schedDate || !schedTime) {
      alert('날짜와 시간을 모두 입력해주세요.');
      return;
    }
    setScheduleSaving(true);
    try {
      const res = await fetch(`/api/consult/${consultationId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledDate: schedDate, scheduledTime: schedTime }),
      });
      if (!res.ok) throw new Error();
      setStatus('scheduled');
      setShowSchedule(false);
      router.refresh();
    } catch {
      alert('일정 저장에 실패했습니다.');
    } finally {
      setScheduleSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={saving}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm font-semibold outline-none focus:border-blue-400 disabled:opacity-50"
        >
          {STATUS_OPTIONS.map(({ val, label }) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button
          onClick={() => { setShowMemo(!showMemo); setShowSchedule(false); }}
          title="메모"
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${showMemo ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
        >
          <StickyNote size={15} />
        </button>
        <button
          onClick={() => { setShowSchedule(!showSchedule); setShowMemo(false); }}
          title="일정 알림"
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${showSchedule ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
        >
          <CalendarClock size={15} />
        </button>
      </div>

      {showMemo && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500">관리자 메모</span>
            <button onClick={() => setShowMemo(false)} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
          </div>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full h-16 resize-none rounded-md border border-gray-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="메모 입력..."
          />
          <button
            onClick={handleSaveMemo}
            disabled={saving}
            className="flex items-center gap-1 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            저장
          </button>
        </div>
      )}

      {showSchedule && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500">일정 알림톡</span>
            <button onClick={() => setShowSchedule(false)} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
          </div>
          <div className="flex gap-1.5">
            <input
              type="date"
              value={schedDate}
              onChange={(e) => setSchedDate(e.target.value)}
              className="flex-1 min-w-0 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
            />
            <input
              type="time"
              value={schedTime}
              onChange={(e) => setSchedTime(e.target.value)}
              className="w-[90px] rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
            />
          </div>
          <button
            onClick={handleSchedule}
            disabled={scheduleSaving}
            className="flex items-center gap-1 rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            {scheduleSaving ? <Loader2 size={12} className="animate-spin" /> : <CalendarClock size={12} />}
            알림톡 발송
          </button>
        </div>
      )}
    </div>
  );
}
