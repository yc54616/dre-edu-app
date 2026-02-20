'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, Award, Trophy, Medal, GraduationCap } from 'lucide-react';

// Mock Data for Admissions
const admissions = [
    {
        id: 1,
        univ: "서울대학교",
        major: "의예과",
        student: "김O준",
        school: "OO고 3",
        badge: "수시 합격",
        desc: "DRE와 함께한 3년, 내신 1.0의 기적"
    },
    {
        id: 2,
        univ: "연세대학교",
        major: "경영학과",
        student: "이O아",
        school: "OO고 3",
        badge: "정시 합격",
        desc: "수학 4등급에서 1등급으로, 수능 만점 달성"
    },
    {
        id: 3,
        univ: "고려대학교",
        major: "컴퓨터공학과",
        student: "박O진",
        school: "OO고 3",
        badge: "수시 합격",
        desc: "체계적인 로드맵으로 꿈을 이루었습니다."
    },
];

// Existing Reviews Data
const reviews = [
    {
        id: 1,
        name: "해바라기nn",
        content: "여름방학 특강이 유명하더라구요! 나에게 딱 맞는 수업이라는 취지로 수준별 맞춤으로 진행되고 스케줄 조정도 된다고 하니 좋은것 같아요. 주3회 하루 180분 빠짝 해서 방학동안 수학 완벽 정리 하기 좋은 커리큘럼인것 같아요!",
        tag: "학부모",
        stars: 5
    },
    {
        id: 2,
        name: "ghj****",
        content: "선생님께서 시험 대비 수준별 그리고 맞춤별 코칭 수업으로 엄청 꼼꼼하게 지도해 주십니다. 그리고 원장님이 학생 개개인의 파악하여 학습 방향을 제시 해 주시고 그 학생별 맞게 적정한 난이도와 적정한 양의 숙제를 내 주셔서 우리 아이도 잘 다니고 있어요.",
        tag: "학부모",
        stars: 5
    },
    {
        id: 3,
        name: "els****",
        content: "엄마들 사이에서 유명한것 같아서 저도 보내봤는데 중간고사 대비도 잘해주시고 수준별, 개인별 맞춤 코칭수업으로 아이에게 꼭 맞는 적절한 난이도와 문제량을 주셔서 아이가 드디어 공부에 재미를 붙였어요 ㅎㅎ 감사합니다!!!",
        tag: "학부모",
        stars: 5
    },
    {
        id: 4,
        name: "김OO",
        content: "수학을 포기할까 고민하던 중에 DRE를 만나고 희망을 찾았습니다. 모르는 부분을 끝까지 이해시켜 주시는 선생님 덕분에 성적이 30점이나 올랐어요!",
        tag: "중3 재원생",
        stars: 5
    },
    {
        id: 5,
        name: "carry031833",
        content: "너무 잘가르쳐 줍니다.^^",
        tag: "재원생",
        stars: 5
    },
    {
        id: 6,
        name: "고3 학생",
        content: "원장님이 2년 동안 잘 지도해주셔서 이번 수시 원서 쓸 때 정말 큰 도움이 됐어요. 감사합니다.",
        tag: "고3 재원생",
        stars: 5
    }
];

