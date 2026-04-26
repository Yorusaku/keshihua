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
.industrial-layout {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 96px 1fr 180px;
  gap: 12px;
  padding: 12px;
  background:
    radial-gradient(circle at 80% 0%, rgba(0, 177, 163, 0.16), transparent 42%),
    radial-gradient(circle at 20% 20%, rgba(255, 160, 67, 0.12), transparent 38%),
    linear-gradient(135deg, #08131e 0%, #0b1e2a 50%, #071119 100%);
}

.industrial-layout__top {
  border: 1px solid rgba(111, 168, 205, 0.45);
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(3, 22, 40, 0.9) 0%, rgba(8, 35, 53, 0.75) 100%);
  box-shadow: inset 0 0 24px rgba(28, 123, 154, 0.28);
}

.industrial-layout__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 12px;
  min-height: 0;
}

.industrial-layout__stage {
  position: relative;
  min-height: 0;
  border: 1px solid rgba(118, 164, 194, 0.4);
  border-radius: 14px;
  overflow: hidden;
  background:
    linear-gradient(0deg, rgba(9, 20, 33, 0.96), rgba(9, 20, 33, 0.92)),
    repeating-linear-gradient(
      90deg,
      rgba(98, 153, 194, 0.09) 0,
      rgba(98, 153, 194, 0.09) 1px,
      transparent 1px,
      transparent 28px
    );
}

.industrial-layout__intel {
  border: 1px solid rgba(125, 160, 182, 0.42);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(8, 25, 42, 0.88), rgba(12, 33, 49, 0.78));
  min-height: 0;
  overflow: hidden;
}

.industrial-layout__timeline {
  border: 1px solid rgba(129, 167, 190, 0.42);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(10, 25, 39, 0.94), rgba(7, 18, 30, 0.9)),
    repeating-linear-gradient(
      90deg,
      rgba(66, 105, 132, 0.22) 0,
      rgba(66, 105, 132, 0.22) 1px,
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
