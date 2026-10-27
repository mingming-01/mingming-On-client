import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  readdirSync,
  rmSync,
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

function parseOptions(args) {
  const options = { source: null, out: null, iconPath: null, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const name = args[index];
    if (name === '--help' || name === '-h') {
      options.help = true;
      continue;
    }
    if (!['--source', '--out', '--iconPath'].includes(name)) {
      throw new Error('알 수 없는 옵션입니다: ' + name + ' (사용법은 --help)');
    }
    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(name + ' 뒤에 경로를 지정해야 합니다.');
    }
    options[name === '--source' ? 'source' : name === '--out' ? 'out' : 'iconPath'] = value;
    index += 1;
  }
  return options;
}

function samePath(left, right) {
  const first = path.resolve(left);
  const second = path.resolve(right);
  return process.platform === 'win32'
    ? first.toLowerCase() === second.toLowerCase()
    : first === second;
}

function isInside(parent, target) {
  const relative = path.relative(parent, target);
  return relative === ''
    || (relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative));
}

function validatePng256(filePath) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw new Error('아이콘 파일이 없습니다: ' + filePath);
  }
  const data = readFileSync(filePath);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (data.length < 24 || !data.subarray(0, 8).equals(signature)
      || data.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('아이콘은 PNG 형식이어야 합니다: ' + filePath);
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width !== 256 || height !== 256) {
    throw new Error('아이콘은 256x256 PNG여야 합니다. 현재 크기: ' + width + 'x' + height);
  }
}

const pngCrcTable = new Uint32Array(256);
for (let index = 0; index < pngCrcTable.length; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }
  pngCrcTable[index] = value >>> 0;
}

function pngCrc32(data) {
  let value = 0xffffffff;
  for (const byte of data) {
    value = pngCrcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(pngCrc32(Buffer.concat([typeBytes, data])), 0);
  return Buffer.concat([length, typeBytes, data, crc]);
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let current = 0, previous = points.length - 1; current < points.length; previous = current, current += 1) {
    const x1 = points[current][0];
    const y1 = points[current][1];
    const x2 = points[previous][0];
    const y2 = points[previous][1];
    if ((y1 > y) !== (y2 > y) && x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) {
      inside = !inside;
    }
  }
  return inside;
}

