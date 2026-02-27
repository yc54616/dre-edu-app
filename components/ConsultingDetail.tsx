'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    PieChart,
    TrendingUp,
    Target,
    Award,
    Calendar,
    FileSearch,
    Users,
    CheckCircle2,
    Send,
    MessageSquare,
    Phone,
    Loader2
} from 'lucide-react';

const factors = [
    {
        icon: <PieChart className="w-8 h-8" />,
        title: "성적·기록 분석",
        desc: "내신, 모의고사, 학생부 전체를 함께 보며 현재 위치를 정확히 파악합니다.",
        accent: "border-blue-200 text-blue-600"
    },
    {
        icon: <Target className="w-8 h-8" />,
        title: "지원 전략 설계",
        desc: "목표 대학·학과에 맞춰 수시와 정시 비중, 지원 범위를 구체적으로 정합니다.",
        accent: "border-indigo-200 text-indigo-600"
    },
    {
        icon: <Users className="w-8 h-8" />,
        title: "실행·점검 관리",
        desc: "원서 접수까지 필요한 준비를 일정별로 나누고 꾸준히 점검합니다.",
        accent: "border-purple-200 text-purple-600"
    }
];

const roadmap = [
    {
        icon: <FileSearch className="w-8 h-8" />,
        step: "Step 01",
        title: "기초 진단",
        desc: "학생부, 모의고사 성적, 학습 성향을 종합적으로 확인합니다.",
        accent: "border-blue-200 text-blue-600"
    },
    {
        icon: <TrendingUp className="w-8 h-8" />,
        step: "Step 02",
        title: "전략 수립",
        desc: "수시·정시 지원 가능 범위를 정하고 현실적인 목표를 조정합니다.",
        accent: "border-indigo-200 text-indigo-600"
    },
    {
        icon: <Calendar className="w-8 h-8" />,
        step: "Step 03",
        title: "로드맵 실행",
        desc: "시기별 학습 계획과 준비 항목을 단계별로 실행합니다.",
        accent: "border-purple-200 text-purple-600"
    },
    {
        icon: <Award className="w-8 h-8" />,
        step: "Step 04",
        title: "최종 점검",
        desc: "서류, 면접, 원서 접수 직전 최종 체크를 마무리합니다.",
        accent: "border-teal-200 text-teal-600"
    }
];

