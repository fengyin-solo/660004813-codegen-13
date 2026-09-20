<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🧬 蛋白质折叠构象采样与分析平台</h1>
      <p class="subtitle">Ramachandran图 · LJ势能计算 · 3D骨架可视化</p>
    </header>
    <main class="app-main">
      <ControlPanel @sample="handleSample" />

      <div v-if="store.result" class="batch-bar">
        <el-tag type="info" size="small" effect="plain">结果区批次</el-tag>
        <span class="batch-id">#{{ store.result.batchId.slice(0, 8) }}</span>
        <span class="batch-meta">完成时间：{{ formatTime(store.result.completedAt) }}</span>
        <span class="batch-meta">残基 {{ store.result.params.residues }} · 构象 {{ store.result.params.conformations }}</span>
        <el-tag v-if="archiveStore.hasBatch(store.result.batchId)" type="success" size="small">
          ✓ 与归档共用同一份取值
        </el-tag>
        <el-tag v-else type="warning" size="small">尚未归档</el-tag>
      </div>

      <div class="main-grid" v-if="store.result">
        <div class="plot-area"><RamachandranPlot /></div>
        <div class="viewer-area"><ProteinViewer3D /></div>
      </div>
      <ConformationTable v-if="store.result" />

      <ArchivePanel />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ControlPanel from "./components/ControlPanel.vue"
import RamachandranPlot from "./components/RamachandranPlot.vue"
import ProteinViewer3D from "./components/ProteinViewer3D.vue"
import ConformationTable from "./components/ConformationTable.vue"
import ArchivePanel from "./components/ArchivePanel.vue"
import { useProteinStore } from "./store/protein"
import { useArchiveStore } from "./store/archive"
import { formatTime } from "./utils/result"
import type { ProteinParams } from "./types"

const store = useProteinStore()
const archiveStore = useArchiveStore()
function handleSample(params: ProteinParams) { store.runSampling(params) }

onMounted(() => {
  archiveStore.init()
  if (archiveStore.initWarning) ElMessage.warning(archiveStore.initWarning)
})
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#f0f2f5}
.app-container{min-height:100vh}
.app-header{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:24px 40px}
.app-header h1{font-size:1.8rem}
.subtitle{opacity:.85;margin-top:4px;font-size:.9rem}
.app-main{padding:20px 40px}
.main-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px}
.batch-bar{display:flex;align-items:center;gap:10px;background:#fff;border-radius:8px;padding:10px 16px;margin-top:16px;box-shadow:0 2px 8px rgba(0,0,0,.08);flex-wrap:wrap}
.batch-bar .batch-id{font-family:monospace;font-weight:600;color:#409eff}
.batch-bar .batch-meta{font-size:13px;color:#666}
</style>
