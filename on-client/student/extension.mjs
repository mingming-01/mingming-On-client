// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {

  const addStudentText = (parent, tag, text, className) => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    parent.append(node);
    return node;
  };

  const focusArea = (tabId, targetId) => {
    if (tabId) document.getElementById(tabId)?.click();
    const target = document.getElementById(targetId);
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start', behavior: 'auto' });
  };

  const installCoreOverview = () => {
    const view = document.getElementById('view-protection');
    if (!view) return;

    document.getElementById('student-core-overview')?.remove();
    document.getElementById('student-core-overview-style')?.remove();

    const style = document.createElement('style');
    style.id = 'student-core-overview-style';
    style.textContent = [
      '.student-core-overview { border-left: 6px solid var(--accent); padding: 20px; }',
      '.student-core-overview > h2 { font-size: 1.3rem; line-height: 1.4; margin-bottom: 8px; }',
      '.student-core-overview > p { font-size: 1rem; line-height: 1.55; }',
      '.student-core-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }',
      '.student-core-tile { display: flex; flex-direction: column; min-width: 0; gap: 10px; border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }',
      '.student-core-tile h3 { font-size: 1.12rem; line-height: 1.45; }',
      '.student-core-tile p { flex: 1; font-size: 1rem; line-height: 1.5; margin: 0; }',
      '.student-core-link { min-height: 44px; padding: 9px 12px; border: 1px solid var(--accent); border-radius: var(--radius); background: var(--accent-soft); color: var(--text); font: inherit; font-weight: 600; cursor: pointer; }',
      '.student-core-link:hover { background: var(--surface); }',
      '.student-core-link:focus-visible, .student-refresh-button:focus-visible, #identity-title:focus-visible, #student-decision-title:focus-visible, #student-events-title:focus-visible { outline: 3px solid #f5b400; outline-offset: 3px; box-shadow: none; }',
      '.student-refresh-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin: 0 0 12px; }',
      '.student-events-toolbar { display: grid; gap: 10px; margin: 12px 0; }',
      '.student-events-summary { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }',
      '.student-events-search { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }',
      '.student-events-search input { flex: 1; min-width: 220px; min-height: 40px; }',
      '.student-events-actions { display: flex; gap: 8px; flex-wrap: wrap; }',
      '.student-events-status { flex-basis: 100%; min-height: 1.4em; margin: 0; }',
      '.student-refresh-button { display: inline-flex; min-height: 40px; align-items: center; gap: 8px; font-weight: 600; }',
      '.student-refresh-feedback { font-size: .9rem; color: var(--muted); }',
      '.student-loading-spinner { width: 14px; height: 14px; flex: none; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: student-refresh-spin .8s linear infinite; }',
      '@keyframes student-refresh-spin { to { transform: rotate(360deg); } }',
      '.student-local-system > h3, .student-network-status > h3 { font-size: 1.25rem; line-height: 1.45; margin-bottom: 10px; }',
      '.local-system-primary-value { font-size: 1.2rem; line-height: 1.5; font-weight: 700; overflow-wrap: anywhere; }',
      '.student-recovery-guide { border-left: 3px solid var(--deny); padding: 8px 12px; margin: 8px 0; background: var(--deny-soft); line-height: 1.55; }',
      '.student-next-step { line-height: 1.55; }',
      '@media (max-width: 1120px) { .student-core-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .student-core-tile:last-child { grid-column: 1 / -1; } }',
      '@media (prefers-reduced-motion: reduce) { .student-loading-spinner { animation: none; } }'
    ].join('\n');
    document.head.append(style);

    const panel = document.createElement('section');
    panel.id = 'student-core-overview';
    panel.className = 'card student student-core-overview';
    panel.setAttribute('aria-labelledby', 'student-core-overview-title');
    addStudentText(panel, 'h2', '핵심 기능 바로가기').id = 'student-core-overview-title';
    addStudentText(panel, 'p', '계정 상태, 업무 앱 접근 판정, 보안 기록을 먼저 확인할 수 있습니다. 각 항목은 실제 화면으로 이동하며 설명용 예시 값은 표시하지 않습니다.');

    const grid = document.createElement('div');
    grid.className = 'student-core-grid';
    const features = [
      {
        title: '계정 · 기기 · 세션',
        description: '현재 로그인한 계정, 기기 보안 상태와 세션 상태를 확인합니다.',
        button: '계정 정보 보기',
        target: 'identity-title',
        tab: null,
      },
      {
        title: '업무 앱 접근 판정',
        description: '접근 허용·거부 결과와 정책 판정 이유를 확인합니다.',
        button: '접근 판정 보기',
        target: 'student-decision-title',
        tab: 'tab-apps',
      },
      {
        title: '보안 기록 타임라인',
        description: '최근 보안 기록을 시각순으로 확인하고 종류별로 거릅니다.',
        button: '기록 타임라인 보기',
        target: 'student-events-title',
        tab: 'tab-records',
      },
    ];

    for (const feature of features) {
      const tile = document.createElement('section');
      tile.className = 'student-core-tile';
      addStudentText(tile, 'h3', feature.title);
      addStudentText(tile, 'p', feature.description);
      const button = addStudentText(tile, 'button', feature.button, 'student-core-link');
      button.type = 'button';
      button.addEventListener('click', () => focusArea(feature.tab, feature.target));
      grid.append(tile);
    }
    panel.append(grid);

    for (const id of ['identity-title', 'student-decision-title', 'student-events-title']) {
      const heading = document.getElementById(id);
      if (heading && !heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    }
    const firstGrid = view.querySelector('.grid-2');
    if (firstGrid) view.insertBefore(panel, firstGrid);
    else view.append(panel);
  };

  const addRefreshControl = (parent, config) => {
    const row = document.createElement('div');
    row.className = 'student-refresh-row';

    const isLoading = config.status === 'loading';
    const button = addStudentText(
      row,
      'button',
      isLoading ? config.loadingLabel : config.label,
      'btn student-refresh-button'
    );
    button.type = 'button';
    button.disabled = isLoading;
    button.setAttribute('aria-controls', config.slotId);
    button.setAttribute('aria-busy', String(isLoading));

    const spinner = document.createElement('span');
    spinner.className = 'student-loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    spinner.hidden = !isLoading;
    button.prepend(spinner);

    const feedback = addStudentText(row, 'span', '', 'student-refresh-feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');

    button.addEventListener('click', () => {
      const existingButton = document.getElementById(config.controlId);
      if (!existingButton) {
        feedback.textContent = '기존 조회 기능을 찾지 못했습니다. 앱을 다시 실행하고 조회 버튼이 표시되는지 확인하세요.';
        return;
      }
      if (existingButton.disabled) {
        feedback.textContent = '이미 조회 중입니다. 현재 조회가 끝난 뒤 다시 시도하세요.';
        return;
      }
      feedback.textContent = '새 조회를 요청했습니다.';
      existingButton.click();
    });

    parent.append(row);
  };

  installCoreOverview();

  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const root = document.createElement('section');
      root.className = 'student-identity';

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
          demo: '예제 자료(demo)',
          disconnected: '연결 없음(disconnected)',
          connected: '연결 설정 있음(connected)',
          unknown: '확인 불가(unknown)',
        };
        const modeLabel = resource && modeLabels[resource.mode];
        if (modeLabel) addText(parent, 'p', `연결 모드: ${modeLabel}`);
        if (resource?.mode === 'connected') {
          addText(parent, 'p', resource.status === 'ok'
            ? '이번 조회는 연결된 서버의 응답을 받았습니다. unknown 상태는 확인 불가로 유지합니다.'
            : '연결 설정은 있지만 이번 조회는 성공하지 않았습니다. 실제 값으로 간주하지 않습니다.');
        } else if (resource?.mode === 'demo') {
          addText(parent, 'p', '예제 자료입니다. 실제 PC나 계정에서 읽은 값이 아닙니다.');
        }
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
      const modeLabels = { demo: '예제 자료(demo)', disconnected: '연결 없음(disconnected)', connected: '연결 설정 있음(connected)', unknown: '확인 불가(unknown)' };

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
      root.className = 'student-events';

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
      const modeLabels = { demo: '예제 자료(demo)', disconnected: '연결 없음(disconnected)', connected: '연결 설정 있음(connected)', unknown: '확인 불가(unknown)' };

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

      addText(root, 'h3', '보안 기록 타임라인');
      const sourceMode = meta?.mode ?? mode;
      if (sourceMode === 'demo') {
        addText(root, 'p', '예제 데이터(demo): 아래 값은 화면 설명용이며 실제 PC나 보안 시스템에서 조회한 기록이 아닙니다.');
      } else if (sourceMode === 'connected' && status === 'ok' && Array.isArray(data)) {
        addText(root, 'p', '실제 연결 조회: 이번 요청의 응답을 확인했습니다. 본인 범위의 최근 기록만 표시하며 전체 직원 이력이나 실시간 전체 위협 탐지는 아닙니다.');
      } else if (sourceMode === 'connected') {
        addText(root, 'p', '연결 설정 있음(connected): 이번 기록 조회는 성공하지 않았으므로 실제 기록이 확인된 상태가 아닙니다.');
      } else if (sourceMode === 'disconnected') {
        addText(root, 'p', '연결 없음(disconnected): 실제 보안 기록을 불러오지 못했습니다. 예제 데이터로 대체하지 않습니다.');
        addText(root, 'p', '실제 연결은 담당 운영자가 발급한 설정 파일 경로를 -SdpHostConfig 옵션으로 지정해야 합니다.');
      } else {
        addText(root, 'p', '조회 출처 확인 불가: 연결 상태를 확인하기 전에는 기록의 실제 여부를 판단하지 않습니다.');
      }

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
          const filters = { kind: 'all', appId: 'all', access: 'all', query: '' };
          let selectedId = null;

          addText(root, 'p', '이 목록은 본인의 최근 기록(최대 40건)입니다. 모든 직원의 전체 이력이나 실시간 전체 위협 탐지가 아닙니다. XDR 경보는 서버가 이미 저장한 경보만 표시합니다.');

          const toolbar = document.createElement('div');
          toolbar.className = 'student-events-toolbar';
          const searchRow = document.createElement('div');
          searchRow.className = 'student-events-search';
          const searchLabel = addText(searchRow, 'label', '기록 검색');
          searchLabel.setAttribute('for', 'student-events-search');
          const searchInput = document.createElement('input');
          searchInput.id = 'student-events-search';
          searchInput.type = 'search';
          searchInput.autocomplete = 'off';
          searchInput.placeholder = '사건 ID, 요약, 앱, 상태, 근거, 규칙 검색';
          searchInput.setAttribute('aria-label', '보안 기록 검색어');
          searchInput.addEventListener('input', () => {
            filters.query = searchInput.value.trim().toLocaleLowerCase();
            refresh();
          });
          searchRow.append(searchInput);

          const filterBar = document.createElement('div');
          filterBar.className = 'row';
          const actionRow = document.createElement('div');
          actionRow.className = 'student-events-actions';
          const resetButton = addText(actionRow, 'button', '필터 초기화');
          resetButton.type = 'button';
          resetButton.className = 'btn';
          const exportButton = addText(actionRow, 'button', '현재 결과 CSV 저장');
          exportButton.type = 'button';
          exportButton.className = 'btn';
          const actionStatus = addText(actionRow, 'p', '', 'student-events-status muted');
          actionStatus.setAttribute('role', 'status');
          actionStatus.setAttribute('aria-live', 'polite');

          const summaryArea = document.createElement('div');
          summaryArea.className = 'student-events-summary';
          summaryArea.setAttribute('aria-label', '현재 필터 결과 요약');
          summaryArea.setAttribute('role', 'status');
          summaryArea.setAttribute('aria-live', 'polite');

          const listArea = document.createElement('div');
          const detailArea = document.createElement('div');
          detailArea.className = 'card';
          const buttons = new Map();
          const filterControls = new Map();

          const searchableText = (event) => [
            event.id, event.summary, event.appId, event.at, event.kind,
            event.state?.access, event.state?.session, event.state?.device,
            ...(Array.isArray(event.evidence) ? event.evidence.flatMap((row) => [row?.id, row?.text]) : []),
            ...(Array.isArray(event.rules) ? event.rules.flatMap((row) => [row?.id, row?.text]) : []),
          ].filter(isText).join(' ').toLocaleLowerCase();

          const visibleEvents = () => sorted.filter((event) => (filters.kind === 'all' || event.kind === filters.kind)
            && (filters.appId === 'all' || event.appId === filters.appId)
            && (filters.access === 'all' || event.state?.access === filters.access)
            && (!filters.query || searchableText(event).includes(filters.query)));

          const updateSummary = (rows) => {
            summaryArea.replaceChildren();
            const denied = rows.filter((event) => event.kind === 'access' && event.state?.access === 'denied').length;
            const unknown = rows.filter((event) => event.kind === 'access' && event.state?.access === 'unknown').length;
            const values = [
              '현재 조건 ' + rows.length + '건',
              '접속 기록 ' + rows.filter((event) => event.kind === 'access').length + '건',
              'XDR 경보 기록 ' + rows.filter((event) => event.kind === 'xdr').length + '건',
              '접속 거부 상태 ' + denied + '건',
              '접속 상태 확인 불가 ' + unknown + '건',
            ];
            for (const value of values) {
              const tag = addText(summaryArea, 'span', value);
              tag.className = 'tag';
            }
            exportButton.disabled = rows.length === 0;
          };

          const csvCell = (value) => {
            let text = value == null ? '' : String(value);
            // Excel 등의 스프레드시트가 입력을 수식으로 실행하지 않도록 위험한 셀을 문자로 취급한다.
            if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
            return '"' + text.replace(/"/g, '""') + '"';
          };

          const exportVisibleEvents = () => {
            const rows = visibleEvents();
            if (rows.length === 0) {
              actionStatus.textContent = '저장할 기록이 없습니다. 필터 조건을 바꿔 주세요.';
              return;
            }
            try {
              if (typeof Blob !== 'function' || typeof URL?.createObjectURL !== 'function') {
                throw new Error('CSV_DOWNLOAD_UNAVAILABLE');
              }
              const header = [
                '출처 모드', '원본 시각(ISO)', '기록 종류', '사건 ID', '앱 ID', '요약',
                '접속 상태', '세션 상태', '기기 상태', '근거', '규칙',
              ];
              const dataRows = rows.map((event) => [
                sourceMode || 'unknown',
                event.at,
                event.kind,
                event.id,
                event.appId,
                event.summary,
                event.state?.access,
                event.state?.session,
                event.state?.device,
                (event.evidence || []).map((row) => [row?.id, row?.text].filter(isText).join(': ')).join(' | '),
                (event.rules || []).map((row) => [row?.id, row?.text].filter(isText).join(': ')).join(' | '),
              ]);
              const csv = '\uFEFF' + [header, ...dataRows]
                .map((row) => row.map(csvCell).join(',')).join('\r\n');
              const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
              const url = URL.createObjectURL(file);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'mingming-timeline-' + (sourceMode === 'demo' ? 'demo' : 'records')
                + '-' + new Date().toISOString().replace(/[:.]/g, '-') + '.csv';
              link.hidden = true;
              root.append(link);
              link.click();
              link.remove();
              window.setTimeout(() => URL.revokeObjectURL(url), 1000);
              actionStatus.textContent = rows.length + '건을 CSV로 내보냈습니다. 현재 필터 결과만 포함됩니다.';
            } catch {
              actionStatus.textContent = 'CSV 저장을 시작하지 못했습니다. 브라우저의 다운로드 설정을 확인하세요.';
            }
          };

          resetButton.addEventListener('click', () => {
            for (const [key, select] of filterControls) {
              filters[key] = 'all';
              select.value = 'all';
            }
            filters.query = '';
            searchInput.value = '';
            actionStatus.textContent = '필터를 초기화했습니다.';
            refresh();
          });
          exportButton.addEventListener('click', exportVisibleEvents);

          const renderDetail = () => {
            detailArea.replaceChildren();
            const event = selectedId === null ? null : sorted.find((item) => item.id === selectedId);
            if (!event) return;
            const box = document.createElement('section');
            box.className = 'event-block';
            box.setAttribute('data-student-event-detail', String(event.id));
            addText(box, 'h4', '기록 상세');
            addText(box, 'p', `사건 ID: ${displayValue(event.id)}`);
            addText(box, 'p', `원본 시각(at): ${displayValue(event.at)}`);
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
            updateSummary(rows);
            buttons.clear();
            listArea.replaceChildren();
            addText(listArea, 'p', `표시 중인 기록 ${rows.length}건 / 받은 기록 ${sorted.length}건`);
            if (rows.length === 0) {
              addText(listArea, 'p', '선택한 조건에 맞는 기록이 없습니다.');
            } else {
              const list = document.createElement('ol');
              list.className = 'records';
              for (const event of rows) {
                const item = document.createElement('li');
                item.className = 'event';
                item.setAttribute('data-student-event-id', String(event.id));
                const head = document.createElement('div');
                head.className = 'event-head';
                addText(head, 'h3', displayValue(event.summary));
                const kindTag = addText(head, 'span', withCode(kindLabels, event.kind));
                kindTag.className = 'tag';
                if (sourceMode === 'demo') {
                  const demoTag = addText(head, 'span', '예제');
                  demoTag.className = 'tag tag-demo';
                }
                item.append(head);
                const timeLine = addText(item, 'p', `시각: ${formatAt(event.at)}`);
                timeLine.className = 'muted';
                addText(item, 'p', `사건 ID: ${displayValue(event.id)}`);
                addText(item, 'p', `앱: ${appText(event.appId)}`);
                const button = addText(item, 'button', `${event.id} 상세`);
                button.type = 'button';
                button.className = 'btn';
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
            filterControls.set(key, select);
            wrap.append(select);
            filterBar.append(wrap);
          };

          addFilter('kind', '기록 종류', unique(sorted.map((event) => event.kind)), (value) => withCode(kindLabels, value));
          addFilter('appId', '업무 앱', unique(sorted.map((event) => event.appId)), (value) => value);
          addFilter('access', '접속 상태', unique(sorted.map((event) => event.state?.access)), (value) => withCode(accessLabels, value));

          toolbar.append(searchRow, filterBar, actionRow);
          root.append(summaryArea, toolbar, listArea, detailArea);
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
    renderLocalSystem({ status, data, error, history = [], attemptedAt } = {}) {
      const root = document.createElement('section');
      root.className = 'student-local-system';

      const addText = (parent, tag, text, className) => {
        const node = document.createElement(tag);
        node.textContent = text;
        if (className) node.className = className;
        parent.append(node);
        return node;
      };
      const timeText = (value) => {
        if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return '시각 확인 불가';
        return new Date(value).toLocaleString('ko-KR');
      };
      const numberText = (value, digits = 2) => Number.isFinite(value) ? value.toFixed(digits) : '확인 불가';
      const metricOk = (metric) => metric && metric.status === 'ok';
      const cpuText = (metric) => metricOk(metric) ? numberText(metric.percent, 1) + ' %' : '확인 불가';
      const memoryText = (metric) => metricOk(metric)
        ? numberText(metric.usedGiB) + ' / ' + numberText(metric.totalGiB) + ' GiB 사용 · 사용 가능 ' + numberText(metric.freeGiB) + ' GiB · ' + numberText(metric.percentUsed, 1) + ' % 사용'
        : '확인 불가';
      const diskText = (metric) => metricOk(metric)
        ? numberText(metric.freeGiB) + ' / ' + numberText(metric.totalGiB) + ' GiB 남음 / 전체 · ' + numberText(metric.percentUsed, 1) + ' % 사용 중'
        : '확인 불가';
      const metricValue = (metric, kind) => kind === 'cpu' ? cpuText(metric) : kind === 'memory' ? memoryText(metric) : diskText(metric);
      const names = { cpu: 'CPU 사용률', memory: '메모리 사용량', disk: '디스크 남은 공간' };

      addText(root, 'h3', '내 PC 실측 기록');
      root.setAttribute('aria-busy', String(status === 'loading'));
      addRefreshControl(root, {
        status,
        label: '다시 측정',
        loadingLabel: '측정 중…',
        controlId: 'local-system-refresh',
        slotId: 'student-local-system',
      });
      addText(root, 'p', '운영체제에서 직접 읽은 값입니다. 관리자 권한은 요청하지 않습니다. 예시 값은 사용하지 않으며, 읽지 못한 항목은 확인 불가로 남깁니다.');

      if (status === 'idle' || status == null) {
        addText(root, 'p', '아직 측정하지 않았습니다. 「지금 측정」을 눌러 현재 값을 확인하세요.');
      } else if (status === 'loading') {
        addText(root, 'p', '측정 중입니다. 이전 기록은 현재 측정값으로 대신 표시하지 않습니다.');
      } else if (status === 'error') {
        addText(root, 'p', '이번 요청: 확인 불가 · ' + (typeof error?.message === 'string' ? error.message : '측정 요청을 완료하지 못했습니다.'));
        addText(root, 'p', '요청 시각: ' + timeText(attemptedAt));
        addText(root, 'p', '예시 값은 표시하지 않았습니다. 이번 측정에 실패한 상태입니다.', 'student-recovery-guide');
        addText(root, 'p', '다음 조치: 앱의 조회 기능이 실행 중인지 확인하고 「다시 측정」을 누르세요. 반복되면 오류 이유를 기록해 확인합니다.', 'student-next-step');
      } else if (status === 'ok' && data) {
        addText(root, 'p', '이번 측정 완료 · 결과 시각: ' + timeText(data.measuredAt));
        for (const key of ['cpu', 'memory', 'disk']) {
          const metric = data[key];
          const block = document.createElement('section');
          block.className = 'local-system-metric';
          addText(block, 'h4', names[key]);
          if (metricOk(metric)) {
            addText(block, 'p', metricValue(metric, key), 'local-system-primary-value');
            addText(block, 'p', '측정 시각: ' + timeText(metric.checkedAt) + ' · 단위: ' + metric.unit);
            addText(block, 'p', '출처: ' + metric.source);
          } else {
            addText(block, 'p', '확인 불가');
            addText(block, 'p', '이유: ' + (typeof metric?.reason === 'string' ? metric.reason : '측정 이유를 확인할 수 없습니다.'));
            addText(block, 'p', '측정 시각: ' + timeText(metric?.checkedAt) + ' · 단위: ' + (typeof metric?.unit === 'string' ? metric.unit : '확인 불가'));
            addText(block, 'p', '출처: ' + (typeof metric?.source === 'string' ? metric.source : '확인 불가'));
          }

          const prior = [...history]
            .filter((row) => row && row.measuredAt && Date.parse(row.measuredAt) < Date.parse(data.measuredAt) && metricOk(row[key]))
            .sort((a, b) => Date.parse(b.measuredAt) - Date.parse(a.measuredAt))[0];
          if (metricOk(metric) && prior) {
            let difference;
            if (key === 'cpu') {
              difference = 'CPU 사용률 변화 ' + (metric.percent - prior.cpu.percent >= 0 ? '+' : '') + numberText(metric.percent - prior.cpu.percent, 1) + ' %p';
            } else if (key === 'memory') {
              const delta = metric.usedGiB - prior.memory.usedGiB;
              difference = '사용량 변화 ' + (delta >= 0 ? '+' : '') + numberText(delta) + ' GiB · 사용률 변화 ' + (metric.percentUsed - prior.memory.percentUsed >= 0 ? '+' : '') + numberText(metric.percentUsed - prior.memory.percentUsed, 1) + ' %p';
            } else {
              const delta = metric.freeGiB - prior.disk.freeGiB;
              difference = '남은 공간 변화 ' + (delta >= 0 ? '+' : '') + numberText(delta) + ' GiB';
            }
            addText(block, 'p', '이전 실측 대비: ' + difference + ' · 비교 기준 시각: ' + timeText(prior.measuredAt));
          } else if (metricOk(metric)) {
            addText(block, 'p', '추이 비교: 비교할 이전 실측이 없습니다. 한 번 더 측정하면 비교합니다.');
          }
          root.append(block);
        }
      } else {
        addText(root, 'p', '확인 불가: 측정 상태의 형식을 확인할 수 없습니다.');
      }

      const rows = Array.isArray(history) ? [...history].sort((a, b) => Date.parse(b?.measuredAt || '') - Date.parse(a?.measuredAt || '')).slice(0, 10) : [];
      if (rows.length) {
        addText(root, 'h4', '최근 측정 타임라인 (최대 10회)');
        const list = document.createElement('ol');
        for (const row of rows) {
          const summary = ['cpu', 'memory', 'disk'].map((key) => names[key] + ': ' + metricValue(row?.[key], key));
          addText(list, 'li', timeText(row?.measuredAt) + ' · ' + summary.join(' · '));
        }
        root.append(list);
        addText(root, 'p', '추이 기록은 현재 화면을 열어 둔 동안 메모리에만 보관됩니다. 페이지를 새로 열면 초기화되며, 디스크에 저장하거나 외부로 전송하지 않습니다.');
      }
      return root;
    },
    renderNetworkStatus({ status, data, error, history = [], attemptedAt } = {}) {
      const root = document.createElement('section');
      root.className = 'student-network-status';

      const addText = (parent, tag, text, className) => {
        const node = document.createElement(tag);
        node.textContent = text;
        if (className) node.className = className;
        parent.append(node);
        return node;
      };
      const isText = (value) => typeof value === 'string' && value.length > 0;
      const timeText = (value) => {
        if (!isText(value) || !Number.isFinite(Date.parse(value))) return '시각 확인 불가';
        return new Date(value).toLocaleString('ko-KR');
      };
      const fields = (values) => Array.isArray(values) && values.length ? values.join(', ') : '없음/확인된 값 없음';
      const statusText = (item) => {
        if (!item) return '확인 불가';
        if (item.status === 'ok') return '조회 성공';
        if (item.status === 'unavailable') return '확인 불가 · ' + (isText(item.reason) ? item.reason : '조회 이유를 확인할 수 없습니다.');
        return '확인 불가';
      };
      const section = (title) => {
        const block = document.createElement('section');
        block.className = 'network-read-block';
        addText(block, 'h4', title);
        return block;
      };
      const summarize = (item, kind) => {
        if (!item) return '확인 불가';
        if (kind === 'network') {
          if (item.status !== 'ok') return '확인 불가';
          if (!Array.isArray(item.interfaces) || item.interfaces.length === 0) return '조회 성공 · 표시할 IP 구성이 없습니다.';
          return item.interfaces.length + '개 인터페이스 · ' + item.interfaces.map((row) => row.name + ' (' + row.adapterStatus + ')').join(', ');
        }
        if (kind === 'firewall') {
          if (item.status !== 'ok') return '확인 불가';
          return Array.isArray(item.profiles) && item.profiles.length
            ? item.profiles.map((row) => row.name + ': ' + (row.enabled === true || row.enabled === 'True' ? '사용' : row.enabled === false || row.enabled === 'False' ? '사용 안 함' : '상태 확인 불가')).join(', ')
            : '조회 성공 · 반환된 프로필이 없습니다.';
        }
        if (kind === 'systemLog' || kind === 'applicationLog') {
          return item.status === 'ok'
            ? '경고 ' + item.warningCount + '건 · 오류 ' + item.errorCount + '건 (최근 24시간)'
            : '확인 불가';
        }
        if (kind === 'sdp') return item.label || (item.status === 'connected' ? 'SDP 연결 확인' : item.status === 'disconnected' ? 'SDP 미연결' : '확인 불가');
        return '확인 불가';
      };
      const names = {
        network: '네트워크 구성',
        firewall: '방화벽 설정',
        systemLog: 'System 이벤트',
        applicationLog: 'Application 이벤트',
        sdp: 'SDP 서버 연결',
      };

      addText(root, 'h3', '네트워크·방화벽·Windows 기록');
      root.setAttribute('aria-busy', String(status === 'loading'));
      addRefreshControl(root, {
        status,
        label: '다시 조회',
        loadingLabel: '조회 중…',
        controlId: 'network-status-refresh',
        slotId: 'student-network-status',
      });
      addText(root, 'p', 'PC 조회는 이 PC의 운영체제에서 읽은 실제 결과입니다. 설명용 예시 값으로 대체하지 않습니다. 조회할 수 없는 항목은 확인 불가로 표시합니다.');
      addText(root, 'p', 'System·Application 경고/오류 건수는 최근 24시간의 Windows 이벤트 로그 집계일 뿐입니다. 이는 침해·공격 탐지 결과나 감염 여부 판단이 아닙니다.');
      addText(root, 'p', '방화벽·네트워크 설정은 읽기만 합니다. 설정 변경, 관리자 권한 상승, 공격·침투 재현은 수행하지 않습니다.');

      if (status === 'idle' || status == null) {
        addText(root, 'p', '아직 조회하지 않았습니다. 「지금 조회」를 눌러 현재 상태를 확인하세요.');
      } else if (status === 'loading') {
        addText(root, 'p', '조회 중입니다. 이전 조회 결과는 현재 상태로 대신 표시하지 않습니다.');
      } else if (status === 'error') {
        addText(root, 'p', '이번 조회: 확인 불가 · ' + (isText(error?.message) ? error.message : '조회 요청을 완료하지 못했습니다.'));
        addText(root, 'p', '요청 시각: ' + timeText(attemptedAt));
        addText(root, 'p', '예시 값은 표시하지 않았습니다. 이번 네트워크 조회에 실패한 상태입니다.', 'student-recovery-guide');
        addText(root, 'p', '다음 조치: 앱의 조회 기능이 실행 중인지 확인하고 「다시 조회」를 누르세요. 특정 항목만 실패하면 아래 항목별 이유를 확인합니다.', 'student-next-step');
      } else if (status === 'ok' && data) {
        addText(root, 'p', '실제 PC 조회 완료 · 결과 시각: ' + timeText(data.measuredAt));

        const network = section('현재 네트워크 구성');
        addText(network, 'p', statusText(data.network));
        if (data.network?.status === 'unavailable') {
          addText(network, 'p', '다음 조치: 앱을 다시 조회하고, 계속 실패하면 표시된 이유와 네트워크 어댑터 상태를 확인하세요. 관리자 권한으로 변경 작업을 수행할 필요는 없습니다.', 'student-next-step');
        }
        if (data.network?.status === 'ok') {
          if (!data.network.interfaces.length) addText(network, 'p', '조회 성공이지만 IP 구성을 반환한 인터페이스가 없습니다.');
          for (const item of data.network.interfaces) {
            const block = document.createElement('div');
            block.className = 'network-interface';
            addText(block, 'h4', (isText(item.name) ? item.name : '이름 확인 불가') + ' · 상태: ' + (isText(item.adapterStatus) ? item.adapterStatus : '확인 불가'));
            addText(block, 'p', 'IPv4: ' + fields(item.ipv4Addresses) + ' · IPv6: ' + fields(item.ipv6Addresses));
            addText(block, 'p', '기본 게이트웨이: ' + fields(item.defaultGateways) + ' · DNS: ' + fields(item.dnsServers));
            addText(block, 'p', '네트워크 범주: ' + (item.networkCategory || '확인 불가') + ' · IPv4 연결 상태: ' + (item.ipv4Connectivity || '확인 불가'));
            network.append(block);
          }
        }
        addText(network, 'p', '측정 시각: ' + timeText(data.network?.checkedAt) + ' · 출처: ' + (data.network?.source || '확인 불가'));
        root.append(network);

        const firewall = section('Windows 방화벽 프로필');
        addText(firewall, 'p', statusText(data.firewall));
        if (data.firewall?.status === 'unavailable') {
          addText(firewall, 'p', '다음 조치: 앱을 다시 조회하세요. 계속 실패하면 Windows 방화벽 조회 구성요소 또는 표시된 오류 이유를 확인하고, 방화벽 설정은 변경하지 마세요.', 'student-next-step');
        }
        if (data.firewall?.status === 'ok') {
          if (!data.firewall.profiles.length) addText(firewall, 'p', '프로필 정보가 반환되지 않았습니다.');
          for (const profile of data.firewall.profiles) {
            addText(firewall, 'p', profile.name + ' · 방화벽: ' + (profile.enabled === true || profile.enabled === 'True' ? '사용(Enabled)' : profile.enabled === false || profile.enabled === 'False' ? '사용 안 함(Disabled)' : '확인 불가')
              + ' · 인바운드 기본 동작: ' + profile.defaultInboundAction
              + ' · 아웃바운드 기본 동작: ' + profile.defaultOutboundAction);
          }
        }
        addText(firewall, 'p', '측정 시각: ' + timeText(data.firewall?.checkedAt) + ' · 출처: ' + (data.firewall?.source || '확인 불가'));
        root.append(firewall);

        for (const key of ['systemLog', 'applicationLog']) {
          const log = data[key];
          const block = section(key === 'systemLog' ? 'Windows System 이벤트 로그' : 'Windows Application 이벤트 로그');
          addText(block, 'p', statusText(log));
          if (log?.status === 'unavailable') {
            addText(block, 'p', '다음 조치: 앱을 다시 조회하세요. 계속 실패하면 표시된 이유를 확인하고, 권한 오류가 있더라도 권한 상승 없이 확인 불가로 유지합니다.', 'student-next-step');
          }
          if (log?.status === 'ok') {
            addText(block, 'p', '경고: ' + log.warningCount + '건 · 오류: ' + log.errorCount + '건');
            addText(block, 'p', '조회 범위: ' + timeText(log.windowStart) + ' ~ ' + timeText(log.windowEnd));
          }
          addText(block, 'p', '측정 시각: ' + timeText(log?.checkedAt) + ' · 출처: ' + (log?.source || 'Get-WinEvent'));
          root.append(block);
        }

        const sdpBlock = section('SDP 서버 연결 상태');
        const sdpLabel = data.sdp?.status === 'connected' ? 'SDP 연결 확인'
          : data.sdp?.status === 'disconnected' ? 'SDP 미연결' : '확인 불가';
        addText(sdpBlock, 'p', sdpLabel);
        addText(sdpBlock, 'p', isText(data.sdp?.reason) ? data.sdp.reason : '연결 상태를 확인할 수 없습니다.');
        addText(sdpBlock, 'p', '확인 시각: ' + timeText(data.sdp?.checkedAt) + ' · 근거: ' + (data.sdp?.source || '확인 불가'));
        addText(sdpBlock, 'p', 'PC 네트워크 조회 성공은 SDP 서버 연결을 의미하지 않습니다.');
        addText(sdpBlock, 'p', 'SDP 연결 확인은 원천 identity 조회만 사용합니다. 이 PC의 네트워크·방화벽·이벤트 집계 결과를 SDP 서버로 보내지 않습니다.');
        root.append(sdpBlock);
      } else {
        addText(root, 'p', '확인 불가: 조회 상태의 형식을 확인할 수 없습니다.');
      }

      const categories = [
        ['all', '전체'], ['network', '네트워크'], ['firewall', '방화벽'],
        ['systemLog', 'System'], ['applicationLog', 'Application'], ['sdp', 'SDP 연결'],
      ];
      const records = [];
      for (const sample of (Array.isArray(history) ? history : [])) {
        for (const kind of ['network', 'firewall', 'systemLog', 'applicationLog', 'sdp']) {
          const item = sample?.[kind];
          if (item) records.push({ kind, at: item.checkedAt || sample.measuredAt, status: item.status, summary: summarize(item, kind) });
        }
      }
      records.sort((a, b) => {
        const ta = Date.parse(a.at), tb = Date.parse(b.at);
        if (!Number.isFinite(ta) || !Number.isFinite(tb)) return Number.isFinite(ta) ? -1 : Number.isFinite(tb) ? 1 : 0;
        return tb - ta;
      });

      if (records.length) {
        addText(root, 'h4', '조회 기록 타임라인 (최근 10회 조회)');
        const filterBar = document.createElement('div');
        filterBar.className = 'row network-filter';
        const label = document.createElement('label');
        label.textContent = '기록 종류 ';
        const select = document.createElement('select');
        select.className = 'network-filter-select';
        select.setAttribute('aria-label', '타임라인 기록 종류 필터');
        for (const [value, title] of categories) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = title;
          select.append(option);
        }
        label.append(select);
        filterBar.append(label);
        const list = document.createElement('ol');
        list.className = 'network-timeline';
        const renderRecords = () => {
          list.replaceChildren();
          const visible = records.filter((row) => select.value === 'all' || row.kind === select.value);
          if (!visible.length) {
            addText(list, 'li', '선택한 종류의 기록이 없습니다.');
            return;
          }
          for (const row of visible) {
            const item = document.createElement('li');
            item.className = 'network-timeline-item';
            addText(item, 'strong', names[row.kind] + ' · ' + (row.status === 'ok' || row.status === 'connected' ? '조회 확인' : row.status === 'disconnected' ? 'SDP 미연결' : '확인 불가'));
            addText(item, 'p', timeText(row.at));
            addText(item, 'p', row.summary);
            list.append(item);
          }
        };
        select.addEventListener('change', renderRecords);
        renderRecords();
        root.append(filterBar, list);
        addText(root, 'p', '타임라인은 조회 시각 기준 최신순이며, 종류별로 걸러 볼 수 있습니다. 최근 10회 조회 이력은 화면이 열린 동안 메모리에만 보관됩니다. 새로고침/재접속 시 사라지며 외부로 전송하지 않습니다.');
      }
      return root;
    },
    renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
      const root = document.createElement('section');
      root.className = 'student-status';

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
      const modeLabels = { demo: '예제 자료(demo)', disconnected: '연결 없음(disconnected)', connected: '연결 설정 있음(connected)', unknown: '확인 불가(unknown)' };
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

      addText(root, 'h3', '내 PC 상태와 위험 알림');
      if (mode === 'demo') {
        addText(root, 'p', '예제 자료(demo): 아래 상태와 알림은 화면 설명용 값이며 실제 PC에서 측정·조회한 결과가 아닙니다.');
      } else if (mode === 'connected') {
        addText(root, 'p', '연결 설정 있음(connected): 각 항목의 조회 상태를 따로 확인하세요. 응답의 unknown은 실제 상태를 확인하지 못했다는 뜻입니다.');
      } else if (mode === 'disconnected') {
        addText(root, 'p', '연결 없음(disconnected): 실제 계정·기기·세션·기록을 조회하지 못해 실제 위험 여부를 판단할 수 없습니다.');
        addText(root, 'p', '실제 연결은 담당 운영자가 발급한 설정 경로를 -SdpHostConfig 옵션으로 지정한 뒤 다시 실행해야 합니다.');
      } else {
        addText(root, 'p', '연결 출처 확인 불가: 정상이나 안전으로 추정하지 않습니다.');
      }
      addText(root, 'p', '위험 알림은 조회된 기록과 기기·세션 상태, 조회 실패를 모아 보여 줍니다. 이 화면 자체가 새 위협을 탐지하지는 않습니다.');

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
    renderVulnerabilities({ status, mode, data, error } = {}) {
      const root = document.createElement('section');

      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      const isText = (value) =>
        typeof value === 'string' && value.length > 0;

      const hasValue = (value) =>
        isText(value) || (typeof value === 'number' && Number.isFinite(value));

      const SECRET_LIKE =
        /bearer|token|secret|password|passwd|api[_-]?key|authorization/i;

      const safeText = (value) => {
        if (!isText(value)) return '확인 불가';
        if (SECRET_LIKE.test(value)) {
          return '(민감 정보 가능성이 있어 표시하지 않음)';
        }
        return value.length > 200 ? `${value.slice(0, 200)}…` : value;
      };

      const displayValue = (value) =>
        hasValue(value) ? safeText(String(value)) : '확인 불가';

      const safeCode = (value) =>
        isText(value) && /^[A-Za-z0-9_.:-]{1,64}$/.test(value)
          ? value
          : '확인 불가';

      const topStatusLabels = {
        complete: '모두 조회 완료(complete)',
        partial: '일부 조회 실패(partial)',
        not_checked: '아직 조회 안 함(not_checked)',
        not_configured: '조회 준비 미완료(not_configured)',
        unverifiable: 'lock 파일 확인 불가(unverifiable)',
      };

      const packageStatusLabels = {
        known_vulnerabilities: '알려진 취약점 있음(known_vulnerabilities)',
        none_found: '알려진 항목 없음(none_found)',
        unverifiable: '조회 확인 불가(unverifiable)',
      };

      addText(root, 'h3', '설치 패키지 버전과 알려진 취약점 조회');

      const modeLabels = {
        demo: '예제 자료(demo)',
        disconnected: '연결 없음(disconnected)',
        connected: '연결 설정 있음(connected)',
        unknown: '확인 불가(unknown)',
      };
      if (modeLabels[mode]) {
        addText(root, 'p', `연결 모드: ${modeLabels[mode]}`);
      }

      if (status === 'idle') {
        addText(root, 'p', '설치 패키지 조회 전(idle). 아직 취약점 조회 결과가 없습니다.');
        return root;
      }

      if (status === 'loading') {
        addText(root, 'p', '설치 패키지와 취약점 조회 중(loading). 이전 결과를 현재 결과로 표시하지 않습니다.');
        return root;
      }

      if (status === 'error') {
        addText(root, 'p', '설치 패키지 조회 실패(error). 취약점 없음으로 판단할 수 없습니다.');
        if (isText(error?.code)) {
          addText(root, 'p', `오류 코드: ${safeCode(error.code)}`);
        }
        addText(root, 'p', `오류 메시지: ${safeText(error?.message)}`);
        return root;
      }

      if (status !== 'ok' || !data || typeof data !== 'object') {
        addText(root, 'p', '조회 결과 확인 불가: 상태 또는 결과 형식이 계약과 일치하지 않습니다.');
        return root;
      }

      addText(
        root,
        'p',
        topStatusLabels[data.status]
          || `조회 상태 확인 불가(${safeCode(data.status)})`
      );

      const overallMessages = {
        complete: '표시된 패키지에 대해 조회가 완료되었습니다. 조회 결과만으로 패키지나 앱 전체의 안전성을 보장하지는 않습니다.',
        partial: '일부 패키지 조회에 실패했습니다. 이미 확인된 패키지와 취약점 ID는 아래에 유지합니다.',
        not_checked: '조회가 수행되지 않았습니다. 이는 취약점 없음이라는 뜻이 아닙니다.',
        not_configured: '프로젝트의 조회 설정이 필요합니다. 허용 대상과 경로는 담당 운영자가 준비합니다.',
        unverifiable: 'lock 파일을 확인할 수 없어 전체 조회 결과를 검증할 수 없습니다. 취약점 없음으로 판단할 수 없습니다.',
      };
      if (overallMessages[data.status]) {
        addText(root, 'p', overallMessages[data.status]);
      }

      if (hasValue(data.lockfileVersion)) {
        addText(root, 'p', `lockfileVersion: ${displayValue(data.lockfileVersion)}`);
      }
      if (hasValue(data.lockfileHash)) {
        addText(root, 'p', `lockfileHash: ${displayValue(data.lockfileHash)}`);
      }
      if (hasValue(data.checkedAt)) {
        addText(root, 'p', `전체 조회 시각(checkedAt): ${displayValue(data.checkedAt)}`);
      }

      const packages = Array.isArray(data.packages) ? data.packages : [];
      if (packages.length === 0) {
        addText(root, 'p', '표시할 패키지 결과가 없습니다. 이는 취약점 없음이라는 뜻이 아닙니다.');
        return root;
      }

      addText(root, 'h4', '패키지별 조회 결과');

      for (const pkg of packages) {
        const row = document.createElement('article');
        row.setAttribute(
          'data-student-package-name',
          isText(pkg?.name) ? pkg.name : ''
        );
        row.setAttribute(
          'data-student-package-version',
          isText(pkg?.version) ? pkg.version : ''
        );

        addText(
          row,
          'h5',
          `패키지: ${displayValue(pkg?.name)}`
        );
        addText(
          row,
          'p',
          `설치된 정확한 버전(version): ${displayValue(pkg?.version)}`
        );
        addText(
          row,
          'p',
          `패키지 조회 상태: ${packageStatusLabels[pkg?.status] || `확인 불가(${safeCode(pkg?.status)})`}`
        );

        if (hasValue(pkg?.source)) {
          addText(row, 'p', `조회 출처(source): ${displayValue(pkg.source)}`);
        }
        if (hasValue(pkg?.checkedAt)) {
          addText(row, 'p', `패키지 조회 시각(checkedAt): ${displayValue(pkg.checkedAt)}`);
        }

        const vulnerabilities = Array.isArray(pkg?.vulnerabilities)
          ? pkg.vulnerabilities
          : [];

        if (pkg?.status === 'none_found') {
          addText(
            row,
            'p',
            '현재 조회 범위에서 알려진 취약점 항목이 발견되지 않았습니다. 이것만으로 패키지나 앱 전체가 안전하다고 보장할 수는 없습니다.'
          );
        } else if (pkg?.status === 'unverifiable') {
          addText(
            row,
            'p',
            vulnerabilities.length > 0
              ? '일부 확인·전체 조회 확인 불가: 이미 확인된 취약점 항목은 아래에 유지합니다.'
              : '조회 확인 불가입니다. 취약점 없음으로 판단할 수 없습니다.'
          );
        } else if (
          pkg?.status === 'known_vulnerabilities'
          && vulnerabilities.length === 0
        ) {
          addText(row, 'p', '알려진 취약점 있음 상태이지만 표시할 취약점 상세 항목이 없습니다.');
        }

        if (vulnerabilities.length > 0) {
          addText(row, 'h6', '취약점 항목');
          const list = document.createElement('ul');

          for (const vulnerability of vulnerabilities) {
            const item = document.createElement('li');
            addText(item, 'p', `취약점 ID(id): ${displayValue(vulnerability?.id)}`);
            if (hasValue(vulnerability?.modified)) {
              addText(item, 'p', `수정 시각(modified): ${displayValue(vulnerability.modified)}`);
            }
            list.append(item);
          }

          row.append(list);
        } else if (pkg?.status === 'known_vulnerabilities') {
          // 상태가 알려진 취약점을 가리키면 상세가 비어 있어도 none_found로 바꾸지 않는다.
        } else if (pkg?.status !== 'none_found' && pkg?.status !== 'unverifiable') {
          addText(row, 'p', '취약점 상세를 확인할 수 없습니다. 취약점 없음으로 판단하지 않습니다.');
        }

        root.append(row);
      }

      return root;
    },
    renderAiConnection({ status, mode, data, error, checkedAt, explanationAccepted } = {}) {
      const root = document.createElement('section');

      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      const isText = (value) => typeof value === 'string' && value.length > 0;
      const modeLabels = { demo: '예제 자료(demo)', disconnected: '연결 없음(disconnected)', connected: '연결 설정 있음(connected)', unknown: '확인 불가(unknown)' };

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
