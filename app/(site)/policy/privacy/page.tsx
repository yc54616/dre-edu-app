export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4 border-gray-200">개인정보처리방침</h1>

            <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
                <section>
                    <p className="lead">
                        DRE 수학학원('https://dre-edu.com'이하 '학원')은 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고
                        개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">1. 개인정보의 처리 목적</h2>
                    <p>학원은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li><strong>홈페이지 회원가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리 등</li>
                        <li><strong>학습 상담 및 관리:</strong> 수강 신청, 레벨 테스트 결과 안내, 성적 관리, 입시 상담 등</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">2. 개인정보의 처리 및 보유 기간</h2>
                    <p>학원은 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">3. 정보주체와 법정대리인의 권리·의무 및 그 행사방법</h2>
                    <p>정보주체는 학원에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">4. 처리하는 개인정보의 항목</h2>
                    <p>학원은 다음의 개인정보 항목을 처리하고 있습니다.</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>필수항목: 성명, 전화번호, 재학 중인 학교/학년</li>
                        <li>선택항목: 이메일 주소, 희망 수강 과목</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-3">5. 개인정보 보호책임자</h2>
                    <p>학원은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <ul className="space-y-1 text-sm">
                            <li><strong>담당자:</strong> 행정실장</li>
                            <li><strong>연락처:</strong> 02-XXX-XXXX</li>
                            <li><strong>이메일:</strong> privacy@dre-edu.com</li>
                        </ul>
                    </div>
                </section>

                <div className="pt-8 text-sm text-gray-500">
                    <p>본 방침은 2024년 1월 1일부터 시행됩니다.</p>
                </div>
            </div>
        </div>
    );
}
