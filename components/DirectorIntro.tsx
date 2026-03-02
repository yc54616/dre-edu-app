'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function DirectorIntro() {
    return (
        <section className="py-12 md:py-24 bg-white overflow-hidden relative">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-pattern-light z-0 opacity-40 pointer-events-none" />

            {/* Atmospheric Light Leak */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-60 pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-16 items-center">

                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-dre-blue)]/5 rounded-[3rem] transform -rotate-3 scale-105 z-0" />
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl z-10 aspect-[4/5]">
                            <Image
                                src="/director.png"
                                alt="DRE 대표 원장"
                                fill
                                className="object-cover"
                            />
                            {/* Overlay Gradient for Text Readability if needed */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />

                            <div className="absolute bottom-8 left-8 text-white z-20">
                                <p className="text-lg font-medium opacity-90 mb-1">DRE Math Academy</p>
                                <h3 className="text-3xl font-bold">대표 원장</h3>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" />
                        <div className="absolute -top-8 -left-8 w-32 h-32 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000" />
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display leading-tight">
                            &ldquo;성적을 바꾸는<br />
                            <span className="text-[var(--color-dre-blue)]">결정적 차이</span>를 만듭니다.&rdquo;
                        </h2>

                        <div className="space-y-6 text-lg text-gray-600 mb-10 leading-relaxed">
                            <p>
                                <strong>&ldquo;꼴찌반을 1등반으로, 6등급을 2등급으로.&rdquo;</strong><br />
                                단순히 공부만 시키는 것이 아닙니다. 학생의 가능성을 믿고,
                                올바른 방향을 제시할 때 기적 같은 성장이 일어납니다.
                            </p>
                            <p>
                                학교 현장에서 입시 총괄과 고3 담임을 역임하며 쌓은 노하우로,
                                인서울이 불가능해 보였던 학생들을 서울권 대학에 합격시켰습니다.
                            </p>
                            <p>
                                서울대, 의대, 카이스트 입시부터 기초가 부족한 학생의 성적 향상까지.
                                DRE는 <strong>&apos;되는 방법&apos;</strong>을 정확히 알고 있습니다.
                            </p>
                        </div>

                        {/* Career History */}
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                            <h4 className="text-[var(--color-dre-blue)] font-bold mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[var(--color-dre-blue)]" />
                                주요 경력 및 성과
                            </h4>
                            <ul className="space-y-3 mb-6">
                                {[
                                    "전) 고등학교 3학년 부장 & 입시 총괄 역임",
                                    "전) 고3 담임 6년 (입시 지도 베테랑)",
                                    "교육과정 및 특성화 프로그램 설계 총괄 전문가",
                                    "학기 초 최하위반 → 학기 말 1등반 성적 향상 신화",
                                    "서울대, 의대, 카이스트, 연/고대 다수 합격 배출"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start text-gray-700 text-sm md:text-base">
                                        <CheckCircle2 className="w-5 h-5 text-[var(--color-dre-blue)] mr-3 flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[var(--color-dre-blue)] rounded-full mr-2"></span>중등 1정 정교사 자격</span>
                                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[var(--color-dre-blue)] rounded-full mr-2"></span>고3 담임 6년 / 교직 22년</span>
                                <span className="flex items-center"><span className="w-1.5 h-1.5 bg-[var(--color-dre-blue)] rounded-full mr-2"></span>대입 자기주도전형 위원</span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-end border-t border-gray-100 pt-6">
                            <div className="font-bold text-gray-900 text-lg">
                                DRE 디알이 수학 원장 <span className="text-[var(--color-dre-blue)] text-xl ml-1 whitespace-nowrap">유 재 무</span>
                            </div>
                            <Link href="/about/director" className="text-sm text-gray-500 hover:text-[var(--color-dre-blue)] underline decoration-gray-300 underline-offset-4 transition-colors">
                                원장 소개 더보기 →
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
