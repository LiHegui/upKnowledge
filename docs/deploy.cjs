const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

// 作者 → GitHub 用户名映射（命中则加载 GitHub 头像，否则用邮箱生成 Gravatar 兜底）
// 后续新增贡献者，在这里补一行即可
const AUTHOR_GITHUB = {
  'Hegui Li': 'LiHegui',
  'Hegui L': 'LiHegui',
  'LiHegui': 'LiHegui',
}

// 根据作者名 / 邮箱生成头像 URL
const avatarUrl = (author, email) => {
  const user = AUTHOR_GITHUB[author]
  if (user) return `https://github.com/${user}.png?size=48`
  // 未映射的作者用 Gravatar identicon 兜底（基于邮箱 md5，永远有图）
  const hash = crypto.createHash('md5').update((email || '').trim().toLowerCase()).digest('hex')
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=48`
}

// 1. 生成更新日志
const changelogPath = path.resolve(__dirname, 'changelog.md')
try {
  // 用不可见字符 \x1f 作为字段分隔符，避免 commit message 中的 | 干扰切分
  const raw = execSync(
    'git log --pretty=format:"%ad%x1f%an%x1f%ae%x1f%s%x1f%H" --date=format:"%Y-%m-%d"',
    { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', LANG: 'en_US.UTF-8' } }
  )
  const lines = raw.trim().split('\n')

  // 提交类型 → emoji 映射，让 changelog 更直观
  const typeEmoji = {
    feat: '✨',
    fix: '🐛',
    docs: '📝',
    refactor: '♻️',
    perf: '⚡',
    style: '💄',
    test: '✅',
    chore: '🔧',
    build: '📦',
    ci: '👷',
    revert: '⏪',
    delete: '🗑️',
  }

  // 按日期分组
  const groups = {}
  for (const line of lines) {
    const [date, author, email, msg, hash] = line.split('\x1f')
    if (!date || !msg) continue
    // 过滤 merge / deploy 等噪音提交
    if (/^Merge branch|^Merge pull request|^deploy$/i.test(msg)) continue
    if (!groups[date]) groups[date] = []
    groups[date].push({ author, email, msg, hash })
  }

  const content = [
    '# 更新日志',
    '',
    '> 本页由部署脚本根据 git 提交记录自动生成。',
    '',
  ]

  for (const date of Object.keys(groups).sort().reverse()) {
    const commits = groups[date]
    content.push(`## ${date}`)
    content.push('')
    for (const { author, email, msg, hash } of commits) {
      const shortHash = hash.slice(0, 7)
      // 提取 conventional commit 类型前缀（如 feat: xxx）
      const m = msg.match(/^(\w+)(\(.+?\))?:\s*(.+)$/)
      const type = m ? m[1].toLowerCase() : ''
      const emoji = typeEmoji[type] || '📌'
      const desc = m ? m[3] : msg
      // 作者信息块：头像 + 名字 + hash，整体不允许内部换行，避免东一截西一截
      const avatar = `<img src="${avatarUrl(author, email)}" width="16" height="16" style="border-radius:50%;vertical-align:text-bottom" onerror="this.style.display='none'" />`
      const meta = `<span style="white-space:nowrap;opacity:.6;font-size:.85em">${avatar} ${author || '-'} \`${shortHash}\`</span>`
      content.push(`- ${emoji} ${desc} ${meta}`)
    }
    content.push('')
  }

  fs.writeFileSync(changelogPath, content.join('\n'), 'utf8')
  console.log('📋 已生成 changelog.md')
} catch (e) {
  console.warn('⚠️  生成 changelog.md 失败：', e.message)
}

// 仅生成 changelog（node deploy.cjs --changelog-only），跳过构建与部署
if (process.argv.includes('--changelog-only')) {
  console.log('✅ 仅生成 changelog，已跳过构建与部署')
  process.exit(0)
}

// 2. 清理旧缓存
const cacheDir = path.resolve(__dirname, '.vitepress/cache')
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true })
  console.log(`🗑  已清理 ${cacheDir}`)
}

// 3. 构建
run('npm run docs:build')

// 4. 进入产物目录
const distDir = path.resolve(__dirname, '.vitepress/dist')
const rootDir = path.resolve(__dirname, '..')

const runIn = (cmd, cwd) => execSync(cmd, { stdio: 'inherit', cwd })

// 5. 推送到 gh-pages
runIn('git init', distDir)
runIn('git add -A', distDir)
runIn('git commit -m "deploy"', distDir)
runIn('git branch -M master', distDir)
runIn('git push -f git@github.com:lihegui/upKnowledge.git master:gh-pages', distDir)

// 恢复工作目录，避免 Windows CMD 报"系统找不到指定的路径"
process.chdir(rootDir)

console.log('\n✅ 部署完成')
