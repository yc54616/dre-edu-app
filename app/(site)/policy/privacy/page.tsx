const EFFECTIVE_DATE = '2026년 2월 23일';
const UPDATED_DATE = '2026년 2월 23일';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4 border-gray-200">
        개인정보처리방침
      </h1>

      <div className="prose prose-blue max-w-none text-gray-700 space-y-8">
        <section>
          <p className="lead">
            DRE 수학학원(이하 &quot;학원&quot;)은 개인정보 보호법 제30조 및 같은 법 시행령
            제31조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고
            원활하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
          </p>
          <p>본 방침은 학원이 운영하는 웹사이트 및 학습자료 서비스 전반에 적용됩니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">1. 처리하는 개인정보 항목</h2>
          <p>학원은 서비스 제공을 위해 아래 개인정보를 처리합니다.</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              회원가입/로그인: 이메일, 사용자명, 비밀번호(암호화 저장), 회원 역할(학생/교사/관리자)
            </li>
            <li>
              이메일 인증: 인증토큰 해시값, 인증토큰 만료시각, 이메일 인증 여부
            </li>
            <li>
              만 14세 미만 회원가입 시: 생년월일, 법정대리인 성명/연락처, 법정대리인 동의 이력
            </li>
            <li>
              주문/결제: 사용자 식별값, 주문번호, 구매 자료 식별값, 구매 항목, 결제금액,
              결제상태, 결제수단, 결제키(paymentKey)
            </li>
            <li>
              맞춤 추천 기능: 학습 토픽별 레이팅, 시도/정답 수, 피드백 이력(난이도 선택 등)
            </li>
            <li>
              자동 수집 정보: 접속 IP, 브라우저/기기 정보, 쿠키, 접속 일시(서비스 운영 및
              보안 목적)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">2. 개인정보 처리 목적</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>회원 식별 및 인증, 계정 관리, 부정 이용 방지</li>
            <li>유료 콘텐츠 주문 처리, 결제 확인, 구매 이력 관리</li>
            <li>학습 수준 기반 추천, 서비스 개인화 및 품질 개선</li>
            <li>민원 대응, 분쟁 처리, 법령상 의무 이행</li>
            <li>보안, 장애 대응, 서비스 안정성 확보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">3. 개인정보의 처리 및 보유기간</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              회원정보: 회원 탈퇴 시까지 보유·이용(다만 관련 법령상 보존 의무가 있는 경우 해당
              기간 보관)
            </li>
            <li>
              이메일 인증정보(인증토큰): 발급 후 최대 4시간 또는 인증 완료 시점까지 보관 후
              지체 없이 삭제
            </li>
            <li>
              전자상거래 관련 기록(계약/청약철회/결제/재화공급): 전자상거래 등에서의
              소비자보호에 관한 법률에 따라 5년
            </li>
            <li>
              만 14세 미만 법정대리인 동의 기록: 회원 탈퇴 시까지(법령상 별도 보관의무가 있는
              경우 해당 기간)
            </li>
            <li>소비자 불만 또는 분쟁처리 기록: 3년</li>
            <li>표시·광고에 관한 기록: 6개월</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            4. 개인정보의 제3자 제공에 관한 사항
          </h2>
          <p>
            학원은 원칙적으로 정보주체의 개인정보를 외부에 제공하지 않습니다. 다만, 정보주체의
            별도 동의가 있거나 법령에 특별한 규정이 있는 경우에는 예외로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">5. 개인정보 처리의 위탁</h2>
          <p>학원은 원활한 서비스 제공을 위해 다음과 같이 업무를 위탁할 수 있습니다.</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              이메일 발송: Resend (회원가입 인증 메일 발송, 수탁 처리항목: 이메일 주소,
              사용자명)
            </li>
            <li>
              결제 처리: 토스페이먼츠 (결제 승인 처리, 수탁 처리항목: 주문번호, 결제 관련 식별자,
              결제금액 등)
            </li>
          </ul>
          <p className="text-sm text-gray-500 mt-3">
            위탁계약 시 개인정보 보호법 제26조에 따라 수탁자 관리·감독 및 안전조치를
            이행합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">6. 개인정보의 국외 이전</h2>
          <p>
            학원은 이메일 발송 서비스 이용 과정에서 개인정보가 국외 서버를 경유·저장될
            가능성이 있습니다. 학원은 관련 법령이 정한 절차에 따라 보호조치를 적용합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            7. 정보주체와 법정대리인의 권리·의무 및 행사방법
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              정보주체는 언제든지 개인정보 열람, 정정·삭제, 처리정지, 동의 철회를 요청할 수
              있습니다.
            </li>
            <li>
              권리 행사는 이메일 또는 서면으로 요청할 수 있으며, 학원은 지체 없이 필요한 조치를
              취합니다.
            </li>
            <li>
              법정대리인은 만 14세 미만 아동의 개인정보에 대해 동일한 권리를 행사할 수
              있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">8. 개인정보 파기 절차 및 방법</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              파기 사유가 발생한 개인정보는 지체 없이 파기합니다. 다만 법령에 따라 보존이
              필요한 경우 별도 분리 보관합니다.
            </li>
            <li>
              전자적 파일 형태 정보는 복구 또는 재생되지 않도록 기술적 방법으로 삭제합니다.
            </li>
            <li>
              종이 문서 형태 정보는 분쇄 또는 소각 등으로 파기합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">9. 개인정보의 안전성 확보조치</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>개인정보 접근 권한의 최소화 및 접근통제</li>
            <li>비밀번호 등 중요정보의 암호화 저장</li>
            <li>보안 점검 및 접속기록 관리</li>
            <li>개인정보 취급자 최소화 및 내부 관리계획 운영</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">10. 쿠키의 설치·운영 및 거부</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              학원은 로그인 세션 유지 및 사용자 모드(학생/교사) 설정을 위해 쿠키를 사용할 수
              있습니다.
            </li>
            <li>
              이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 로그인 유지
              또는 일부 기능 이용이 제한될 수 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            11. 개인정보 보호책임자 및 개인정보 열람청구
          </h2>
          <div className="mt-2 bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-1 text-sm">
              <li>
                <strong>상호:</strong> 디알이(DRE) 수학 교습소
              </li>
              <li>
                <strong>대표자명:</strong> 유재무
              </li>
              <li>
                <strong>사업자등록번호:</strong> 512-99-01452
              </li>
              <li>
                <strong>통신판매업신고번호:</strong> 제 2025-서울중구-723호
              </li>
              <li>
                <strong>사업장주소:</strong> 서울 중구 퇴계로 452-1 스타빌딩 B동 7층
              </li>
              <li>
                <strong>개인정보 보호책임자:</strong> 유재무
              </li>
              <li>
                <strong>유선전화번호:</strong> 0507-1346-1125
              </li>
              <li>
                <strong>이메일:</strong> carry0318@gmail.com
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            개인정보 열람청구는 위 연락처를 통해 접수할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">12. 권익침해 구제방법</h2>
          <p>정보주체는 아래 기관에 개인정보 침해 관련 상담 및 분쟁조정을 신청할 수 있습니다.</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>개인정보침해신고센터: privacy.kisa.or.kr / 국번없이 118</li>
            <li>개인정보분쟁조정위원회: www.kopico.go.kr / 1833-6972</li>
            <li>대검찰청: www.spo.go.kr / 국번없이 1301</li>
            <li>경찰청: ecrm.police.go.kr / 국번없이 182</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            13. 개인정보처리방침의 변경
          </h2>
          <p>
            본 방침은 법령 및 서비스 변경사항을 반영하여 개정될 수 있으며, 변경 시 웹사이트를
            통해 사전 공지합니다.
          </p>
          <div className="pt-4 text-sm text-gray-500">
            <p>공고일자: {UPDATED_DATE}</p>
            <p>시행일자: {EFFECTIVE_DATE}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