export default function HallOfFameDetail() {
    const [activeTab, setActiveTab] = useState<'admission' | 'review'>('admission');

    return (
        <section className="py-16 md:py-24 bg-white min-h-screen relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-gray-50 to-white -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Stats Banner - Premium Design */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="rounded-3xl bg-white p-8 md:p-12 mb-20 relative overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.2)] transition-shadow duration-500"
                >
                    <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--color-dre-blue)] via-[var(--color-dre-blue-light)] to-blue-300" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 divide-x divide-transparent md:divide-gray-100">
                        <div className="text-center group flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[var(--color-dre-blue)] group-hover:text-white group-hover:shadow-lg">
                                <Trophy className="w-8 h-8 text-[var(--color-dre-blue)] group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1 font-display tracking-tight">Goal</div>
                            <div className="text-sm text-gray-500 font-medium">목표 대학 합격</div>
                        </div>
                        <div className="text-center group flex flex-col items-center md:border-l border-gray-100">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-lg">
                                <Medal className="w-8 h-8 text-indigo-500 group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1 font-display tracking-tight">Growth</div>
                            <div className="text-sm text-gray-500 font-medium">놀라운 성적 향상</div>
                        </div>
                        <div className="text-center group flex flex-col items-center md:border-l border-gray-100">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-lg">
                                <Award className="w-8 h-8 text-purple-500 group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1 font-display tracking-tight">Custom</div>
                            <div className="text-sm text-gray-500 font-medium">1:1 맞춤 로드맵</div>
                        </div>
                        <div className="text-center group flex flex-col items-center md:border-l border-gray-100">
                            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-teal-500 group-hover:text-white group-hover:shadow-lg">
                                <GraduationCap className="w-8 h-8 text-teal-500 group-hover:text-white transition-colors" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1 font-display tracking-tight">Expert</div>
                            <div className="text-sm text-gray-500 font-medium">입시 전문 코치진</div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex justify-center mb-16 relative z-20">
                    <div className="bg-gray-100/80 backdrop-blur-md p-1.5 rounded-full flex relative shadow-inner">
                        <button
                            onClick={() => setActiveTab('admission')}
                            className={`relative z-10 px-8 py-3.5 rounded-full text-base font-bold transition-colors duration-300 ${activeTab === 'admission' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {activeTab === 'admission' && (
                                <motion.div
                                    layoutId="hallOfFameTab"
                                    className="absolute inset-0 bg-[var(--color-dre-blue)] rounded-full shadow-[0_4px_14px_0_rgba(0,118,255,0.39)]"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                🏆 합격 명예의 전당
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('review')}
                            className={`relative z-10 px-8 py-3.5 rounded-full text-base font-bold transition-colors duration-300 ${activeTab === 'review' ? 'text-white' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {activeTab === 'review' && (
                                <motion.div
                                    layoutId="hallOfFameTab"
                                    className="absolute inset-0 bg-[var(--color-dre-blue)] rounded-full shadow-[0_4px_14px_0_rgba(0,118,255,0.39)]"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                💬 생생 수강 후기
                            </span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'admission' ? (
                            <motion.div
                                key="admission"
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                                className="grid md:grid-cols-3 gap-8"
                            >
                                {/* Admission Cards */}
                                {admissions.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 z-0" />
                                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[var(--color-dre-blue)]/[0.03] rounded-full blur-2xl group-hover:bg-[var(--color-dre-blue)]/[0.08] transition-colors duration-500" />

                                        <div className="absolute top-6 right-6 text-gray-100 group-hover:text-[var(--color-dre-blue)]/10 transition-colors duration-500 transform group-hover:scale-110 group-hover:rotate-12">
                                            <Trophy size={80} strokeWidth={1} />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="inline-flex items-center px-4 py-1.5 bg-blue-50/80 text-[var(--color-dre-blue)] text-sm font-bold rounded-full mb-6 backdrop-blur-sm border border-blue-100/50">
                                                {item.badge}
                                            </div>
                                            <h3 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{item.univ}</h3>
                                            <p className="text-[var(--color-dre-blue)] mb-8 text-base font-semibold">{item.major}</p>

                                            <div className="border-t border-gray-100/80 pt-6">
                                                <p className="text-gray-800 font-bold text-lg mb-3 leading-snug">"{item.desc}"</p>
                                                <p className="text-gray-500 text-sm font-medium">{item.student} ({item.school})</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Placeholder for "Coming Soon" */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: admissions.length * 0.1 }}
                                    className="bg-gray-50/50 rounded-3xl p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center opacity-70 min-h-[300px] hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                >
                                    <Trophy size={48} className="text-gray-300 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-400 mb-2">Next Hero</h3>
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                        다음 명예의 전당 주인공은<br />
                                        바로 당신입니다.
                                    </p>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="review"
                                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                                transition={{ duration: 0.4 }}
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {reviews.map((review, index) => (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <Quote size={80} className="text-gray-50 transform -translate-y-4 translate-x-4 rotate-12" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex bg-yellow-50 px-3 py-1.5 rounded-full items-center gap-1">
                                                    {[...Array(review.stars)].map((_, i) => (
                                                        <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                                                    ))}
                                                </div>
                                                <Quote size={24} className="text-gray-200 group-hover:text-[var(--color-dre-blue)]/20 transition-colors" />
                                            </div>
                                            <p className="text-gray-700 leading-relaxed mb-8 font-medium text-[15px] line-clamp-4 group-hover:line-clamp-none transition-all">
                                                "{review.content}"
                                            </p>
                                            <div className="flex items-center mt-auto border-t border-gray-50 pt-6">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold mr-4 shadow-inner text-lg">
                                                    {review.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-base font-bold text-gray-900">{review.name}</div>
                                                    <div className="text-sm text-[var(--color-dre-blue)] font-medium bg-blue-50/50 inline-block px-2 py-0.5 rounded-md mt-1">{review.tag}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}

