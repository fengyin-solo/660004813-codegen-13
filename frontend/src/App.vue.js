/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import ControlPanel from "./components/ControlPanel.vue";
import RamachandranPlot from "./components/RamachandranPlot.vue";
import ProteinViewer3D from "./components/ProteinViewer3D.vue";
import ConformationTable from "./components/ConformationTable.vue";
import ArchivePanel from "./components/ArchivePanel.vue";
import { useProteinStore } from "./store/protein";
import { useArchiveStore } from "./store/archive";
import { formatTime } from "./utils/result";
const store = useProteinStore();
const archiveStore = useArchiveStore();
function handleSample(params) { store.runSampling(params); }
onMounted(() => {
    archiveStore.init();
    if (archiveStore.initWarning)
        ElMessage.warning(archiveStore.initWarning);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "app-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "app-main" },
});
/** @type {[typeof ControlPanel, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ControlPanel, new ControlPanel({
    ...{ 'onSample': {} },
}));
const __VLS_1 = __VLS_0({
    ...{ 'onSample': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onSample: (__VLS_ctx.handleSample)
};
var __VLS_2;
if (__VLS_ctx.store.result) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "batch-bar" },
    });
    const __VLS_7 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
        type: "info",
        size: "small",
        effect: "plain",
    }));
    const __VLS_9 = __VLS_8({
        type: "info",
        size: "small",
        effect: "plain",
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    __VLS_10.slots.default;
    var __VLS_10;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "batch-id" },
    });
    (__VLS_ctx.store.result.batchId.slice(0, 8));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "batch-meta" },
    });
    (__VLS_ctx.formatTime(__VLS_ctx.store.result.completedAt));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "batch-meta" },
    });
    (__VLS_ctx.store.result.params.residues);
    (__VLS_ctx.store.result.params.conformations);
    if (__VLS_ctx.archiveStore.hasBatch(__VLS_ctx.store.result.batchId)) {
        const __VLS_11 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
            type: "success",
            size: "small",
        }));
        const __VLS_13 = __VLS_12({
            type: "success",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_12));
        __VLS_14.slots.default;
        var __VLS_14;
    }
    else {
        const __VLS_15 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
            type: "warning",
            size: "small",
        }));
        const __VLS_17 = __VLS_16({
            type: "warning",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_16));
        __VLS_18.slots.default;
        var __VLS_18;
    }
}
if (__VLS_ctx.store.result) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "main-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plot-area" },
    });
    /** @type {[typeof RamachandranPlot, ]} */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(RamachandranPlot, new RamachandranPlot({}));
    const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "viewer-area" },
    });
    /** @type {[typeof ProteinViewer3D, ]} */ ;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent(ProteinViewer3D, new ProteinViewer3D({}));
    const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
}
if (__VLS_ctx.store.result) {
    /** @type {[typeof ConformationTable, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(ConformationTable, new ConformationTable({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
}
/** @type {[typeof ArchivePanel, ]} */ ;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent(ArchivePanel, new ArchivePanel({}));
const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
/** @type {__VLS_StyleScopedClasses['app-container']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['app-main']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-id']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['batch-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['plot-area']} */ ;
/** @type {__VLS_StyleScopedClasses['viewer-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ControlPanel: ControlPanel,
            RamachandranPlot: RamachandranPlot,
            ProteinViewer3D: ProteinViewer3D,
            ConformationTable: ConformationTable,
            ArchivePanel: ArchivePanel,
            formatTime: formatTime,
            store: store,
            archiveStore: archiveStore,
            handleSample: handleSample,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
