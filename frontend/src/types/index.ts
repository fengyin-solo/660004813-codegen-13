export interface Conformation {
  id: number
  phi: number
  psi: number
  energy: number
  region: string
  cluster: string
}

export interface ProteinParams {
  residues: number
  conformations: number
}

export interface RegionStats {
  alpha: number
  beta: number
  left: number
  disallowed: number
}

export interface SamplingResult {
  /** 批次唯一标识：归档与结果区靠它判断是不是同一批 */
  batchId: string
  /** 本次采样完成时间（ISO 字符串） */
  completedAt: string
  params: ProteinParams
  conformations: Conformation[]
  energyRange: [number, number]
  stats: RegionStats
}

/** 一条归档：同一批次（batchId 相同）只保留一条 */
export interface ArchiveEntry {
  batchId: string
  /** 归档时间（ISO 字符串），清单按它排序 */
  archivedAt: string
  result: SamplingResult
}
