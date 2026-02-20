
'use client';

import { ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function FloatingCallBtn() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="md:hidden fixed bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none"
        >
            <Link href="/admission" className="bg-[var(--color-dre-blue)] text-white font-bold py-3 px-8 rounded-full shadow-xl flex items-center space-x-2 hover:bg-[var(--color-dre-blue-dark)] transition-colors pointer-events-auto transform hover:scale-105 active:scale-95">
                <ClipboardCheck size={20} />
                <span>1:1 정밀 진단 신청</span>
            </Link>
        </motion.div>
    );
}
