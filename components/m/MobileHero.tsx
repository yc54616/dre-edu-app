'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MobileHero() {
  return (
    <div className="relative w-full overflow-hidden bg-white mb-6">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-95" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative px-6 py-10 sm:py-14 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 mb-4">
            <Sparkles size={12} className="text-yellow-300" />
            <span className="text-[11px] font-bold tracking-wider uppercase">Premium Edtech</span>
          </div>
          
          <h1 className="text-3xl font-black leading-tight mb-3">
            나에게 딱 맞는<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              최고의 학습 자료
            </span>
          </h1>
          
          <p className="text-blue-100 text-sm font-medium mb-6 max-w-[80%] leading-relaxed">
            DRE 연구소가 검수한 고품질 문항으로<br />성적 향상의 지름길을 찾으세요.
          </p>

          <Link 
            href="/m/recommend"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl text-sm font-bold shadow-lg shadow-black/10 active:scale-95 transition-transform"
          >
            맞춤 자료 찾기
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
