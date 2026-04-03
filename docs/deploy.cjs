const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

// 1. 清理旧缓存
const cacheDir = path.resolve(__dirname, '.vitepress/cache')
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true })
  console.log(`🗑  已清理 ${cacheDir}`)
}

// 2. 构建
run('npm run docs:build')

// 3. 进入产物目录
const distDir = path.resolve(__dirname, '.vitepress/dist')
process.chdir(distDir)

// 4. 推送到 gh-pages
run('git init')
run('git add -A')
run('git commit -m "deploy"')
run('git branch -M master')
run('git push -f git@github.com:lihegui/upKnowledge.git master:gh-pages')

console.log('\n✅ 部署完成')
