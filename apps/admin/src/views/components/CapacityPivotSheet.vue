<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { PivotSheet, type S2DataConfig, type S2Options } from '@antv/s2';
import '@antv/s2/dist/s2.min.css';
import type { ICapacityReportData } from '@packages/shared';
import {
  COLUMNS,
  ROWS,
  S2_CONDITION_TEXT_MAP,
  S2_HIERARCHY_TYPE,
  S2_SIZE,
  VALUES,
} from '@/constants';

interface Props {
  rows: ICapacityReportData[];
}

const props = defineProps<Props>();

const containerRef = ref<HTMLDivElement | null>(null);
let pivotSheet: PivotSheet | null = null;
let resizeObserver: ResizeObserver | null = null;

function buildDataConfig(data: ICapacityReportData[]): S2DataConfig {
  return {
    fields: {
      rows: [...ROWS],
      columns: [...COLUMNS],
      values: [...VALUES],
      valueInCols: true,
    },
    data,
  };
}

function buildOptions(width: number, height: number): S2Options {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : S2_SIZE.width;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : S2_SIZE.height;
  return {
    width: safeWidth,
    height: safeHeight,
    hierarchyType: S2_HIERARCHY_TYPE as S2Options['hierarchyType'],
    tooltip: {
      showTooltip: true,
    },
    style: {
      dataCell: {
        text: {
          style: (_text, _cellMeta, info) => {
            const field = info?.fieldValue;
            const currentValue = Number(info?.value);
            const condition = field ? S2_CONDITION_TEXT_MAP[field as keyof typeof S2_CONDITION_TEXT_MAP] : undefined;
            if (!condition || Number.isNaN(currentValue)) {
              return {};
            }
            return condition.mapping(currentValue);
          },
        },
      },
    },
  };
}

function getContainerSize(): { width: number; height: number } {
  const el = containerRef.value;
  if (!el) {
    return { width: S2_SIZE.width, height: S2_SIZE.height };
  }
  const width = el.clientWidth || S2_SIZE.width;
  const height = el.clientHeight || S2_SIZE.height;
  return { width, height };
}

function renderSheet(data: ICapacityReportData[]): void {
  const el = containerRef.value;
  if (!el) {
    return;
  }
  const { width, height } = getContainerSize();
  const dataCfg = buildDataConfig(data);

  if (!pivotSheet) {
    pivotSheet = new PivotSheet(el, dataCfg, buildOptions(width, height));
    pivotSheet.render();
    return;
  }

  pivotSheet.setDataCfg(dataCfg);
  if (typeof pivotSheet.changeSheetSize === 'function') {
    pivotSheet.changeSheetSize(width, height);
  }
  pivotSheet.render();
}

function setupResizeObserver(): void {
  if (typeof ResizeObserver === 'undefined' || !containerRef.value) {
    return;
  }

  resizeObserver = new ResizeObserver(() => {
    if (!pivotSheet) {
      return;
    }
    const { width, height } = getContainerSize();
    if (typeof pivotSheet.changeSheetSize === 'function') {
      pivotSheet.changeSheetSize(width, height);
      pivotSheet.render();
    }
  });
  resizeObserver.observe(containerRef.value);
}

onMounted(() => {
  renderSheet(props.rows);
  setupResizeObserver();
});

watch(
  () => props.rows,
  (rows) => {
    renderSheet(rows);
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (pivotSheet) {
    pivotSheet.destroy();
    pivotSheet = null;
  }
});
</script>

<template>
  <div ref="containerRef" class="capacity-pivot-sheet"></div>
</template>

<style scoped>
.capacity-pivot-sheet {
  width: 100%;
  min-height: 600px;
  border: 1px solid #d6e4f0;
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}
</style>
