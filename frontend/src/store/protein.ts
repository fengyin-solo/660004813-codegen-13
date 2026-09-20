import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axios from 'axios'
import type {
  ArchiveActionOutcome,
  ArchiveEntry,
  Conformation,
  ProteinParams,
  SamplingResult,
} from '@/types'
import {
  deepClone,
  downloadEntry,
  generateBatchId,
  loadArchives,
  saveArchives,
  validateResult,
} from '@/utils/archive'

export const useProteinStore = defineStore('protein', () => {
  const loading = ref(false)
  const result = ref<SamplingResult | null>(null)
  const selectedConformation = ref<Conformation | null>(null)
  const selectedCluster = ref('all')

  // 归档清单（本地保存），按最近归档时间倒序
  const archives = ref<ArchiveEntry[]>([])
  // 清单初始化时的说明（如损坏/不完整内容被跳过）
  const archiveWarning = ref<string | null>(null)

  // 初始化：读取本地归档
  const initial = loadArchives()
  archives.value = initial.entries
  archiveWarning.value = initial.warning

  /** 当前结果区对应的批次标识（用于清单中高亮“正在看的这一批”） */
  const currentBatchId = computed(() => result.value?.batchId ?? null)

  async function runSampling(params: ProteinParams) {
    loading.value = true
    try {
      const { data } = await axios.post('/api/sample', params)
      result.value = {
        ...(data as SamplingResult),
        batchId: generateBatchId(),
        completedAt: new Date().toISOString(),
        loadedFrom: undefined,
      }
      selectedConformation.value = null
      selectedCluster.value = 'all'
    } finally { loading.value = false }
  }

  function selectConformation(conf: Conformation) { selectedConformation.value = conf }
  function filterByCluster(cluster: string) { selectedCluster.value = cluster }

  /** 把结果区当前这批采样归档；同一批重复归档合并为一条 */
  function archiveCurrentResult(): ArchiveActionOutcome {
    const current = result.value
    if (!current) {
      return { status: 'empty', message: '当前没有结果可归档，请先生成一次构象采样' }
    }
    const invalid = validateResult(current)
    if (invalid) {
      return { status: 'empty', message: `结果不完整，未归档：${invalid}` }
    }

    const now = new Date().toISOString()
    const existingIndex = archives.value.findIndex(e => e.batchId === current.batchId)

    if (existingIndex >= 0) {
      // 同一批重复归档：合并成一条，刷新取值并计数
      const existing = archives.value[existingIndex]
      const merged: ArchiveEntry = {
        ...existing,
        updatedAt: now,
        archiveCount: existing.archiveCount + 1,
        result: deepClone(current),
      }
      const next = [...archives.value]
      next.splice(existingIndex, 1, merged)
      next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      try {
        saveArchives(next)
      } catch (err) {
        return { status: 'error', message: err instanceof Error ? err.message : '归档失败' }
      }
      archives.value = next
      return {
        status: 'merged',
        entry: merged,
        message: `这一批已归档过，已合并为同一条（累计归档 ${merged.archiveCount} 次，取值已更新为当前结果，归档时间刷新到 ${now}）`,
      }
    }

    const entry: ArchiveEntry = {
      id: current.batchId!,
      batchId: current.batchId!,
      completedAt: current.completedAt!,
      archivedAt: now,
      updatedAt: now,
      archiveCount: 1,
      // 存快照拷贝：归档与结果区共用同一份取值，但两边互不影响
      result: deepClone(current),
    }
    try {
      saveArchives([entry, ...archives.value])
    } catch (err) {
      return { status: 'error', message: err instanceof Error ? err.message : '归档失败' }
    }
    archives.value = [entry, ...archives.value]
    return {
      status: 'created',
      entry,
      message: `已归档：残基 ${current.params.residues}、构象 ${current.params.conformations} 条，完成时间 ${current.completedAt}`,
    }
  }

  /** 从归档载入某一批到结果区；不完整则说明且不改动当前结果区 */
  function loadArchive(id: string): string {
    const entry = archives.value.find(e => e.id === id)
    if (!entry) return '归档清单中找不到这一批，载入取消'
    const invalid = validateResult(entry.result)
    if (invalid) return `归档内容不完整，未载入：${invalid}（当前结果区保持不变）`

    // 载入的是快照拷贝：可看出是哪一次的结果，且不改动归档本身、不影响正在看的那一批
    result.value = {
      ...deepClone(entry.result),
      loadedFrom: {
        archiveId: entry.id,
        completedAt: entry.completedAt,
        archivedAt: entry.archivedAt,
      },
    }
    selectedConformation.value = null
    selectedCluster.value = 'all'
    return `已载入 ${entry.completedAt} 完成的归档批次（残基 ${entry.result.params.residues}、构象 ${entry.result.params.conformations} 条）`
  }

  /** 把某一批单独导出成一份 JSON 文件 */
  function exportArchive(id: string): string {
    const entry = archives.value.find(e => e.id === id)
    if (!entry) return '归档清单中找不到这一批，导出取消'
    const invalid = validateResult(entry.result)
    if (invalid) return `归档内容不完整，未导出：${invalid}`
    downloadEntry(entry)
    return `已导出该批次（完成于 ${entry.completedAt}）`
  }

  return {
    loading, result, selectedConformation, selectedCluster,
    archives, archiveWarning, currentBatchId,
    runSampling, selectConformation, filterByCluster,
    archiveCurrentResult, loadArchive, exportArchive,
  }
})
