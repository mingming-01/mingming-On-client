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
    renderAiConnection({ status, mode, data, error, checkedAt, explanationAccepted } = {}) {
      const root = document.createElement('section');

      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      const isText = (value) => typeof value === 'string' && value.length > 0;
      const modeLabels = { demo: '예제 자료', disconnected: '연결 없음', unknown: '확인 불가' };

      // 열쇠·토큰처럼 보이는 값과 원문 오류는 표시하지 않는다.
      const SECRET_LIKE = /bearer|token|secret|password|passwd|api[_-]?key|authorization/i;
      const safeText = (value) => {
        if (!isText(value)) return '확인 불가';
        if (SECRET_LIKE.test(value)) return '(민감 정보 가능성이 있어 표시하지 않음)';
        return value.length > 120 ? `${value.slice(0, 120)}…` : value;
      };
      const safeCode = (value) => (isText(value) && /^[A-Za-z0-9_.:-]{1,64}$/.test(value) ? value : '확인 불가');

      // error.code를 원인으로 나눈다. 순서가 중요하다(앞쪽 분류가 우선).
      const classify = (code) => {
        const c = String(code ?? '');
        if (/CANCEL|ABORT/i.test(c)) return { label: '취소', guide: '취소되었습니다. 이전 결과는 현재 결과가 아닙니다. 필요하면 점검 버튼을 직접 눌러 다시 점검하세요.' };
        if (/TIMEOUT|TIMED/i.test(c)) return { label: '시간 초과', guide: '응답 시간이 초과되었습니다. 잠시 뒤 점검 버튼을 직접 눌러 다시 점검하세요.' };
        if (/RATE|TOO_MANY|429/i.test(c)) return { label: '요청 제한', guide: '요청이 제한되었습니다. 잠시 뒤 점검 버튼을 직접 눌러 다시 점검하세요.' };
        if (/NETWORK|OFFLINE|FETCH|CONNECTION/i.test(c)) return { label: '네트워크 오류', guide: '네트워크 연결에 실패했습니다. 잠시 뒤 점검 버튼을 직접 눌러 다시 점검하세요.' };
        if (/MODEL/i.test(c)) return { label: '사용 가능한 모델 없음', guide: '담당자에게 모델 허용 설정 확인을 요청하세요.' };
        if (/QUOTA|USAGE|BUDGET|LIMIT/i.test(c)) return { label: '사용량·이용 한도', guide: '반 사용량 또는 이용 한도에 도달했습니다. 담당자에게 확인을 요청하세요.' };
        if (/HOURS|SCHEDULE|WINDOW|OUTSIDE|CLOSED/i.test(c)) return { label: '이용 시간 아님', guide: '지금은 이용 시간이 아닙니다. 이용 시간을 확인하세요.' };
        if (/AUTH|UNAUTHORIZED|LOGIN|401/i.test(c)) return { label: '인증 실패', guide: '계정 연결을 다시 확인하고, 계속되면 담당자에게 확인을 요청하세요.' };
        if (/FORBIDDEN|DENIED|PERMISSION|ACCESS|403/i.test(c)) return { label: '접근 제한', guide: '계정 연결을 다시 확인하고, 계속되면 담당자에게 확인을 요청하세요.' };
        if (/PENDING|NOT_READY|PREPAR|PROVISION|UNVERIFIED|CONTRACT_MISMATCH|UNAVAILABLE/i.test(c)) return { label: '권한 준비 중·확인 불가', guide: '운영 측 계정·앱 권한 준비가 끝나지 않았을 수 있습니다. 학생 잘못이 아닙니다. 담당자에게 계정 연결과 앱 권한 확인을 요청하세요.' };
        return { label: '분류되지 않은 오류', guide: '원인을 확인할 수 없습니다. 위 오류 코드와 메시지를 담당자에게 전달하세요.' };
      };

      addText(root, 'h3', 'AI 연결 점검');

      if (status === 'idle' || status == null) {
        addText(root, 'p', 'AI 연결 점검 전');
        addText(root, 'p', '점검은 「현재 API 연결 점검」 버튼을 직접 눌러 실행합니다. 자동으로 점검하지 않습니다.');
      } else if (status === 'loading') {
        addText(root, 'p', 'AI 연결 점검 중');
        addText(root, 'p', '점검이 끝날 때까지 이전 결과는 표시하지 않습니다.');
      } else if (status === 'ok') {
        const valid = data && typeof data === 'object'
          && data.transportChecked === true
          && (data.audienceAuthorization === 'test' || data.audienceAuthorization === 'verified');
        if (!valid) {
          addText(root, 'p', '확인 불가: 점검 결과 형식을 확인할 수 없습니다. 연결 성공으로 처리하지 않습니다.');
        } else {
          const verified = data.audienceAuthorization === 'verified';
          addText(root, 'p', verified ? '앱 권한 확인 후 점검(verified)' : '시험 연결 점검(test)');
          addText(root, 'p', verified
            ? '점검 시각 기준 앱 권한 확인과 모델 응답을 확인했습니다.'
            : '시험 연결입니다. 앱 권한 확인이 끝난 결과가 아닙니다.');
          addText(root, 'p', `확인된 모델 수: ${Number.isFinite(data.modelCount) ? data.modelCount : '확인 불가'}`);
          addText(root, 'p', `점검 시각: ${isText(checkedAt) ? checkedAt : '확인 불가'}`);
          addText(root, 'p', '연결만 점검했습니다. 사건 설명은 아직 실행하지 않았습니다.');
          addText(root, 'p', '모델 목록 응답만으로 사건 설명이 된 것은 아닙니다. 사건 설명은 보안 기록에서 따로 요청하고 확인합니다.');
          if (isText(data.help)) addText(root, 'p', `도움말: ${safeText(data.help)}`);
          addText(root, 'p', '다시 점검은 「현재 API 연결 점검」 버튼을 직접 눌러 실행합니다.');
        }
      } else if (status === 'error') {
        const cause = classify(error?.code);
        addText(root, 'p', `AI 연결 점검 실패: ${cause.label}`);
        addText(root, 'p', `오류 코드: ${safeCode(error?.code)}`);
        addText(root, 'p', `오류 메시지: ${safeText(error?.message)}`);
        addText(root, 'p', cause.guide);
        addText(root, 'p', '이 결과는 연결 성공이 아니며, 사건 설명도 실행되지 않았습니다.');
      } else {
        addText(root, 'p', '확인 불가: 알 수 없는 점검 상태입니다. 연결 성공으로 처리하지 않습니다.');
      }

      const modeLabel = modeLabels[mode];
      if (modeLabel) addText(root, 'p', `연결 모드: ${modeLabel}`);

      return root;
    },
    renderExplanation({ event, explanation, checkedAt } = {}) {
      const root = document.createElement('section');

      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      const isText = (value) =>
        typeof value === 'string' && value.length > 0;

      const SECRET_LIKE =
        /bearer|token|secret|password|passwd|api[_-]?key|authorization/i;

      const safeText = (value) => {
        if (!isText(value)) return '확인 불가';
        if (SECRET_LIKE.test(value)) {
          return '(민감 정보 가능성이 있어 표시하지 않음)';
        }
        return value;
      };

      const safeCode = (value) =>
        isText(value) && /^[A-Za-z0-9_.:-]{1,64}$/.test(value)
          ? value
          : '확인 불가';

      const displayId = (value) =>
        isText(value) ? value : '확인 불가';

      const evidenceList = Array.isArray(event?.evidence)
        ? event.evidence
        : [];

      const rules = Array.isArray(event?.rules)
        ? event.rules
        : [];

      const findEvidence = (id) =>
        evidenceList.find((item) => item?.id === id);

      const hasValidEvidenceIds = (ids) =>
        Array.isArray(ids)
        && ids.length > 0
        && ids.every(isText)
        && new Set(ids).size === ids.length
        && ids.every((id) => Boolean(findEvidence(id)));

      const addEvidence = (parent, ids) => {
        const list = document.createElement('ul');

        for (const id of ids) {
          const evidence = findEvidence(id);

          addText(
            list,
            'li',
            `${id} — ${safeText(evidence.text)}`
          );
        }

        parent.append(list);
      };

      const addRules = (parent) => {
        addText(parent, 'h4', '적용 규칙');

        if (rules.length === 0) {
          addText(parent, 'p', '표시할 규칙이 없습니다.');
          return;
        }

        const list = document.createElement('ul');

        for (const rule of rules) {
          addText(
            list,
            'li',
            `${displayId(rule?.id)} — ${safeText(rule?.text)}`
          );
        }

        parent.append(list);
      };

      addText(root, 'h3', 'AI 사건 설명');

      // 오류는 event가 없어도 먼저 표시한다.
      if (explanation?.status === 'error') {
        addText(root, 'p', 'AI 설명 실패');
        addText(root, 'p', `오류 코드: ${safeCode(explanation.error?.code)}`);
        addText(root, 'p', `오류 메시지: ${safeText(explanation.error?.message)}`);
        addText(root, 'p', 'AI 설명을 생성하지 못했습니다. 근거가 부족하거나 설명 요청에 실패했을 수 있습니다.');
        addText(root, 'p', '기록은 그대로입니다.');
        return root;
      }

      // 오류가 아니라면 기록을 먼저 선택해야 한다.
      if (!event) {
        addText(root, 'p', '보안 기록에서 기록을 먼저 고르세요.');
        return root;
      }

      if (explanation?.status === 'loading') {
        addText(root, 'p', 'AI 설명 요청 중');
        return root;
      }

      if (explanation?.status !== 'ok') {
        addText(root, 'p', '확인 불가: AI 설명 결과를 확인할 수 없습니다.');
        return root;
      }

      const data = explanation.data;

      // 성공 응답의 필수 계약을 확인한다.
      if (
        !data
        || !isText(data.summary)
        || !Array.isArray(data.evidenceIds)
        || data.requiresHumanConfirmation !== true
        || data.executed !== false
        || !Array.isArray(data.proposals)
      ) {
        addText(root, 'p', 'AI 설명을 표시할 수 없습니다.');
        addText(root, 'p', '설명 결과의 필수 항목이 없거나 계약과 일치하지 않습니다.');
        return root;
      }

      // 근거가 없는 ID, 중복 ID, 다른 기록의 근거는 허용하지 않는다.
      if (!hasValidEvidenceIds(data.evidenceIds)) {
        addText(root, 'p', 'AI 설명을 표시할 수 없습니다.');
        addText(root, 'p', '근거 ID가 현재 기록의 근거와 일치하지 않거나 중복되어 있습니다.');
        addText(root, 'p', '근거가 맞지 않아 설명의 신뢰성을 확인할 수 없습니다.');
        return root;
      }

      // AI가 이미 실행했다고 표시한 결과는 사용하지 않는다.
      if (data.executed === true) {
        addText(root, 'p', 'AI 설명을 표시할 수 없습니다.');
        addText(root, 'p', '조치가 이미 실행되었다고 표시된 설명은 허용하지 않습니다.');
        return root;
      }

      const supportedActions = Array.isArray(event.supportedActions)
        ? event.supportedActions
        : [];

      // 성공 결과에만 성공 속성을 지정한다.
      root.setAttribute('data-student-explanation-event', event.id);

      addText(root, 'p', `사건 ID: ${event.id}`);
      addText(root, 'h4', 'AI 설명(참고용)');
      addText(root, 'p', safeText(data.summary));

      if (isText(checkedAt)) {
        addText(root, 'p', `확인 시각: ${checkedAt}`);
      }

      addText(root, 'h4', '인용한 근거');

      if (data.evidenceIds.length === 0) {
        addText(root, 'p', '인용한 근거가 없습니다.');
      } else {
        addEvidence(root, data.evidenceIds);
      }

      addRules(root);

      addText(root, 'h4', '현재 상태');

      const state = event.state || {};

      const stateLabels = [
        ['access', '접속'],
        ['session', '세션'],
        ['device', '기기'],
      ];

      let unknownCount = 0;

      for (const [key, label] of stateLabels) {
        const value = state[key];

        if (value === 'unknown') {
          addText(root, 'p', `${label}: 확인 불가(unknown)`);
          unknownCount += 1;
        }
      }

      if (unknownCount === 0) {
        addText(root, 'p', '확인 불가 상태가 없습니다.');
      }

      addText(root, 'h4', 'AI 조치 제안');

      if (data.proposals.length === 0) {
        if (supportedActions.length === 0) {
          addText(
            root,
            'p',
            '연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상).'
          );
        } else {
          addText(root, 'p', 'AI가 제안한 조치가 없습니다.');
        }
      } else {
        const proposalsList = document.createElement('ul');

        for (const proposal of data.proposals) {
          if (
            !proposal
            || !isText(proposal.action)
            || !isText(proposal.reason)
            || !supportedActions.includes(proposal.action)
            || !hasValidEvidenceIds(proposal.evidenceIds)
          ) {
            root.removeAttribute('data-student-explanation-event');
            root.replaceChildren();

            addText(root, 'h3', 'AI 사건 설명');
            addText(root, 'p', 'AI 설명을 표시할 수 없습니다.');
            addText(root, 'p', '조치 제안의 근거 또는 지원 조치가 일치하지 않습니다.');
            return root;
          }

          const item = document.createElement('li');

          addText(item, 'p', `제안 조치: ${safeText(proposal.action)}`);
          addText(item, 'p', `제안 이유: ${safeText(proposal.reason)}`);
          addText(item, 'p', '제안 근거');

          addEvidence(item, proposal.evidenceIds);

          addText(
            item,
            'p',
            '사람의 확인이 필요하며 아직 실행되지 않았습니다.'
          );

          proposalsList.append(item);
        }

        root.append(proposalsList);
      }

      addText(
        root,
        'p',
        'AI 설명은 참고 정보입니다. 사실 판단은 근거와 연동 시스템의 상태를 기준으로 합니다.'
      );

      addText(
        root,
        'p',
        '이 화면에서는 보안 조치를 실행하지 않습니다.'
      );

      return root;
    },
    renderAction({
      status,
      event,
      actionId,
      target,
      receipt,
      observation,
      message,
      confirmationExpiresAt,
      error,
    } = {}) {
      const root = document.createElement('section');

      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      const isText = (value) =>
        typeof value === 'string' && value.length > 0;

      const isId = (value) =>
        isText(value) && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(value);

      const SECRET_LIKE =
        /bearer|token|secret|password|passwd|api[_-]?key|authorization/i;

      const safeText = (value) => {
        if (!isText(value)) return '확인 불가';
        if (SECRET_LIKE.test(value)) {
          return '(민감 정보 가능성이 있어 표시하지 않음)';
        }
        return value;
      };

      const displayValue = (value) => {
        if (isText(value)) return safeText(value);
        if (typeof value === 'number' && Number.isFinite(value)) {
          return String(value);
        }
        return '확인 불가';
      };

      const safeCode = (value) =>
        isText(value) && /^[A-Za-z0-9_.:-]{1,64}$/.test(value)
          ? value
          : '확인 불가';

      const labels = {
        idle: '아직 미실행(idle)',
        loading: '조치 준비 또는 연동 시스템 결과 조회 중(loading)',
        prepared: '준비됨·미실행(prepared)',
        executing: '서버에 전달 중(executing)',
        pending: '서버 접수·처리 중(pending)',
        succeeded: '효과 확인(succeeded)',
        denied: '연동 시스템 거절(denied)',
        failed: '연동 시스템 실패(failed)',
        unknown: '결과 불명(unknown)',
        error: '요청이 처리되지 않음(error)',
        expired: '확인 기한 지남(expired)',
      };

      const effectConfirmed =
        status === 'succeeded' && observation?.effectApplied === true;

      if (isId(event?.id)) {
        root.setAttribute('data-student-action-event', event.id);
      }
      if (isId(receipt?.requestId)) {
        root.setAttribute('data-student-action-request', receipt.requestId);
      }

      addText(root, 'h3', '보안 조치 요청 상태와 실제 결과');

      if (status === 'succeeded' && !effectConfirmed) {
        addText(
          root,
          'p',
          '결과 불명(unknown): 입력 상태 succeeded만으로는 실제 효과를 확인할 수 없습니다.'
        );
        addText(
          root,
          'p',
          '효과가 없었다고 단정하지 마세요. 「연동 시스템 결과만 재조회」로 결과를 다시 확인하세요.'
        );
      } else {
        addText(
          root,
          'p',
          labels[status] || '조치 상태 확인 불가: 알 수 없는 상태 값입니다.'
        );
      }

      if (status === 'idle') {
        addText(
          root,
          'p',
          'AI 조치 제안만으로 조치가 실행되지는 않습니다.'
        );
      } else if (status === 'loading') {
        addText(
          root,
          'p',
          '조치 준비 또는 결과 조회 중입니다. 실제 효과는 아직 확인되지 않았습니다.'
        );
      } else if (status === 'prepared') {
        addText(
          root,
          'p',
          '준비만 완료된 상태입니다. 사람이 제공 화면에서 조치와 실제 대상을 확인하기 전에는 실행되지 않습니다.'
        );
      } else if (status === 'executing') {
        addText(
          root,
          'p',
          '요청이 연동 시스템으로 전달되는 중입니다. 결과가 확인되기 전에는 완료나 성공으로 판단하지 않습니다.'
        );
      } else if (status === 'pending') {
        addText(
          root,
          'p',
          '연동 시스템이 요청을 접수해 처리 중입니다. 접수 응답(ACK)은 실제 효과 확인이 아닙니다.'
        );
      } else if (effectConfirmed) {
        addText(
          root,
          'p',
          '연동 시스템의 관측 결과에서 실제 효과가 확인되었습니다.'
        );
        addText(
          root,
          'p',
          `관측 시각: ${displayValue(observation?.observedAt)}`
        );
        addText(root, 'p', 'effectApplied: true');
        addText(
          root,
          'p',
          `영수증 ID(receiptId): ${displayValue(receipt?.receiptId)}`
        );
      } else if (status === 'denied' || status === 'failed') {
        addText(
          root,
          'p',
          `연동 시스템 메시지: ${safeText(
            isText(message) ? message : error?.message
          )}`
        );
      } else if (status === 'unknown') {
        addText(
          root,
          'p',
          '실제 효과가 확인되지 않은 상태입니다. 효과 없음이나 성공으로 단정하지 마세요.'
        );
        addText(
          root,
          'p',
          '「연동 시스템 결과만 재조회」로 현재 결과만 다시 확인하세요.'
        );
      } else if (status === 'expired') {
        addText(
          root,
          'p',
          '확인 기한이 지났습니다. 이전 준비 건으로는 집행할 수 없으며, 필요하면 제공 화면에서 다시 준비해야 합니다.'
        );
      } else if (status === 'error') {
        addText(root, 'p', `오류 코드: ${safeCode(error?.code)}`);
        addText(root, 'p', `오류 메시지: ${safeText(error?.message)}`);
      }

      if (isText(message) && status !== 'denied' && status !== 'failed') {
        addText(root, 'p', `상태 메시지: ${safeText(message)}`);
      }

      if (error && status !== 'error' && isText(error.message)) {
        addText(root, 'p', `오류 메시지: ${safeText(error.message)}`);
      }
      if (error && status !== 'error' && isText(error.code)) {
        addText(root, 'p', `오류 코드: ${safeCode(error.code)}`);
      }

      if (event) {
        addText(root, 'h4', '사건 및 근거');
        addText(root, 'p', `사건 ID(event.id): ${displayValue(event.id)}`);

        const evidenceIds = Array.isArray(event.evidence)
          ? event.evidence.filter((item) => isId(item?.id)).map((item) => item.id)
          : [];

        addText(
          root,
          'p',
          `근거 ID: ${evidenceIds.length > 0 ? evidenceIds.map(safeText).join(', ') : '없음'}`
        );

        if (
          Array.isArray(event.supportedActions)
          && event.supportedActions.length === 0
        ) {
          addText(
            root,
            'p',
            '이 기록에는 연동 시스템이 지원하는 조치가 없습니다. 조치 준비 버튼이 없는 것이 정상입니다.'
          );
        }
      }

      if (isText(actionId)) {
        addText(root, 'p', `조치 ID(actionId): ${safeText(actionId)}`);
      }

      if (target) {
        addText(root, 'h4', '실제 대상');
        addText(root, 'p', `대상 ID(target.id): ${displayValue(target.id)}`);
        addText(
          root,
          'p',
          `대상 세대(target.generation): ${displayValue(target.generation)}`
        );
      }

      if (receipt) {
        addText(root, 'h4', '연동 시스템 요청 정보');
        addText(
          root,
          'p',
          `요청 ID(requestId): ${displayValue(receipt.requestId)}`
        );
        addText(
          root,
          'p',
          `영수증 ID(receiptId): ${displayValue(receipt.receiptId)}`
        );
        addText(
          root,
          'p',
          `버전(version): ${displayValue(receipt.version)}`
        );
      }

      if (confirmationExpiresAt) {
        addText(
          root,
          'p',
          `사람 확인 기한(confirmationExpiresAt): ${displayValue(confirmationExpiresAt)}`
        );
      }

      addText(
        root,
        'p',
        '이 학생 화면은 상태만 표시합니다. 조치 준비·사람 확인·집행·결과 조회는 제공 화면의 기능을 사용합니다.'
      );

      return root;
    },
  };
}
