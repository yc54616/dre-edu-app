'use client';

import PageHero from '@/components/PageHero';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';

export default function LocationPage() {
    return (
        <main className="bg-white min-h-screen">
            <PageHero
                title="오시는 길"
                subtitle="LOCATION"
                description="DRE 수학학원으로 오시는 길을 안내해 드립니다."
                bgImage="/images/classroom_1.png"
            />

            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-16">
                    {/* Map Area */}
                    <div className="bg-gray-100 rounded-2xl overflow-hidden h-[400px] shadow-lg relative">
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
                    </div>

                    {/* Info Area */}
                    <div className="glass-card p-10 rounded-2xl relative overflow-hidden border border-white/20 shadow-lg">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <h2 className="text-3xl font-bold text-gray-900 mb-8 relative z-10">DRE 수학학원</h2>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-start group">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[var(--color-dre-blue)] mr-6 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">주소</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        서울 중구 퇴계로 452-1 스타빌딩 B동 7층<br />
                                        (신당역 2번 출구 도보 3분)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start group">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[var(--color-dre-blue)] mr-6 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">전화번호</h3>
                                    <p className="text-gray-600 text-lg font-medium">
                                        0507-1346-1125
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start group">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[var(--color-dre-blue)] mr-6 shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">상담 시간</h3>
                                    <ul className="text-gray-600 space-y-1">
                                        <li>평일: 12:00 - 22:00</li>
                                        <li>토요일: 09:00 - 13:00</li>
                                        <li className="text-gray-400 text-sm pt-2">* 일요일 및 공휴일 휴무</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 relative z-10">
                            <a
                                href="tel:050713461125"
                                className="inline-block px-8 py-4 bg-[var(--color-dre-blue)] text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                전화 상담 연결하기
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
