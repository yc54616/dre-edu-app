'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Search, User, X, ChevronRight, LogOut, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { MATERIAL_SUBJECTS } from '@/lib/constants/material';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: '홈', href: '/m/materials', icon: Home },
    { name: '카테고리', href: '#', icon: Layers, action: () => setIsMenuOpen(!isMenuOpen) },
    { name: '검색', href: '/m/materials?search=true', icon: Search },
    { name: '마이', href: '/m/my-orders', icon: User },
  ];

  return (
    <>
      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-[95] w-[80%] max-w-[320px] bg-white shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-gray-900">전체 메뉴</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-900">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Section 1: Categories */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">학습 자료</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/m/materials" className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        전체 보기
                        <ChevronRight size={16} className="text-gray-400" />
                      </Link>
                      {MATERIAL_SUBJECTS.map((s) => (
                        <Link key={s} href={`/m/materials?subject=${encodeURIComponent(s)}`} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          {s}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Account */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">계정</h3>
                    <div className="space-y-2">
                        <Link href="/m/my-orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                            <User size={18} />
                            마이페이지
                        </Link>
                        <Link href="/m/purchase" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">
                            <ShoppingBag size={18} />
                            구매 내역
                        </Link>
                        <button 
                            onClick={() => signOut({ callbackUrl: '/m' })}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium text-left"
                        >
                            <LogOut size={18} />
                            로그아웃
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (item.action) {
                    e.preventDefault();
                    item.action();
                  }
                }}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 relative group`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : 'bg-transparent'}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
