'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    ClipboardCheck,
    MessageCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Send,
    Loader2
} from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "진단 예약",
        desc: "온라인 또는 전화로 테스트 일정을 예약합니다.",
        icon: <Calendar className="w-8 h-8" />,
        accent: "border-blue-200 text-blue-600"
    },
    {
        id: 2,
        title: "1:1 정밀 진단",
        desc: "약 60분간 학생의 현재 실력을 꼼꼼하게 확인합니다.",
        icon: <ClipboardCheck className="w-8 h-8" />,
        accent: "border-indigo-200 text-indigo-600"
    },
    {
        id: 3,
        title: "결과 분석 상담",
        desc: "분석 결과를 바탕으로 원장님이 직접 상담합니다.",
        icon: <MessageCircle className="w-8 h-8" />,
        accent: "border-purple-200 text-purple-600"
    },
    {
        id: 4,
        title: "반 배정 및 등록",
        desc: "학생에게 맞는 반을 배정하고 학습 계획을 시작합니다.",
        icon: <CheckCircle2 className="w-8 h-8" />,
        accent: "border-teal-200 text-teal-600"
    }
];

const faqs = [
    {
        q: "진단 테스트는 어떤 내용인가요?",
        a: "단순한 레벨 테스트가 아닙니다. 이전 학년에서 빠진 부분, 현재 학년 심화 수준, 서술형 답안 습관까지 함께 봅니다."
    },
    {
        q: "수업 시간표는 어떻게 되나요?",
        a: "학년과 수준에 따라 여러 반이 있습니다. 진단 후 학생 일정과 목표에 맞는 반을 안내드립니다."
    },
    {
        q: "숙제 양은 얼마나 되나요?",
        a: "많이 푸는 것보다 제대로 푸는 게 중요합니다. 학생이 소화할 수 있는 양만 내고, 오답 노트와 취약 유형 보완 과제가 추가될 수 있습니다."
    },
    {
        q: "내신 기간에는 어떻게 수업하나요?",
        a: "시험 4주 전부터 학교별 기출 분석과 집중 대비로 전환합니다. 인근 학교 출제 경향에 맞춘 자료로 실전 연습을 합니다."
    }
];

export default function AdmissionDetail() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [form, setForm] = useState({ name: '', phone: '', schoolGrade: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<'success' | 'error' | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                body: JSON.stringify({ ...form, type: 'admission' }),
            });
            if (!res.ok) throw new Error();
            setResult('success');
            setForm({ name: '', phone: '', schoolGrade: '', message: '' });
        } catch {
            setResult('error');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <section className="min-h-screen bg-gray-50 py-12 md:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Process Section */}
                <div className="mb-16 md:mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="mb-10 text-center md:mb-16"
                    >
                        <span className="text-[var(--color-dre-blue)] font-bold tracking-widest uppercase text-sm mb-4 block">Process</span>
                        <h2 className="mb-4 text-3xl font-bold text-gray-900 font-display md:mb-6 md:text-5xl">입학 절차 안내</h2>
                        <p className="text-base text-gray-600 md:text-lg">
                            정확한 진단이 올바른 학습의 시작입니다.<br className="hidden md:block" />
                            아래 순서대로 진행됩니다.
                        </p>
                    </motion.div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[60px] left-0 w-full h-1 bg-gradient-to-r from-blue-100 via-purple-100 to-teal-100 -z-10" />

                        <div className="grid gap-6 md:grid-cols-4 md:gap-8">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.id}
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
                                        <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Step 0{step.id}</div>
                                        <h3 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl">{step.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* FAQ Section */}
                    <div>
                        <h3 className="mb-6 border-l-4 border-[var(--color-dre-blue)] pl-4 text-xl font-bold text-gray-900 sm:mb-8 sm:text-2xl">자주 묻는 질문</h3>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="flex w-full items-center justify-between bg-white p-4 text-left focus:outline-none sm:p-6"
                                    >
                                        <span className="flex items-center gap-2 text-base font-bold text-gray-800 sm:gap-3 sm:text-lg">
                                            <span className="text-[var(--color-dre-blue)]">Q.</span> {faq.q}
                                        </span>
                                        {openFaq === index ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-gray-50"
                                            >
                                                <div className="border-t border-gray-100 p-4 pt-0 text-sm leading-relaxed text-gray-600 sm:p-6 sm:pt-0 sm:text-base">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inquiry Form */}
                    <div id="apply-form" className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-5 shadow-2xl sm:p-8 md:rounded-[2.5rem] md:p-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10" />

                        <div className="mb-6 sm:mb-8">
                            <span className="bg-[var(--color-dre-blue)] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">Reservation</span>
                            <h3 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">1:1 정밀 진단 신청</h3>
                            <p className="text-sm text-gray-500 sm:text-base">
                                학생의 현재 상황을 남겨주시면,<br />
                                담당자가 확인 후 24시간 이내에 연락드립니다.
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">학생 이름</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-dre-blue)] transition-all"
                                        placeholder="이름"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">학교 / 학년</label>
                                    <input
                                        type="text"
                                        value={form.schoolGrade}
                                        onChange={(e) => setForm({ ...form, schoolGrade: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-dre-blue)] transition-all"
                                        placeholder="예: OO중 2"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">연락처</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                                        const formatted = digits.length <= 3 ? digits : digits.length <= 7 ? `${digits.slice(0,3)}-${digits.slice(3)}` : `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`;
                                        setForm({ ...form, phone: formatted });
                                    }}
                                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-dre-blue)] transition-all"
                                    placeholder="010-0000-0000"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">문의 내용 (선택)</label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-dre-blue)] transition-all h-32 resize-none"
                                    placeholder="현재 성적, 고민 사항, 희망 상담 시간 등을 자유롭게 남겨주세요."
                                />
                            </div>

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
                                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-black disabled:opacity-50 sm:py-4 sm:text-lg"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                <span>{submitting ? '신청 중...' : '상담 예약하기'}</span>
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-4 bg-gray-50 py-2 rounded-lg">
                                개인정보는 상담 예약 목적으로만 안전하게 사용됩니다.
                            </p>
                        </form>
                    </div>
                </div>

            </div>
        </section>
    );
}
