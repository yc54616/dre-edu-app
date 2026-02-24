'use client';

import PageHero from '@/components/PageHero';
import { MapPin, Phone, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LocationPage() {
    return (
        <main className="bg-white min-h-screen">
            <PageHero
                title="오시는 길"
                subtitle="LOCATION"
                description="DRE 수학학원 위치와 연락처 안내"
                bgImage="/images/facility_lobby.jpg"
            />

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-24">
                <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
                    {/* Map Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="relative h-[300px] overflow-hidden rounded-2xl bg-gray-100 shadow-lg sm:h-[360px] md:h-[400px]"
                    >
                        {/* Naver Map Embed Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                            <span className="text-gray-500 font-medium">네이버 지도 영역</span>
                        </div>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.973463878148!2d127.0147985764024!3d37.5556637720412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca31063636737%3A0xc61d4e84b8032483!2z7ISc7Jq47Yq567OE7IucIOlykOq1rCDthLTwgye6rCA0NTItMQ!5e0!3m2!1sko!2skr!4v1708300000000!5m2!1sko!2skr"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </motion.div>

                    {/* Info Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
                        className="glass-card relative overflow-hidden rounded-2xl border border-white/20 p-6 shadow-lg sm:p-8 md:p-10"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <h2 className="relative z-10 mb-6 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">DRE 수학학원</h2>

                        <div className="relative z-10 space-y-6 sm:space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.12 }}
                                className="flex items-start group"
                            >
                                <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[var(--color-dre-blue)] transition-transform duration-300 group-hover:scale-110 sm:mr-6 sm:h-12 sm:w-12">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="mb-1 text-base font-bold text-gray-900 sm:mb-2 sm:text-lg">주소</h3>
                                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                                        서울 중구 퇴계로 452-1 스타빌딩 B동 7층<br />
                                        (신당역 2번 출구 도보 3분)
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.18 }}
                                className="flex items-start group"
                            >
                                <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[var(--color-dre-blue)] transition-transform duration-300 group-hover:scale-110 sm:mr-6 sm:h-12 sm:w-12">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="mb-1 text-base font-bold text-gray-900 sm:mb-2 sm:text-lg">전화번호</h3>
                                    <p className="text-base font-medium text-gray-600 sm:text-lg">
                                        0507-1346-1125
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.24 }}
                                className="flex items-start group"
                            >
                                <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[var(--color-dre-blue)] transition-transform duration-300 group-hover:scale-110 sm:mr-6 sm:h-12 sm:w-12">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="mb-1 text-base font-bold text-gray-900 sm:mb-2 sm:text-lg">상담 시간</h3>
                                    <ul className="space-y-1 text-sm text-gray-600 sm:text-base">
                                        <li>평일: 12:00 - 22:00</li>
                                        <li>토요일: 09:00 - 13:00</li>
                                        <li className="text-gray-400 text-sm pt-2">* 일요일 및 공휴일 휴무</li>
                                    </ul>
                                </div>
                            </motion.div>
                        </div>

                        <div className="relative z-10 mt-8 sm:mt-12">
                            <a
                                href="tel:050713461125"
                                className="inline-block rounded-xl bg-[var(--color-dre-blue)] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-blue-800 hover:shadow-xl sm:px-8 sm:py-4 sm:text-base"
                            >
                                전화 상담 연결하기
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
