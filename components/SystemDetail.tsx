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
        desc: "완벽한 학습을 위한 마인드셋과 메타인지 점검",
        color: "from-blue-500 to-blue-600",
        steps: [
            { id: 1, title: '입실 & 기기 제출', desc: '학습 방해 요소를 차단하고 오직 공부에만 집중할 수 있는 환경을 조성합니다.', icon: <Smartphone className="w-6 h-6" /> },
            { id: 2, title: '태도 세팅', desc: '감사노트 작성을 통해 긍정적인 마인드셋을 갖추고 학습 의지를 다집니다.', icon: <BrainCircuit className="w-6 h-6" /> },
            { id: 3, title: '일일 테스트 & 진단', desc: '이전 학습 내용을 점검하고 오늘 공부할 분량과 목표를 정확히 설정합니다.', icon: <ClipboardCheck className="w-6 h-6" /> },
        ]
    },
    {
        phase: "PHASE 02",
        title: "몰입 & 개념 체화",
        desc: "본질을 꿰뚫는 개념 이해와 구조적 문제 해결",
        color: "from-indigo-600 to-blue-800",
        steps: [
            { id: 4, title: '개념 강의 & 노트 정리', desc: '단순 암기가 아닌 원리를 이해하는 개념 학습을 진행하며 나만의 개념 노트를 완성합니다.', icon: <BookOpen className="w-6 h-6" /> },
            { id: 5, title: '개념 확인 문제', desc: '학습한 개념을 바로 적용해보며 기본적인 이해도를 스스로 점검합니다.', icon: <CheckCircle2 className="w-6 h-6" /> },
            { id: 6, title: '필수 예제 풀이', desc: '대표 유형 문제를 통해 문제 해결의 논리적 구조와 접근법을 익힙니다.', icon: <Pencil className="w-6 h-6" /> },
        ]
    },
    {
        phase: "PHASE 03",
        title: "실전 & 피드백",
        desc: "어떤 문제도 풀어내는 응용력과 완전 학습",
        color: "from-blue-900 to-slate-900",
        steps: [
            { id: 7, title: '유제 풀이 (확인)', desc: '배운 내용을 바탕으로 숫자 변형 문제 등을 풀어보며 계산력을 다집니다.', icon: <FileText className="w-6 h-6" /> },
            { id: 8, title: '심화/변형 문제', desc: '다양한 변형 문제를 통해 개념을 응용하고 심화된 사고력을 기릅니다.', icon: <Repeat className="w-6 h-6" /> },
            { id: 9, title: '오답 분석 & 클리닉', desc: '틀린 원인을 철저히 분석하고 1:1 첨삭을 통해 모르는 부분을 완벽히 해결합니다.', icon: <Search className="w-6 h-6" /> },
            { id: 10, title: '과제 부여 & 귀가', desc: '학습의 연속성을 위해 개인별 맞춤 과제를 부여받고 하원합니다.', icon: <ClipboardCheck className="w-6 h-6" /> },
        ]
    }
];

export default function SystemDetail() {
    return (
        <section className="py-12 md:py-24 bg-gray-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Intro Header */}
                <div className="text-center mb-12 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1 bg-blue-100 text-[var(--color-dre-blue)] rounded-full text-sm font-bold mb-4"
                    >
                        Standard Process
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
                    >
                        성적을 바꾸는<br />
                        <span className="text-[var(--color-dre-blue)]">DRE 10단계 시스템</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
                    >
                        수학 실력은 우연히 만들어지지 않습니다.<br />
                        검증된 프로세스로 매일 꾸준히 쌓아올린 결과입니다.
                    </motion.p>
                </div>

                {/* Phases */}
                {/* Phases - Connected Timeline Layout */}
                <div className="relative space-y-24 before:absolute before:inset-0 before:ml-5 md:before:ml-[8.5rem] before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {phases.map((phase, phaseIndex) => (
                        <motion.div
                            key={phaseIndex}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="relative flex flex-col md:flex-row gap-8 md:gap-16 group"
                        >
                            {/* Phase Marker & Title (Left Side) */}
                            <div className="md:w-64 flex-shrink-0 flex md:flex-col items-center md:items-end md:text-right gap-4 md:gap-2">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center text-white font-bold text-sm shadow-lg z-10 relative group-hover:scale-110 transition-transform duration-300 ring-4 ring-white`}>
                                    {phaseIndex + 1}
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-[var(--color-dre-blue)] tracking-widest uppercase block mb-1">{phase.phase}</span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{phase.title}</h3>
                                    <p className="text-sm text-gray-500 mt-2 hidden md:block">{phase.desc}</p>
                                </div>
                            </div>

                            {/* Mobile Desc (Hidden on Desktop) */}
                            <div className="md:hidden pl-14 -mt-6 mb-4">
                                <p className="text-sm text-gray-500">{phase.desc}</p>
                            </div>

                            {/* Steps (Right Side) */}
                            <div className="flex-1 pb-12 border-b border-gray-100 last:border-0">
                                <div className="grid gap-6">
                                    {phase.steps.map((step, stepIndex) => (
                                        <div key={step.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300 flex gap-4 items-start group/step">
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover/step:text-[var(--color-dre-blue)] group-hover/step:bg-blue-50 transition-colors">
                                                {step.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                    {step.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 leading-relaxed">
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
                <div className="mt-16 mb-12">
                    <div className="relative bg-white border border-gray-100 rounded-2xl p-12 text-center overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-500">
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-[var(--color-dre-blue)] to-transparent opacity-20" />
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                        <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

                        <p className="text-[var(--color-dre-blue)] font-bold tracking-[0.2em] text-sm uppercase mb-6">
                            Education Philosophy
                        </p>

                        <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8 font-display flex flex-wrap justify-center items-center gap-x-2 md:gap-x-4">
                            <span className="hover:text-[var(--color-dre-blue)] transition-colors duration-300">Dream</span>
                            <span className="text-gray-300">·</span>
                            <span className="hover:text-[var(--color-dre-blue)] transition-colors duration-300">Rest</span>
                            <span className="text-gray-300">·</span>
                            <span className="hover:text-[var(--color-dre-blue)] transition-colors duration-300">Essence</span>
                        </h3>

                        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed mb-10 break-keep">
                            DRE의 시스템은 단순한 성적 향상을 넘어, 학생 스스로 꿈을 꾸고(Dream), 올바른 쉼(Rest)을 통해 학습의 본질(Essence)을 찾아가는 과정을 함께합니다.
                        </p>

                        <a
                            href="/admission"
                            className="inline-flex items-center justify-center px-8 py-3 bg-[var(--color-dre-blue)] text-white font-bold rounded-full hover:bg-[var(--color-dre-navy)] transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                        >
                            입학 상담 신청하기
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
