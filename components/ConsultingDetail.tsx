'use client';

import { motion } from 'framer-motion';
import {
    PieChart,
    TrendingUp,
    Target,
    Award,
    Calendar,
    FileSearch,
    Users,
    CheckCircle2
} from 'lucide-react';

const factors = [
    {
        icon: <PieChart className="w-8 h-8 text-white" />,
        title: "Data-Driven",
        desc: "철저한 성적 분석과 입시 데이터에 기반한 객관적 전략",
        color: "bg-blue-500"
    },
    {
        icon: <Target className="w-8 h-8 text-white" />,
        title: "Goal-Oriented",
        desc: "학생의 목표 대학 및 학과에 최적화된 맞춤형 로드맵",
        color: "bg-indigo-500"
    },
    {
        icon: <Users className="w-8 h-8 text-white" />,
        title: "Total Care",
        desc: "학습 멘탈 관리부터 서류, 면접까지 입체적 케어",
        color: "bg-purple-500"
    }
];

const roadmap = [
    {
        icon: <FileSearch size={24} />,
        step: "Step 01",
        title: "심층 분석",
        desc: "학생부, 모의고사 성적, 성향 정밀 진단"
    },
    {
        icon: <TrendingUp size={24} />,
        step: "Step 02",
        title: "전략 수립",
        desc: "수시/정시 지원 가능군 설정 및 목표 대학 조율"
    },
    {
        icon: <Calendar size={24} />,
        step: "Step 03",
        title: "로드맵 실행",
        desc: "시기별 학습 계획 및 비교과 활동 가이드"
    },
    {
        icon: <Award size={24} />,
        step: "Step 04",
        title: "파이널 점검",
        desc: "자소서 첨삭, 면접 대비, 최종 원서 접수 전략"
    }
];

export default function ConsultingDetail() {
    return (
        <section className="bg-white">

            {/* Strategy Compass Section */}
            <div className="py-12 md:py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-bold mb-6 font-display leading-tight text-gray-900"
                        >
                            <span className="text-[var(--color-dre-blue)]">DRE 입시 컨설팅</span>의<br />
                            성공 방정식
                        </motion.h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            막연한 감이 아닌, 확실한 데이터와 전략으로 합격의 문을 엽니다.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 relative">
                        {/* Seamless container for all items instead of individual boxes */}
                        {factors.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="px-6 py-4 text-center group"
                            >
                                <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mb-6 shadow-lg text-white mx-auto group-hover:scale-110 transition-transform duration-300`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Consulting Roadmap */}
            <div className="py-12 md:py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[var(--color-dre-blue)] font-bold tracking-widest uppercase text-sm mb-2 block">Roadmap</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">컨설팅 프로세스</h2>
                    </div>

                    <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[4.5rem] left-0 w-full h-1 bg-gray-200" />

                        <div className="grid md:grid-cols-4 gap-8">
                            {roadmap.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    className="relative bg-white p-8 rounded-3xl shadow-lg border border-gray-100 group hover:-translate-y-2 transition-transform duration-300"
                                >
                                    <div className="w-20 h-20 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center text-[var(--color-dre-blue)] mb-6 mx-auto relative z-10 group-hover:border-[var(--color-dre-blue)] transition-colors duration-300">
                                        {item.icon}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-[var(--color-dre-blue)] mb-2 uppercase tracking-wider">{item.step}</div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Audience & CTA */}
            <div className="py-12 md:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">
                                이런 학생들에게<br />
                                <span className="text-[var(--color-dre-blue)]">전문 컨설팅</span>이 필요합니다.
                            </h2>
                            <ul className="space-y-4">
                                {[
                                    "현재 성적으로 지원 가능한 대학이 궁금한 학생",
                                    "수시와 정시 사이에서 방향을 잡지 못하는 학생",
                                    "학생부는 관리했지만 자소서/면접이 막막한 학생",
                                    "고교 진학을 앞두고 진로 로드맵이 필요한 중학생"
                                ].map((text, i) => (
                                    <li key={i} className="flex items-start">
                                        <CheckCircle2 className="w-6 h-6 text-[var(--color-dre-blue)] mr-3 flex-shrink-0" />
                                        <span className="text-gray-700 text-lg">{text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 text-center relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-dre-blue)]/10 rounded-full" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full" />

                            <h3 className="text-2xl font-bold text-gray-900 mb-4">입시 성공의 골든타임</h3>
                            <p className="text-gray-600 mb-8">
                                지금이 바로 입시 전략을 재점검해야 할<br />
                                <strong>가장 결정적인 시기</strong>입니다.<br />
                                DRE 전문가와 함께 합격 전략을 완성하세요.
                            </p>
                            <div className="space-y-3">
                                <a href="/admission" className="block w-full py-4 bg-[var(--color-dre-blue)] text-white font-bold rounded-xl shadow-lg hover:bg-blue-800 transition-colors">
                                    1:1 정밀 진단 신청하기
                                </a>
                                <div className="text-sm text-gray-400">
                                    * 사전 예약제로 운영됩니다.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
}
