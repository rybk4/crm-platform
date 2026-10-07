import { readFileSync, readdirSync, statSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const sourceRoot = resolve(root, 'src')
const violations = []

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = resolve(directory, entry)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

function report(file, rule) {
  violations.push(`${relative(root, file)}: ${rule}`)
}

function moduleName(file) {
  const path = relative(sourceRoot, file).split(sep)
  return path[0] === 'modules' ? path[1] : null
}

for (const file of walk(sourceRoot)) {
  const projectPath = relative(root, file).split(sep).join('/')
  const isCode = /\.[cm]?[jt]sx?$/.test(file)
  const isTest = /\.test\.[jt]sx?$/.test(file)
  if (!isCode) continue

  const source = readFileSync(file, 'utf8')
  const lines = source.split('\n').length
  const hardLimit = file.endsWith('.tsx') ? 200 : 300

  if (lines > hardLimit) report(file, `файл длиннее жёсткого лимита ${hardLimit} строк (${lines})`)
  if (isTest && !projectPath.includes('/__tests__/')) {
    report(file, 'тест должен находиться в __tests__ своего модуля или слоя')
  }
  if (/\bexport\s+default\b/.test(source)) report(file, 'default export запрещён')
  if (/\b(?:as\s+any|:\s*any\b|<any>)/.test(source)) report(file, 'тип any запрещён')
  if (/\bconsole\.log\s*\(/.test(source)) report(file, 'console.log запрещён')
  if (/\bwindow\.confirm\s*\(/.test(source)) report(file, 'window.confirm запрещён')
  if (!projectPath.includes('/__tests__/') && /from\s+['"][^'"]*__tests__\//.test(source)) {
    report(file, 'production-код не импортирует тесты и тестовые фабрики')
  }

  if (file.endsWith('.tsx') && !projectPath.includes('/__tests__/')) {
    const declaresInterface = /^\s*(?:export\s+)?interface\s+[A-Za-z_$][\w$]*/m.test(source)
    const declaresType = /^\s*(?:export\s+)?type\s+[A-Za-z_$][\w$]*(?:\s*<[^;]+>)?\s*=/m.test(
      source,
    )
    if (declaresInterface || declaresType) {
      report(file, 'типы и интерфейсы должны находиться в отдельном *.types.ts')
    }
  }

  if (/from\s+['"]@mui\//.test(source) && !projectPath.startsWith('src/ui/')) {
    report(file, 'MUI разрешён только внутри src/ui')
  }
  if (/from\s+['"]axios['"]/.test(source) && !projectPath.startsWith('src/lib/api/')) {
    report(file, 'axios разрешён только внутри src/lib/api')
  }
  if (/from\s+['"]react-toastify['"]/.test(source)) {
    const allowed = ['src/lib/toast/notifications.ts', 'src/ui/ToastProvider.tsx']
    if (!allowed.includes(projectPath))
      report(file, 'react-toastify используется только через toast-слой')
  }
  if (projectPath.startsWith('src/lib/') && /from\s+['"]@\/(?:modules|ui)\//.test(source)) {
    report(file, 'lib не зависит от modules или ui')
  }
  if (projectPath.startsWith('src/ui/') && /from\s+['"]@\/modules\//.test(source)) {
    report(file, 'ui не зависит от бизнес-модулей')
  }
  if (/\b(?:window\.)?localStorage\.(?:getItem|setItem|removeItem)\s*\(/.test(source)) {
    const allowed =
      projectPath === 'src/lib/browser/storage.ts' || projectPath.includes('/__tests__/')
    if (!allowed) report(file, 'localStorage используется только через lib/browser/storage')
  }

  const owner = moduleName(file)
  if (owner && owner !== 'shell') {
    for (const match of source.matchAll(/from\s+['"]@\/modules\/([^/]+)\/components\//g)) {
      if (match[1] !== owner)
        report(file, `нельзя импортировать components чужого модуля ${match[1]}`)
    }
  }
  if (projectPath.includes('/components/')) {
    if (/from\s+['"](?:@\/modules\/[^/]+|\.\.?)\/api\//.test(source)) {
      report(file, 'компонент не импортирует API модуля напрямую')
    }
    if (/\buse(?:Query|Mutation|InfiniteQuery)\s*\(/.test(source)) {
      report(file, 'TanStack Query вызывается только внутри hooks')
    }
  }
}

if (violations.length) {
  console.error(
    `Architecture check failed (${violations.length}):\n${violations.map((item) => `- ${item}`).join('\n')}`,
  )
  process.exit(1)
}

console.log('Architecture check passed')
