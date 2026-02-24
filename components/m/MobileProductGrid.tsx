'use client';

import Link from 'next/link';
import { BookOpen, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { buildMaterialTitle } from '@/lib/material-display';

interface MobileMaterial {
  materialId: string;
  sourceCategory?: string;
  publisher?: string | null;
  bookTitle?: string | null;
  schoolName?: string | null;
  subject: string;
  topic?: string | null;
  difficulty: number;
  fileType?: string;
  isFree?: boolean;
  priceProblem?: number;
  previewImages?: string[];
  downloadCount?: number;
}

interface ProductGridProps {
  materials: MobileMaterial[];
}

const DIFFICULTY_LABEL: Record<number, string> = {
    1: '입문',
    2: '기본',
    3: '심화',
    4: '최상위',
    5: '챌린지'
};

const DIFFICULTY_COLOR: Record<number, string> = {
    1: 'emerald',
    2: 'blue',
    3: 'violet',
    4: 'orange',
    5: 'red'
};

const diffStyle: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  violet: 'bg-violet-100 text-violet-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-700',
};

export default function MobileProductGrid({ materials }: ProductGridProps) {
  if (!materials || materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <BookOpen size={24} className="text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">등록된 자료가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-20">
      {materials.map((m, idx) => {
        const title = buildMaterialTitle(m);
        const dc = DIFFICULTY_COLOR[m.difficulty] || 'blue';
        
        return (
          <motion.div
            key={m.materialId || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={`/m/materials/${m.materialId}`}
              className="group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              {/* Thumbnail Area */}
              <div className="aspect-[4/5] relative bg-gray-50 overflow-hidden">
                {m.previewImages?.[0] ? (
                  <img
                    src={`/uploads/previews/${m.previewImages[0]}`}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full flex flex-col items-center justify-center p-4 text-center ${
                    m.fileType === 'hwp' ? 'bg-amber-50' : 'bg-blue-50'
                  }`}>
                     <BookOpen size={24} className={
                        m.fileType === 'hwp' ? 'text-orange-400' : 'text-blue-400'
                     } />
                     <span className="text-[10px] font-bold text-gray-400 mt-2 line-clamp-2">{m.subject}</span>
                  </div>
                )}
                
                {/* Labels */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                   {/* Difficulty Badge */}
                   <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold shadow-sm ${diffStyle[dc]}`}>
                      {DIFFICULTY_LABEL[m.difficulty]}
                   </span>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-3">
                <h3 className="text-[13px] font-bold text-gray-900 line-clamp-2 leading-snug min-h-[2.5em] mb-1">
                  {title || m.subject}
                </h3>
                
                <div className="flex items-center justify-between mt-2">
                   <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <ShoppingBag size={10} />
                      <span>{m.downloadCount || 0}</span>
                   </div>
                   
                   <div className="text-right">
                      {m.isFree ? (
                        <span className="text-[11px] font-bold text-emerald-600">무료</span>
                      ) : (
                        <span className="text-[11px] font-bold text-gray-900">
                          {m.priceProblem?.toLocaleString()}원~
                        </span>
                      )}
                   </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
