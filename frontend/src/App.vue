<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🧬 蛋白质折叠构象采样与分析平台</h1>
      <p class="subtitle">Ramachandran图 · LJ势能计算 · 3D骨架可视化</p>
    </header>
    <main class="app-main">
      <ControlPanel @sample="handleSample" />

      <el-alert
        v-if="store.result"
        :closable="false"
        show-icon
        :type="store.result.loadedFrom ? 'warning' : 'success'"
        class="batch-bar"
      >
        <template #title>
          <template v-if="store.result.loadedFrom">
            📂 当前结果区为载入的归档批次：采样完成于
            <b>{{ formatTime(store.result.loadedFrom.completedAt) }}</b>
            （残基 {{ store.result.params.residues }}、构象 {{ store.result.params.conformations }} 条），
            首次归档于 {{ formatTime(store.result.loadedFrom.archivedAt) }}。重新采样不会改动这份归档。
          </template>
          <template v-else>
            🆕 当前结果区为本轮新采样：完成于
            <b>{{ formatTime(store.result.completedAt!) }}</b>
            （残基 {{ store.result.params.residues }}、构象 {{ store.result.params.conformations }} 条），尚未归档。
          </template>
        </template>
      </el-alert>

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
import ControlPanel from "./components/ControlPanel.vue"
import RamachandranPlot from "./components/RamachandranPlot.vue"
import ProteinViewer3D from "./components/ProteinViewer3D.vue"
import ConformationTable from "./components/ConformationTable.vue"
import ArchivePanel from "./components/ArchivePanel.vue"
import { useProteinStore } from "./store/protein"
import { formatTime } from "./utils/archive"
import type { ProteinParams } from "./types"

const store = useProteinStore()
function handleSample(params: ProteinParams) { store.runSampling(params) }
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
.batch-bar{margin-top:16px}
</style>
