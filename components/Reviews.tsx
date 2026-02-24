
'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const reviews = [
    {
        id: 1,
        name: "해바라기nn",
        content: "여름방학 특강이 유명하더라구요! 나에게 딱 맞는 수업이라는 취지로 수준별 맞춤으로 진행되고 스케줄 조정도 된다고 하니 좋은것 같아요. 주3회 하루 180분 빠짝 해서 방학동안 수학 완벽 정리 하기 좋은 커리큘럼인것 같아요!",
        tag: "학부모"
    },
    {
        id: 2,
        name: "ghj****",
        content: "선생님께서 시험 대비 수준별 그리고 맞춤별 코칭 수업으로 엄청 꼼꼼하게 지도해 주십니다. 그리고 원장님이 학생 개개인의 파악하여 학습 방향을 제시 해 주시고 그 학생별 맞게 적정한 난이도와 적정한 양의 숙제를 내 주셔서 우리 아이도 잘 다니고 있어요.",
        tag: "학부모"
    },
    {
        id: 3,
        name: "els****",
        content: "엄마들 사이에서 유명한것 같아서 저도 보내봤는데 중간고사 대비도 잘해주시고 수준별, 개인별 맞춤 코칭수업으로 아이에게 꼭 맞는 적절한 난이도와 문제량을 주셔서 아이가 드디어 공부에 재미를 붙였어요 ㅎㅎ 감사합니다!!!",
        tag: "학부모"
    },
    {
        id: 4,
        name: "김OO",
        content: "수학을 포기할까 고민하던 중에 DRE를 만나고 희망을 찾았습니다. 모르는 부분을 끝까지 이해시켜 주시는 선생님 덕분에 성적이 30점이나 올랐어요!",
        tag: "중3 재원생"
    },
    {
        id: 5,
        name: "carry031833",
        content: "너무 잘가르쳐 줍니다.^^",
        tag: "재원생"
    },
    {
        id: 6,
        name: "고3 학생",
        content: "원장님이 2년 동안 잘 지도해주셔서 이번 수시 원서 쓸 때 정말 큰 도움이 됐어요. 감사합니다.",
        tag: "고3 재원생"
    }
];

export default function Reviews() {
    return (
        <section id="reviews" className="py-24 bg-dre-gradient-dark relative overflow-hidden text-white">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-pattern z-0 opacity-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-4"
                    >
                        학생과 학부모님의 생생한 후기
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-blue-100 max-w-2xl mx-auto"
                    >
                        DRE와 함께 꿈을 이룬 학생들의 이야기입니다.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                        >
                            <div className="flex items-center mb-4">
                                <span className="text-4xl mr-3">❝</span>
                                <div>
                                    <p className="font-bold text-lg">{review.name}</p>
                                    <span className="text-sm text-blue-200 bg-blue-900/50 px-2 py-0.5 rounded">{review.tag}</span>
                                </div>
                            </div>
                            <p className="text-gray-100 leading-relaxed mb-4 min-h-[80px]">
                                {review.content}
                            </p>
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
