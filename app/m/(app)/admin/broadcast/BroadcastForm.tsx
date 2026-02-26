'use client';

import { useState, useMemo } from 'react';

type ConsultationType = 'admission' | 'consulting' | 'coaching' | 'teacher';

const TYPE_LABEL: Record<ConsultationType, string> = {
  admission: '입학 안내',
  consulting: '입시컨설팅',
  coaching: '온라인수학코칭',
  teacher: '수업설계컨설팅',
};

const TYPE_COLOR: Record<ConsultationType, string> = {
  admission: 'bg-green-50 text-green-700 border-green-200',
  consulting: 'bg-blue-50 text-blue-700 border-blue-200',
  coaching: 'bg-purple-50 text-purple-700 border-purple-200',
  teacher: 'bg-orange-50 text-orange-700 border-orange-200',
};

interface Recipient {
  phone: string;
  name: string;
  types: ConsultationType[];
}

interface Props {
  recipients: Recipient[];
}

export default function BroadcastForm({ recipients }: Props) {
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<ConsultationType | 'all'>('all');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const filteredRecipients = useMemo(() => {
    if (typeFilter === 'all') return recipients;
    return recipients.filter((r) => r.types.includes(typeFilter));
  }, [recipients, typeFilter]);

  const allFilteredSelected = filteredRecipients.length > 0
    && filteredRecipients.every((r) => selectedPhones.has(r.phone));

  function toggleAll() {
    setSelectedPhones((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredRecipients.forEach((r) => next.delete(r.phone));
      } else {
        filteredRecipients.forEach((r) => next.add(r.phone));
      }
      return next;
    });
  }

  function toggleOne(phone: string) {
    setSelectedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  }

  const selectedRecipients = recipients.filter((r) => selectedPhones.has(r.phone));

  const previewMessage = `(광고) DRE수학학원\n${message || '메시지를 입력하세요'}\n\n무료수신거부 0507-1346-1125`;

  const isNightTime = (() => {
    const hour = new Date().getHours();
    return hour >= 21 || hour < 8;
  })();

  async function handleSend() {
    if (selectedRecipients.length === 0) {
      alert('수신자를 선택해주세요.');
      return;
    }
    if (!message.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    if (isNightTime) {
      const nightConfirm = confirm(
        '현재 야간 시간대(21:00~08:00)입니다.\n야간에는 광고성 메시지 발송이 제한됩니다.\n그래도 발송하시겠습니까?',
      );
      if (!nightConfirm) return;
    }

    const ok = confirm(`${selectedRecipients.length}명에게 친구톡을 발송하시겠습니까?`);
    if (!ok) return;

    setSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phones: selectedRecipients.map((r) => ({ phone: r.phone, name: r.name })),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: `${selectedRecipients.length}명에게 발송 요청 완료` });
      } else {
        setResult({ success: false, message: data.error || '발송 실패' });
      }
    } catch {
      setResult({ success: false, message: '네트워크 오류가 발생했습니다.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 유형 필터 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all ${
            typeFilter === 'all'
              ? 'bg-blue-100 text-blue-600 border border-blue-100'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
          }`}
        >
          전체
        </button>
        {(Object.entries(TYPE_LABEL) as [ConsultationType, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all ${
              typeFilter === key
                ? 'bg-blue-100 text-blue-600 border border-blue-100'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 수신자 목록 */}
      <div className="m-detail-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <label className="flex items-center gap-2.5 text-[13px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={toggleAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            전체 선택 ({filteredRecipients.length}명)
          </label>
          <span className="text-[13px] font-bold text-blue-500">
            {selectedPhones.size}명 선택
          </span>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
          {filteredRecipients.map((r) => (
            <label
              key={r.phone}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedPhones.has(r.phone)}
                onChange={() => toggleOne(r.phone)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-[15px] font-bold text-gray-900">{r.name}</span>
                <span className="text-[13px] text-gray-400 tabular-nums">
                  {r.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                {r.types.map((t) => (
                  <span key={t} className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${TYPE_COLOR[t]}`}>
                    {TYPE_LABEL[t]}
                  </span>
                ))}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 메시지 작성 */}
      <div className="m-detail-card p-5 space-y-4">
        <h3 className="text-[12px] font-extrabold text-gray-500 uppercase tracking-widest">메시지 작성</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
          rows={6}
          placeholder="발송할 메시지를 입력하세요..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none resize-none transition-colors"
        />
        <div className="text-right text-[13px] text-gray-400 font-medium tabular-nums">
          {message.length} / 1,000자
        </div>
      </div>

      {/* 미리보기 */}
      <div className="m-detail-card p-5 space-y-4">
        <h3 className="text-[12px] font-extrabold text-gray-500 uppercase tracking-widest">발송 미리보기</h3>
        <div className="bg-[#B2C7D9] rounded-2xl p-5 max-w-sm mx-auto">
          <div className="bg-[#FEE500] rounded-2xl p-4 shadow-sm">
            <p className="text-[14px] whitespace-pre-wrap text-gray-800 leading-relaxed">
              {previewMessage}
            </p>
          </div>
        </div>
      </div>

      {/* 야간 경고 */}
      {isNightTime && (
        <div className="m-detail-card p-4 border-l-4 border-yellow-400 bg-yellow-50">
          <p className="text-[14px] font-bold text-yellow-800">
            현재 야간 시간대(21:00~08:00)입니다. 야간에는 광고성 메시지 발송이 법적으로 제한됩니다.
          </p>
        </div>
      )}

      {/* 발송 결과 */}
      {result && (
        <div
          className={`m-detail-card p-4 border-l-4 ${
            result.success
              ? 'border-green-400 bg-green-50'
              : 'border-red-400 bg-red-50'
          }`}
        >
          <p className={`text-[14px] font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.message}
          </p>
        </div>
      )}

      {/* 발송 버튼 */}
      <button
        onClick={handleSend}
        disabled={sending || selectedPhones.size === 0 || !message.trim()}
        className="w-full py-3.5 rounded-xl text-white font-extrabold text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--color-dre-blue)] hover:bg-blue-800 shadow-md hover:shadow-lg"
      >
        {sending ? '발송 중...' : `${selectedPhones.size}명에게 친구톡 발송`}
      </button>
    </div>
  );
}
