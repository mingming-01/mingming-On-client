import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

export const engineError = (code, message, status=503) => Object.assign(new Error(code), {code,safeMessage:message,status});
const disconnected = () => { throw engineError('ENGINE_NOT_CONNECTED','기존 서버·에이전트 연결을 확인할 수 없습니다. 기본 실행은 연결 없음 상태입니다. SDP 연결을 사용하려면 담당 운영자가 발급한 SDP 설정 파일 경로를 지정하세요. 다른 연결 어댑터를 사용하는 경우 담당자가 제공한 어댑터 설정을 확인하세요. 설정이 없다면 담당 운영자에게 요청하세요.'); };
export async function loadEngine(path, {hostCapability} = {}) {
  if (!path) return {evidenceMode:'disconnected'};
  // 이 경로는 서버 실행자의 설정이다. 브라우저 요청에서 모듈을 선택하지 않는다.
  const module = await import(pathToFileURL(resolve(path)).href);
  const engine = hostCapability === undefined ? module.default
    : typeof module.createEngine === 'function' ? await module.createEngine(hostCapability) : null;
  if (!engine || typeof engine !== 'object' || !['connected','disconnected'].includes(engine.evidenceMode)) throw engineError('ENGINE_ADAPTER_INVALID','기존 서버 연결 어댑터의 형식을 확인하세요.');
  return engine;
}
export function engineMethod(engine, name) {
  return typeof engine?.[name] === 'function' ? engine[name].bind(engine) : disconnected;
}
export function demoEngine() {
  const now = Date.now();
  const minutesAgo = (minutes) => new Date(now - minutes * 60 * 1000).toISOString();
  const identity = {
    user: { id: 'practice-user', label: '연습 사용자' },
    device: { id: 'practice-pc', label: '연습 PC', status: 'unknown' },
    session: { id: 'practice-session', status: 'active' },
  };
  const apps = [
    { id: 'library', name: '학습 자료실' },
    { id: 'repository', name: '개발 저장소' },
    { id: 'approval', name: '확인할 업무 앱' },
    { id: 'hr', name: '인사 포털' },
    { id: 'analytics', name: '분석 대시보드' },
  ];
  // 아래는 매 실행 시각을 기준으로 생성하는 설명용 예제 기록이다. 운영 로그가 아니다.
  // 의도적으로 시간순이 아닌 배열을 반환해 화면의 최신순 정렬을 시연한다.
  const events = [
    {
      id: 'demo-event-05', kind: 'xdr', at: minutesAgo(720), appId: 'repository',
      summary: '예제 XDR 경보: 비정상 로그인 패턴 확인 필요',
      evidence: [{ id: 'demo-e-05', text: '설명용 예제 경보가 생성됨' }],
      rules: [{ id: 'demo-rule-05', text: '경보는 담당자 검토가 필요함' }],
      state: { access: 'unknown', session: 'unknown', device: 'unknown' },
      supportedActions: ['isolate-host'],
    },
    {
      id: 'demo-event-02', kind: 'access', at: minutesAgo(45), appId: 'repository',
      summary: '예제 자료: 개발 저장소 접속 거부',
      evidence: [{ id: 'demo-e-02', text: '연습 정책의 기기 상태 확인 조건' }],
      rules: [{ id: 'demo-rule-02', text: '기기 상태를 확인한 뒤 다시 요청' }],
      state: { access: 'denied', session: 'active', device: 'unknown' },
      supportedActions: [],
    },
    {
      id: 'demo-event-06', kind: 'access', at: minutesAgo(6), appId: 'library',
      summary: '예제 자료: 학습 자료실 접속 허용',
      evidence: [{ id: 'demo-e-06', text: '연습 정책에서 허용으로 판정' }],
      rules: [{ id: 'demo-rule-06', text: '학습용 앱 접근 규칙' }],
      state: { access: 'allowed', session: 'active', device: 'compliant' },
      supportedActions: [],
    },
    {
      id: 'demo-event-03', kind: 'access', at: minutesAgo(160), appId: 'approval',
      summary: '예제 자료: 업무 앱 추가 확인 필요',
      evidence: [{ id: 'demo-e-03', text: '추가 확인 조건이 충족되지 않음' }],
      rules: [{ id: 'demo-rule-03', text: '필요한 확인 절차가 끝나기 전에는 허용하지 않음' }],
      state: { access: 'unknown', session: 'active', device: 'unknown' },
      supportedActions: [],
    },
    {
      id: 'demo-event-04', kind: 'xdr', at: minutesAgo(360), appId: 'hr',
      summary: '예제 XDR 경보: 등록 기기 확인 필요',
      evidence: [{ id: 'demo-e-04', text: '설명용 기기 상태 불명 예제' }],
      rules: [{ id: 'demo-rule-04', text: '기기 상태를 추측하지 않음' }],
      state: { access: 'denied', session: 'unknown', device: 'noncompliant' },
      supportedActions: [],
    },
    {
      id: 'demo-event-01', kind: 'access', at: minutesAgo(20), appId: 'analytics',
      summary: '예제 자료: 분석 대시보드 접속 확인',
      evidence: [{ id: 'demo-e-01', text: '시연용 분석 앱 요청' }],
      rules: [{ id: 'demo-rule-01', text: '접근 판정은 앱마다 별도로 확인' }],
      state: { access: 'allowed', session: 'active', device: 'compliant' },
      supportedActions: [],
    },
  ];

  return {
    evidenceMode: 'demo',
    projectId: 'practice-project',
    readIdentity: async () => structuredClone(identity),
    readApps: async () => structuredClone(apps),
    readEvents: async () => structuredClone(events),
    readDevices: async () => [structuredClone(identity.device)],
    readSessions: async () => [structuredClone(identity.session)],
    decideAccess: async ({ appId }) => {
      if (!apps.some((app) => app.id === appId)) {
        throw engineError('APP_NOT_FOUND', '업무 앱을 찾을 수 없습니다.', 404);
      }
      const decisions = {
        library: {
          decision: 'allow',
          reason: '예제 정책에서 접속을 허용했습니다.',
        },
        repository: {
          decision: 'deny',
          reason: '예제 정책에서 기기 상태 확인을 요구했습니다.',
        },
        approval: {
          decision: 'challenge',
          reason: '예제 정책에서 추가 확인을 요구했습니다.',
        },
        hr: {
          decision: 'deny',
          reason: '예제 정책에서 기기 보안 확인을 요구했습니다.',
        },
        analytics: {
          decision: 'allow',
          reason: '예제 정책에서 접속을 허용했습니다.',
        },
      };
      return { appId, ...decisions[appId], checkedAt: new Date().toISOString() };
    },
  };
}
