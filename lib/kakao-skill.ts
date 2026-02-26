/** 카카오 i 오픈빌더 스킬 요청/응답 타입 및 헬퍼 */

export interface KakaoSkillRequest {
  intent: { id: string; name: string };
  userRequest: {
    timezone: string;
    params: { ignoreMe: string; surface: string };
    block: { id: string; name: string };
    utterance: string;
    lang: string | null;
    user: {
      id: string;
      type: string;
      properties: Record<string, string>;
    };
  };
  bot: { id: string; name: string };
  action: {
    name: string;
    clientExtra: Record<string, unknown> | null;
    params: Record<string, string>;
    id: string;
    detailParams: Record<string, { origin: string; value: string; groupName: string }>;
  };
}

export interface KakaoSkillResponse {
  version: '2.0';
  template: {
    outputs: Array<{ simpleText?: { text: string } }>;
  };
}

export function simpleTextResponse(text: string): KakaoSkillResponse {
  return {
    version: '2.0',
    template: {
      outputs: [{ simpleText: { text } }],
    },
  };
}

export function errorResponse(message = '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'): KakaoSkillResponse {
  return simpleTextResponse(message);
}
