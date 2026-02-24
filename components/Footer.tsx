
import Link from 'next/link';
import { MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
    return (
        <footer id="contact" className="bg-dre-gradient-dark text-white pt-16 pb-24 md:pb-8 relative overflow-hidden">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-pattern z-0 opacity-5 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-4 gap-8 mb-12">

                    {/* Brand & Description */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-6">DRE 수학</h3>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            설명하지 않고 질문합니다.<br />
                            가르치지 않고 깨닫게 합니다.<br />
                            진짜 실력을 만드는 DRE 수학학원.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">바로가기</h4>
                        <ul className="space-y-3">
                            <li><Link href="/about/system" className="hover:text-white transition-colors">DRE 시스템</Link></li>
                            <li><Link href="/about/facility" className="hover:text-white transition-colors">시설 안내/오시는 길</Link></li>
                            <li><Link href="/curriculum" className="hover:text-white transition-colors">커리큘럼</Link></li>
                            <li><Link href="/coaching/math" className="hover:text-white transition-colors">코칭 안내</Link></li>
                            <li><Link href="/hall-of-fame" className="hover:text-white transition-colors">명예의 전당</Link></li>
                            <li><Link href="/admission" className="hover:text-dre-blue transition-colors font-bold text-dre-blue-light">입학 안내/신청</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-6">오시는 길</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin className="mr-3 mt-1 flex-shrink-0 text-[var(--color-dre-blue)]" size={18} />
                                <span>서울 중구 퇴계로 452-1<br />스타빌딩 B동 7층</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="mr-3 flex-shrink-0 text-[var(--color-dre-blue)]" size={18} />
                                <span>0507-1346-1125</span>
                            </li>
                        </ul>
                    </div>

                    {/* Hours */}
                    <div>
                        <h4 className="text-white font-bold mb-6">상담 시간</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <Clock className="mr-3 flex-shrink-0 text-[var(--color-dre-blue)]" size={18} />
                                <span>평일: 13:00 - 15:00</span>
                            </li>
                            <li className="flex items-center">
                                <Clock className="mr-3 flex-shrink-0 text-[var(--color-dre-blue)]" size={18} />
                                <span>토요일: 13:00 - 15:00</span>
                            </li>
                            <li className="text-sm text-gray-500 pl-8">
                                * 일요일 휴무
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} DRE Math Academy. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <Link href="/policy/terms" className="hover:text-white transition-colors">이용약관</Link>
                        <Link href="/policy/privacy" className="hover:text-white transition-colors font-bold">개인정보처리방침</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
