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
    Send
} from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "진단 예약",
        desc: "온라인 또는 전화로 편리하게 테스트 일정을 예약합니다.",
        icon: <Calendar className="w-8 h-8" />,
        color: "bg-blue-100 text-blue-600"
    },
    {
        id: 2,
        title: "1:1 정밀 진단",
        desc: "약 60분간 학생의 현재 실력을 다각도로 심층 분석합니다.",
        icon: <ClipboardCheck className="w-8 h-8" />,
        color: "bg-indigo-100 text-indigo-600"
    },
    {
        id: 3,
        title: "결과 분석 상담",
        desc: "데이터 기반 분석 리포트로 원장님이 직접 심층 상담을 진행합니다.",
        icon: <MessageCircle className="w-8 h-8" />,
        color: "bg-purple-100 text-purple-600"
    },
    {
        id: 4,
        title: "반 배정 및 등록",
        desc: "학생 성향과 목표에 최적화된 반을 배정하고 학습 로드맵을 시작합니다.",
        icon: <CheckCircle2 className="w-8 h-8" />,
        color: "bg-teal-100 text-teal-600"
    }
];

const faqs = [
    {
        q: "진단 테스트는 어떤 내용인가요?",
        a: "단순한 레벨 테스트가 아닙니다. 이전 학년의 결손 부분부터 현재 학년의 심화 능력, 그리고 서술형 답안 작성 습관까지 종합적으로 분석하는 DRE만의 정밀 진단 시스템입니다."
    },
    {
        q: "수업 시간표는 어떻게 되나요?",
        a: "학생의 학년과 레벨에 따라 다양하게 구성되어 있습니다. 진단 테스트 후, 학생의 스케줄과 목표에 맞춰 최적의 반을 안내해 드립니다."
    },
    {
        q: "숙제 양은 얼마나 되나요?",
        a: "DRE는 무조건적인 '양치기' 숙제를 지양합니다. 학생이 충분히 소화하고 고민해볼 수 있는 적정량을 부여하며, 개인별 오답 노트와 취약 유형 보완 과제가 추가로 배부될 수 있습니다."
    },
    {
        q: "내신 기간에는 어떻게 수업하나요?",
        a: "시험 기간 4주 전부터 학교별 기출 분석 및 집중 대비 체제로 전환됩니다. 인근 학교의 출제 경향을 완벽히 분석한 자료로 실전 감각을 극대화합니다."
    }
];

export default function AdmissionDetail() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <section className="py-12 md:py-24 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Process Section */}
                <div className="mb-16 md:mb-32">
                    <div className="text-center mb-16">
                        <span className="text-[var(--color-dre-blue)] font-bold tracking-widest uppercase text-sm mb-4 block">Process</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 font-display">입학 절차 안내</h2>
                        <p className="text-gray-600 text-lg">
                            정확한 진단이 올바른 학습의 시작입니다.<br className="hidden md:block" />
                            체계적인 절차를 통해 최적의 학습 환경을 제안합니다.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[60px] left-0 w-full h-1 bg-gradient-to-r from-blue-100 via-purple-100 to-teal-100 -z-10" />

                        <div className="grid md:grid-cols-4 gap-8">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="relative group text-center"
                                >
                                    <div className="relative z-10 mb-6 inline-block">
                                        <div className={`w-20 h-20 ${step.color.replace('bg-', 'bg-white border-2 border-')} rounded-full flex items-center justify-center shadow-sm mx-auto group-hover:scale-110 transition-transform bg-white`}>
                                            {step.icon}
                                        </div>
                                    </div>
                                    <div className="text-center px-4">
                                        <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Step 0{step.id}</div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* FAQ Section */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-[var(--color-dre-blue)] pl-4">자주 묻는 질문</h3>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none bg-white"
                                    >
                                        <span className="font-bold text-gray-800 text-lg flex items-center gap-3">
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
                                                <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
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
                    <div id="apply-form" className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10" />

                        <div className="mb-8">
                            <span className="bg-[var(--color-dre-blue)] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">Reservation</span>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">1:1 정밀 진단 신청</h3>
                            <p className="text-gray-500">
                                학생의 현재 상황을 남겨주시면,<br />
                                담당자가 확인 후 24시간 이내에 연락드립니다.
                            </p>
                        </div>

                        <form className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">학생 이름</label>
                                    <input type="text" className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-dre-blue)] transition-all" placeholder="이름" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">학교 / 학년</label>
                                    <input type="text" className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-dre-blue)] transition-all" placeholder="예: OO중 2" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">학부모 연락처</label>
                                <input type="tel" className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-dre-blue)] transition-all" placeholder="숫자만 입력해 주세요" required />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">문의 내용 (선택)</label>
                                <textarea className="w-full px-5 py-3.5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-[var(--color-dre-blue)] transition-all h-32 resize-none" placeholder="현재 성적, 고민 사항, 희망 상담 시간 등을 자유롭게 남겨주세요." />
                            </div>

                            <button type="submit" className="w-full py-4 bg-gray-900 text-white font-bold text-lg rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 group">
                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                <span>상담 예약하기</span>
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-4 bg-gray-50 py-2 rounded-lg">
                                🔒 개인정보는 상담 예약 목적으로만 안전하게 사용됩니다.
                            </p>
                        </form>
                    </div>
                </div>

            </div>
        </section>
    );
}
