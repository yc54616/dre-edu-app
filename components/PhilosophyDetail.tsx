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
        detail: "막연히 공부하는 것과 목표를 가지고 공부하는 것은 결과가 다릅니다. '내가 왜 공부해야 하는가'에 대한 답을 찾고, 구체적인 목표를 세울 때 성적은 자연스럽게 따라옵니다. 우리는 학생과 함께 그 목표를 찾아갑니다.",
        color: "from-blue-500 to-indigo-600",
        bgPattern: "bg-[url('/pattern-dream.svg')]", // Placeholder for pattern class
        icon: <Rocket className="w-12 h-12 mb-6 text-blue-200" />
    },
    {
        char: "R",
        word: "Rest",
        kor: "쉼과 회복",
        desc: "충분한 휴식이 더 높은 집중력을 만듭니다.",
        detail: "무조건 책상에 오래 앉아있는 것이 능사가 아닙니다. 뇌과학적으로도 입증된 적절한 휴식과 수면은 학습 효율을 높입니다. 우리는 학생이 스스로 컨디션을 관리하고, 학습 에너지를 유지하는 방법을 지도합니다.",
        color: "from-teal-600 to-emerald-700",
        bgPattern: "bg-[url('/pattern-rest.svg')]",
        icon: <HeartHandshake className="w-12 h-12 mb-6 text-teal-200" />
    },
    {
        char: "E",
        word: "Essence",
        kor: "본질과 원리",
        desc: "요령이 아닌, 수학의 원리를 이해합니다.",
        detail: "유형 암기식 학습은 고등 심화 과정에서 한계에 부딪힙니다. '왜 이렇게 되는지'를 끊임없이 질문하고 탐구하여 개념을 체계화하는 것. 그것이 흔들리지 않는 수학 실력의 핵심입니다.",
        color: "from-indigo-900 to-slate-900",
        bgPattern: "bg-[url('/pattern-essence.svg')]",
        icon: <Microscope className="w-12 h-12 mb-6 text-indigo-200" />
    }
];

export default function PhilosophyDetail() {
    return (
        <section className="bg-gray-50 pb-8 md:pb-20">

            {/* Intro Message */}
            <div className="max-w-4xl mx-auto px-4 py-10 md:py-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-[var(--color-dre-blue)] font-bold tracking-widest uppercase text-sm mb-4 block">Our Core Values</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight font-display break-keep">
                        "점수 그 이상,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">스스로 성장하는 힘을 기릅니다</span>"
                    </h2>
                    <div className="w-20 h-1 bg-gray-200 mx-auto mb-8" />
                    <p className="text-xl text-gray-600 leading-relaxed break-keep">
                        DRE는 단순히 문제 풀이 기술만 가르치지 않습니다.<br className="hidden md:block" />
                        수학을 통해 생각하는 힘, 끝까지 해내는 끈기를 배웁니다.
                    </p>
                </motion.div>
            </div>

            {/* Value Cards (Vertical Scroll) */}
            <div className="max-w-6xl mx-auto px-4 space-y-8 md:space-y-12">
                {values.map((item, index) => (
                    <motion.div
                        key={item.char}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className="group relative overflow-hidden rounded-3xl shadow-xl bg-white"
                    >
                        <div className="grid md:grid-cols-2 min-h-[400px]">
                            {/* Visual Side */}
                            <div className={`relative p-12 flex flex-col justify-between bg-gradient-to-br ${item.color} text-white overflow-hidden`}>
                                {/* Background Abstract Char */}
                                <span className="absolute -bottom-10 -right-10 text-[200px] font-black opacity-10 leading-none select-none group-hover:scale-110 transition-transform duration-700">
                                    {item.char}
                                </span>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 border border-white/30">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-5xl font-bold mb-2 tracking-tight">{item.word}</h3>
                                    <p className="text-xl font-medium opacity-90">{item.kor}</p>
                                </div>
                                <div className="relative z-10 mt-12">
                                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full w-0 bg-white group-hover:w-full transition-all duration-1000 ease-out" />
                                    </div>
                                </div>
                            </div>

                            {/* Text Side */}
                            <div className="p-10 md:p-14 flex flex-col justify-center bg-white relative">
                                <Quote className="w-12 h-12 text-gray-100 absolute bottom-8 right-8 rotate-180" />
                                <h4 className="text-2xl font-bold text-gray-900 mb-6 leading-snug break-keep relative z-10">
                                    {item.desc}
                                </h4>
                                <p className="text-gray-600 leading-relaxed text-lg break-keep relative z-10">
                                    {item.detail}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* The DRE Standard (Do / Don't) */}
            <div className="max-w-6xl mx-auto px-4 mt-12 md:mt-24">
                <div className="text-center mb-16">
                    <h3 className="text-3xl font-bold text-gray-900">The DRE Standard</h3>
                    <p className="text-gray-500 mt-2">타협하지 않는 DRE만의 교육 원칙</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                    {/* OLD WAY */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-10 rounded-3xl border border-gray-100 shadow-lg relative overflow-hidden h-full"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <XCircle className="w-32 h-32 text-red-500" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-400 mb-8 border-b pb-4">Ordinary Academy</h4>
                        <ul className="space-y-6">
                            {[
                                "무의미한 '양치기' 숙제 반복",
                                "학생 수준을 무시한 '진도 빼기'식 강의",
                                "질문하기 눈치 보이는 강압적 분위기",
                                "공식 암기 위주의 '유형 학습'"
                            ].map((text, i) => (
                                <li key={i} className="flex items-start text-gray-500">
                                    <XCircle className="w-6 h-6 text-red-300 mr-4 flex-shrink-0" />
                                    <span className="text-lg">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* DRE WAY */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-gray-900 p-10 rounded-3xl shadow-2xl relative overflow-hidden text-white border border-gray-700 h-full"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CheckCircle2 className="w-32 h-32 text-blue-500" />
                        </div>
                        <h4 className="text-2xl font-bold text-blue-400 mb-8 border-b border-gray-700 pb-4">DRE Math Academy</h4>
                        <ul className="space-y-6">
                            {[
                                "개인별 취약점 분석 기반 '맞춤 과제'",
                                "완벽히 이해할 때까지 '1:1 밀착 코칭'",
                                "자유롭게 토론하고 질문하는 '하브루타'",
                                "원리를 꿰뚫는 '구조적 개념 학습'"
                            ].map((text, i) => (
                                <li key={i} className="flex items-start">
                                    <CheckCircle2 className="w-6 h-6 text-blue-500 mr-4 flex-shrink-0" />
                                    <span className="text-lg font-medium">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
