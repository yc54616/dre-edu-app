'use client';

import PageHero from '@/components/PageHero';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Award, BookOpen, Briefcase, GraduationCap, Scroll, Star, Quote } from 'lucide-react';

export default function DirectorPage() {
    const history = [
        {
            year: "2023",
            title: "교육부 장관상 수여",
            desc: "교육 발전 기여 공로",
            category: "Award",
            icon: <Award className="w-5 h-5" />
        },
        {
            year: "2023",
            title: "명예퇴직 감사패 수여",
            desc: "15년 교직 생활 마무리",
            category: "Career",
            icon: <Star className="w-5 h-5" />
        },
        {
            year: "2021",
            title: "경기도 자기주도학습전형 입학전형위원 위촉",
            category: "Professional",
            icon: <Briefcase className="w-5 h-5" />
        },
        {
            year: "2021",
            title: "미래엔 '1등급 만들기 수학1, 수학2' 검토위원",
            category: "Book",
            icon: <BookOpen className="w-5 h-5" />
        },
        {
            year: "2020",
            title: "서울여자대학교 모의 면접 사정관 참여",
            category: "Professional",
            icon: <Briefcase className="w-5 h-5" />
        },
        {
            year: "2019",
            title: "수원시장 표창장 수여",
            desc: "글로벌인재육성과 창의교육 부문",
            category: "Award",
            icon: <Award className="w-5 h-5" />
        },
        {
            year: "2017",
            title: "서울대학교 고교-대학 연계 '샤' 교육포럼 참여",
            category: "Professional",
            icon: <Briefcase className="w-5 h-5" />
        },
        {
            year: "2013",
            title: "EBS 수능특강 / 기하와 벡터 검토",
            category: "Book",
            icon: <BookOpen className="w-5 h-5" />
        },
        {
            year: "2012",
            title: "EBS 수능특강 / 수능완성 (수학1) 검토",
            category: "Book",
            icon: <BookOpen className="w-5 h-5" />
        },
        {
            year: "2011",
            title: "자기주도학습관리사 2급 취득",
            category: "Certificate",
            icon: <Scroll className="w-5 h-5" />
        },
        {
            year: "2010",
            title: "EBS 포스수학 / 미적분과 통계기본, 기하와 벡터 검토",
            category: "Book",
            icon: <BookOpen className="w-5 h-5" />
        },
        {
            year: "2009",
            title: "미래엔 '공감수학 (수학1)' 검토위원",
            category: "Book",
            icon: <BookOpen className="w-5 h-5" />
        },
        {
            year: "2007",
            title: "서울대학교 논술교사 연수 제1기 자연계 수료",
            category: "Education",
            icon: <GraduationCap className="w-5 h-5" />
        },
        {
            year: "2004",
            title: "정교사 1급 자격 취득",
            category: "Certificate",
            icon: <Scroll className="w-5 h-5" />
        }
    ];

    const schoolCareer = [
        "15년 학교 담임 경력 (고3 담임 6년)",
        "수학교과부장 역임 (시험 출제 총괄, 교육과정 운영)",
        "학년부장 역임 (2019.03 ~ 2022.02, 진학 상담 및 입시 지도 총괄)"
    ];

    return (
        <main className="bg-white min-h-screen">
            <PageHero
                title="원장 소개"
                subtitle="DIRECTOR"
                description="교육의 진정성을 믿는 유재무 원장입니다."
                bgImage="/images/director.png"
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10 translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-50 rounded-full blur-3xl opacity-30 -z-10 -translate-x-1/3 translate-y-1/4" />

                {/* Intro Section */}
                <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start mb-12 md:mb-32">
                    {/* Profile Image (Left, 5 cols) */}
                    <div className="md:col-span-5 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white max-w-[320px] mx-auto md:max-w-none"
                        >
                            <Image
                                src="/images/director.png"
                                alt="유재무 원장"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />

                            <div className="absolute bottom-6 left-6 text-white">
                                <p className="text-xs md:text-sm font-light opacity-80 tracking-widest mb-1">DRE MATH ACADEMY</p>
                                <p className="text-xl md:text-2xl font-bold">유 재 무 원장</p>
                            </div>
                        </motion.div>

                        {/* Decorative Elements */}
                        <div className="absolute -z-10 top-10 -left-10 w-full h-full border border-blue-200 rounded-2xl hidden md:block" />
                    </div>

                    {/* Text Content (Right, 7 cols) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="md:col-span-7 pt-4"
                    >
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-[var(--color-dre-blue)] text-xs md:text-sm font-bold mb-4 md:mb-6">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[var(--color-dre-blue)] mr-2" />
                            Master Director
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight font-display text-center md:text-left break-keep">
                            "꿈은 사람을 이끌고,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-dre-blue)] to-indigo-600">사람은 꿈을 이룹니다."</span>
                        </h2>

                        <div className="prose prose-lg text-gray-600 mb-8 md:mb-10 leading-loose text-sm md:text-base">
                            <p className="mb-4">
                                안녕하세요, DRE 수학학원 원장 유재무입니다.<br />
                                15년의 공교육 현장 경험과 EBS 교재 검토 위원으로서의 전문성을 바탕으로,
                                학생들에게 가장 정확하고 효율적인 학습 전략을 제시합니다.
                            </p>
                            <p>
                                막연한 문제 풀이가 아닌, <strong className="text-gray-900">철저한 분석과 맞춤 처방</strong>으로
                                여러분의 꿈을 현실로 만들어드리겠습니다.
                            </p>
                        </div>

                        {/* Signature Section */}
                        <div className="flex items-center justify-end mb-8 md:mb-10">
                            <div className="text-right">
                                <p className="text-gray-400 text-xs md:text-sm mb-1">DRE 수학학원 원장</p>
                                <p className="text-xl md:text-2xl font-script text-gray-900">유 재 무</p>
                            </div>
                        </div>

                        {/* Highlights Card */}
                        <div className="bg-white/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110" />
                            <Briefcase className="absolute top-6 right-6 text-[var(--color-dre-blue)] w-6 h-6 md:w-8 md:h-8 z-10" />

                            <h3 className="font-bold text-gray-900 mb-3 md:mb-4 text-base md:text-lg relative z-10">주요 교직 경력 Highlight</h3>
                            <ul className="space-y-2 md:space-y-3 relative z-10">
                                {schoolCareer.map((item, idx) => (
                                    <li key={idx} className="flex items-start text-gray-700">
                                        <div className="w-1.5 h-1.5 bg-[var(--color-dre-blue)] rounded-full mt-2 mr-3 flex-shrink-0" />
                                        <span className="text-sm font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* Timeline Section */}
                <div className="relative">
                    <div className="text-center mb-10 md:mb-16">
                        <span className="text-[var(--color-dre-blue)] font-bold tracking-wider text-xs md:text-sm uppercase mb-2 block">History path</span>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">전문가 히스토리</h3>
                    </div>

                    {/* Vertical Line */}
                    <div className="absolute left-4 md:left-1/2 top-24 md:top-32 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-gray-200 to-transparent md:-translate-x-1/2" />

                    <div className="space-y-8 md:space-y-12 relative z-10 mb-20">
                        {history.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                className={`flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''
                                    }`}
                            >
                                {/* Date Column (Desktop) */}
                                <div className={`hidden md:block w-1/2 text-${index % 2 === 0 ? 'left' : 'right'} pt-3`}>
                                    <span className="text-4xl font-bold text-gray-300">{item.year}</span>
                                </div>

                                {/* Center Icon */}
                                <div className="absolute left-4 md:left-1/2 w-8 h-8 md:w-10 md:h-10 -ml-[18px] md:-ml-0 md:-translate-x-1/2 bg-white border-4 border-blue-50 rounded-full flex items-center justify-center text-[var(--color-dre-blue)] shadow-md z-10 top-0 md:top-0">
                                    <div className="scale-75 md:scale-100">{item.icon}</div>
                                </div>

                                {/* Content Card */}
                                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                                    <div className="md:hidden mb-1 flex items-center h-8">
                                        <span className="text-xl font-bold text-[var(--color-dre-blue)] ml-1">{item.year}</span>
                                    </div>
                                    <div className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 group relative overflow-hidden inline-block w-full text-left ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                                        <div className={`absolute top-0 w-1 h-full bg-[var(--color-dre-blue)] transition-all duration-300 md:opacity-0 group-hover:opacity-100 left-0`} />

                                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-400 mb-1.5 md:mb-2 block">{item.category}</span>
                                        <h4 className="font-bold text-gray-900 text-base md:text-lg mb-1 md:mb-2 leading-snug">{item.title}</h4>
                                        {item.desc && <p className="text-xs md:text-sm text-gray-500">{item.desc}</p>}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer Quote */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 md:mt-32 relative"
                >
                    <div className="absolute inset-0 bg-blue-600 rounded-3xl -rotate-1 opacity-5 blur-sm transform scale-105" />
                    <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                        {/* Background Patterns */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

                        <Quote className="w-8 h-8 md:w-12 md:h-12 text-white/20 mx-auto mb-6 rotate-180" />

                        <p className="text-xl md:text-3xl font-medium leading-relaxed font-display mb-6 md:mb-8 relative z-10">
                            "가르치지 않고 깨닫게 합니다.<br />
                            설명하지 않고 질문합니다."
                        </p>

                        <div className="w-12 md:w-16 h-1 bg-blue-400/50 mx-auto mb-6 md:mb-8" />

                        <p className="text-blue-200 text-sm md:text-base">
                            DRE 수학학원 원장 <strong className="text-white ml-2">유 재 무</strong>
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
