import { isCompleteResult, isCompleteEntry, generateBatchId, exportEntry, formatTime } from '../src/utils/result'
import { useArchiveStore } from '../src/store/archive'
import { createPinia, setActivePinia } from 'pinia'
import { toRaw } from 'vue'
import type { SamplingResult } from '../src/types'

setActivePinia(createPinia())

let pass = 0, fail = 0
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log('  ✓', name) }
  else { fail++; console.log('  ✗ FAIL:', name) }
}

// --- 内存版 localStorage mock ---
const mem = new Map<string, string>()
;(globalThis as any).localStorage = {
  getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
  setItem: (k: string, v: string) => { mem.set(k, v) },
  removeItem: (k: string) => { mem.delete(k) }
}
;(globalThis as any).Blob = class { constructor(public parts: any[], public opts: any) {} }
const downloads: string[] = []
;(globalThis as any).document = {
  createElement: () => ({ click: () => downloads.push('clicked'), set href(_: string) {}, set download(_: string) {} }),
  body: { appendChild() {}, removeChild() {} }
}
;(globalThis as any).URL = { createObjectURL: () => 'blob:x', revokeObjectURL: () => {} }

function makeResult(overrides: Partial<SamplingResult> = {}): SamplingResult {
  const conformations = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1, phi: -60, psi: -45, energy: 0.5, region: 'alpha-helix', cluster: 'low-energy'
  }))
  return {
    batchId: generateBatchId(),
    completedAt: '2026-09-20T10:00:00.000Z',
    params: { residues: 10, conformations: 10 },
    conformations,
    energyRange: [0.1, 1.2],
    stats: { alpha: 10, beta: 0, left: 0, disallowed: 0 },
    ...overrides
  }
}

console.log('\n[1] 完整性校验')
check('完整结果通过', isCompleteResult(makeResult()))
check('null 不通过', !isCompleteResult(null))
check('缺 batchId 不通过', !isCompleteResult({ ...makeResult(), batchId: '' }))
check('completedAt 非法不通过', !isCompleteResult({ ...makeResult(), completedAt: 'not-a-date' }))
check('缺 params 不通过', !isCompleteResult({ ...makeResult(), params: undefined }))
check('energyRange 长度不对不通过', !isCompleteResult({ ...makeResult(), energyRange: [1] as any }))
check('构象为空不通过', !isCompleteResult({ ...makeResult(), conformations: [] }))
check('构象字段缺失不通过',
  !isCompleteResult({ ...makeResult(), conformations: [{ id: 1, phi: 1 }] }))
check('分布合计与构象数不符不通过',
  !isCompleteResult({ ...makeResult(), stats: { alpha: 9, beta: 0, left: 0, disallowed: 0 } }))

console.log('\n[2] 归档：空结果')
mem.clear()
const s1 = useArchiveStore(); s1.init()
const emptyOutcome = s1.archiveCurrent(null)
check('无结果返回 empty', emptyOutcome.status === 'empty')
check('清单为空', s1.sortedEntries.length === 0)
check('本地未写入', mem.get('protein-sampling-archives') === undefined)

console.log('\n[3] 归档：新增')
const r = makeResult()
const o1 = s1.archiveCurrent(r)
check('首次归档 archived', o1.status === 'archived')
check('savedToLocal=true', o1.savedToLocal === true)
check('清单有 1 条', s1.sortedEntries.length === 1)
check('归档结果与结果区共用同一引用（底层对象）', toRaw(s1.sortedEntries[0].result) === r)

console.log('\n[4] 同一批重复归档 → 合并为一条')
const o2 = s1.archiveCurrent(r)
check('第二次返回 merged', o2.status === 'merged')
check('mergedIntoExisting 标记', o2.mergedIntoExisting === true)
check('仍是 1 条（未重复记录）', s1.sortedEntries.length === 1)

console.log('\n[5] 不同批次 → 两条，按归档时间倒序')
const r2 = makeResult({ completedAt: '2026-09-19T08:00:00.000Z' })
s1.archiveCurrent(r2)
check('清单有 2 条', s1.sortedEntries.length === 2)

console.log('\n[6] 载入：完整 vs 不完整')
const loaded = s1.loadEntry(s1.sortedEntries[0])
check('完整条目可载入，返回同一引用', loaded === s1.sortedEntries[0].result)
const badEntry = { batchId: 'x', archivedAt: '2026-09-20T00:00:00.000Z', result: { ...makeResult(), conformations: [] } }
check('不完整条目返回 null（不留半截数据）', s1.loadEntry(badEntry as any) === null)
check('isCompleteEntry 对坏数据 false', !isCompleteEntry(badEntry))

console.log('\n[7] 重新初始化：不完整/损坏的本地数据被忽略并说明')
// 构造：2 条好（不同批次）+ 1 条坏 + 1 条对第一条的重复
const goodA = s1.sortedEntries.find(e => e.batchId === r.batchId)!
const goodB = s1.sortedEntries.find(e => e.batchId === r2.batchId)!
const dup = { ...goodA }
const stored = [goodA, goodB, badEntry, dup]
mem.set('protein-sampling-archives', JSON.stringify(stored))
const s2 = useArchiveStore(); s2.init()
check('坏条目被忽略、重复合并后剩 2 个不同批次', s2.entries.length === 2)
check('给出不完整说明', s2.initWarning.includes('不完整'))

// 损坏的 JSON
mem.set('protein-sampling-archives', '{not json')
const s3 = useArchiveStore(); s3.init()
check('损坏 JSON → 空清单', s3.entries.length === 0)
check('损坏说明', s3.initWarning.includes('损坏'))

// 非数组
mem.set('protein-sampling-archives', '{"a":1}')
const s4 = useArchiveStore(); s4.init()
check('格式不对 → 空清单 + 说明', s4.entries.length === 0 && s4.initWarning.includes('格式'))

// 空存储
mem.clear()
const s5 = useArchiveStore(); s5.init()
check('空存储 → 空清单且无警告', s5.entries.length === 0 && s5.initWarning === '')

console.log('\n[8] 持久化：刷新后数据还在')
s5.archiveCurrent(r)
const s6 = useArchiveStore(); s6.init()
check('重新 init 后条目恢复', s6.entries.length === 1)
check('恢复的数据完整（参数/分布/构象）', isCompleteEntry(s6.entries[0]))
check('完成时间可格式化', formatTime(s6.entries[0].result.completedAt).length === 19)

console.log('\n[9] 导出单批文件')
downloads.length = 0
exportEntry(toRaw(goodA))
check('触发一次文件下载', downloads.length === 1)

console.log(`\n结果: ${pass} 通过, ${fail} 失败`)
if (fail) process.exit(1)
