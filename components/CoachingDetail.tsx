'use client';

import { motion } from 'framer-motion';
import {
    MessageSquare,
    Phone,
    MonitorPlay,
    Clock,
    UserCheck,
    FileText,
    Send
} from 'lucide-react';

const benefits = [
    {
        icon: <Clock className="w-8 h-8 text-[var(--color-dre-blue)]" />,
        title: "시간 효율 극대화",
        desc: "이동 시간 0분. 오직 학습에만 집중할 수 있는 가장 효율적인 수업입니다."
    },
    {
        icon: <MonitorPlay className="w-8 h-8 text-[var(--color-dre-blue)]" />,
        title: "실시간 화상 코칭",
        desc: "녹화 강의가 아닌, 실시간 쌍방향 소통으로 현장강의 그 이상의 몰입감을 제공합니다."
    },
    {
        icon: <UserCheck className="w-8 h-8 text-[var(--color-dre-blue)]" />,
        title: "1:1 맞춤 관리",
        desc: "전담 코치가 배정되어 출결부터 과제, 오답까지 빈틈없이 관리합니다."
    }
];

const steps = [
    { number: "01", title: "상담 신청", desc: "온라인 양식 또는 전화로 상담을 신청합니다." },
    { number: "02", title: "레벨 테스트", desc: "현재 실력을 정확히 진단하기 위한 테스트를 진행합니다." },
    { number: "03", title: "맞춤 배정", desc: "성향과 수준에 딱 맞는 전담 강사진을 배정합니다." },
    { number: "04", title: "수업 시작", desc: "오리엔테이션 후 본격적인 맞춤 수업이 시작됩니다." }
];

export default function CoachingDetail() {
    return (
        <section className="bg-white">

            {/* Benefits Section */}
            <div className="py-12 md:py-24 bg-gray-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-indigo-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        >
                            Why DRE Online?
                        </motion.h2>
                        <p className="text-lg text-gray-600">DRE만의 관리 시스템 그대로, 집에서 경험하세요.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        {benefits.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="group"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-sm border border-blue-50 group-hover:scale-110 transition-transform duration-300">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed px-4">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Process Section */}
            <div className="py-12 md:pt-24 md:pb-12 lg:py-24 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-[var(--color-dre-blue)] font-bold tracking-widest uppercase text-sm mb-2 block">Process</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">수업 시작 프로세스</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative"
                            >
                                <div className="text-6xl font-black text-gray-100 mb-4 font-display">
                                    {step.number}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 relative z-10 text-sm">
                                    {step.desc}
                                </p>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-8 right-0 w-full h-[2px] bg-gradient-to-r from-gray-200 to-transparent transform translate-x-1/2" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact & Form Section */}
            <div className="py-12 md:pt-12 md:pb-24 lg:py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Contact Methods */}
                    <div className="grid md:grid-cols-2 gap-6 mb-16">
                        <a href="#" className="flex items-center p-6 bg-[#FAE100] rounded-2xl hover:bg-[#FDD835] transition-colors group shadow-md">
                            <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center mr-4 text-[#3C1E1E]">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3 className="text-[#3C1E1E] font-bold text-lg">카카오톡 상담</h3>
                                <p className="text-[#3C1E1E]/80 text-sm">실시간 채팅 문의</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#3C1E1E]">
                                &rarr;
                            </div>
                        </a>

                        <a href="tel:050713461125" className="flex items-center p-6 bg-[var(--color-dre-blue)] rounded-2xl hover:bg-blue-800 transition-colors group shadow-md">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 text-white">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">전화 상담</h3>
                                <p className="text-blue-100 text-sm">0507-1346-1125</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-white">
                                &rarr;
                            </div>
                        </a>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--color-dre-blue)] to-indigo-600" />

                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">상담 신청서 작성</h3>
                            <p className="text-gray-500">정보를 남겨주시면 담당자가 확인 후 빠르게 연락드리겠습니다.</p>
                        </div>

                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">학생 이름</label>
                                    <input type="text" className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[var(--color-dre-blue)] focus:ring-1 focus:ring-[var(--color-dre-blue)] outline-none transition-all" placeholder="이름을 입력하세요" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">연락처</label>
                                    <input type="tel" className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[var(--color-dre-blue)] focus:ring-1 focus:ring-[var(--color-dre-blue)] outline-none transition-all" placeholder="010-0000-0000" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">학교 / 학년</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['중등', '고등'].map((grade) => (
                                        <label key={grade} className="cursor-pointer">
                                            <input type="radio" name="grade" className="peer sr-only" />
                                            <div className="w-full py-3 text-center rounded-xl border border-gray-200 bg-gray-50 peer-checked:bg-[var(--color-dre-blue)] peer-checked:text-white peer-checked:border-transparent transition-all font-medium text-gray-600">
                                                {grade}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">문의 내용</label>
                                <textarea className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[var(--color-dre-blue)] focus:ring-1 focus:ring-[var(--color-dre-blue)] outline-none transition-all h-32 resize-none" placeholder="현재 수학 성적, 고민되는 부분 등 자유롭게 남겨주세요." />
                            </div>

                            <button type="button" className="w-full py-5 bg-gray-900 text-white font-bold rounded-xl mt-4 hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2 group">
                                <Send size={20} className="group-hover:translate-x-1 transition-transform" />
                                <span>상담 신청하기</span>
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
}
