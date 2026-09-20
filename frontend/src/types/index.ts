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

export interface SamplingStats {
  alpha: number
  beta: number
  left: number
  disallowed: number
}

export interface SamplingResult {
  params: ProteinParams
  conformations: Conformation[]
  energyRange: [number, number]
  stats: SamplingStats
  /** 本批采样的唯一标识（前端在收到结果时生成） */
  batchId?: string
  /** 本批采样的完成时间（ISO 字符串） */
  completedAt?: string
  /** 该结果来自归档时，记录对应归档的信息 */
  loadedFrom?: LoadedFrom
}

export interface LoadedFrom {
  archiveId: string
  /** 归档中保留的完成时间 */
  completedAt: string
  /** 首次归档时间 */
  archivedAt: string
}

/** 一条归档记录：结果与参数、完成时间、分布一并留存 */
export interface ArchiveEntry {
  id: string
  /** 指向同一批采样结果的标识，用于重复归档合并 */
  batchId: string
  /** 采样完成时间（ISO） */
  completedAt: string
  /** 首次归档时间（ISO） */
  archivedAt: string
  /** 最近一次（重复）归档时间（ISO），清单按此时间倒序排列 */
  updatedAt: string
  /** 被归档（含重复合并）的次数 */
  archiveCount: number
  /** 归档时的结果快照，与结果区共用同一份取值结构 */
  result: SamplingResult
}

/** 一次归档操作的结果说明 */
export interface ArchiveActionOutcome {
  status: 'created' | 'merged' | 'empty' | 'error'
  message: string
  entry?: ArchiveEntry
}
