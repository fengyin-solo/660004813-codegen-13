import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type { Conformation, SamplingResult, ProteinParams } from '@/types'
import { generateBatchId } from '@/utils/result'

export const useProteinStore = defineStore('protein', () => {
  const loading = ref(false)
  const result = ref<SamplingResult | null>(null)
  const selectedConformation = ref<Conformation | null>(null)
  const selectedCluster = ref('all')

  async function runSampling(params: ProteinParams) {
    loading.value = true
    try {
      const { data } = await axios.post('/api/sample', params)
      // 后端只返回结果体，批次标识与完成时间在采样完成时补齐
      result.value = {
        ...data,
        batchId: generateBatchId(),
        completedAt: new Date().toISOString()
      } as SamplingResult
      selectedConformation.value = null
      selectedCluster.value = 'all'
    } finally { loading.value = false }
  }

  /**
   * 载入一个结果（来自归档）。
   * 载入的是归档中结果的同一个引用（与归档共用同一份取值），
   * 不修改归档条目本身；调用方需先确认内容完整。
   */
  function loadResult(r: SamplingResult) {
    result.value = r
    selectedConformation.value = null
    selectedCluster.value = 'all'
  }

  function selectConformation(conf: Conformation) { selectedConformation.value = conf }
  function filterByCluster(cluster: string) { selectedCluster.value = cluster }

  return {
    loading, result, selectedConformation, selectedCluster,
    runSampling, loadResult, selectConformation, filterByCluster
  }
})
