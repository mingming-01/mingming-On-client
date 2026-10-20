// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const root = document.createElement('section');

      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      const deviceStatusLabel = (status) => ({
        compliant: '보안 기준 충족',
        noncompliant: '보안 기준 미충족',
        unknown: '확인 불가',
      })[status] || '확인 불가';

      const sessionStatusLabel = (status) => ({
        active: '활성',
        expired: '만료',
        revoked: '철회됨',
        unknown: '확인 불가',
      })[status] || '확인 불가';

      const displayValue = (value) => typeof value === 'string' && value.length > 0 ? value : '확인 불가';

      const appendMode = (parent, resource) => {
        const modeLabels = {
          demo: '예제 자료',
          disconnected: '연결 없음',
          unknown: '확인 불가',
        };
        const modeLabel = resource && modeLabels[resource.mode];
        if (modeLabel) addText(parent, 'p', `연결 모드: ${modeLabel}`);
      };

      const renderResource = (title, resource, renderData) => {
        const block = document.createElement('section');
        addText(block, 'h3', title);

        if (!resource || resource.status === 'loading') {
          addText(block, 'p', '불러오는 중');
        } else if (resource.status === 'error') {
          const message = typeof resource.error?.message === 'string' && resource.error.message.length > 0
            ? resource.error.message
            : '서버에서 오류 메시지를 제공하지 않았습니다.';
          const unverified = ['CONTRACT_MISMATCH', 'ENGINE_RESULT_UNVERIFIED'].includes(resource.error?.code);
          addText(block, 'p', `${unverified ? '확인 불가' : '연결 실패'}: ${message}`);
        } else if (resource.status === 'ok') {
          renderData(block, resource.data);
        } else {
          addText(block, 'p', '확인 불가');
        }

        appendMode(block, resource);
        root.append(block);
      };

      renderResource('계정·현재 기기·로그인 세션', me, (block, data) => {
        if (!data || !data.user || !data.device || !data.session) {
          addText(block, 'p', '확인 불가: 사용자·기기·세션 정보를 확인할 수 없습니다.');
          return;
        }
        addText(block, 'p', `계정 이름: ${displayValue(data.user.label)}`);
        addText(block, 'p', `계정 ID: ${displayValue(data.user.id)}`);
        addText(block, 'p', `현재 기기 이름: ${displayValue(data.device.label)}`);
        addText(block, 'p', `기기 ID: ${displayValue(data.device.id)}`);
        addText(block, 'p', `기기 보안 상태: ${deviceStatusLabel(data.device.status)} (${displayValue(data.device.status)})`);
        addText(block, 'p', `로그인 세션 ID: ${displayValue(data.session.id)}`);
        addText(block, 'p', `로그인 세션 상태: ${sessionStatusLabel(data.session.status)} (${displayValue(data.session.status)})`);
      });

      renderResource('기기 목록', devices, (block, data) => {
        if (!Array.isArray(data)) {
          addText(block, 'p', '확인 불가: 기기 목록 형식을 확인할 수 없습니다.');
          return;
        }
        addText(block, 'p', `기기 수: ${data.length}`);
        for (const device of data) {
          addText(block, 'p', `기기 이름: ${displayValue(device?.label)} · 기기 ID: ${displayValue(device?.id)} · 보안 상태: ${deviceStatusLabel(device?.status)} (${displayValue(device?.status)})`);
        }
      });

      renderResource('세션 목록', sessions, (block, data) => {
        if (!Array.isArray(data)) {
          addText(block, 'p', '확인 불가: 세션 목록 형식을 확인할 수 없습니다.');
          return;
        }
        addText(block, 'p', `세션 수: ${data.length}`);
        for (const session of data) {
          addText(block, 'p', `세션 ID: ${displayValue(session?.id)} · 세션 상태: ${sessionStatusLabel(session?.status)} (${displayValue(session?.status)})`);
        }
      });

      return root;
    },
    renderDecision({ status, data, error, appId, meta, mode } = {}) {
      const root = document.createElement('section');

      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      const displayValue = (value) => typeof value === 'string' && value.length > 0 ? value : '확인 불가';
      const decisionLabels = { allow: '허용', deny: '거부', challenge: '추가 확인 필요', unknown: '확인 불가' };
      const decisionNotes = {
        allow: '정책상 접근 허용입니다. 실제 앱 접속 성공을 보장하지 않습니다.',
        deny: '정책상 접근 거부입니다.',
        challenge: '추가 인증 또는 확인이 필요합니다. 이 앱이 확인 절차를 대신 수행하지 않습니다.',
        unknown: '판정을 확인할 수 없습니다. 허용된 것이 아닙니다.',
      };
      const modeLabels = { demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };

      addText(root, 'h3', '접속 판정');

      if (status === 'idle' || status == null) {
        addText(root, 'p', '앱을 골라 접속을 요청하세요');
      } else if (status === 'loading') {
        addText(root, 'p', `판정 확인 중${typeof appId === 'string' && appId ? ` (앱 ID: ${appId})` : ''}`);
      } else if (status === 'error') {
        const message = typeof error?.message === 'string' && error.message.length > 0
          ? error.message
          : '서버에서 오류 메시지를 제공하지 않았습니다.';
        const unverified = ['CONTRACT_MISMATCH', 'ENGINE_RESULT_UNVERIFIED'].includes(error?.code);
        addText(root, 'p', `${unverified ? '확인 불가' : '요청 실패'}: ${message}`);
        addText(root, 'p', '이 결과는 접근 거부 판정이 아니며, 접속 허용 결과도 아닙니다.');
      } else if (status === 'ok') {
        if (!data || typeof data !== 'object') {
          addText(root, 'p', '확인 불가: 판정 정보를 확인할 수 없습니다. 허용된 것이 아닙니다.');
        } else {
          const known = typeof data.decision === 'string' && Object.hasOwn(decisionLabels, data.decision);
          const code = known ? data.decision : 'unknown';
          addText(root, 'p', `판정: ${decisionLabels[code]}(${code})`);
          if (!known) addText(root, 'p', `수신한 판정 값: ${displayValue(data.decision)}`);
          addText(root, 'p', decisionNotes[code]);
          addText(root, 'p', `앱 ID: ${displayValue(data.appId ?? appId)}`);
          addText(root, 'p', `판정 이유: ${displayValue(data.reason)}`);
          addText(root, 'p', `판정 시각: ${displayValue(data.checkedAt)}`);
        }
      } else {
        addText(root, 'p', '확인 불가: 알 수 없는 요청 상태입니다. 허용된 것이 아닙니다.');
      }

      const modeLabel = modeLabels[meta?.mode ?? mode];
      if (modeLabel) addText(root, 'p', `연결 모드: ${modeLabel}`);

      return root;
    },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
