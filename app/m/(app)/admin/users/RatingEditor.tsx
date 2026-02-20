'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Save, Trash2, Plus, TrendingUp, Star } from 'lucide-react';

interface TopicSkill {
  rating: number;
  attempts: number;
  correct: number;
}

interface RatingData {
  overallRating: number;
  totalAttempts: number;
  totalCorrect: number;
  topicSkills: Record<string, TopicSkill>;
}

interface Props {
  userId: string;
  username: string;
  onClose: () => void;
}

function ratingLabel(r: number): { label: string; color: string } {
  if (r < 800)  return { label: '입문',   color: 'text-red-500' };
  if (r < 1000) return { label: '초급',   color: 'text-orange-500' };
  if (r < 1200) return { label: '중급',   color: 'text-violet-500' };
  if (r < 1400) return { label: '고급',   color: 'text-blue-500' };
  return              { label: '최상급', color: 'text-emerald-500' };
}

export default function RatingEditor({ userId, username, onClose }: Props) {
  const router = useRouter();
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [data,     setData]     = useState<RatingData | null>(null);

  // 편집 상태
  const [overall,  setOverall]  = useState(1000);
  const [topics,   setTopics]   = useState<Record<string, number>>({});
  const [deleted,  setDeleted]  = useState<Set<string>>(new Set());
  const [newTopic, setNewTopic] = useState('');
  const [newRating,setNewRating]= useState(1000);

  useEffect(() => {
    fetch(`/api/m/admin/users/${userId}/rating`)
      .then((r) => r.json())
      .then((d: RatingData) => {
        setData(d);
        setOverall(d.overallRating);
        const t: Record<string, number> = {};
        for (const [k, v] of Object.entries(d.topicSkills)) t[k] = v.rating;
        setTopics(t);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const topicPayload: Record<string, number | null> = {};
    for (const [t, r] of Object.entries(topics)) topicPayload[t] = r;
    for (const t of deleted) topicPayload[t] = null;

    const res = await fetch(`/api/m/admin/users/${userId}/rating`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overallRating: overall, topicSkills: topicPayload }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || '저장 실패');
    } else {
      router.refresh();
      onClose();
    }
    setSaving(false);
  };

  const addTopic = () => {
    const t = newTopic.trim();
    if (!t) return;
    setTopics((prev) => ({ ...prev, [t]: newRating }));
    setDeleted((prev) => { const s = new Set(prev); s.delete(t); return s; });
    setNewTopic('');
    setNewRating(1000);
  };

  const deleteTopic = (topic: string) => {
    setDeleted((prev) => new Set([...prev, topic]));
  };

  const restoreTopic = (topic: string) => {
    setDeleted((prev) => { const s = new Set(prev); s.delete(topic); return s; });
  };

  const { label: oLabel, color: oColor } = ratingLabel(overall);

  return (
    /* 오버레이 */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">ELO 레이팅 편집</p>
            <p className="text-base font-bold text-gray-900">{username}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="px-6 py-5 space-y-6">

            {/* 통합 레이팅 */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                <div className="flex items-center gap-1.5"><Star size={12} />통합 레이팅</div>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={100}
                  max={3000}
                  step={10}
                  value={overall}
                  onChange={(e) => setOverall(Number(e.target.value))}
                  className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono font-bold text-gray-900 focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
                <span className={`text-sm font-bold ${oColor}`}>{oLabel} 레벨</span>
                {data && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {data.totalAttempts}회 시도 · {data.totalCorrect}회 정답
                  </span>
                )}
              </div>
              <input
                type="range"
                min={100}
                max={3000}
                step={10}
                value={overall}
                onChange={(e) => setOverall(Number(e.target.value))}
                className="w-full mt-3 accent-[var(--color-dre-blue)]"
              />
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
                <span>100</span><span>800</span><span>1000</span><span>1200</span><span>1400</span><span>3000</span>
              </div>
            </div>

            {/* 주제별 레이팅 */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                <div className="flex items-center gap-1.5"><TrendingUp size={12} />주제별 레이팅</div>
              </label>

              {Object.keys(topics).length === 0 && deleted.size === 0 ? (
                <p className="text-sm text-gray-400 py-3">아직 주제별 기록이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(topics).map(([topic, rating]) => {
                    const isDel = deleted.has(topic);
                    const { label, color } = ratingLabel(rating);
                    return (
                      <div
                        key={topic}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                          isDel ? 'bg-red-50 border-red-100 opacity-50' : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <span className={`text-sm font-bold flex-1 ${isDel ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {topic}
                        </span>
                        {!isDel && (
                          <>
                            <input
                              type="number"
                              min={100}
                              max={3000}
                              step={10}
                              value={rating}
                              onChange={(e) => setTopics((prev) => ({ ...prev, [topic]: Number(e.target.value) }))}
                              className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-xs font-mono font-bold text-center focus:border-[var(--color-dre-blue)] focus:ring-2 focus:ring-blue-500/10 outline-none"
                            />
                            <span className={`text-xs font-bold w-12 ${color}`}>{label}</span>
                          </>
                        )}
                        <button
                          onClick={() => isDel ? restoreTopic(topic) : deleteTopic(topic)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDel
                              ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                              : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                          }`}
                        >
                          {isDel ? <Plus size={13} /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 새 주제 추가 */}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  placeholder="새 주제명"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTopic(); } }}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-[var(--color-dre-blue)] focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
                <input
                  type="number"
                  min={100}
                  max={3000}
                  step={10}
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="w-20 px-2 py-2 border border-gray-200 rounded-xl text-sm font-mono text-center focus:border-[var(--color-dre-blue)] outline-none"
                />
                <button
                  onClick={addTopic}
                  disabled={!newTopic.trim()}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 disabled:opacity-40 transition-colors"
                >
                  <Plus size={14} />추가
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 저장 버튼 */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-[var(--color-dre-blue)] text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
