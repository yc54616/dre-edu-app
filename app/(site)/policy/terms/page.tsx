const EFFECTIVE_DATE = '2026년 2월 26일';
const UPDATED_DATE = '2026년 2월 26일';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4 border-gray-200">
        이용약관
      </h1>

      <div className="prose prose-blue max-w-none text-gray-700 space-y-8">
        <section>
          <p className="lead">
            본 약관은 DRE 수학학원(이하 &quot;학원&quot;)이 운영하는 온라인 서비스(웹사이트
            및 자료구매/추천 서비스, 이하 &quot;서비스&quot;)의 이용과 관련하여 학원과 이용자의
            권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
          <p>
            본 약관에서 정하지 아니한 사항은 민법, 전자상거래 등에서의 소비자보호에 관한
            법률, 개인정보 보호법, 정보통신망 관련 법령 및 관계 법령 또는 상관례에
            따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제1조 (용어의 정의)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              &quot;회원&quot;이란 본 약관에 동의하고 계정을 생성하여 서비스를 이용하는 자를
              말합니다.
            </li>
            <li>
              &quot;콘텐츠&quot;란 학원이 제공하는 학습 자료(PDF 등 디지털 파일), 추천 정보, 기타
              온라인 서비스 결과물을 말합니다.
            </li>
            <li>
              &quot;유료서비스&quot;란 회원이 대금을 지급하고 이용하는 유상 콘텐츠 또는 기능을
              말합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제2조 (약관의 게시와 개정)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>학원은 본 약관의 내용을 서비스 화면에 게시합니다.</li>
            <li>
              학원은 관계 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시
              적용일자 및 개정사유를 적용일자 7일 전(이용자에게 불리한 경우 30일 전)부터
              공지합니다.
            </li>
            <li>
              회원이 개정약관 시행일까지 명시적으로 거부의사를 표시하지 않고 서비스를 계속
              이용하는 경우 개정약관에 동의한 것으로 봅니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제3조 (서비스의 제공 및 변경)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>학원은 다음 서비스를 제공합니다.</li>
            <li>회원가입, 로그인, 이메일 인증</li>
            <li>학습 자료 조회, 구매, 다운로드</li>
            <li>학습 수준(레이팅) 기반 추천 및 피드백 서비스</li>
            <li>카카오톡 채널 챗봇을 통한 상담 신청, 일정 변경·취소 요청</li>
            <li>카카오 알림톡을 통한 상담 접수 확인, 일정 안내 등 알림 발송</li>
            <li>카카오 브랜드 메시지를 통한 이벤트, 특강, 할인 등 광고성 정보 발송(마케팅 수신 동의 회원 대상)</li>
            <li>
              학원은 운영상/기술상 필요에 따라 서비스의 전부 또는 일부를 변경할 수 있으며,
              중요한 변경은 사전 공지합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제4조 (회원가입 및 계정관리)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              회원가입은 이용자가 약관 및 개인정보처리방침에 동의하고, 학원이 정한 가입
              절차(이메일 인증 포함)를 완료함으로써 성립합니다.
            </li>
            <li>
              회원은 정확한 정보를 제공하여야 하며, 허위 정보 제공으로 발생한 불이익은
              회원 본인에게 있습니다.
            </li>
            <li>
              회원은 계정 및 비밀번호를 직접 관리할 책임이 있으며, 제3자에게 양도/대여할 수
              없습니다.
            </li>
            <li>
              만 14세 미만 아동은 회원가입 시 법정대리인의 동의를 받아야 하며, 학원은 해당 동의
              여부를 확인할 수 있습니다.
            </li>
            <li>
              회원은 가입 시 광고성 정보 수신에 선택적으로 동의할 수 있으며, 언제든지 수신을 거부할
              수 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제5조 (회원의 의무)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>관계 법령, 본 약관, 서비스 이용안내를 준수해야 합니다.</li>
            <li>
              서비스 운영을 방해하거나 타인의 권리를 침해하는 행위(계정 도용, 해킹 시도,
              불법 배포, 무단 크롤링 등)를 해서는 안 됩니다.
            </li>
            <li>
              유료 콘텐츠를 무단 복제/배포/공유하거나 상업적으로 재판매해서는 안 됩니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제6조 (학원의 의무)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              학원은 관계 법령과 본 약관이 금지하는 행위를 하지 않으며, 안정적인 서비스
              제공을 위해 노력합니다.
            </li>
            <li>
              학원은 회원의 개인정보를 개인정보처리방침에 따라 보호하고, 보안 강화를 위해
              합리적인 기술적/관리적 조치를 취합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제7조 (유료서비스 결제)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              유료서비스 이용대금은 서비스 화면에 표시된 금액 및 결제조건에 따라 결제됩니다.
            </li>
            <li>
              결제는 전자결제대행사(토스페이먼츠 등)를 통해 처리되며, 결제 과정에서 해당
              사업자의 약관/정책이 적용될 수 있습니다.
            </li>
            <li>
              결제 완료 후 주문 정보(주문번호, 결제수단, 결제금액, 결제상태 등)가 서비스
              내에 기록됩니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제8조 (청약철회 및 환불)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              디지털 콘텐츠의 특성상, 다운로드 또는 열람 등 사용이 개시된 이후에는 관계
              법령에서 정한 예외 사유에 해당하는 경우 청약철회가 제한될 수 있습니다.
            </li>
            <li>
              회원은 결제일로부터 7일 이내에 청약철회를 요청할 수 있으며, 이미 사용이
              개시된 콘텐츠는 예외가 적용될 수 있습니다.
            </li>
            <li>
              제공된 콘텐츠가 표시·광고 내용과 다르거나 계약 내용과 다르게 이행된 경우, 회원은
              관련 법령에 따라 환불/재공급을 요청할 수 있습니다.
            </li>
            <li>
              환불은 결제수단 및 결제대행사 정책에 따라 처리되며, 처리 일정은 각 수단의 정산
              절차에 따릅니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제9조 (지식재산권)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              서비스 및 콘텐츠에 대한 저작권 등 지식재산권은 학원 또는 정당한 권리자에게
              귀속됩니다.
            </li>
            <li>
              회원은 서비스 이용을 통해 얻은 콘텐츠를 학원의 사전 서면 동의 없이 복제, 전송,
              배포, 2차적 저작물 작성 등의 방법으로 이용할 수 없습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제10조 (이용제한 및 계약해지)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              회원이 본 약관 또는 관계 법령을 위반하는 경우 학원은 사전 통지 후 서비스 이용을
              제한하거나 계약을 해지할 수 있습니다.
            </li>
            <li>
              회원은 언제든지 탈퇴를 요청할 수 있으며, 법령상 보관의무가 있는 정보는 해당 기간
              동안 보관 후 파기됩니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제11조 (면책)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              학원은 천재지변, 불가항력, 회원의 귀책사유로 인한 서비스 이용 장애에 대하여
              책임을 지지 않습니다.
            </li>
            <li>
              학원은 회원 상호 간 또는 회원과 제3자 간 분쟁에 개입할 의무가 없으며, 고의 또는
              중대한 과실이 없는 한 이에 대한 책임을 부담하지 않습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제12조 (분쟁해결 및 준거법)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              학원은 이용자의 정당한 의견 또는 불만을 반영하고 피해를 구제하기 위해 노력합니다.
            </li>
            <li>
              본 약관과 관련한 분쟁에는 대한민국 법령을 준거법으로 하며, 관할법원은
              민사소송법에 따릅니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3">제13조 (사업자 정보 및 고객문의)</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>상호: 디알이(DRE) 수학 교습소</li>
            <li>대표자명: 유재무</li>
            <li>사업자등록번호: 512-99-01452</li>
            <li>통신판매업신고번호: 제 2025-서울중구-723호</li>
            <li>사업장주소: 서울 중구 퇴계로 452-1 스타빌딩 B동 7층</li>
            <li>유선전화번호: 0507-1346-1125</li>
            <li>도메인: https://dre-edu.com</li>
            <li>개인정보 문의: carry0318@gmail.com</li>
          </ul>
        </section>

        <section className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">공고일자: {UPDATED_DATE}</p>
          <p className="text-sm text-gray-500">시행일자: {EFFECTIVE_DATE}</p>
        </section>
      </div>
    </div>
  );
}
