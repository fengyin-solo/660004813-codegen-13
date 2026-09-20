<template>
  <div class="panel archive-panel">
    <div class="archive-header">
      <h3>🗂️ 采样归档（本地保存）</h3>
      <el-button type="primary" size="small" @click="onArchive">
        📥 归档当前结果
      </el-button>
    </div>

    <el-alert
      v-if="archiveStore.initWarning"
      :title="archiveStore.initWarning"
      type="warning"
      :closable="false"
      show-icon
      class="warn"
    />

    <el-table
      v-if="archiveStore.sortedEntries.length"
      :data="archiveStore.sortedEntries"
      stripe
      size="small"
      max-height="360"
      :row-class-name="rowClass"
    >
      <el-table-column label="完成时间 / 归档时间" min-width="180">
        <template #default="{ row }">
          <div class="time-main">{{ formatTime(row.result.completedAt) }}</div>
          <div class="time-sub">归档于 {{ formatTime(row.archivedAt) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="参数" width="130">
        <template #default="{ row }">
          残基 {{ row.result.params.residues }}<br />
          构象 {{ row.result.params.conformations }}
        </template>
      </el-table-column>
      <el-table-column label="分布 (α/β/左手/禁阻)" min-width="200">
        <template #default="{ row }">
          <el-tag type="success" size="small">α {{ row.result.stats.alpha }}</el-tag>
          <el-tag type="danger" size="small">β {{ row.result.stats.beta }}</el-tag>
          <el-tag type="warning" size="small">左 {{ row.result.stats.left }}</el-tag>
          <el-tag type="info" size="small">禁 {{ row.result.stats.disallowed }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="批次" width="110">
        <template #default="{ row }">
          <span class="batch-id">#{{ String(row.batchId).slice(0, 8) }}</span>
          <el-tag v-if="isCurrent(row)" type="primary" size="small" effect="dark" class="cur-tag">
            当前查看
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            link
            :disabled="!isCompleteEntry(row)"
            @click="onLoad(row)"
          >载入</el-button>
          <el-button
            size="small"
            type="success"
            link
            :disabled="!isCompleteEntry(row)"
            @click="onExport(row)"
          >导出文件</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty
      v-else
      description="归档清单为空：完成一次采样并点击「归档当前结果」后，批次会保存在本地。"
      :image-size="80"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useProteinStore } from '../store/protein'
import { useArchiveStore } from '../store/archive'
import { exportEntry, formatTime, isCompleteEntry } from '../utils/result'
import type { ArchiveEntry } from '../types'

const proteinStore = useProteinStore()
const archiveStore = useArchiveStore()

function onArchive() {
  if (!proteinStore.result) {
    ElMessage.warning('当前没有结果可归档：请先生成一次采样。')
    return
  }
  const outcome = archiveStore.archiveCurrent(proteinStore.result)
  if (outcome.status === 'empty') {
    ElMessage.warning('当前没有结果可归档：请先生成一次采样。')
    return
  }
  if (!outcome.savedToLocal) {
    ElMessage.error('归档失败：无法写入本地存储（空间不足或被禁用），本次归档未保留。')
    return
  }
  if (outcome.status === 'merged') {
    ElMessage.success(
      `批次 #${outcome.entry!.batchId.slice(0, 8)} 已归档过，已合并为同一条（刷新归档时间，结果未重复记录）。`
    )
  } else {
    ElMessage.success(
      `已归档批次 #${outcome.entry!.batchId.slice(0, 8)}（${proteinStore.result.conformations.length} 条构象），保存在本地。`
    )
  }
}

function isCurrent(row: ArchiveEntry): boolean {
  return proteinStore.result?.batchId === row.batchId
}

function rowClass({ row }: { row: ArchiveEntry }): string {
  return isCurrent(row) ? 'current-archive-row' : ''
}

function onLoad(row: ArchiveEntry) {
  const loaded = archiveStore.loadEntry(row)
  if (!loaded) {
    ElMessage.error('该归档内容不完整（缺少参数、分布或构象数据），已停止载入，当前查看的结果未受影响。')
    return
  }
  // 载入归档结果；与归档共用同一份取值，且不改动归档条目本身
  proteinStore.loadResult(loaded)
  ElMessage.success(
    `已载入批次 #${loaded.batchId.slice(0, 8)}，完成于 ${formatTime(loaded.completedAt)}。`
  )
}

function onExport(row: ArchiveEntry) {
  if (!isCompleteEntry(row)) {
    ElMessage.error('该归档内容不完整，无法导出为文件。')
    return
  }
  exportEntry(row)
  ElMessage.success(`批次 #${row.batchId.slice(0, 8)} 已导出为单独的 JSON 文件。`)
}
</script>

<style scoped>
.archive-panel { margin-top: 16px; }
.archive-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.archive-header h3 { color: #333; font-size: 15px; }
.warn { margin-bottom: 12px; }
.time-main { font-size: 13px; }
.time-sub { font-size: 11px; color: #999; margin-top: 2px; }
.batch-id { font-family: monospace; color: #666; }
.cur-tag { margin-left: 6px; }
:deep(.current-archive-row) { background-color: #ecf5ff !important; }
</style>
