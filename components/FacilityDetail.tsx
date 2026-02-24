'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Phone, Clock, Search, Library, Coffee } from 'lucide-react';

const spaces = [
    {
        id: 'lecture',
        title: "Focus Lecture Room",
        subtitle: "몰입형 강의실",
        desc: "칠판과 선생님에게만 집중할 수 있도록, 불필요한 것을 빼고 조명과 책상 배치까지 신경 쓴 공간입니다.",
        img: "/images/facility_classroom2.jpg",
        icon: <Library className="w-6 h-6" />,
        colSpan: "md:col-span-2"
    },
    {
        id: 'study',
        title: "Deep Study Zone",
        subtitle: "자기주도 학습실",
        desc: "수업 끝나고 바로 복습할 수 있는 자리. 편하게 앉아서 집중할 수 있습니다.",
        img: "/images/facility_study2.jpg",
        icon: <Coffee className="w-6 h-6" />,
        colSpan: "md:col-span-1"
    },
    {
        id: 'coaching',
        title: "1:1 Coaching Lab",
        subtitle: "개별 클리닉 룸",
        desc: "궁금한 건 바로 물어볼 수 있는 1:1 공간. 모르는 부분을 그때그때 해결합니다.",
        img: "/images/facility_classroom3.jpg",
        icon: <Search className="w-6 h-6" />,
        colSpan: "md:col-span-1"
    }
];

export default function FacilityDetail() {
    return (
        <section className="bg-white">

            {/* Space Philosophy */}
            <div className="relative overflow-hidden bg-gray-50 py-12 md:py-24">
                <div className="absolute inset-0 bg-[url('/pattern-grid.svg')] opacity-5" />
                <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
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
                        className="mb-6 text-3xl font-bold leading-tight text-gray-900 font-display md:mb-8 md:text-4xl"
                    >
                        환경이 달라지면 공부도 달라집니다.<br />
                        <span className="text-gray-500">DRE는 공간 하나도 허투루 만들지 않았습니다.</span>
                    </motion.h2>
                </div>
            </div>

            {/* Premium Gallery */}
            <div className="relative z-20 mx-auto -mt-10 mb-14 max-w-7xl px-4 md:-mt-12 md:mb-24">
                <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                    {spaces.map((space, index) => (
                        <motion.div
                            key={space.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative h-[300px] overflow-hidden rounded-3xl shadow-xl sm:h-[340px] md:h-[400px] ${space.colSpan}`}
                        >
                            <Image
                                src={space.img}
                                alt={space.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                            <div className="absolute bottom-0 left-0 w-full transform p-5 transition-transform duration-300 group-hover:translate-y-0 sm:p-6 md:p-10 md:translate-y-4">
                                <div className="flex items-center gap-3 mb-3 text-blue-300">
                                    <div className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                        {space.icon}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider sm:text-sm">{space.title}</span>
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white sm:mb-3 sm:text-2xl">{space.subtitle}</h3>
                                <p className="text-sm leading-relaxed text-gray-300 opacity-100 transition-opacity duration-300 delay-75 md:opacity-0 md:group-hover:opacity-100 md:text-base">
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
            <div className="relative overflow-hidden bg-gray-900 py-12 text-white md:py-24">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="mb-10 text-center md:mb-16">
                        <span className="text-blue-400 font-bold tracking-widest text-sm uppercase mb-2 block">Location</span>
                        <h2 className="mb-3 text-3xl font-bold text-white md:mb-4 md:text-4xl">오시는 길</h2>
                        <p className="text-sm text-gray-400 md:text-base">DRE 수학학원 위치 안내입니다.</p>
                    </div>

                    <div className="grid items-start gap-6 md:grid-cols-2 md:gap-12">
                        {/* Map */}
                        <div className="group relative h-[300px] overflow-hidden rounded-3xl border border-gray-700 bg-gray-800 shadow-2xl sm:h-[350px] md:h-[450px]">
                            {/* Naver Map Embed with Smart Crop */}
                            <div className="absolute left-1/2 top-1/2 h-[185%] w-[360%] -translate-x-[58%] -translate-y-[55%] sm:h-[200%] sm:w-[400%] sm:-translate-x-[62%] lg:h-[160%] lg:w-[300%] lg:-translate-x-1/2 lg:-translate-y-1/2">
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
                            <div className="absolute bottom-3 right-3 z-10 md:bottom-4 md:right-4">
                                <a
                                    href="https://map.naver.com/p/entry/place/1087649900"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 rounded-full bg-[#03C75A] px-3 py-2 text-[11px] font-bold text-white shadow-lg transition-colors hover:bg-[#02b351] md:text-xs"
                                >
                                    <span className="font-extrabold">N</span> 네이버 지도 보기
                                </a>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-lg sm:p-8 md:p-10">
                            <h3 className="mb-6 border-b border-white/10 pb-5 text-xl font-bold text-white sm:mb-8 sm:pb-6 sm:text-2xl">Contact Info</h3>

                            <div className="space-y-6 sm:space-y-8">
                                <div className="flex items-start group">
                                    <div className="mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#03C75A]/20 bg-[#03C75A]/10 text-[#03C75A] transition-all duration-300 group-hover:bg-[#03C75A] group-hover:text-white sm:mr-5 sm:h-12 sm:w-12">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400 sm:text-sm">Address</h4>
                                        <p className="text-base leading-relaxed text-gray-100 sm:text-lg">
                                            서울 중구 퇴계로 452-1 스타빌딩 B동 7층<br />
                                            (신당역 2번 출구 도보 3분)
                                        </p>
                                        <a href="https://m.place.naver.com/place/1087649900" target="_blank" className="text-[#03C75A] text-sm font-bold mt-2 inline-flex items-center hover:underline">
                                            네이버 지도에서 위치 확인하기 &rarr;
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start group">
                                    <div className="mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-all duration-300 group-hover:bg-blue-500 group-hover:text-white sm:mr-5 sm:h-12 sm:w-12">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400 sm:text-sm">Contact</h4>
                                        <p className="font-mono text-lg font-bold text-gray-100 sm:text-xl">
                                            0507-1346-1125
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start group">
                                    <div className="mr-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition-all duration-300 group-hover:bg-blue-500 group-hover:text-white sm:mr-5 sm:h-12 sm:w-12">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400 sm:text-sm">Office Hours</h4>
                                        <ul className="space-y-1 text-sm text-gray-300 sm:text-base">
                                            <li>평일: 10:00 - 22:00</li>
                                            <li>토요일: 09:00 - 13:00</li>
                                            <li className="text-gray-500 text-sm">* 일요일 및 공휴일 휴무</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="tel:050713461125"
                                className="mt-8 block w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30 sm:mt-10 sm:py-4 sm:text-base"
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
