import type {
  ArchiveEntry,
  Conformation,
  ProteinParams,
  SamplingResult,
  SamplingStats,
} from '@/types'

const STORAGE_KEY = 'protein-sampling-archives-v1'

/** 深拷贝：载入与归档都通过拷贝，确保两边取值一致但互不影响。
 *  数据为纯 JSON（参数/构象/分布/时间），JSON 克隆同时可解包 Vue 响应式代理。 */
export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function isParams(v: unknown): v is ProteinParams {
  if (typeof v !== 'object' || v === null) return false
  const p = v as Record<string, unknown>
  return isFiniteNumber(p.residues) && isFiniteNumber(p.conformations)
}

function isConformation(v: unknown): v is Conformation {
  if (typeof v !== 'object' || v === null) return false
  const c = v as Record<string, unknown>
  return (
    isFiniteNumber(c.id) &&
    isFiniteNumber(c.phi) &&
    isFiniteNumber(c.psi) &&
    isFiniteNumber(c.energy) &&
    typeof c.region === 'string' &&
    typeof c.cluster === 'string'
  )
}

function isStats(v: unknown): v is SamplingStats {
  if (typeof v !== 'object' || v === null) return false
  const s = v as Record<string, unknown>
  return (
    isFiniteNumber(s.alpha) &&
    isFiniteNumber(s.beta) &&
    isFiniteNumber(s.left) &&
    isFiniteNumber(s.disallowed)
  )
}

/**
 * 校验一份采样结果是否完整。
 * 不完整时返回原因说明，完整时返回 null。
 */
export function validateResult(result: unknown): string | null {
  if (result === null || result === undefined) return '结果为空，没有可校验的采样数据'
  if (typeof result !== 'object') return '结果数据格式不正确'
  const r = result as Record<string, unknown>

  if (!isParams(r.params)) return '缺少完整的采样参数（残基数 / 构象数量）'
  if (!Array.isArray(r.conformations)) return '缺少构象数据'
  if (r.conformations.length === 0) return '构象数据为空（0 条）'
  if (!r.conformations.every(isConformation)) {
    return `构象数据不完整（共 ${r.conformations.length} 条，部分记录缺少字段）`
  }
  if (!Array.isArray(r.energyRange) || r.energyRange.length !== 2 ||
      !r.energyRange.every(isFiniteNumber)) {
    return '缺少完整的能量范围数据'
  }
  if (!isStats(r.stats)) return '缺少完整的区域分布统计（α/β/左手/禁阻）'
  if (typeof r.completedAt !== 'string' || Number.isNaN(Date.parse(r.completedAt))) {
    return '缺少采样完成时间'
  }
  return null
}

function isArchiveEntry(v: unknown): v is ArchiveEntry {
  if (typeof v !== 'object' || v === null) return false
  const e = v as Record<string, unknown>
  if (typeof e.id !== 'string' || typeof e.batchId !== 'string') return false
  if (typeof e.completedAt !== 'string' || Number.isNaN(Date.parse(e.completedAt))) return false
  if (typeof e.archivedAt !== 'string' || Number.isNaN(Date.parse(e.archivedAt))) return false
  if (typeof e.updatedAt !== 'string' || Number.isNaN(Date.parse(e.updatedAt))) return false
  if (!isFiniteNumber(e.archiveCount)) return false
  return validateResult(e.result) === null
}

/** 生成一批采样的唯一标识 */
export function generateBatchId(): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `batch-${Date.now().toString(36)}-${rand}`
}

/** 格式化为本地可读时间，如 2026-09-20 14:03:07 */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

/** 清单用的短标识 */
export function shortId(id: string): string {
  return id.length > 14 ? id.slice(-10) : id
}

/**
 * 读取本地归档清单。
 * 解析失败或存在不完整条目时给出说明，并丢弃损坏内容（不留半截数据）。
 */
export function loadArchives(): { entries: ArchiveEntry[]; warning: string | null } {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { entries: [], warning: '无法读取本地归档（浏览器存储被禁用），本次归档将无法保存' }
  }
  if (!raw) return { entries: [], warning: null }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { entries: [], warning: '本地归档数据已损坏，无法解析，已忽略损坏内容（清单现为空）' }
  }
  if (!Array.isArray(parsed)) {
    return { entries: [], warning: '本地归档数据格式不正确，已忽略全部内容（清单现为空）' }
  }

  const valid = parsed.filter(isArchiveEntry)
  const dropped = parsed.length - valid.length
  const warning = dropped > 0
    ? `本地清单中有 ${dropped} 条归档内容不完整，已跳过（不会载入半截数据）`
    : null
  return { entries: valid, warning }
}

/** 写入本地归档清单；空间不足等失败时抛出并附说明 */
export function saveArchives(entries: ArchiveEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch (err) {
    const msg = err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ? '本地存储空间不足，归档未能保存'
      : '写入本地存储失败，归档未能保存'
    throw new Error(msg)
  }
}

/** 把一条归档导出为独立 JSON 文件 */
export function downloadEntry(entry: ArchiveEntry): void {
  const payload = {
    format: 'protein-sampling-archive',
    version: 1,
    batchId: entry.batchId,
    completedAt: entry.completedAt,
    archivedAt: entry.archivedAt,
    archiveCount: entry.archiveCount,
    params: entry.result.params,
    stats: entry.result.stats,
    energyRange: entry.result.energyRange,
    conformations: entry.result.conformations,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const stamp = entry.completedAt.slice(0, 19).replace(/[:T]/g, '-')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sampling-${entry.result.params.residues}r-${entry.result.params.conformations}c-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
}
