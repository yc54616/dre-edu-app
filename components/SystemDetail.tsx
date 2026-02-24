'use client';

import { motion } from 'framer-motion';
import {
    ClipboardCheck,
    BrainCircuit,
    BookOpen,
    Pencil,
    CheckCircle2,
    Repeat,
    FileText,
    Search,
    Smartphone
} from 'lucide-react';

const phases = [
    {
        phase: "PHASE 01",
        title: "준비 & 진단",
        desc: "공부 시작 전, 마음가짐과 현재 상태 점검",
        color: "from-blue-500 to-blue-600",
        steps: [
            { id: 1, title: '입실 & 기기 제출', desc: '핸드폰을 맡기고 공부에만 집중할 수 있는 환경을 만듭니다.', icon: <Smartphone className="w-6 h-6" /> },
            { id: 2, title: '태도 세팅', desc: '감사노트를 쓰며 마음을 정리하고 학습 의지를 다집니다.', icon: <BrainCircuit className="w-6 h-6" /> },
            { id: 3, title: '일일 테스트 & 진단', desc: '어제 배운 내용을 확인하고 오늘 공부할 분량과 목표를 정합니다.', icon: <ClipboardCheck className="w-6 h-6" /> },
        ]
    },
    {
        phase: "PHASE 02",
        title: "몰입 & 개념 체화",
        desc: "원리부터 이해하고, 문제에 적용하는 시간",
        color: "from-indigo-600 to-blue-800",
        steps: [
            { id: 4, title: '개념 강의 & 노트 정리', desc: '암기가 아니라 원리를 이해하는 수업을 듣고, 나만의 개념 노트를 정리합니다.', icon: <BookOpen className="w-6 h-6" /> },
            { id: 5, title: '개념 확인 문제', desc: '배운 개념을 바로 적용해보면서 이해도를 스스로 확인합니다.', icon: <CheckCircle2 className="w-6 h-6" /> },
            { id: 6, title: '필수 예제 풀이', desc: '대표 유형 문제를 풀면서 풀이 흐름과 접근법을 익힙니다.', icon: <Pencil className="w-6 h-6" /> },
        ]
    },
    {
        phase: "PHASE 03",
        title: "실전 & 피드백",
        desc: "실전 문제 풀이와 오답 점검까지 마무리",
        color: "from-blue-900 to-slate-900",
        steps: [
            { id: 7, title: '유제 풀이 (확인)', desc: '숫자만 바뀐 문제를 풀어보면서 계산 감각을 잡습니다.', icon: <FileText className="w-6 h-6" /> },
            { id: 8, title: '심화/변형 문제', desc: '변형 문제를 통해 개념을 다른 상황에 적용하는 연습을 합니다.', icon: <Repeat className="w-6 h-6" /> },
            { id: 9, title: '오답 분석 & 클리닉', desc: '틀린 이유를 분석하고 1:1 첨삭으로 모르는 부분을 잡습니다.', icon: <Search className="w-6 h-6" /> },
            { id: 10, title: '과제 부여 & 귀가', desc: '오늘 배운 내용에 맞는 과제를 받고 하원합니다.', icon: <ClipboardCheck className="w-6 h-6" /> },
        ]
    }
];

export default function SystemDetail() {
    return (
        <section className="relative overflow-hidden bg-gray-50 py-12 md:py-24">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Intro Header */}
                <div className="mb-12 text-center md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1 text-xs font-bold text-[var(--color-dre-blue)] sm:text-sm"
                    >
                        Standard Process
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mb-5 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:mb-6 md:text-5xl"
                    >
                        성적을 바꾸는<br />
                        <span className="text-[var(--color-dre-blue)]">DRE 10단계 시스템</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl"
                    >
                        수학 실력은 갑자기 오르지 않습니다.<br />
                        매일 같은 과정을 반복해서 쌓아올린 결과입니다.
                    </motion.p>
                </div>

                {/* Phases */}
                {/* Phases - Connected Timeline Layout */}
                <div className="relative space-y-14 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent md:space-y-24 md:before:ml-[8.5rem] md:before:translate-x-0">
                    {phases.map((phase, phaseIndex) => (
                        <motion.div
                            key={phaseIndex}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="group relative flex flex-col gap-6 md:flex-row md:gap-16"
                        >
                            {/* Phase Marker & Title (Left Side) */}
                            <div className="flex flex-shrink-0 items-center gap-3 md:w-64 md:flex-col md:items-end md:gap-2 md:text-right">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center text-white font-bold text-sm shadow-lg z-10 relative group-hover:scale-110 transition-transform duration-300 ring-4 ring-white`}>
                                    {phaseIndex + 1}
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-[var(--color-dre-blue)] tracking-widest uppercase block mb-1">{phase.phase}</span>
                                    <h3 className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl md:text-3xl">{phase.title}</h3>
                                    <p className="text-sm text-gray-500 mt-2 hidden md:block">{phase.desc}</p>
                                </div>
                            </div>

                            {/* Mobile Desc (Hidden on Desktop) */}
                            <div className="-mt-4 mb-3 pl-14 md:hidden">
                                <p className="text-sm text-gray-500">{phase.desc}</p>
                            </div>

                            {/* Steps (Right Side) */}
                            <div className="flex-1 border-b border-gray-100 pb-10 last:border-0 md:pb-12">
                                <div className="grid gap-6">
                                    {phase.steps.map((step) => (
                                        <div key={step.id} className="group/step flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-shadow duration-300 hover:shadow-md sm:gap-4 sm:p-6">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors group-hover/step:bg-blue-50 group-hover/step:text-[var(--color-dre-blue)] sm:h-12 sm:w-12">
                                                {step.icon}
                                            </div>
                                            <div>
                                                <h4 className="mb-1 flex items-center gap-2 font-bold text-gray-900">
                                                    {step.title}
                                                </h4>
                                                <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                                                    {step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Brand Identity */}
                <div className="mb-12 mt-14 md:mt-16">
                    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-lg transition-all duration-500 hover:shadow-xl sm:p-9 md:p-12">
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[var(--color-dre-blue)] to-transparent opacity-20" />
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                        <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                        <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-dre-blue)] sm:mb-6 sm:text-sm">
                            Education Philosophy
                        </p>

                        <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8 font-display flex flex-wrap justify-center items-center gap-x-2 md:gap-x-4">
                            <span className="hover:text-[var(--color-dre-blue)] transition-colors duration-300">Dream</span>
                            <span className="text-gray-300">·</span>
                            <span className="hover:text-[var(--color-dre-blue)] transition-colors duration-300">Rest</span>
                            <span className="text-gray-300">·</span>
                            <span className="hover:text-[var(--color-dre-blue)] transition-colors duration-300">Essence</span>
                        </h3>

                        <p className="mx-auto mb-8 max-w-lg break-keep text-sm leading-relaxed text-gray-500 sm:mb-10 sm:text-base">
                            DRE는 성적만 올리는 곳이 아닙니다. 학생이 스스로 꿈을 꾸고(Dream), 제대로 쉬면서(Rest), 공부의 본질(Essence)을 찾아가도록 함께합니다.
                        </p>

                        <a
                            href="/admission"
                            className="inline-flex items-center justify-center rounded-full bg-[var(--color-dre-blue)] px-6 py-3 text-sm font-bold text-white shadow-md transition-colors duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-dre-navy)] hover:shadow-lg sm:px-8 sm:text-base"
                        >
                            입학 상담 신청하기
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
