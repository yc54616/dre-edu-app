'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  MonitorPlay,
  Clock,
  UserCheck,
  Send,
  ClipboardList,
  BarChart3,
  BookOpen,
  PlayCircle,
  Loader2,
} from 'lucide-react';

const benefits = [
  {
    icon: <Clock className="h-8 w-8" />,
    title: '학습 시간 관리',
    desc: '온라인 수업이라 이동 시간 없이, 수업과 복습 시간을 안정적으로 확보합니다.',
    accent: 'border-blue-200 text-blue-600',
  },
  {
    icon: <MonitorPlay className="h-8 w-8" />,
    title: '실시간 질문 중심 수업',
    desc: '녹화가 아닌 실시간 수업이라, 수업 중 바로 질문하고 바로 정리합니다.',
    accent: 'border-indigo-200 text-indigo-600',
  },
  {
    icon: <UserCheck className="h-8 w-8" />,
    title: '개인별 진도 관리',
    desc: '진도, 과제, 오답 루틴을 학생 상황에 맞게 조정해 운영합니다.',
    accent: 'border-purple-200 text-purple-600',
  },
];

const steps = [
  {
    icon: <ClipboardList className="w-8 h-8" />,
    title: '상담 신청',
    desc: '학생 정보와 현재 고민을 먼저 남겨주세요.',
    accent: 'border-blue-200 text-blue-600',
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: '기초 진단',
    desc: '성취도와 학습 습관을 확인해 출발점을 잡습니다.',
    accent: 'border-indigo-200 text-indigo-600',
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: '수업 설계',
    desc: '목표에 맞는 주간 계획과 과제 루틴을 정리합니다.',
    accent: 'border-purple-200 text-purple-600',
  },
  {
    icon: <PlayCircle className="w-8 h-8" />,
    title: '코칭 시작',
    desc: '수업 후 피드백을 반영해 계속 보정합니다.',
    accent: 'border-teal-200 text-teal-600',
  },
];

