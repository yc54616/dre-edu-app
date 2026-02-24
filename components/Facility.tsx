'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const photos = [
    {
        src: '/images/facility_classroom.jpg',
        alt: '강의실 전경',
        title: '집중이 잘 되는 강의실'
    },
    {
        src: '/images/facility_study.jpg',
        alt: '자습 공간',
        title: '카페형 자습 & 코칭 존'
    },
    {
        src: '/images/facility_coaching.png',
        alt: '1:1 코칭',
        title: '1:1 맞춤 코칭'
    }
];

export default function Facility() {
    return (
        <section id="facility" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    >
                        학습에 최적화된 공간
                    </motion.h2>
                    <p className="text-lg text-gray-600">
                        오직 공부에만 집중할 수 있도록 설계했습니다.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {photos.map((photo, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="group relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3]"
                        >
                            <Image
                                src={photo.src}
                                alt={photo.alt}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="backdrop-blur-md bg-white/10 p-4 rounded-xl border border-white/20">
                                    <h3 className="text-xl font-bold text-white mb-1 text-center">{photo.title}</h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
