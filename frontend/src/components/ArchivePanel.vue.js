/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ElMessage } from 'element-plus';
import { useProteinStore } from '../store/protein';
import { useArchiveStore } from '../store/archive';
import { exportEntry, formatTime, isCompleteEntry } from '../utils/result';
const proteinStore = useProteinStore();
const archiveStore = useArchiveStore();
function onArchive() {
    if (!proteinStore.result) {
        ElMessage.warning('当前没有结果可归档：请先生成一次采样。');
        return;
    }
    const outcome = archiveStore.archiveCurrent(proteinStore.result);
    if (outcome.status === 'empty') {
        ElMessage.warning('当前没有结果可归档：请先生成一次采样。');
        return;
    }
    if (!outcome.savedToLocal) {
        ElMessage.error('归档失败：无法写入本地存储（空间不足或被禁用），本次归档未保留。');
        return;
    }
    if (outcome.status === 'merged') {
        ElMessage.success(`批次 #${outcome.entry.batchId.slice(0, 8)} 已归档过，已合并为同一条（刷新归档时间，结果未重复记录）。`);
    }
    else {
        ElMessage.success(`已归档批次 #${outcome.entry.batchId.slice(0, 8)}（${proteinStore.result.conformations.length} 条构象），保存在本地。`);
    }
}
function isCurrent(row) {
    return proteinStore.result?.batchId === row.batchId;
}
function rowClass({ row }) {
    return isCurrent(row) ? 'current-archive-row' : '';
}
function onLoad(row) {
    const loaded = archiveStore.loadEntry(row);
    if (!loaded) {
        ElMessage.error('该归档内容不完整（缺少参数、分布或构象数据），已停止载入，当前查看的结果未受影响。');
        return;
    }
    // 载入归档结果；与归档共用同一份取值，且不改动归档条目本身
    proteinStore.loadResult(loaded);
    ElMessage.success(`已载入批次 #${loaded.batchId.slice(0, 8)}，完成于 ${formatTime(loaded.completedAt)}。`);
}
function onExport(row) {
    if (!isCompleteEntry(row)) {
        ElMessage.error('该归档内容不完整，无法导出为文件。');
        return;
    }
    exportEntry(row);
    ElMessage.success(`批次 #${row.batchId.slice(0, 8)} 已导出为单独的 JSON 文件。`);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['archive-header']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel archive-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "archive-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.onArchive)
};
__VLS_3.slots.default;
var __VLS_3;
if (__VLS_ctx.archiveStore.initWarning) {
    const __VLS_8 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        title: (__VLS_ctx.archiveStore.initWarning),
        type: "warning",
        closable: (false),
        showIcon: true,
        ...{ class: "warn" },
    }));
    const __VLS_10 = __VLS_9({
        title: (__VLS_ctx.archiveStore.initWarning),
        type: "warning",
        closable: (false),
        showIcon: true,
        ...{ class: "warn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
if (__VLS_ctx.archiveStore.sortedEntries.length) {
    const __VLS_12 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        data: (__VLS_ctx.archiveStore.sortedEntries),
        stripe: true,
        size: "small",
        maxHeight: "360",
        rowClassName: (__VLS_ctx.rowClass),
    }));
    const __VLS_14 = __VLS_13({
        data: (__VLS_ctx.archiveStore.sortedEntries),
        stripe: true,
        size: "small",
        maxHeight: "360",
        rowClassName: (__VLS_ctx.rowClass),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    const __VLS_16 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        label: "完成时间 / 归档时间",
        minWidth: "180",
    }));
    const __VLS_18 = __VLS_17({
        label: "完成时间 / 归档时间",
        minWidth: "180",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_19.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "time-main" },
        });
        (__VLS_ctx.formatTime(row.result.completedAt));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "time-sub" },
        });
        (__VLS_ctx.formatTime(row.archivedAt));
    }
    var __VLS_19;
    const __VLS_20 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        label: "参数",
        width: "130",
    }));
    const __VLS_22 = __VLS_21({
        label: "参数",
        width: "130",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_23.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        (row.result.params.residues);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.br)({});
        (row.result.params.conformations);
    }
    var __VLS_23;
    const __VLS_24 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        label: "分布 (α/β/左手/禁阻)",
        minWidth: "200",
    }));
    const __VLS_26 = __VLS_25({
        label: "分布 (α/β/左手/禁阻)",
        minWidth: "200",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_27.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_28 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            type: "success",
            size: "small",
        }));
        const __VLS_30 = __VLS_29({
            type: "success",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        (row.result.stats.alpha);
        var __VLS_31;
        const __VLS_32 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            type: "danger",
            size: "small",
        }));
        const __VLS_34 = __VLS_33({
            type: "danger",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        (row.result.stats.beta);
        var __VLS_35;
        const __VLS_36 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            type: "warning",
            size: "small",
        }));
        const __VLS_38 = __VLS_37({
            type: "warning",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        __VLS_39.slots.default;
        (row.result.stats.left);
        var __VLS_39;
        const __VLS_40 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            type: "info",
            size: "small",
        }));
        const __VLS_42 = __VLS_41({
            type: "info",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        (row.result.stats.disallowed);
        var __VLS_43;
    }
    var __VLS_27;
    const __VLS_44 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        label: "批次",
        width: "110",
    }));
    const __VLS_46 = __VLS_45({
        label: "批次",
        width: "110",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_47.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "batch-id" },
        });
        (String(row.batchId).slice(0, 8));
        if (__VLS_ctx.isCurrent(row)) {
            const __VLS_48 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
                type: "primary",
                size: "small",
                effect: "dark",
                ...{ class: "cur-tag" },
            }));
            const __VLS_50 = __VLS_49({
                type: "primary",
                size: "small",
                effect: "dark",
                ...{ class: "cur-tag" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_49));
            __VLS_51.slots.default;
            var __VLS_51;
        }
    }
    var __VLS_47;
    const __VLS_52 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        label: "操作",
        width: "150",
        fixed: "right",
    }));
    const __VLS_54 = __VLS_53({
        label: "操作",
        width: "150",
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_55.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_56 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
            link: true,
            disabled: (!__VLS_ctx.isCompleteEntry(row)),
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onClick': {} },
            size: "small",
            type: "primary",
            link: true,
            disabled: (!__VLS_ctx.isCompleteEntry(row)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_60;
        let __VLS_61;
        let __VLS_62;
        const __VLS_63 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.archiveStore.sortedEntries.length))
                    return;
                __VLS_ctx.onLoad(row);
            }
        };
        __VLS_59.slots.default;
        var __VLS_59;
        const __VLS_64 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
            link: true,
            disabled: (!__VLS_ctx.isCompleteEntry(row)),
        }));
        const __VLS_66 = __VLS_65({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
            link: true,
            disabled: (!__VLS_ctx.isCompleteEntry(row)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        let __VLS_68;
        let __VLS_69;
        let __VLS_70;
        const __VLS_71 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.archiveStore.sortedEntries.length))
                    return;
                __VLS_ctx.onExport(row);
            }
        };
        __VLS_67.slots.default;
        var __VLS_67;
    }
    var __VLS_55;
    var __VLS_15;
}
else {
    const __VLS_72 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        description: "归档清单为空：完成一次采样并点击「归档当前结果」后，批次会保存在本地。",
        imageSize: (80),
    }));
    const __VLS_74 = __VLS_73({
        description: "归档清单为空：完成一次采样并点击「归档当前结果」后，批次会保存在本地。",
        imageSize: (80),
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
}
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['archive-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['archive-header']} */ ;
/** @type {__VLS_StyleScopedClasses['warn']} */ ;
/** @type {__VLS_StyleScopedClasses['time-main']} */ ;
/** @type {__VLS_StyleScopedClasses['time-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-id']} */ ;
/** @type {__VLS_StyleScopedClasses['cur-tag']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formatTime: formatTime,
            isCompleteEntry: isCompleteEntry,
            archiveStore: archiveStore,
            onArchive: onArchive,
            isCurrent: isCurrent,
            rowClass: rowClass,
            onLoad: onLoad,
            onExport: onExport,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
