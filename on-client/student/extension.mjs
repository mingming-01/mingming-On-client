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
            // 연결되지 않은 조치는 요청을 보내지 않는 비활성 안내 버튼으로만 보여 준다.
            const actions = Array.isArray(event.supportedActions) ? event.supportedActions.filter(isText) : [];
            if (actions.length > 0) {
              addText(box, 'h5', '조치');
              addText(box, 'p', '조치 실행 연결은 준비 중입니다. 아직 지원하지 않는 조치이며 어떤 요청도 보내지 않습니다.');
              for (const action of actions) {
                const unsupported = addText(box, 'button', `${action} 미지원`);
                unsupported.type = 'button';
                unsupported.disabled = true;
              }
            }
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
    renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
      const root = document.createElement('section');

      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      const isText = (value) => typeof value === 'string' && value.length > 0;
      const displayValue = (value) => (isText(value) ? value : '확인 불가');
      const deviceLabels = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
      const sessionLabels = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
      const modeLabels = { demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };
      const resourceLabels = { devices: '기기', sessions: '세션', events: '보안 기록', access: '접속 판정', diagnostics: '도움정보', vulnerabilities: '설치 패키지 조회' };
      const unverifiedCodes = ['CONTRACT_MISMATCH', 'ENGINE_RESULT_UNVERIFIED'];

      // 한국어 뜻과 원래 값을 함께 적는다. 목록에 없는 값은 확인 불가로 처리한다.
      const withCode = (labels, value) => (isText(value) && Object.hasOwn(labels, value)
        ? `${labels[value]}(${value})`
        : `확인 불가(${isText(value) ? value : '값 없음'})`);

      // 화면과 복사에 쓰는 값은 여기를 거친다. 열쇠·토큰처럼 보이는 값은 표시하지 않는다.
      const SECRET_LIKE = /bearer|token|secret|password|passwd|api[_-]?key|authorization/i;
      const safeText = (value) => {
        const text = typeof value === 'number' && Number.isFinite(value) ? String(value) : value;
        if (!isText(text)) return '확인 불가';
        if (SECRET_LIKE.test(text)) return '(민감 정보 가능성이 있어 표시하지 않음)';
        return text.length > 120 ? `${text.slice(0, 120)}…` : text;
      };
      const safeCode = (value) => (isText(value) && /^[A-Za-z0-9_.:-]{1,64}$/.test(value) ? value : '확인 불가');

      // 실패 문구: 무엇을 불러오지 못했는지, message, 시간 초과 여부를 적는다.
      const failureText = (what, error) => {
        const message = isText(error?.message) ? error.message : '서버에서 오류 메시지를 제공하지 않았습니다.';
        if (unverifiedCodes.includes(error?.code)) return `확인 불가: ${message}`;
        const timedOut = /timeout|timed[_ ]?out/i.test(String(error?.code ?? '')) || /시간\s*초과/.test(message);
        return `${what} 불러오지 못했습니다${timedOut ? '(시간 초과)' : ''}: ${message}`;
      };
      const retryHint = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요. 자동으로 다시 요청하지 않습니다.';

      const addSection = (title) => {
        const block = document.createElement('section');
        addText(block, 'h3', title);
        root.append(block);
        return block;
      };

      // 이 함수는 호출될 때마다 처음부터 새로 그린다. 다시 불러와 성공하면 이전 실패 안내는 남지 않는다.

      // ----- 기기 -----
      const deviceBlock = addSection('등록 기기');
      if (!devices || devices.status === 'loading') {
        addText(deviceBlock, 'p', '기기 목록을 불러오는 중');
      } else if (devices.status === 'error') {
        addText(deviceBlock, 'p', failureText('기기 목록을', devices.error));
        addText(deviceBlock, 'p', retryHint);
      } else if (devices.status === 'ok') {
        if (!Array.isArray(devices.data)) {
          addText(deviceBlock, 'p', '확인 불가: 기기 목록 형식을 확인할 수 없습니다.');
        } else if (devices.data.length === 0) {
          addText(deviceBlock, 'p', '등록된 기기가 없습니다');
        } else {
          addText(deviceBlock, 'p', `기기 수: ${devices.data.length}`);
          for (const device of devices.data) {
            addText(deviceBlock, 'p', `기기 이름: ${displayValue(device?.label)} · 기기 ID: ${displayValue(device?.id)} · 보안 상태: ${withCode(deviceLabels, device?.status)}`);
          }
          addText(deviceBlock, 'p', '본인 이름으로 등록되고 회수되지 않은 기기를 최대 100개까지 표시하며, 지금 쓰는 기기가 맨 앞에 옵니다.');
        }
      } else {
        addText(deviceBlock, 'p', '확인 불가: 기기 목록 상태를 확인할 수 없습니다.');
      }

      // ----- 세션 -----
      const sessionBlock = addSection('로그인 세션');
      if (!sessions || sessions.status === 'loading') {
        addText(sessionBlock, 'p', '세션 정보를 불러오는 중');
      } else if (sessions.status === 'error') {
        addText(sessionBlock, 'p', failureText('세션 정보를', sessions.error));
        addText(sessionBlock, 'p', retryHint);
      } else if (sessions.status === 'ok') {
        if (!Array.isArray(sessions.data)) {
          addText(sessionBlock, 'p', '확인 불가: 세션 정보 형식을 확인할 수 없습니다.');
        } else if (sessions.data.length === 0) {
          addText(sessionBlock, 'p', '현재 연결이 없습니다');
        } else {
          for (const session of sessions.data) {
            addText(sessionBlock, 'p', `세션 ID: ${displayValue(session?.id)} · 세션 상태: ${withCode(sessionLabels, session?.status)}`);
          }
        }
        addText(sessionBlock, 'p', '세션은 현재 검증된 연결 한 개만 표시합니다. 과거 세션은 조회하지 않습니다.');
      } else {
        addText(sessionBlock, 'p', '확인 불가: 세션 정보 상태를 확인할 수 없습니다.');
      }

      // ----- 알림 -----
      const notificationBlock = addSection('알림');
      const items = Array.isArray(notifications) ? notifications : [];
      if (items.length === 0) {
        addText(notificationBlock, 'p', '주의할 알림이 없습니다');
      } else {
        addText(notificationBlock, 'p', `알림 수: ${items.length}`);
        const list = document.createElement('ul');
        for (const item of items) {
          const resource = item?.resource;
          const label = isText(resource) && Object.hasOwn(resourceLabels, resource) ? `${resourceLabels[resource]}(${resource})` : displayValue(resource);
          addText(list, 'li', `자료: ${label} · 코드: ${safeCode(item?.code)} · 내용: ${displayValue(item?.message)}`);
        }
        notificationBlock.append(list);
      }

      // ----- 도움정보 (제공 화면이 전달한 값만 사용하며 직접 조회하지 않는다) -----
      const diagBlock = addSection('도움정보');
      let helpLines = null;
      if (!diagnostics || diagnostics.status === 'idle') {
        addText(diagBlock, 'p', '도움정보를 아직 불러오지 않았습니다. 제공 화면의 도움정보 칸에서 직접 불러오세요.');
      } else if (diagnostics.status === 'loading') {
        addText(diagBlock, 'p', '도움정보를 불러오는 중');
      } else if (diagnostics.status === 'error') {
        addText(diagBlock, 'p', failureText('도움정보를', diagnostics.error));
        addText(diagBlock, 'p', '다시 시도는 제공 화면의 도움정보 칸에서 직접 누르세요. 자동으로 다시 요청하지 않습니다.');
      } else if (diagnostics.status === 'ok') {
        const d = diagnostics.data;
        if (!d || typeof d !== 'object') {
          addText(diagBlock, 'p', '확인 불가: 도움정보 형식을 확인할 수 없습니다.');
        } else {
          // 아래 여섯 값만 표시·복사한다. 그 밖의 필드는 읽지 않는다.
          const fields = [
            ['requestId', d.requestId],
            ['component', d.component],
            ['version', d.version],
            ['checkedAt', d.checkedAt ?? diagnostics.meta?.checkedAt],
            ['engine.mode', d.engine?.mode],
            ['engine.code', d.engine?.code],
          ];
          helpLines = fields.map(([name, value]) => `${name}: ${safeText(value)}`);
          for (const line of helpLines) addText(diagBlock, 'p', line);
        }
      } else {
        addText(diagBlock, 'p', '확인 불가: 도움정보 상태를 확인할 수 없습니다.');
      }

      const copyButton = addText(diagBlock, 'button', '도움정보 복사');
      copyButton.type = 'button';
      copyButton.disabled = helpLines === null;
      addText(diagBlock, 'p', helpLines === null
        ? '불러온 도움정보가 없어 복사할 수 없습니다.'
        : '위 값을 도움 요청에 쓰도록 복사합니다. 누를 때만 복사하며 열쇠·토큰·비밀번호는 포함하지 않습니다.');
      const copyResult = addText(diagBlock, 'p', '');
      copyResult.setAttribute('role', 'status');
      if (helpLines !== null) {
        copyButton.addEventListener('click', async () => {
          try {
            if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') throw new Error('clipboard unavailable');
            await navigator.clipboard.writeText(`도움정보\n${helpLines.join('\n')}`);
            copyResult.textContent = '도움정보를 복사했습니다. 도움 요청에 붙여 넣으세요.';
          } catch {
            copyResult.textContent = '자동 복사에 실패했습니다. 위에 표시된 값을 직접 선택해 복사하세요.';
          }
        });
      }

      const modeLabel = modeLabels[mode];
      if (modeLabel) addText(root, 'p', `연결 모드: ${modeLabel}`);

      return root;
    },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