function generateDefaultIcon(outputPath) {
  const width = 256;
  const height = 256;
  const rowSize = width * 4 + 1;
  const pixels = Buffer.alloc(rowSize * height);
  const shield = [[128, 42], [190, 67], [186, 125], [168, 160], [128, 197], [88, 160], [70, 125], [66, 67]];
  const check = [[91, 122], [103, 110], [124, 131], [153, 101], [166, 114], [124, 156]];
  for (let y = 0; y < height; y += 1) {
    const row = y * rowSize;
    pixels[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const nearestX = Math.max(52, Math.min(204, px));
      const nearestY = Math.max(52, Math.min(204, py));
      const inRoundedSquare = px >= 8 && px <= 248 && py >= 8 && py <= 248
        && ((px - nearestX) ** 2 + (py - nearestY) ** 2 <= 44 ** 2);
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      if (inRoundedSquare) {
        red = 16;
        green = 31;
        blue = 54;
        alpha = 255;
      }
      if (pointInPolygon(px, py, shield)) {
        red = 39;
        green = 190;
        blue = 204;
        alpha = 255;
      }
      if (pointInPolygon(px, py, check)) {
        red = 245;
        green = 252;
        blue = 255;
        alpha = 255;
      }
      const offset = row + 1 + x * 4;
      pixels[offset] = red;
      pixels[offset + 1] = green;
      pixels[offset + 2] = blue;
      pixels[offset + 3] = alpha;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const image = Buffer.concat([
    signature,
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(pixels)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(outputPath, image);
}

function convertWebpToPng(sourcePath, outputPath) {
  const powershellScript = '$ErrorActionPreference = "Stop"; '
    + 'Add-Type -AssemblyName System.Drawing; '
    + '$source = [System.Drawing.Image]::FromFile(' + quotePowerShell(sourcePath) + '); '
    + '$bitmap = $null; $graphics = $null; '
    + 'try { '
    + '$bitmap = [System.Drawing.Bitmap]::new(256, 256); '
    + '$graphics = [System.Drawing.Graphics]::FromImage($bitmap); '
    + '$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic; '
    + '$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality; '
    + '$graphics.DrawImage($source, 0, 0, 256, 256); '
    + '$bitmap.Save(' + quotePowerShell(outputPath) + ', [System.Drawing.Imaging.ImageFormat]::Png); '
    + '} finally { '
    + 'if ($null -ne $graphics) { $graphics.Dispose() }; '
    + 'if ($null -ne $bitmap) { $bitmap.Dispose() }; '
    + '$source.Dispose(); }';
  try {
    run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', powershellScript]);
    validatePng256(outputPath);
    return 'converted-from-repository-webp';
  } catch (powerShellError) {
    try {
      if (existsSync(outputPath)) unlinkSync(outputPath);
      run('magick', [sourcePath, '-resize', '256x256!', 'PNG32:' + outputPath]);
      validatePng256(outputPath);
      return 'converted-from-repository-webp';
    } catch (imageMagickError) {
      generateDefaultIcon(outputPath);
      validatePng256(outputPath);
      return 'generated-default-shield';
    }
  }
}

const options = parseOptions(process.argv.slice(2));
if (options.help) {
  console.log('사용법: npm run package-app -- [--source .] [--out <새 출력 폴더>] [--iconPath <256x256 PNG>]');
  console.log('--out 생략 시 %LOCALAPPDATA%/ALEPH/Packages 아래에 새 버전 폴더를 만듭니다.');
  console.log('--iconPath 생략 시 기존 WEBP 변환을 시도하고, 변환할 수 없으면 기본 방패 PNG를 생성합니다.');
  process.exit(0);
}

const sourceRoot = options.source ? path.resolve(process.cwd(), options.source) : appRoot;
if (!samePath(sourceRoot, appRoot)) {
  throw new Error('--source는 이 도구가 포함된 on-client 폴더여야 합니다: ' + appRoot);
}
const repoRoot = run('git', ['rev-parse', '--show-toplevel'], sourceRoot);
const appRelative = path.relative(repoRoot, sourceRoot).split(path.sep).join('/');
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
  'docs/LOCAL_SYSTEM_STATUS.md',
  'docs/NETWORK_STATUS.md',
  'docs/QUICK_START.md',
  'docs/DAY7_DEMO_AND_EVIDENCE.md',
]);

function isSafePackageFile(file) {
  if (!file.startsWith(prefix)) return false;
  const relative = file.slice(prefix.length);
  const baseName = path.posix.basename(relative);
  const allowed = relative === 'README.md'
    || relative === 'package.json'
    || ['public/', 'src/', 'student/', 'vendor/'].some((dir) => relative.startsWith(dir))
    || relative === 'tools/start-alekov.ps1'
    || relative === 'tools/launch-mingming.ps1'
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
  'tools/launch-mingming.ps1',
  'docs/QUICK_START.md',
  'docs/DAY7_DEMO_AND_EVIDENCE.md',
];
for (const relative of requiredFiles) {
  if (!files.includes(prefix + relative)) {
    throw new Error('필수 파일을 패키지에 포함할 수 없습니다: ' + relative);
  }
}

const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.(\d{3})Z$/, '-$1Z');
const shortCommit = commit.slice(0, 7);
const defaultFolderName = 'mingming-app-v' + packageInfo.version + '-' + shortCommit + '-' + timestamp;
const defaultOutputParent = path.join(localAppData, 'ALEPH', 'Packages');
const packageRoot = options.out
  ? path.resolve(process.cwd(), options.out)
  : path.join(defaultOutputParent, defaultFolderName);
const outputParent = path.dirname(packageRoot);
const folderName = path.basename(packageRoot);
const zipPath = path.join(outputParent, folderName + '.zip');

if (!folderName || folderName === path.parse(packageRoot).root) {
  throw new Error('--out에는 루트 폴더가 아닌 새 패키지 폴더 경로를 지정하세요.');
}
if (isInside(repoRoot, packageRoot)) {
  throw new Error('출력 폴더는 Git 저장소 밖에 있어야 합니다. 저장소 안의 원본 파일이나 제출물을 덮어쓰지 않습니다.');
}
if (existsSync(packageRoot) || existsSync(zipPath)) {
  throw new Error('출력 폴더 또는 ZIP이 이미 있습니다. 기존 결과를 덮어쓰지 않았습니다: ' + packageRoot);
}

const desktopPath = run('powershell.exe', [
  '-NoProfile',
  '-ExecutionPolicy',
  'Bypass',
  '-Command',
  "[Environment]::GetFolderPath('Desktop')",
]);
if (!desktopPath || !existsSync(desktopPath)) {
  throw new Error('바탕화면 경로를 확인하지 못해 시연 바로가기를 만들 수 없습니다.');
}
const shortcutName = '밍밍-시연모드-v' + packageInfo.version + '-' + shortCommit + '-' + timestamp + '.lnk';
const shortcutPath = path.join(desktopPath, shortcutName);
if (existsSync(shortcutPath)) {
  throw new Error('같은 이름의 시연 바로가기가 이미 있습니다. 기존 바로가기는 덮어쓰지 않았습니다: ' + shortcutPath);
}

const iconRelative = 'public/assets/alekov/alekov-app-icon.png';
let iconSourcePath;
let iconSourceKind;
let temporaryIconPath = null;
if (options.iconPath) {
  iconSourcePath = path.resolve(process.cwd(), options.iconPath);
  validatePng256(iconSourcePath);
  iconSourceKind = 'operator-provided-256x256-png';
} else {
  const sourceWebp = path.join(sourceRoot, 'public', 'assets', 'alekov', 'alekov-app-icon.webp');
  temporaryIconPath = path.join(os.tmpdir(), 'mingming-app-icon-' + process.pid + '-' + Date.now() + '.png');
  iconSourceKind = convertWebpToPng(sourceWebp, temporaryIconPath);
  iconSourcePath = temporaryIconPath;
}

mkdirSync(outputParent, { recursive: true });
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

const packagedIconPath = path.join(packageRoot, iconRelative);
mkdirSync(path.dirname(packagedIconPath), { recursive: true });
copyFileSync(iconSourcePath, packagedIconPath);
if (temporaryIconPath && existsSync(temporaryIconPath)) unlinkSync(temporaryIconPath);

// The runtime package does not ship the packaging script itself.
const distributedPackagePath = path.join(packageRoot, 'package.json');
const distributedPackage = JSON.parse(readFileSync(distributedPackagePath, 'utf8'));
delete distributedPackage.scripts['package-app'];
distributedPackage.scripts.check = 'node --check src/server.mjs && node --check public/app.js && node --check student/extension.mjs';
writeFileSync(distributedPackagePath, JSON.stringify(distributedPackage, null, 2) + '\n', 'utf8');

const installGuide = [
  '# 밍밍 보안 Agent 패키지 설치 안내',
  '',
  '## 패키지 확인',
  '',
  '- 이 패키지는 Windows용 앱 파일과 실행 안내를 담고 있습니다. Node.js 22~24가 필요하며 수업 기준은 24.19.0입니다.',
  '- 외부 npm 의존성은 없으므로 npm install을 실행할 필요가 없습니다.',
  '- 아이콘은 public/assets/alekov/alekov-app-icon.png에 256x256 PNG로 포함됩니다.',
  '- APP_PACKAGE_MANIFEST.json에는 소스 커밋, 파일 SHA-256, 제외 대상 및 실행 준비 상태가 기록됩니다.',
  '',
  '## 운영 실행 전 필수 확인',
  '',
  '이 패키지 도구는 바탕화면에 ' + shortcutName + ' 시연 전용 바로가기를 생성합니다. 이 바로가기는 -Demo 예제 모드만 실행하며 승인된 운영 바로가기가 아닙니다.',
  '이 저장소에서는 승인된 운영 호스트 런타임의 설치 명령, 등록된 호스트 바로가기 규격 또는 운영 앱 승인 키 검증 규격이 확인되지 않았습니다. 운영 실행은 운영자 준비가 필요합니다.',
  '',
  '- 런타임 상태가 PROVIDED_RUNTIME_NOT_INSTALLED이면 실행을 중단하고 운영자 준비가 필요합니다.',
  '- 운영 앱 승인 키가 없거나 검증되지 않은 경우에도 실행을 중단하고 운영자 준비가 필요합니다.',
  '- 담당 운영자로부터 승인된 런타임, 바로가기 또는 설치 도구의 정확한 위치와 실행 명령을 받아야 합니다.',
  '- 승인 절차를 우회하거나 --app-only-v1 옵션으로 대체하지 마세요.',
  '- SDP 설정, 인증서, 개인키, 토큰 또는 운영 앱 승인 키의 값은 이 패키지, Git 저장소, 채팅 또는 제출물에 넣지 않습니다.',
  '',
  '## 설치 및 실행 명령',
  '',
  '현재 저장소에서 확인된 승인 호스트 설치·실행 명령은 없습니다. 위 운영자 준비가 끝나기 전에는 임의의 PowerShell 바로가기로 운영 앱을 실행하지 마세요. 운영자가 전달한 승인 명령과 설치 안내를 받은 뒤 이 절의 내용을 보완해야 합니다.',
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
  icon: {
    path: iconRelative,
    format: 'PNG',
    width: 256,
    height: 256,
    source: iconSourceKind,
  },
  start: {
    script: 'tools/launch-mingming.ps1',
    defaultUrl: 'http://127.0.0.1:5189/',
    defaultMode: 'desktop shortcut uses demo data; a normal launch is disconnected unless explicitly configured',
    demoShortcut: {
      created: true,
      name: shortcutName,
      mode: 'demo',
      externalToPackageFolder: true,
    },
    approvedHostShortcut: 'not-created',
  },
  hostExecution: {
    status: 'operator-preparation-required',
    approvedRuntime: 'not verified by this repository packaging tool',
    productionAppApprovalKey: 'not included or verified',
    blockingConditions: [
      'PROVIDED_RUNTIME_NOT_INSTALLED',
      'production app approval key missing or unverified',
    ],
    note: 'Do not bypass host approval or substitute --app-only-v1.',
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

const manifestPath = path.join(packageRoot, 'APP_PACKAGE_MANIFEST.json');
const installPath = path.join(packageRoot, 'INSTALL.md');
const checkedManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const checkedInstall = readFileSync(installPath, 'utf8');
const mustExist = [
  'package.json',
  'public/index.html',
  'public/assets/alekov/alekov-app-icon.png',
  'tools/launch-mingming.ps1',
  'INSTALL.md',
  'APP_PACKAGE_MANIFEST.json',
];
for (const relative of mustExist) {
  if (!existsSync(path.join(packageRoot, relative))) {
    throw new Error('패키지 검증 실패: 필수 결과물이 없습니다: ' + relative);
  }
}
validatePng256(path.join(packageRoot, iconRelative));
if (checkedManifest.source.commit !== commit || checkedManifest.source.workingTreeClean !== true) {
  throw new Error('패키지 검증 실패: 소스 커밋 정보가 일치하지 않습니다.');
}
if (checkedManifest.hostExecution.status !== 'operator-preparation-required'
    || checkedManifest.hostExecution.blockingConditions.indexOf('PROVIDED_RUNTIME_NOT_INSTALLED') < 0) {
  throw new Error('패키지 검증 실패: 운영 실행 준비 상태가 명시되지 않았습니다.');
}
if (!checkedInstall.includes('PROVIDED_RUNTIME_NOT_INSTALLED')
    || !checkedInstall.includes('--app-only-v1')
    || !checkedInstall.includes('운영자 준비가 필요')
    || !checkedInstall.includes('-Demo 예제 모드')) {
  throw new Error('패키지 검증 실패: INSTALL.md의 시연/운영 준비 안내가 누락되었습니다.');
}

const zipCommand = '$ErrorActionPreference = "Stop"; Compress-Archive -LiteralPath '
  + quotePowerShell(packageRoot) + ' -DestinationPath ' + quotePowerShell(zipPath)
  + ' -CompressionLevel Optimal';
run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', zipCommand]);
if (!existsSync(zipPath) || statSync(zipPath).size === 0) {
  throw new Error('ZIP 생성 결과를 검증하지 못했습니다: ' + zipPath);
}

const powershellPath = path.join(
  process.env.SystemRoot || 'C:\\Windows',
  'System32',
  'WindowsPowerShell',
  'v1.0',
  'powershell.exe',
);
const startScript = path.join(packageRoot, 'tools', 'launch-mingming.ps1');
const shortcutArgs = '-NoProfile -ExecutionPolicy Bypass -File "' + startScript + '" -Demo -Port 5189';
const shortcutCommand = '$ErrorActionPreference = "Stop"; '
  + '$shell = New-Object -ComObject WScript.Shell; '
  + '$shortcut = $shell.CreateShortcut(' + quotePowerShell(shortcutPath) + '); '
  + '$shortcut.TargetPath = ' + quotePowerShell(powershellPath) + '; '
  + '$shortcut.Arguments = ' + quotePowerShell(shortcutArgs) + '; '
  + '$shortcut.WorkingDirectory = ' + quotePowerShell(packageRoot) + '; '
  + '$shortcut.Description = "밍밍 시연 모드 — 설명용 예제 데이터"; '
  + '$shortcut.Save()';
try {
  run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', shortcutCommand]);
  if (!existsSync(shortcutPath)) throw new Error('바탕화면 시연 바로가기를 확인할 수 없습니다.');
} catch (error) {
  // 이 호출에서 생성한 결과만 정리합니다. 기존 폴더·ZIP·바로가기는 생성 전 검사에서 제외했습니다.
  try { rmSync(packageRoot, { recursive: true, force: true }); } catch {}
  try { if (existsSync(zipPath)) unlinkSync(zipPath); } catch {}
  try { if (existsSync(shortcutPath)) unlinkSync(shortcutPath); } catch {}
  throw new Error('시연 바로가기를 만들지 못해 이번 실행에서 만든 패키지 결과만 정리했습니다: ' + error.message);
}

console.log('밍밍 보안 Agent 패키지 생성 및 기본 검증 완료');
console.log('패키지 폴더: ' + packageRoot);
console.log('ZIP: ' + zipPath);
console.log('매니페스트: ' + manifestPath);
console.log('아이콘: ' + path.join(packageRoot, iconRelative));
console.log('바탕화면 시연 바로가기: ' + shortcutPath);
console.log('주의: 바로가기는 -Demo 예제 모드 전용입니다. 운영 실행 승인은 미확인 — 운영자 준비가 필요합니다.');
console.log('주의: 개인 SDP 연결 설정, 인증 자료 및 운영 앱 승인 키는 패키지에 포함하지 않았습니다.');
