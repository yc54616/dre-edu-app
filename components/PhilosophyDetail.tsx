'use client';

import { motion } from 'framer-motion';
import {
    Rocket,
    HeartHandshake,
    Microscope,
    XCircle,
    CheckCircle2,
    Quote
} from 'lucide-react';

const values = [
    {
        char: "D",
        word: "Dream",
        kor: "꿈과 비전",
        desc: "목표가 분명하면, 공부는 과정이 됩니다.",
        detail: "막연히 공부하는 것과 목표를 가지고 공부하는 것은 결과가 다릅니다. '왜 공부해야 하는지'를 스스로 알게 되면, 성적은 자연스럽게 따라옵니다. DRE는 그 목표를 함께 찾아갑니다.",
        color: "from-blue-500 to-indigo-600",
        bgPattern: "bg-[url('/pattern-dream.svg')]", // Placeholder for pattern class
        icon: <Rocket className="w-12 h-12 mb-6 text-blue-200" />
    },
    {
        char: "R",
        word: "Rest",
        kor: "쉼과 회복",
        desc: "충분한 휴식이 더 높은 집중력을 만듭니다.",
        detail: "무조건 오래 앉아있는 게 공부가 아닙니다. 제대로 쉬어야 집중력도 올라갑니다. DRE는 학생이 스스로 컨디션을 관리하고, 공부 에너지를 유지하는 법을 알려줍니다.",
        color: "from-teal-600 to-emerald-700",
        bgPattern: "bg-[url('/pattern-rest.svg')]",
        icon: <HeartHandshake className="w-12 h-12 mb-6 text-teal-200" />
    },
    {
        char: "E",
        word: "Essence",
        kor: "본질과 원리",
        desc: "요령이 아닌, 수학의 원리를 이해합니다.",
        detail: "유형만 외우는 공부는 고등 심화에서 막힙니다. '왜 이렇게 되는지'를 계속 물어보고 파고드는 것, 그게 진짜 수학 실력입니다.",
        color: "from-indigo-900 to-slate-900",
        bgPattern: "bg-[url('/pattern-essence.svg')]",
        icon: <Microscope className="w-12 h-12 mb-6 text-indigo-200" />
    }
];

export default function PhilosophyDetail() {
    return (
        <section className="bg-gray-50 pb-8 md:pb-20">

            {/* Intro Message */}
            <div className="mx-auto max-w-4xl px-4 py-10 text-center md:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-[var(--color-dre-blue)] font-bold tracking-widest uppercase text-sm mb-4 block">Our Core Values</span>
                    <h2 className="mb-6 break-keep text-3xl font-bold leading-tight text-gray-900 font-display sm:text-4xl md:mb-8 md:text-5xl">
                        &ldquo;점수 그 이상,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">스스로 성장하는 힘을 기릅니다</span>&rdquo;
                    </h2>
                    <div className="w-20 h-1 bg-gray-200 mx-auto mb-8" />
                    <p className="break-keep text-base leading-relaxed text-gray-600 sm:text-lg md:text-xl">
                        DRE는 문제 풀이 기술만 가르치는 곳이 아닙니다.<br className="hidden md:block" />
                        수학을 통해 생각하는 힘과 끝까지 해내는 습관을 만듭니다.
                    </p>
                </motion.div>
            </div>

            {/* Value Cards (Vertical Scroll) */}
            <div className="max-w-6xl mx-auto px-4 space-y-8 md:space-y-12">
                {values.map((item) => (
                    <motion.div
                        key={item.char}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className="group relative overflow-hidden rounded-3xl bg-white shadow-xl"
                    >
                        <div className="grid min-h-[320px] md:min-h-[400px] md:grid-cols-2">
                            {/* Visual Side */}
                            <div className={`relative flex flex-col justify-between overflow-hidden bg-gradient-to-br p-6 text-white sm:p-8 md:p-12 ${item.color}`}>
                                {/* Background Abstract Char */}
                                <span className="absolute -bottom-8 -right-8 select-none text-[150px] font-black leading-none opacity-10 transition-transform duration-700 group-hover:scale-110 sm:text-[200px]">
                                    {item.char}
                                </span>

                                <div className="relative z-10">
                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm sm:mb-8 sm:h-16 sm:w-16">
                                        {item.icon}
                                    </div>
                                    <h3 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">{item.word}</h3>
                                    <p className="text-lg font-medium opacity-90 sm:text-xl">{item.kor}</p>
                                </div>
                                <div className="relative z-10 mt-8 sm:mt-12">
                                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full w-0 bg-white group-hover:w-full transition-all duration-1000 ease-out" />
                                    </div>
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className="relative flex flex-col justify-center bg-white p-6 sm:p-8 md:p-12 lg:p-14">
                                <Quote className="w-12 h-12 text-gray-100 absolute bottom-8 right-8 rotate-180" />
                                <h4 className="relative z-10 mb-4 break-keep text-xl font-bold leading-snug text-gray-900 sm:mb-6 sm:text-2xl">
                                    {item.desc}
                                </h4>
                                <p className="relative z-10 break-keep text-sm leading-relaxed text-gray-600 sm:text-base md:text-lg">
                                    {item.detail}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* The DRE Standard (Do / Don't) */}
            <div className="max-w-6xl mx-auto px-4 mt-12 md:mt-24">
                <div className="mb-10 text-center md:mb-16">
                    <h3 className="text-3xl font-bold text-gray-900">The DRE Standard</h3>
                    <p className="mt-2 text-sm text-gray-500 md:text-base">타협하지 않는 DRE만의 교육 원칙</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                    {/* OLD WAY */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative h-full overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8 md:p-10"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <XCircle className="w-32 h-32 text-red-500" />
                        </div>
                        <h4 className="mb-6 border-b pb-4 text-xl font-bold text-gray-400 sm:mb-8 sm:text-2xl">Ordinary Academy</h4>
                        <ul className="space-y-6">
                            {[
                                "무의미한 '양치기' 숙제 반복",
                                "학생 수준을 무시한 '진도 빼기'식 강의",
                                "질문하기 눈치 보이는 강압적 분위기",
                                "공식 암기 위주의 '유형 학습'"
                            ].map((text, i) => (
                                <li key={i} className="flex items-start text-gray-500">
                                    <XCircle className="w-6 h-6 text-red-300 mr-4 flex-shrink-0" />
                                    <span className="text-base sm:text-lg">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* DRE WAY */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative h-full overflow-hidden rounded-3xl border border-gray-700 bg-gray-900 p-6 text-white shadow-2xl sm:p-8 md:p-10"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CheckCircle2 className="w-32 h-32 text-blue-500" />
                        </div>
                        <h4 className="mb-6 border-b border-gray-700 pb-4 text-xl font-bold text-blue-400 sm:mb-8 sm:text-2xl">DRE Math Academy</h4>
                        <ul className="space-y-6">
                            {[
                                "개인별 취약점 분석 기반 '맞춤 과제'",
                                "완벽히 이해할 때까지 '1:1 밀착 코칭'",
                                "자유롭게 토론하고 질문하는 '하브루타'",
                                "원리를 꿰뚫는 '구조적 개념 학습'"
                            ].map((text, i) => (
                                <li key={i} className="flex items-start">
                                    <CheckCircle2 className="w-6 h-6 text-blue-500 mr-4 flex-shrink-0" />
                                    <span className="text-base font-medium sm:text-lg">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
