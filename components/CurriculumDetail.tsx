'use client';

import { motion } from 'framer-motion';
import {
    BookOpen,
    Calculator,
    Trophy,
    Target,
    Sparkles,
    GraduationCap,
    Microscope,
    LineChart
} from 'lucide-react';

const courses = [
    {
        level: "Middle School",
        title: "중등부 정규/심화",
        subtitle: "고등 수학의 기본기는 중등에서 잡힙니다.",
        desc: "중등 과정을 확실히 다지고, 고등 선행까지 이어갑니다.",
        color: "from-emerald-500 to-teal-600",
        icon: <Calculator className="w-8 h-8 text-white" />,
        features: [
            { icon: <BookOpen className="w-5 h-5" />, title: "내신 대비", desc: "학교별 기출 분석과 서술형 대비" },
            { icon: <Microscope className="w-5 h-5" />, title: "오답 관리", desc: "틀린 문제는 알 때까지 반복 점검" },
            { icon: <Sparkles className="w-5 h-5" />, title: "고등 연계 심화", desc: "고1 수학(상/하) 연계 학습으로 미리 준비" }
        ],
        tags: ["중1~중3", "내신대비", "고등선행"]
    },
    {
        level: "High School",
        title: "고등부 수능/내신",
        subtitle: "내신과 수능, 둘 다 잡아야 합니다.",
        desc: "내신 1등급 대비와 수능 고난도 문항까지 실전 중심으로 준비합니다.",
        color: "from-blue-600 to-indigo-700",
        icon: <GraduationCap className="w-8 h-8 text-white" />,
        features: [
            { icon: <LineChart className="w-5 h-5" />, title: "수능/모의고사 분석", desc: "최신 출제 경향에 맞춘 변형 문제 풀이" },
            { icon: <Target className="w-5 h-5" />, title: "고난도 문항 훈련", desc: "킬러 문항 풀이에 필요한 사고력 연습" },
            { icon: <Trophy className="w-5 h-5" />, title: "입시컨설팅", desc: "수시/정시 개인별 맞춤 대입 전략 수립" }
        ],
        tags: ["고1~고3", "수능대비", "입시컨설팅"]
    }
];

export default function CurriculumDetail() {
    return (
        <section className="bg-gray-50 py-8 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Intro */}
                <div className="text-center mb-10 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-5 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-[var(--color-dre-blue)] sm:text-sm"
                    >
                        Total Roadmap
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mb-5 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:mb-6 md:text-5xl"
                    >
                        단계별 맞춤 커리큘럼
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 22 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.45, delay: 0.16, ease: 'easeOut' }}
                        className="text-base text-gray-600 sm:text-lg md:text-xl"
                    >
                        기초부터 심화, 입시까지.<br className="md:hidden" /> 학생 목표에 맞춰 단계별로 진행합니다.
                    </motion.p>
                </div>

                {/* Course Cards */}
                <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12">
                    {courses.map((course, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="group overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:rounded-[2rem] md:hover:-translate-y-2"
                        >
                            {/* Header */}
                            <div className={`relative overflow-hidden bg-gradient-to-br p-5 text-white sm:p-6 md:p-10 ${course.color}`}>
                                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                                    <div className="w-64 h-64 rounded-full border-[20px] border-white" />
                                </div>

                                <span className="mb-4 inline-block rounded-lg border border-white/20 bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md sm:mb-6 sm:text-sm">
                                    {course.level}
                                </span>
                                <div className="mb-3 flex items-center gap-3 sm:mb-4 sm:gap-4">
                                    <div className="rounded-2xl bg-white/20 p-2.5 backdrop-blur-md sm:p-3">
                                        {course.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold sm:text-3xl">{course.title}</h3>
                                </div>
                                <p className="text-sm font-medium leading-relaxed text-blue-100 opacity-90 sm:text-base md:text-lg">
                                    {course.subtitle}
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-5 sm:p-6 md:p-10">
                                <p className="mb-8 text-sm leading-relaxed text-gray-600 sm:mb-10 sm:text-base md:text-lg">
                                    {course.desc}
                                </p>

                                <div className="mb-8 space-y-4 sm:mb-10 sm:space-y-6">
                                    {course.features.map((feature, i) => (
                                        <div key={i} className="flex items-start group/item">
                                            <div className="mr-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-50 text-[var(--color-dre-blue)] transition-colors duration-300 group-hover/item:bg-[var(--color-dre-blue)] group-hover/item:text-white sm:mr-4 sm:h-10 sm:w-10">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                                                <p className="text-xs text-gray-500 transition-colors group-hover/item:text-gray-700 sm:text-sm">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-6 sm:pt-8">
                                    {course.tags.map((tag, i) => (
                                        <span key={i} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 sm:px-4 sm:text-sm">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Info / Call to Action */}
                <div className="relative mt-14 overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-lg md:mt-24 md:p-12">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <h3 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
                        상세 커리큘럼 및 학습 로드맵 안내
                    </h3>
                    <p className="mx-auto mb-6 max-w-xl text-sm text-gray-600 sm:mb-8 sm:text-base">
                        방문 상담 시 학생의 성취도와 목표에 맞춘<br />
                        <strong>구체적인 학습 계획</strong>을 제시해 드립니다.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <a href="/admission" className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg whitespace-nowrap text-center">
                            입학 안내 확인하기
                        </a>
                        <a href="/coaching/math" className="w-full sm:w-auto px-6 py-3 bg-white text-gray-900 font-bold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap text-center">
                            온라인 수학 코칭 알아보기
                        </a>
                    </div>
                </div>

            </div>
        </section>
    );
}
