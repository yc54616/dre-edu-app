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
        subtitle: "고등 수학의 승패는 중등에서 결정됩니다.",
        desc: "중등 과정의 완벽한 이해부터 고등 선행까지, 빈틈없는 실력을 완성합니다.",
        color: "from-emerald-500 to-teal-600",
        icon: <Calculator className="w-8 h-8 text-white" />,
        features: [
            { icon: <BookOpen className="w-5 h-5" />, title: "내신 만점 대비", desc: "학교별 기출 분석 및 서술형 완벽 대비" },
            { icon: <Microscope className="w-5 h-5" />, title: "오답 관리 시스템", desc: "틀린 문제는 알 때까지, 무한 오답 클리닉" },
            { icon: <Sparkles className="w-5 h-5" />, title: "고등 연계 심화", desc: "고1 수학(상/하) 연계 학습으로 격차 해소" }
        ],
        tags: ["중1~중3", "내신대비", "고등선행"]
    },
    {
        level: "High School",
        title: "고등부 수능/내신",
        subtitle: "대입 성공을 위한 가장 확실한 전략입니다.",
        desc: "내신 1등급 확보와 수능 킬러 문항 정복을 위한 실전형 커리큘럼입니다.",
        color: "from-blue-600 to-indigo-700",
        icon: <GraduationCap className="w-8 h-8 text-white" />,
        features: [
            { icon: <LineChart className="w-5 h-5" />, title: "수능/모의고사 분석", desc: "최신 출제 경향 분석 및 변형 문제 풀이" },
            { icon: <Target className="w-5 h-5" />, title: "킬러 문항 정복", desc: "고난도 사고력 문제 해결을 위한 논리 훈련" },
            { icon: <Trophy className="w-5 h-5" />, title: "입시 컨설팅", desc: "수시/정시 개인별 맞춤 대입 전략 수립" }
        ],
        tags: ["고1~고3", "수능대비", "입시컨설팅"]
    }
];

export default function CurriculumDetail() {
    return (
        <section className="py-8 md:py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Intro */}
                <div className="text-center mb-10 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 bg-blue-100 text-[var(--color-dre-blue)] rounded-full text-sm font-bold mb-6"
                    >
                        Total Roadmap
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
                    >
                        단계별 맞춤 커리큘럼
                    </motion.h2>
                    <p className="text-xl text-gray-600">
                        기초부터 심화, 입시까지.<br className="md:hidden" /> 학생의 목표에 맞춘 최적의 로드맵을 제시합니다.
                    </p>
                </div>

                {/* Course Cards */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {courses.map((course, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                        >
                            {/* Header */}
                            <div className={`p-6 md:p-10 bg-gradient-to-br ${course.color} text-white relative overflow-hidden`}>
                                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                                    <div className="w-64 h-64 rounded-full border-[20px] border-white" />
                                </div>

                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-sm font-bold mb-6 border border-white/20">
                                    {course.level}
                                </span>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                        {course.icon}
                                    </div>
                                    <h3 className="text-3xl font-bold">{course.title}</h3>
                                </div>
                                <p className="text-blue-100 font-medium text-lg leading-relaxed opacity-90">
                                    {course.subtitle}
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-6 md:p-10">
                                <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                                    {course.desc}
                                </p>

                                <div className="space-y-6 mb-10">
                                    {course.features.map((feature, i) => (
                                        <div key={i} className="flex items-start group/item">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[var(--color-dre-blue)] mr-4 flex-shrink-0 group-hover/item:bg-[var(--color-dre-blue)] group-hover/item:text-white transition-colors duration-300">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                                                <p className="text-sm text-gray-500 group-hover/item:text-gray-700 transition-colors">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-100">
                                    {course.tags.map((tag, i) => (
                                        <span key={i} className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Info / Call to Action */}
                <div className="mt-16 md:mt-24 p-8 md:p-12 bg-white rounded-3xl border border-gray-200 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        상세 커리큘럼 및 학습 로드맵 안내
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        방문 상담 시 학생의 성취도와 목표에 맞춘<br />
                        <strong>구체적인 학습 계획</strong>을 제시해 드립니다.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <a href="/admission" className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg whitespace-nowrap text-center">
                            입학 안내 확인하기
                        </a>
                        <a href="/coaching/class" className="w-full sm:w-auto px-6 py-3 bg-white text-gray-900 font-bold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap text-center">
                            온라인 수업 알아보기
                        </a>
                    </div>
                </div>

            </div>
        </section>
    );
}
