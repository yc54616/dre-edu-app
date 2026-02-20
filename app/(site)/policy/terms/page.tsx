export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4 border-gray-200">이용약관</h1>

            <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">제1조 (목적)</h2>
                    <p>
                        본 약관은 DRE 수학학원(이하 "학원"이라 함)이 제공하는 교육 서비스 및 관련 제반 서비스(이하 "서비스"라 함)의
                        이용과 관련하여 학원과 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">제2조 (정의)</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>"이용자"란 학원의 웹사이트에 접속하여 본 약관에 따라 학원이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                        <li>"회원"이라 함은 학원에 개인정보를 제공하여 회원등록을 한 자로서, 학원의 정보를 지속적으로 제공받으며 학원이 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">제3조 (약관의 효력 및 변경)</h2>
                    <p>
                        학원은 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
                        학원은 사정 변경의 경우나 영업상 중요 사유가 있을 때 관계 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">제4조 (개인정보보호)</h2>
                    <p>
                        학원은 이용자의 개인정보 수집 시 서비스 제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다.
                        학원은 이용자의 개인정보를 동의 없이 제3자에게 제공하지 않습니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">제5조 (회원의 의무)</h2>
                    <p>
                        회원은 다음 행위를 하여서는 안 됩니다.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>신청 또는 변경 시 허위 내용의 등록</li>
                        <li>타인의 정보 도용</li>
                        <li>학원 및 기타 제3자의 저작권 등 지식재산권에 대한 침해</li>
                        <li>학원 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                    </ul>
                </section>

                <div className="pt-8 text-sm text-gray-500">
                    <p>부칙</p>
                    <p>본 약관은 2024년 1월 1일부터 시행합니다.</p>
                </div>
            </div>
        </div>
    );
}
