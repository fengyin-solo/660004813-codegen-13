/** 生成一次采样的批次唯一标识 */
export function generateBatchId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `batch-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function isNum(v) {
    return typeof v === 'number' && Number.isFinite(v);
}
function isConformation(x) {
    return (x &&
        typeof x === 'object' &&
        isNum(x.id) &&
        isNum(x.phi) &&
        isNum(x.psi) &&
        isNum(x.energy) &&
        typeof x.region === 'string' &&
        typeof x.cluster === 'string');
}
/**
 * 校验一份采样结果是否完整。
 * 任何字段缺失、构象条目不全，都视为不完整，避免载入后留下半截数据。
 */
export function isCompleteResult(x) {
    if (!x || typeof x !== 'object')
        return false;
    if (typeof x.batchId !== 'string' || !x.batchId)
        return false;
    if (typeof x.completedAt !== 'string' || Number.isNaN(Date.parse(x.completedAt)))
        return false;
    const p = x.params;
    if (!p || !isNum(p.residues) || !isNum(p.conformations))
        return false;
    const er = x.energyRange;
    if (!Array.isArray(er) || er.length !== 2 || !isNum(er[0]) || !isNum(er[1]))
        return false;
    const s = x.stats;
    if (!s ||
        !isNum(s.alpha) ||
        !isNum(s.beta) ||
        !isNum(s.left) ||
        !isNum(s.disallowed)) {
        return false;
    }
    if (!Array.isArray(x.conformations) || x.conformations.length === 0)
        return false;
    if (x.conformations.some((c) => !isConformation(c)))
        return false;
    // 分布统计与实际构象应对得上，对不上也是不完整
    const total = s.alpha + s.beta + s.left + s.disallowed;
    if (total !== x.conformations.length)
        return false;
    return true;
}
/** 归档条目完整（外层元信息 + 结果完整）才可载入 */
export function isCompleteEntry(x) {
    return (x &&
        typeof x === 'object' &&
        typeof x.batchId === 'string' &&
        !!x.batchId &&
        typeof x.archivedAt === 'string' &&
        !Number.isNaN(Date.parse(x.archivedAt)) &&
        isCompleteResult(x.result));
}
/** 本地时间格式化：YYYY-MM-DD HH:mm:ss */
export function formatTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    const pad = (n) => String(n).padStart(2, '0');
    return (`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
}
/** 把某一批单独导出成一份 JSON 文件（含参数、完成时间、分布、构象） */
export function exportEntry(entry) {
    const payload = {
        format: 'protein-sampling-archive',
        version: 1,
        batchId: entry.batchId,
        archivedAt: entry.archivedAt,
        result: entry.result
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sampling-${entry.batchId.slice(0, 8)}-${entry.archivedAt.replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}