export default function CoachingDetail() {
  const [form, setForm] = useState({ name: '', phone: '', gradeLevel: '', message: '', agreeMarketing: false });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!/^01[016789]\d{7,8}$/.test(phoneDigits)) {
      alert('올바른 연락처를 입력해주세요. (예: 010-0000-0000)');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'coaching' }),
      });
      if (!res.ok) throw new Error();
      setResult('success');
      setForm({ name: '', phone: '', gradeLevel: '', message: '', agreeMarketing: false });
    } catch {
      setResult('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white">
      {/* Benefits */}
      <div className="relative overflow-hidden bg-gray-50 py-12 md:py-24">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] animate-blob rounded-full bg-blue-100/50 opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[600px] w-[600px] animate-blob rounded-full bg-indigo-100/50 opacity-30 blur-3xl animation-delay-2000" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-10 text-center md:mb-16"
          >
            <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-[var(--color-dre-blue)]">Online Coaching</span>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-5xl">
              온라인 수학 코칭
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
              20명 이하 소규모 온라인 수업으로,<br className="hidden md:block" />
              학생마다 다른 출발점에 맞춰 꾸준히 올리는 방식입니다.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {benefits.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] md:p-8"
              >
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 sm:mb-6 sm:h-20 sm:w-20 ${item.accent}`}>
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 sm:text-base">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="border-b border-gray-100 py-12 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-10 text-center md:mb-16"
          >
            <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-[var(--color-dre-blue)]">Process</span>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">온라인 수학 코칭 진행 순서</h2>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-[60px] left-0 w-full h-1 bg-gradient-to-r from-blue-100 via-purple-100 to-teal-100 -z-10" />

            <div className="grid gap-6 md:grid-cols-4 md:gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="group relative text-center"
                >
                  <div className="relative z-10 mb-6 inline-block">
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform group-hover:scale-110 sm:h-20 sm:w-20 ${step.accent}`}>
                      {step.icon}
                    </div>
                  </div>
                  <div className="text-center px-4">
                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Step 0{index + 1}</div>
                    <h3 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact + Form */}
      <div className="bg-white py-12 md:pb-24 md:pt-12 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 grid gap-4 md:mb-16 md:grid-cols-2 md:gap-6">
            <a
              href="http://pf.kakao.com/_Lbbxgxj/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center rounded-2xl bg-[#FAE100] p-4 shadow-md transition-colors hover:bg-[#FDD835] sm:p-6"
            >
              <div className="mr-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/50 text-[#3C1E1E] sm:mr-4 sm:h-12 sm:w-12">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#3C1E1E] sm:text-lg">카카오톡 봇 접수</h3>
                <p className="text-sm text-[#3C1E1E]/80">신청 접수와 진행 안내를 한 번에 관리합니다.</p>
              </div>
              <div className="ml-auto hidden text-[#3C1E1E] opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                &rarr;
              </div>
            </a>

            <a
              href="tel:050713461125"
              className="group flex items-center rounded-2xl bg-[var(--color-dre-blue)] p-4 shadow-md transition-colors hover:bg-blue-800 sm:p-6"
            >
              <div className="mr-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white sm:mr-4 sm:h-12 sm:w-12">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white sm:text-lg">전화 상담</h3>
                <p className="text-sm text-blue-100">0507-1346-1125</p>
              </div>
              <div className="ml-auto hidden text-white opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                &rarr;
              </div>
            </a>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] sm:p-8 md:rounded-[2.5rem] md:p-12">
            <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[var(--color-dre-blue)] to-indigo-600" />

            <div className="mb-8 text-center sm:mb-10">
              <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">온라인 수학 코칭 상담 신청</h3>
              <p className="text-sm text-gray-500 sm:text-base">기본 정보와 문의 내용을 남겨주시면 확인 후 연락드립니다.</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                <div className="space-y-2">
                  <label className="ml-1 text-sm font-bold text-gray-700">학생 이름</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:bg-white focus:ring-1 focus:ring-[var(--color-dre-blue)] sm:px-5 sm:py-4"
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-sm font-bold text-gray-700">연락처</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                      const formatted = digits.length <= 3 ? digits : digits.length <= 7 ? `${digits.slice(0, 3)}-${digits.slice(3)}` : `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
                      setForm({ ...form, phone: formatted });
                    }}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:bg-white focus:ring-1 focus:ring-[var(--color-dre-blue)] sm:px-5 sm:py-4"
                    placeholder="010-0000-0000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold text-gray-700">학교 / 학년</label>
                <div className="grid grid-cols-2 gap-3">
                  {['중등', '고등'].map((grade) => (
                    <label key={grade} className="cursor-pointer">
                      <input
                        type="radio"
                        name="grade"
                        className="peer sr-only"
                        checked={form.gradeLevel === grade}
                        onChange={() => setForm({ ...form, gradeLevel: grade })}
                      />
                      <div className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-center font-medium text-gray-600 transition-all peer-checked:border-transparent peer-checked:bg-[var(--color-dre-blue)] peer-checked:text-white">
                        {grade}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-bold text-gray-700">문의 내용</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="h-28 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:bg-white focus:ring-1 focus:ring-[var(--color-dre-blue)] sm:h-32 sm:px-5 sm:py-4"
                  placeholder="현재 수학 성적, 고민되는 단원, 원하는 목표를 남겨주세요."
                />
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                카카오톡 봇으로 접수하면 신청 단계, 피드백 일정, 진행 상태를 한 화면에서 확인할 수 있습니다.
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={form.agreeMarketing}
                  onChange={(e) => setForm({ ...form, agreeMarketing: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[var(--color-dre-blue)] focus:ring-blue-200"
                />
                [선택] 혜택/이벤트 정보 수신 동의
              </label>

              {result === 'success' && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">
                  상담 신청이 완료되었습니다. 확인 후 연락드리겠습니다.
                </div>
              )}
              {result === 'error' && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 font-medium">
                  신청 중 오류가 발생했습니다. 다시 시도해주세요.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 font-bold text-white shadow-lg transition-colors hover:bg-black disabled:opacity-50 sm:mt-4 sm:py-5"
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="transition-transform group-hover:translate-x-1" />}
                <span>{submitting ? '신청 중...' : '상담 신청하기'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
