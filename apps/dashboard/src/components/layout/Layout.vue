<!--
  工业驾驶舱骨架布局
  文件职责：提供顶部状态带、主舞台、右侧情报栏、底部事件轨四区插槽。
-->

<template>
  <div class="industrial-layout">
    <header class="industrial-layout__top">
      <slot name="top" />
    </header>

    <main class="industrial-layout__main">
      <section class="industrial-layout__stage">
        <slot name="stage" />
      </section>

      <aside class="industrial-layout__intel">
        <slot name="intel" />
      </aside>
    </main>

    <footer class="industrial-layout__timeline">
      <slot name="timeline" />
    </footer>
  </div>
</template>

<script setup lang="ts">
// 布局组件只负责分区，不承载业务状态。
</script>

<style scoped>
@import '@packages/shared/src/styles/tokens.css';

.industrial-layout {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 96px 1fr 180px;
  gap: var(--space-md);
  padding: var(--space-md);
  background:
    radial-gradient(circle at 80% 0%, var(--color-dashboard-accent-teal), transparent 42%),
    radial-gradient(circle at 20% 20%, var(--color-dashboard-accent-orange), transparent 38%),
    linear-gradient(135deg, var(--color-dashboard-bg-dark) 0%, var(--color-dashboard-bg-mid) 50%, var(--color-dashboard-bg-darker) 100%);
}

.industrial-layout__top {
  border: 1px solid var(--color-dashboard-border-light);
  border-radius: 14px;
  background: linear-gradient(90deg, var(--color-dashboard-panel-bg-start) 0%, var(--color-dashboard-panel-bg-end) 100%);
  box-shadow: inset 0 0 24px var(--color-dashboard-glow-blue);
}

.industrial-layout__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: var(--space-md);
  min-height: 0;
}

.industrial-layout__stage {
  position: relative;
  min-height: 0;
  border: 1px solid var(--color-dashboard-border-stage);
  border-radius: 14px;
  overflow: hidden;
  background:
    linear-gradient(0deg, var(--color-dashboard-stage-bg-overlay), var(--color-dashboard-stage-bg-overlay-alt)),
    repeating-linear-gradient(
      90deg,
      var(--color-dashboard-grid-line) 0,
      var(--color-dashboard-grid-line) 1px,
      transparent 1px,
      transparent 28px
    );
}

.industrial-layout__intel {
  border: 1px solid var(--color-dashboard-border-intel);
  border-radius: 14px;
  background: linear-gradient(180deg, var(--color-dashboard-intel-bg-start), var(--color-dashboard-intel-bg-end));
  min-height: 0;
  overflow: hidden;
}

.industrial-layout__timeline {
  border: 1px solid var(--color-dashboard-border-timeline);
  border-radius: 14px;
  background:
    linear-gradient(180deg, var(--color-dashboard-timeline-bg-start), var(--color-dashboard-timeline-bg-end)),
    repeating-linear-gradient(
      90deg,
      var(--color-dashboard-timeline-grid) 0,
      var(--color-dashboard-timeline-grid) 1px,
      transparent 1px,
      transparent 24px
    );
  min-height: 0;
}

@media (max-width: 1180px) {
  .industrial-layout {
    grid-template-rows: 106px 1fr 210px;
  }

  .industrial-layout__main {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(420px, 1fr) 320px;
  }
}
</style>
