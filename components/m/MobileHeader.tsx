'use client';

import Link from 'next/link';
import { Search, ShoppingBag, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileHeader() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-14 flex items-center justify-between px-4"
    >
      <div className="flex items-center gap-3">
        {/* Logo */}
        <Link href="/m/materials" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                D
            </div>
            <span className="font-extrabold text-lg text-gray-900 tracking-tight">DRE M</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/m/materials?search=true" className="text-gray-600 hover:text-blue-600 transition-colors">
          <Search size={22} />
        </Link>
        <Link href="/m/purchase" className="text-gray-600 hover:text-blue-600 transition-colors relative">
          <ShoppingBag size={22} />
          {/* Badge placeholder - logic can be added later */}
          {/* <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">2</span> */}
        </Link>
      </div>
    </motion.header>
  );
}
