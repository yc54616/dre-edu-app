'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { MATERIAL_SUBJECTS } from '@/lib/constants/material';

interface CategoryListProps {
  currentSubject: string;
}

export default function MobileCategoryList({ currentSubject }: CategoryListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = ['전체', ...MATERIAL_SUBJECTS];

  return (
    <div className="sticky top-14 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3 pl-4">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-2 pr-4 scrollbar-hide"
      >
        {categories.map((subject) => {
          const isSelected = currentSubject === subject || (subject === '전체' && !currentSubject);
          const href = subject === '전체' ? '/m/materials' : `/m/materials?subject=${encodeURIComponent(subject)}`;
          
          return (
            <Link
              key={subject}
              href={href}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-200 ${
                isSelected
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
            >
              {subject}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
