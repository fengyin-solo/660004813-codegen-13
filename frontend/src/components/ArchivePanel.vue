<template>
  <div class="panel archive-panel">
    <div class="archive-header">
      <h3>🗂️ 采样归档 <span class="count" v-if="store.archives.length">（{{ store.archives.length }} 批，按归档时间排列）</span></h3>
      <el-button type="primary" plain size="small" @click="onArchive">📥 归档当前这一批</el-button>
    </div>

    <el-alert
      v-if="store.archiveWarning"
      :title="store.archiveWarning"
      type="warning"
      :closable="false"
      show-icon
      class="warn"
    />

    <el-alert
      v-if="!store.result"
      title="结果区还没有采样结果：请先生成构象采样，再进行归档。"
      type="info"
      :closable="false"
      show-icon
      class="warn"
    />

    <p v-if="store.archives.length === 0" class="empty">归档清单为空。每次采样完成后点击“归档当前这一批”，参数、完成时间、分布与全部构象会一并保存在本地。</p>

    <el-table v-else :data="store.archives" stripe size="small" class="archive-table">
      <el-table-column label="#" type="index" width="44" />
      <el-table-column label="完成时间" width="170">
        <template #default="{ row }">{{ formatTime(row.completedAt) }}</template>
      </el-table-column>
      <el-table-column label="参数" width="130">
        <template #default="{ row }">残基 {{ row.result.params.residues }} / {{ row.result.params.conformations }} 构象</template>
      </el-table-column>
      <el-table-column label="区域分布" min-width="220">
        <template #default="{ row }">
          <div class="dist-bar" :title="distTitle(row)">
            <span class="seg a" :style="{ flexGrow: row.result.stats.alpha }"></span>
            <span class="seg b" :style="{ flexGrow: row.result.stats.beta }"></span>
            <span class="seg l" :style="{ flexGrow: row.result.stats.left }"></span>
            <span class="seg d" :style="{ flexGrow: row.result.stats.disallowed }"></span>
          </div>
          <div class="dist-text">{{ distText(row) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="归档情况" width="130">
        <template #default="{ row }">
          <div class="arch-meta">
            <span>{{ formatTime(row.updatedAt).slice(6) }}</span>
            <el-tag v-if="row.archiveCount > 1" type="warning" size="small">已合并 ×{{ row.archiveCount }}</el-tag>
            <el-tag v-else size="small" type="info">首次</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag v-if="row.batchId === store.currentBatchId" type="success" size="small">结果区正在看</el-tag>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="onLoad(row)">载入</el-button>
          <el-button size="small" type="primary" plain @click="onExport(row)">导出文件</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useProteinStore } from '../store/protein'
import { formatTime } from '../utils/archive'
import type { ArchiveEntry } from '../types'

const store = useProteinStore()

function onArchive() {
  const outcome = store.archiveCurrentResult()
  if (outcome.status === 'created') ElMessage.success(outcome.message)
  else if (outcome.status === 'merged') ElMessage.warning(outcome.message)
  else ElMessage.error(outcome.message)
}

function onLoad(row: ArchiveEntry) {
  ElMessage.success(store.loadArchive(row.id))
}

function onExport(row: ArchiveEntry) {
  const msg = store.exportArchive(row.id)
  if (msg.startsWith('已导出')) ElMessage.success(msg)
  else ElMessage.error(msg)
}

function total(row: ArchiveEntry) {
  const s = row.result.stats
  return s.alpha + s.beta + s.left + s.disallowed
}
function pct(n: number, t: number) { return t ? Math.round((n / t) * 1000) / 10 : 0 }
function distText(row: ArchiveEntry) {
  const t = total(row)
  const s = row.result.stats
  return `α ${s.alpha} (${pct(s.alpha, t)}%) · β ${s.beta} (${pct(s.beta, t)}%) · 左手 ${s.left} · 禁阻 ${s.disallowed}`
}
function distTitle(row: ArchiveEntry) {
  const t = total(row)
  const s = row.result.stats
  return `α-螺旋 ${s.alpha} (${pct(s.alpha, t)}%)\nβ-折叠 ${s.beta} (${pct(s.beta, t)}%)\n左手螺旋 ${s.left} (${pct(s.left, t)}%)\n禁阻区 ${s.disallowed} (${pct(s.disallowed, t)}%)`
}
</script>

<style scoped>
.archive-panel { margin-top: 16px; }
.archive-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.archive-header h3 { color: #333; font-size: 15px; }
.count { font-size: 12px; color: #999; font-weight: normal; }
.warn { margin-bottom: 12px; }
.empty { color: #999; font-size: 13px; padding: 12px 4px; }
.dist-bar { display: flex; width: 100%; height: 10px; border-radius: 5px; overflow: hidden; background: #f5f5f5; }
.dist-bar .seg { display: block; }
.dist-bar .seg.a { background: #4ecdc4; }
.dist-bar .seg.b { background: #ff6b6b; }
.dist-bar .seg.l { background: #45b7d1; }
.dist-bar .seg.d { background: #dcdcdc; }
.dist-text { font-size: 11px; color: #888; margin-top: 4px; white-space: nowrap; }
.arch-meta { display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: #999; }
.muted { color: #bbb; font-size: 12px; }
</style>
