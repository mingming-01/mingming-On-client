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
    renderEvents({ status, data, error, meta, mode } = {}) {
      const root = document.createElement('section');

      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      const isText = (value) => typeof value === 'string' && value.length > 0;
      const displayValue = (value) => (isText(value) ? value : '확인 불가');
      const kindLabels = { access: '접속', xdr: 'XDR 경보' };
      const accessLabels = { allowed: '접속 허용', denied: '접속 거부', unknown: '확인 불가' };
      const sessionLabels = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
      const deviceLabels = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
      const modeLabels = { demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };

      // 한국어 뜻과 원래 값을 함께 적는다. 목록에 없는 값은 확인 불가로 처리한다.
      const withCode = (labels, value) => (isText(value) && Object.hasOwn(labels, value)
        ? `${labels[value]}(${value})`
        : `확인 불가(${isText(value) ? value : '값 없음'})`);
      const appText = (appId) => (isText(appId) ? appId : '앱을 확인할 수 없음(appId 없음)');

      const formatAt = (at) => {
        if (!isText(at)) return '확인 불가';
        const ms = Date.parse(at);
        if (Number.isNaN(ms)) return at;
        try {
          const kst = new Intl.DateTimeFormat('sv-SE', {
            timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
          }).format(new Date(ms));
          return `${at} (한국 시각 ${kst})`;
        } catch {
          return at;
        }
      };

      // at 기준 최신순. 시각을 읽을 수 없는 기록은 맨 뒤에 둔다.
      const newestFirst = (a, b) => {
        const ta = Date.parse(a?.at);
        const tb = Date.parse(b?.at);
        const na = Number.isNaN(ta);
        const nb = Number.isNaN(tb);
        if (na || nb) return na === nb ? 0 : (na ? 1 : -1);
        return tb - ta;
      };

      const unique = (list) => [...new Set(list.filter(isText))];

      addText(root, 'h3', '접속 기록·XDR 경보');

      if (status === 'loading') {
        addText(root, 'p', '기록을 불러오는 중');
      } else if (status === 'error') {
        const message = isText(error?.message) ? error.message : '서버에서 오류 메시지를 제공하지 않았습니다.';
        if (['CONTRACT_MISMATCH', 'ENGINE_RESULT_UNVERIFIED'].includes(error?.code)) {
          addText(root, 'p', `확인 불가: ${message}`);
          addText(root, 'p', '응답을 확인할 수 없어 이전 목록은 표시하지 않습니다.');
        } else {
          addText(root, 'p', `기록을 불러오지 못했습니다: ${message}`);
          addText(root, 'p', '조회에 실패했으므로 이전 목록은 표시하지 않습니다.');
        }
      } else if (status === 'ok') {
        if (!Array.isArray(data)) {
          addText(root, 'p', '확인 불가: 기록 목록 형식을 확인할 수 없습니다.');
        } else if (data.length === 0) {
          addText(root, 'p', '표시할 기록이 없습니다');
        } else {
          // 원본 배열을 바꾸지 않도록 복사한 뒤 정렬한다.
          const sorted = [...data].sort(newestFirst);
          const filters = { kind: 'all', appId: 'all', access: 'all' };
          let selectedId = null;

          addText(root, 'p', '이 목록은 본인의 최근 기록(최대 40건)입니다. 모든 직원의 전체 이력이나 실시간 전체 위협 탐지가 아닙니다. XDR 경보는 서버가 이미 저장한 경보만 표시합니다.');

          const filterBar = document.createElement('div');
          const listArea = document.createElement('div');
          const detailArea = document.createElement('div');
          const buttons = new Map();

          const visibleEvents = () => sorted.filter((event) => (filters.kind === 'all' || event.kind === filters.kind)
            && (filters.appId === 'all' || event.appId === filters.appId)
            && (filters.access === 'all' || event.state?.access === filters.access));

          const renderDetail = () => {
            detailArea.replaceChildren();
            const event = selectedId === null ? null : sorted.find((item) => item.id === selectedId);
            if (!event) return;
            const box = document.createElement('section');
            box.setAttribute('data-student-event-detail', String(event.id));
            addText(box, 'h4', '기록 상세');
            addText(box, 'p', `사건 ID: ${displayValue(event.id)}`);
            addText(box, 'p', `앱 ID: ${appText(event.appId)}`);
            const addList = (title, rows, empty) => {
              addText(box, 'h5', title);
              const items = Array.isArray(rows) ? rows : [];
              if (items.length === 0) {
                addText(box, 'p', empty);
                return;
              }
              const ul = document.createElement('ul');
              for (const row of items) addText(ul, 'li', `${displayValue(row?.id)}: ${displayValue(row?.text)}`);
              box.append(ul);
            };
            addList('근거(evidence)', event.evidence, '근거 없음');
            addList('규칙(rules)', event.rules, '규칙 없음');
            addText(box, 'h5', '상태(state)');
            addText(box, 'p', `접속 상태(state.access): ${withCode(accessLabels, event.state?.access)}`);
            addText(box, 'p', `세션 상태(state.session): ${withCode(sessionLabels, event.state?.session)}`);
            addText(box, 'p', `기기 상태(state.device): ${withCode(deviceLabels, event.state?.device)}`);
            detailArea.append(box);
          };

          const refresh = () => {
            const rows = visibleEvents();
            if (selectedId !== null && !rows.some((event) => event.id === selectedId)) selectedId = null;
            buttons.clear();
            listArea.replaceChildren();
            addText(listArea, 'p', `표시 중인 기록 ${rows.length}건 / 받은 기록 ${sorted.length}건`);
            if (rows.length === 0) {
              addText(listArea, 'p', '선택한 조건에 맞는 기록이 없습니다.');
            } else {
              const list = document.createElement('ul');
              for (const event of rows) {
                const item = document.createElement('li');
                item.setAttribute('data-student-event-id', String(event.id));
                addText(item, 'p', `사건 ID: ${displayValue(event.id)}`);
                addText(item, 'p', `시각: ${formatAt(event.at)}`);
                addText(item, 'p', `종류: ${withCode(kindLabels, event.kind)}`);
                addText(item, 'p', `앱: ${appText(event.appId)}`);
                addText(item, 'p', `요약: ${displayValue(event.summary)}`);
                const button = addText(item, 'button', `${event.id} 상세`);
                button.type = 'button';
                button.setAttribute('aria-expanded', String(event.id === selectedId));
                button.addEventListener('click', () => {
                  selectedId = event.id;
                  refresh();
                  const current = buttons.get(event.id);
                  if (current) current.focus();
                });
                buttons.set(event.id, button);
                list.append(item);
              }
              listArea.append(list);
            }
            renderDetail();
          };

          const addFilter = (key, name, values, describe) => {
            const wrap = document.createElement('div');
            const selectId = `student-events-filter-${key}`;
            const label = addText(wrap, 'label', name);
            label.setAttribute('for', selectId);
            const select = document.createElement('select');
            select.id = selectId;
            const addOption = (value, text) => {
              const option = document.createElement('option');
              option.value = value;
              option.textContent = text;
              select.append(option);
            };
            addOption('all', '전체(all)');
            for (const value of values) addOption(value, describe(value));
            select.addEventListener('change', () => {
              filters[key] = select.value;
              refresh();
            });
            wrap.append(select);
            filterBar.append(wrap);
          };

          addFilter('kind', '기록 종류', unique(sorted.map((event) => event.kind)), (value) => withCode(kindLabels, value));
          addFilter('appId', '업무 앱', unique(sorted.map((event) => event.appId)), (value) => value);
          addFilter('access', '접속 상태', unique(sorted.map((event) => event.state?.access)), (value) => withCode(accessLabels, value));

          root.append(filterBar, listArea, detailArea);
          refresh();
        }
      } else if (status === 'idle' || status == null) {
        addText(root, 'p', '기록 조회 전입니다');
      } else {
        addText(root, 'p', '확인 불가: 알 수 없는 요청 상태입니다.');
      }

      const modeLabel = modeLabels[meta?.mode ?? mode];
      if (modeLabel) addText(root, 'p', `연결 모드: ${modeLabel}`);

      return root;
    },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
