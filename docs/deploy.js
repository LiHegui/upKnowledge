const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })

// 1. 清理旧缓存（避免 SEARCH_INDEX 等跨版本缓存问题）
const tempDir = path.resolve(__dirname, '.vuepress/.temp')
const cacheDir = path.resolve(__dirname, '.vuepress/cache')
;[tempDir, cacheDir].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
    console.log(`🗑  已清理 ${dir}`)
  }
})

// 2. 构建
run('npm run docs:build')

// 3. 进入产物目录
const distDir = path.resolve(__dirname, '.vuepress/dist')
process.chdir(distDir)

// 4. 推送到 gh-pages
run('git init')
run('git add -A')
run('git commit -m "deploy"')
run('git branch -M master')
run('git push -f git@github.com:lihegui/upKnowledge.git master:gh-pages')

console.log('\n✅ 部署完成')
