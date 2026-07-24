import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

// ────────── 作者归并映射：把同一人的多个 name/email 合并，并给出展示信息 ──────────
const AUTHORS = [
  {
    name: 'Hegui Li',
    aliases: ['Hegui Li', 'LiHegui', 'Hegui L'],
    emails: ['hegui.li.ext@momenta.ai', '1487647822@qq.com'],
    github: 'LiHegui',
  },
  {
    name: 'shenqilong',
    aliases: ['shenqilong'],
    emails: ['15237667331@163.com', '2169963939@qq.com'],
    // 无 GitHub，走 gravatar
  },
  {
    name: 'Qzai',
    aliases: ['Qzai', 'q-zai'],
    emails: ['13692804+q-zai@user.noreply.gitee.com'],
    gitee: 'q-zai',
  },
]

function gravatar(email) {
  const hash = createHash('md5')
    .update((email || '').trim().toLowerCase())
    .digest('hex')
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=160`
}

export default {
  // 内容或提交变化时重新聚合（开发期热更新用）
  watch: ['../../**/*.md'],
  load() {
    let raw = ''
    try {
      // execFileSync 不经过 shell，规避 Windows cmd 对 %an 的变量展开
      raw = execFileSync('git', ['log', '--format=%an\t%ae'], {
        encoding: 'utf-8',
        cwd: process.cwd(),
      })
    } catch (e) {
      return []
    }

    const counts = new Map()
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue
      const [name, email] = line.split('\t')
      const def = AUTHORS.find(
        (a) => a.aliases.includes(name) || a.emails.includes(email),
      )
      const key = def ? def.name : name
      counts.set(key, (counts.get(key) || 0) + 1)
    }

    return AUTHORS.filter((a) => counts.has(a.name))
      .map((a) => ({
        name: a.name,
        count: counts.get(a.name),
        avatar: a.github
          ? `https://github.com/${a.github}.png`
          : gravatar(a.emails[0]),
        link: a.github
          ? `https://github.com/${a.github}`
          : a.gitee
            ? `https://gitee.com/${a.gitee}`
            : undefined,
      }))
      .sort((x, y) => y.count - x.count)
  },
}