export default function ConsultingDetail() {
    const [form, setForm] = useState({ name: '', phone: '', schoolGrade: '', currentScore: '', targetUniv: '', direction: '', message: '', agreeMarketing: false });
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
                body: JSON.stringify({ ...form, type: 'consulting' }),
            });
            if (!res.ok) throw new Error();
            setResult('success');
            setForm({ name: '', phone: '', schoolGrade: '', currentScore: '', targetUniv: '', direction: '', message: '', agreeMarketing: false });
        } catch {
            setResult('error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="bg-white">

            {/* What is Consulting */}
            <div className="relative overflow-hidden bg-white py-12 md:py-24">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="mb-10 text-center md:mb-16"
                    >
                        <span className="text-[var(--color-dre-blue)] font-bold tracking-widest uppercase text-sm mb-4 block">Consulting</span>
                        <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-900 md:mb-6 md:text-5xl">
                            입시컨설팅이란
                        </h2>
                        <p className="mx-auto max-w-2xl text-base text-gray-600 md:text-lg">
                            현재 성적과 목표를 함께 분석하고,<br className="hidden md:block" />
                            실제 지원 전략으로 연결하는 1:1 맞춤 컨설팅입니다.
                        </p>
                    </motion.div>

                    <div className="grid gap-6 md:grid-cols-3 md:gap-8">
                        {factors.map((item, index) => (
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

            {/* Consulting Roadmap */}
            <div className="bg-gray-50 py-12 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="mb-10 text-center md:mb-16"
                    >
                        <span className="text-[var(--color-dre-blue)] font-bold tracking-widest uppercase text-sm mb-4 block">Roadmap</span>
                        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">입시컨설팅 진행 순서</h2>
                    </motion.div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[60px] left-0 w-full h-1 bg-gradient-to-r from-blue-100 via-purple-100 to-teal-100 -z-10" />

                        <div className="grid gap-6 md:grid-cols-4 md:gap-8">
                            {roadmap.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="group relative text-center"
                                >
                                    <div className="relative z-10 mb-6 inline-block">
                                        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform group-hover:scale-110 sm:h-20 sm:w-20 ${item.accent}`}>
                                            {item.icon}
                                        </div>
                                    </div>
                                    <div className="text-center px-4">
                                        <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">{item.step}</div>
                                        <h3 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl">{item.title}</h3>
                                        <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Audience */}
            <div className="bg-white py-12 md:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 md:mb-16">
                        <h2 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:mb-8">
                            이런 경우<br />
                            <span className="text-[var(--color-dre-blue)]">입시컨설팅</span>이 도움이 됩니다
                        </h2>
                        <ul className="grid gap-4 md:grid-cols-2">
                            {[
                                "현재 성적으로 어디까지 지원 가능한지 궁금한 학생",
                                "수시와 정시 방향을 아직 정하지 못해 고민인 학생",
                                "서류·면접 준비를 체계적으로 시작하고 싶은 학생",
                                "남은 기간에 맞는 현실적인 입시 계획이 필요한 학생"
                            ].map((text, i) => (
                                <li key={i} className="flex items-start rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                    <CheckCircle2 className="w-6 h-6 text-[var(--color-dre-blue)] mr-3 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700 sm:text-base">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Buttons */}
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

                    {/* Consulting Form */}
                    <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] sm:p-8 md:rounded-[2.5rem] md:p-12">
                        <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[var(--color-dre-blue)] to-indigo-600" />

                        <div className="mb-8 text-center sm:mb-10">
                            <h3 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">입시컨설팅 상담 신청</h3>
                            <p className="text-sm text-gray-500 sm:text-base">기본 정보를 남겨주시면 확인 후 연락드립니다.</p>
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

                            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                                <div className="space-y-2">
                                    <label className="ml-1 text-sm font-bold text-gray-700">학교 / 학년</label>
                                    <input
                                        type="text"
                                        value={form.schoolGrade}
                                        onChange={(e) => setForm({ ...form, schoolGrade: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:bg-white focus:ring-1 focus:ring-[var(--color-dre-blue)] sm:px-5 sm:py-4"
                                        placeholder="예: OO고 2학년"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="ml-1 text-sm font-bold text-gray-700">현재 성적대</label>
                                    <input
                                        type="text"
                                        value={form.currentScore}
                                        onChange={(e) => setForm({ ...form, currentScore: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:bg-white focus:ring-1 focus:ring-[var(--color-dre-blue)] sm:px-5 sm:py-4"
                                        placeholder="예: 내신 2등급, 모의고사 수학 85점"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                                <div className="space-y-2">
                                    <label className="ml-1 text-sm font-bold text-gray-700">목표 대학 / 학과</label>
                                    <input
                                        type="text"
                                        value={form.targetUniv}
                                        onChange={(e) => setForm({ ...form, targetUniv: e.target.value })}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:bg-white focus:ring-1 focus:ring-[var(--color-dre-blue)] sm:px-5 sm:py-4"
                                        placeholder="예: 서울권 경영학과"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="ml-1 text-sm font-bold text-gray-700">수시 / 정시 방향</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['수시 중심', '정시 중심', '미정'].map((option) => (
                                            <label key={option} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="direction"
                                                    className="peer sr-only"
                                                    checked={form.direction === option}
                                                    onChange={() => setForm({ ...form, direction: option })}
                                                />
                                                <div className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-center text-sm font-medium text-gray-600 transition-all peer-checked:border-transparent peer-checked:bg-[var(--color-dre-blue)] peer-checked:text-white sm:py-3.5">
                                                    {option}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="ml-1 text-sm font-bold text-gray-700">추가 문의 내용</label>
                                <textarea
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="h-28 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-[var(--color-dre-blue)] focus:bg-white focus:ring-1 focus:ring-[var(--color-dre-blue)] sm:h-32 sm:px-5 sm:py-4"
                                    placeholder="현재 고민이나 궁금한 점을 자유롭게 남겨주세요."
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
                                <span>{submitting ? '신청 중...' : '입시컨설팅 상담 신청하기'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </section>
    );
}
