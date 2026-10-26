import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(command, args, cwd = appRoot) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const detail = error.stderr ? String(error.stderr).trim() : '';
    throw new Error(command + ' 실행 실패' + (detail ? ': ' + detail : ''));
  }
}

function quotePowerShell(value) {
  return "'" + String(value).replace(/'/g, "''") + "'";
}

const repoRoot = run('git', ['rev-parse', '--show-toplevel']);
const appRelative = path.relative(repoRoot, appRoot).split(path.sep).join('/');
const git = (args) => run('git', args, repoRoot);
const commit = git(['rev-parse', 'HEAD']);
const branch = git(['branch', '--show-current']) || 'detached';
const dirty = git(['status', '--porcelain', '--untracked-files=all', '--', appRelative]);

if (dirty) {
  throw new Error('패키지는 현재 커밋과 일치해야 합니다. 먼저 on-client의 변경을 커밋하고 다시 실행하세요. 비밀 파일을 커밋하라는 뜻은 아닙니다.');
}

const packageInfo = JSON.parse(readFileSync(path.join(appRoot, 'package.json'), 'utf8'));
const trackedFiles = git(['ls-files', '-z', '--', appRelative]).split('\0').filter(Boolean);
const prefix = appRelative + '/';
const approvedDocs = new Set([
  'docs/STUDENT_RUNBOOK.md',
  'docs/CONNECTION_TROUBLESHOOT.md',
  'docs/SDP_HOST_CONNECTION.md',
]);

function isSafePackageFile(file) {
  if (!file.startsWith(prefix)) return false;
  const relative = file.slice(prefix.length);
  const baseName = path.posix.basename(relative);
  const allowed = relative === 'README.md'
    || relative === 'package.json'
    || ['public/', 'src/', 'student/', 'vendor/'].some((dir) => relative.startsWith(dir))
    || relative === 'tools/start-alekov.ps1'
    || approvedDocs.has(relative);
  if (!allowed) return false;
  if (baseName === '.env' || (baseName.startsWith('.env.') && baseName !== '.env.example')) return false;
  if (/\.(pem|key|p12|pfx|crt|cer|token|jwt|log|sqlite|sqlite3|db)$/i.test(baseName)) return false;
  if (/(^|\/)(secrets?|private|credentials?)(\/|$)/i.test(relative)) return false;
  return true;
}

const files = trackedFiles.filter(isSafePackageFile).sort();
const requiredFiles = [
  'README.md',
  'package.json',
  'public/index.html',
  'public/app.js',
  'public/style.css',
  'src/server.mjs',
  'student/extension.mjs',
  'student/engine-adapter.mjs',
  'tools/start-alekov.ps1',
];
for (const relative of requiredFiles) {
  if (!files.includes(prefix + relative)) {
    throw new Error('필수 파일을 패키지에 포함할 수 없습니다: ' + relative);
  }
}

const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
const outputParent = path.join(localAppData, 'ALEPH', 'Packages');
mkdirSync(outputParent, { recursive: true });

const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.(\d{3})Z$/, '-$1Z');
const shortCommit = commit.slice(0, 7);
const folderName = 'mingming-app-v' + packageInfo.version + '-' + shortCommit + '-' + timestamp;
const packageRoot = path.join(outputParent, folderName);
const zipPath = path.join(outputParent, folderName + '.zip');
if (existsSync(packageRoot) || existsSync(zipPath)) {
  throw new Error('같은 이름의 결과물이 이미 있습니다. 기존 파일은 덮어쓰지 않았습니다. 다시 실행해 새 결과를 만드세요.');
}
mkdirSync(packageRoot, { recursive: true });

for (const file of files) {
  const relative = file.slice(prefix.length);
  const source = path.join(repoRoot, file);
  const target = path.resolve(packageRoot, relative);
  if (!target.startsWith(packageRoot + path.sep)) {
    throw new Error('잘못된 파일 경로를 거절했습니다: ' + relative);
  }
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(source, target);
}

// The runtime package does not ship the packaging script itself.
const distributedPackagePath = path.join(packageRoot, 'package.json');
const distributedPackage = JSON.parse(readFileSync(distributedPackagePath, 'utf8'));
delete distributedPackage.scripts['package-app'];
distributedPackage.scripts.check = 'node --check student/extension.mjs';
writeFileSync(distributedPackagePath, JSON.stringify(distributedPackage, null, 2) + '\n', 'utf8');

