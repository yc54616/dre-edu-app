'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Phone, Clock, Search, Library, Coffee } from 'lucide-react';

const spaces = [
    {
        id: 'lecture',
        title: "Focus Lecture Room",
        subtitle: "몰입형 강의실",
        desc: "오직 칠판과 선생님에게만 집중할 수 있는 시선 설계. 불필요한 장식을 배제하고 조도와 책상 간격까지 세심하게 조정한 몰입의 공간입니다.",
        img: "/images/classroom_1.png",
        icon: <Library className="w-6 h-6" />,
        colSpan: "md:col-span-2"
    },
    {
        id: 'study',
        title: "Deep Study Zone",
        subtitle: "자기주도 학습실",
        desc: "강의 후 바로 복습할 수 있는 최적의 동선. 카페 같은 편안함 속에서 깊이 있는 사고를 할 수 있습니다.",
        img: "/images/study_area.png",
        icon: <Coffee className="w-6 h-6" />,
        colSpan: "md:col-span-1"
    },
    {
        id: 'coaching',
        title: "1:1 Coaching Lab",
        subtitle: "개별 클리닉 룸",
        desc: "질문과 토론이 끊이지 않는 곳. 1:1 밀착 지도를 통해 개인별 약점을 완벽하게 보완합니다.",
        img: "/images/classroom_2.png",
        icon: <Search className="w-6 h-6" />,
        colSpan: "md:col-span-1"
    }
];

export default function FacilityDetail() {
    return (
        <section className="bg-white">

            {/* Space Philosophy */}
            <div className="py-12 md:py-24 bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern-grid.svg')] opacity-5" />
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[var(--color-dre-blue)] font-bold tracking-widest uppercase text-sm mb-4 block"
                    >
                        Space Philosophy
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight font-display"
                    >
                        환경이 성적을 바꿉니다.<br />
                        <span className="text-gray-500">DRE는 공간 하나에도 교육 철학을 담았습니다.</span>
                    </motion.h2>
                </div>
            </div>

            {/* Premium Gallery */}
            <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 mb-32">
                <div className="grid md:grid-cols-2 gap-6">
                    {spaces.map((space, index) => (
                        <motion.div
                            key={space.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative rounded-3xl overflow-hidden shadow-xl h-[400px] ${space.colSpan}`}
                        >
                            <Image
                                src={space.img}
                                alt={space.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <div className="flex items-center gap-3 mb-3 text-blue-300">
                                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                        {space.icon}
                                    </div>
                                    <span className="font-bold tracking-wider text-sm uppercase">{space.title}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">{space.subtitle}</h3>
                                <p className="text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                    {space.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}

                    {/* Placeholder for visual balance if needed, or just keep 3 items. 
                        Currently 3 items: 2 cols + 1 col + 1 col doesn't fit a 2-col grid perfectly unless configured.
                        Let's adjust. Item 1: col-span-2 (Full width on top in mobile, or desktop? Wait.)
                        
                        Grid is md:grid-cols-2.
                        Item 1: col-span-2 -> Full width row
                        Item 2: col-span-1
                        Item 3: col-span-1
                        Correct. This makes a nice bento grid.
                    */}
                </div>
            </div>

            {/* Directions Section (Integrated from Location Page) */}
            <div className="bg-gray-900 py-12 md:py-24 relative overflow-hidden text-white">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-blue-400 font-bold tracking-widest text-sm uppercase mb-2 block">Location</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">오시는 길</h2>
                        <p className="text-gray-400">꿈을 향해 나아가는 DRE 수학학원의 위치입니다.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Map */}
                        <div className="bg-gray-800 rounded-3xl overflow-hidden h-[350px] md:h-[450px] shadow-2xl border border-gray-700 relative group">
                            {/* Naver Map Embed with Smart Crop */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-[62%] -translate-y-[55%] lg:-translate-x-1/2 lg:-translate-y-1/2 w-[400%] h-[200%] lg:w-[300%] lg:h-[160%]">
                                <iframe
                                    src="https://map.naver.com/p/entry/place/1087649900?c=15.00,0,0,0,dh"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    className="opacity-90 transition-opacity duration-300 pointer-events-auto"
                                ></iframe>
                            </div>

                            {/* Overlay Button for better UX */}
                            <div className="absolute bottom-4 right-4 z-10">
                                <a
                                    href="https://map.naver.com/p/entry/place/1087649900"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#03C75A] text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-1 hover:bg-[#02b351] transition-colors"
                                >
                                    <span className="font-extrabold">N</span> 네이버 지도 보기
                                </a>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-white/5 backdrop-blur-lg p-10 rounded-3xl border border-white/10 shadow-xl">
                            <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-6">Contact Info</h3>

                            <div className="space-y-8">
                                <div className="flex items-start group">
                                    <div className="w-12 h-12 bg-[#03C75A]/10 rounded-2xl flex items-center justify-center text-[#03C75A] mr-5 shrink-0 border border-[#03C75A]/20 group-hover:bg-[#03C75A] group-hover:text-white transition-all duration-300">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-1 font-bold">Address</h4>
                                        <p className="text-gray-100 text-lg leading-relaxed">
                                            서울 중구 퇴계로 452-1 스타빌딩 B동 7층<br />
                                            (신당역 2번 출구 도보 3분)
                                        </p>
                                        <a href="https://m.place.naver.com/place/1087649900" target="_blank" className="text-[#03C75A] text-sm font-bold mt-2 inline-flex items-center hover:underline">
                                            네이버 지도에서 위치 확인하기 &rarr;
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start group">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mr-5 shrink-0 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-1 font-bold">Contact</h4>
                                        <p className="text-gray-100 text-xl font-bold font-mono">
                                            0507-1346-1125
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start group">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mr-5 shrink-0 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-1 font-bold">Office Hours</h4>
                                        <ul className="text-gray-300 space-y-1">
                                            <li>평일: 10:00 - 22:00</li>
                                            <li>토요일: 09:00 - 13:00</li>
                                            <li className="text-gray-500 text-sm">* 일요일 및 공휴일 휴무</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="tel:050713461125"
                                className="mt-10 block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-center rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
                            >
                                전화 상담 연결하기
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
