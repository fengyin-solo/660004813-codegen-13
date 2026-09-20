import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ArchiveEntry, SamplingResult } from '@/types'
import { isCompleteEntry } from '@/utils/result'

const STORAGE_KEY = 'protein-sampling-archives'

export interface ArchiveOutcome {
  status: 'archived' | 'merged' | 'empty'
  entry?: ArchiveEntry
  /** 与归档中已有的同一条合并时，说明第几次重复归档 */
  mergedIntoExisting?: boolean
  savedToLocal: boolean
}

export const useArchiveStore = defineStore('archive', () => {
  const entries = ref<ArchiveEntry[]>([])
  /** 初始化时发现本地存档损坏/不完整时给出的说明 */
  const initWarning = ref('')

  /** 清单按归档时间倒序（最近的在最前） */
  const sortedEntries = computed(() =>
    [...entries.value].sort((a, b) => b.archivedAt.localeCompare(a.archivedAt))
  )

  function hasBatch(batchId: string): boolean {
    return entries.value.some(e => e.batchId === batchId)
  }

  function persist(): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
      return true
    } catch {
      return false
    }
  }

  /** 从本地读取归档；结构损坏或条目不完整时忽略并给出说明，绝不留半截数据 */
  function init() {
    initWarning.value = ''
    let raw: string | null = null
    try {
      raw = localStorage.getItem(STORAGE_KEY)
    } catch {
      initWarning.value = '无法读取本地归档存储，本次按空归档处理。'
      entries.value = []
      return
    }
    if (!raw) {
      entries.value = []
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      initWarning.value = '本地归档数据已损坏、无法解析，已忽略该内容并按空归档处理。'
      entries.value = []
      return
    }
    if (!Array.isArray(parsed)) {
      initWarning.value = '本地归档数据格式不正确，已忽略并按空归档处理。'
      entries.value = []
      return
    }

    // 同一批次若在本地意外出现多条，合并为一条（保留最近一次）
    const byBatch = new Map<string, ArchiveEntry>()
    let incomplete = 0
    for (const item of parsed) {
      if (!isCompleteEntry(item)) {
        incomplete++
        continue
      }
      const prev = byBatch.get(item.batchId)
      if (!prev || item.archivedAt >= prev.archivedAt) {
        byBatch.set(item.batchId, item)
      }
    }

    entries.value = [...byBatch.values()]
    if (incomplete > 0) {
      initWarning.value = `本地归档中有 ${incomplete} 条内容不完整，已忽略，未载入结果区。`
    }
  }

  /**
   * 归档当前一批结果。
   * - 没有结果：返回 empty，不产生任何记录
   * - 同一批次重复归档：合并为一条（刷新归档时间），说明这是重复归档
   */
  function archiveCurrent(result: SamplingResult | null): ArchiveOutcome {
    if (!result) {
      return { status: 'empty', savedToLocal: false }
    }

    const now = new Date().toISOString()
    const existing = entries.value.find(e => e.batchId === result.batchId)
    if (existing) {
      // 同一条：结果与结果区共用同一份取值，只更新归档时间，不新增记录
      const prevArchivedAt = existing.archivedAt
      const prevResult = existing.result
      existing.archivedAt = now
      existing.result = result
      const saved = persist()
      if (!saved) {
        // 写入失败则回滚，保证内存与本地一致
        existing.archivedAt = prevArchivedAt
        existing.result = prevResult
      }
      return { status: 'merged', entry: existing, mergedIntoExisting: true, savedToLocal: saved }
    }

    const entry: ArchiveEntry = {
      batchId: result.batchId,
      archivedAt: now,
      result // 与结果区共用同一个结果引用
    }
    entries.value.push(entry)
    const saved = persist()
    if (!saved) {
      // 本地保存失败：撤回，不留下只在内存里的“伪归档”
      entries.value = entries.value.filter(e => e !== entry)
      return { status: 'archived', entry, savedToLocal: false }
    }
    return { status: 'archived', entry, savedToLocal: true }
  }

  /** 载入一条归档到结果区；内容不完整时返回 null，由调用方给出说明 */
  function loadEntry(entry: ArchiveEntry): SamplingResult | null {
    if (!isCompleteEntry(entry)) return null
    return entry.result
  }

  return {
    entries,
    sortedEntries,
    initWarning,
    init,
    archiveCurrent,
    loadEntry,
    hasBatch
  }
})
