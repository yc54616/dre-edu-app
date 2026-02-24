
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
            className="pointer-events-none fixed left-0 right-0 z-40 flex justify-center px-4 md:hidden"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        >
            <Link href="/admission" className="pointer-events-auto flex w-full max-w-sm items-center justify-center space-x-2 rounded-full bg-[var(--color-dre-blue)] px-6 py-3 text-sm font-bold text-white shadow-xl transition-colors hover:bg-[var(--color-dre-blue-dark)] active:scale-95 sm:w-auto sm:px-8 sm:text-base">
                <ClipboardCheck size={20} />
                <span>1:1 정밀 진단 신청</span>
            </Link>
        </motion.div>
    );
}
