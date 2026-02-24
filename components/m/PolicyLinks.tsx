import Link from 'next/link';

interface PolicyLinksProps {
  className?: string;
  textClassName?: string;
  linkClassName?: string;
  dividerClassName?: string;
}

export default function PolicyLinks({
  className = '',
  textClassName = 'text-xs font-medium text-gray-400',
  linkClassName = 'font-semibold text-gray-500 hover:text-blue-600 transition-colors',
  dividerClassName = 'text-gray-300',
}: PolicyLinksProps) {
  return (
    <div className={`flex items-center gap-2 ${textClassName} ${className}`}>
      <Link href="/policy/terms" className={linkClassName}>
        이용약관
      </Link>
      <span className={dividerClassName}>·</span>
      <Link href="/policy/privacy" className={linkClassName}>
        개인정보처리방침
      </Link>
    </div>
  );
}
