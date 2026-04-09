const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

// 1. 生成更新日志
const changelogPath = path.resolve(__dirname, 'changelog.md')
try {
  const raw = execSync(
    'git log --pretty=format:"%ad|%s|%H" --date=format:"%Y-%m-%d"',
    { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', LANG: 'en_US.UTF-8' } }
  )
  const lines = raw.trim().split('\n')

  // 按日期分组
  const groups = {}
  for (const line of lines) {
    const idx1 = line.indexOf('|')
    const idx2 = line.lastIndexOf('|')
    const date = line.slice(0, idx1)
    const msg = line.slice(idx1 + 1, idx2)
    const hash = line.slice(idx2 + 1)
    if (!date || !msg) continue
    if (!groups[date]) groups[date] = []
    groups[date].push({ msg, hash })
  }

  const content = [
    '# 更新日志',
    '',
    '> 本页由部署脚本根据 git 提交记录自动生成。',
    '',
  ]

  for (const date of Object.keys(groups).sort().reverse()) {
    content.push(`## ${date}`)
    content.push('')
    for (const { msg, hash } of groups[date]) {
      const shortHash = hash.slice(0, 7)
      content.push(`- ${msg} \`${shortHash}\``)
    }
    content.push('')
  }

  fs.writeFileSync(changelogPath, content.join('\n'), 'utf8')
  console.log('📋 已生成 changelog.md')
} catch (e) {
  console.warn('⚠️  生成 changelog.md 失败：', e.message)
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
process.chdir(distDir)

// 5. 推送到 gh-pages
run('git init')
run('git add -A')
run('git commit -m "deploy"')
run('git branch -M master')
run('git push -f git@github.com:lihegui/upKnowledge.git master:gh-pages')

console.log('\n✅ 部署完成')