const installGuide = [
  '# 밍밍 보안 Agent 설치·실행',
  '',
  '## 준비',
  '',
  '- Windows와 Node.js 22~24가 필요합니다. 수업 기준은 Node.js 24.19.0입니다.',
  '- 외부 npm 의존성은 없으므로 npm install을 실행할 필요가 없습니다.',
  '',
  '## 실행',
  '',
  '이 폴더의 주소 표시줄에 powershell을 입력해 PowerShell을 열고 다음을 실행합니다.',
  '',
  'powershell -NoProfile -ExecutionPolicy Bypass -File .\\tools\\start-alekov.ps1',
  '',
  '브라우저에서 http://127.0.0.1:5189/ 을 엽니다. 종료하려면 PowerShell 창에서 Ctrl+C를 누릅니다.',
  '',
  '## 실제 SDP 연결',
  '',
  '기본 실행은 연결 없음 상태일 수 있습니다. 실제 연결이 필요하면 담당 운영자가 발급한 설정 파일 경로가 있어야 합니다.',
  '',
  'powershell -NoProfile -ExecutionPolicy Bypass -File .\\tools\\start-alekov.ps1 -SdpHostConfig "C:\\실제로_발급받은_경로\\sdp-host.json"',
  '',
  '위 경로는 설명용 자리표시자입니다. 실제로 발급받은 경로로 바꾸세요. 설정 파일 내용, 인증서, 개인키, JWT는 프로젝트 폴더나 압축 파일에 복사하지 않습니다. 설정을 발급받지 못했다면 담당 운영자에게 문의하세요.',
  '',
  '## 데이터 출처',
  '',
  '- demo는 화면 설명용 예제 데이터이며 실제 PC나 보안 시스템의 결과가 아닙니다.',
  '- connected는 연결 설정이 있다는 뜻일 뿐입니다. 실제 데이터는 각 조회 요청이 정상 응답하고 검증된 경우에만 확인된 것으로 취급합니다.',
  '- unknown, 오류, 미조회는 정상이나 안전하다는 의미가 아닙니다.',
  '',
].join('\n');
writeFileSync(path.join(packageRoot, 'INSTALL.md'), installGuide, 'utf8');

function walkFiles(directory, relative = '') {
  const result = [];
  for (const name of readdirSync(directory).sort()) {
    const fullPath = path.join(directory, name);
    const nextRelative = relative ? relative + '/' + name : name;
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      result.push(...walkFiles(fullPath, nextRelative));
    } else if (stat.isFile() && nextRelative !== 'APP_PACKAGE_MANIFEST.json') {
      const bytes = readFileSync(fullPath);
      result.push({
        path: nextRelative,
        sizeBytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      });
    }
  }
  return result;
}

const manifest = {
  schema: 'mingming.app-package.v1',
  application: '밍밍 보안 Agent',
  version: packageInfo.version,
  createdAt: new Date().toISOString(),
  source: {
    repository: 'https://github.com/mingming-01/mingming-On-client',
    branch,
    commit,
    workingTreeClean: true,
  },
  runtime: {
    node: '22-24',
    recommendedNode: '24.19.0',
    externalNpmDependencies: 0,
  },
  start: {
    script: 'tools/start-alekov.ps1',
    defaultUrl: 'http://127.0.0.1:5189/',
    defaultMode: 'disconnected unless a connection is explicitly configured',
  },
  generated: {
    installGuide: 'INSTALL.md',
    manifest: 'APP_PACKAGE_MANIFEST.json',
    manifestSelfHash: 'omitted to avoid a recursive hash',
  },
  exclusions: [
    'Git metadata and untracked files',
    'local environment values and private connection files',
    'certificates, private keys, tokens, databases, and log files',
    'node_modules and previous submissions or package outputs',
  ],
  transformations: [
    'The packaged package.json omits package-app because the packaging tool is not shipped with the runtime app.',
    'No private connection configuration is embedded; actual SDP connectivity requires an operator-issued external config path.',
  ],
  files: walkFiles(packageRoot),
};

writeFileSync(path.join(packageRoot, 'APP_PACKAGE_MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

const zipCommand = '$ErrorActionPreference = "Stop"; Compress-Archive -LiteralPath '
  + quotePowerShell(packageRoot) + ' -DestinationPath ' + quotePowerShell(zipPath)
  + ' -CompressionLevel Optimal';
run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', zipCommand]);

const desktopPath = run('powershell.exe', [
  '-NoProfile',
  '-ExecutionPolicy',
  'Bypass',
  '-Command',
  "[Environment]::GetFolderPath('Desktop')",
]);
if (!desktopPath || !existsSync(desktopPath)) {
  throw new Error('패키지는 생성했지만 바탕화면 경로를 확인하지 못했습니다: ' + packageRoot);
}

const shortcutPath = path.join(desktopPath, folderName + '.lnk');
const powershellPath = path.join(
  process.env.SystemRoot || 'C:\\Windows',
  'System32',
  'WindowsPowerShell',
  'v1.0',
  'powershell.exe',
);
const startScript = path.join(packageRoot, 'tools', 'start-alekov.ps1');
const shortcutArgs = '-NoProfile -ExecutionPolicy Bypass -File "' + startScript + '" -Port 5189';
const shortcutCommand = '$ErrorActionPreference = "Stop"; '
  + '$shell = New-Object -ComObject WScript.Shell; '
  + '$shortcut = $shell.CreateShortcut(' + quotePowerShell(shortcutPath) + '); '
  + '$shortcut.TargetPath = ' + quotePowerShell(powershellPath) + '; '
  + '$shortcut.Arguments = ' + quotePowerShell(shortcutArgs) + '; '
  + '$shortcut.WorkingDirectory = ' + quotePowerShell(packageRoot) + '; '
  + '$shortcut.Description = "밍밍 보안 Agent 실행"; '
  + '$shortcut.Save()';
run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', shortcutCommand]);

console.log('밍밍 보안 Agent 패키지 생성 완료');
console.log('패키지 폴더: ' + packageRoot);
console.log('ZIP: ' + zipPath);
console.log('매니페스트: ' + path.join(packageRoot, 'APP_PACKAGE_MANIFEST.json'));
console.log('바탕화면 바로가기: ' + shortcutPath);
console.log('주의: 개인 SDP 연결 설정과 인증 자료는 패키지에 포함하지 않았습니다.');
