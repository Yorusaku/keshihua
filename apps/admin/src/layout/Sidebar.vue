<!--
  Admin 侧边栏
  文件职责：提供三类核心页面入口，保持导航简洁且稳定。
-->

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{
  collapsed: boolean;
}>();

const route = useRoute();
const router = useRouter();

const menuItems = [
  { key: 'agv', title: 'AGV 管理', path: '/agv', icon: '🚚' },
  { key: 'sensor', title: '传感器策略', path: '/agv/sensor', icon: '📡' },
  { key: 'report', title: '产能报表', path: '/agv/report', icon: '📊' },
  { key: 'alert-center', title: '告警处理中心', path: '/agv/alert-center', icon: '🚨' },
];

const selectedKeys = computed(() => {
  const navKey = route.meta.navKey;
  if (typeof navKey === 'string') {
    return [navKey];
  }
  if (route.path.includes('/alert-center')) return ['alert-center'];
  if (route.path.includes('/sensor')) return ['sensor'];
  if (route.path.includes('/report')) return ['report'];
  return ['agv'];
});

function handleSelect(path: string): void {
  void router.push(path);
}
</script>

<template>
  <a-layout-sider
    :collapsed="props.collapsed"
    :trigger="null"
    width="248"
    collapsible
    class="admin-sidebar"
  >
    <div class="admin-sidebar__brand">
      <span v-if="!props.collapsed">智造远望 Admin</span>
      <span v-else>OA</span>
    </div>

    <a-menu :selected-keys="selectedKeys" theme="dark" mode="inline">
      <a-menu-item
        v-for="item in menuItems"
        :key="item.key"
        @click="handleSelect(item.path)"
      >
        <span class="admin-sidebar__icon">{{ item.icon }}</span>
        <span>{{ item.title }}</span>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
</template>

<style scoped>
.admin-sidebar {
  height: 100vh;
  background:
    radial-gradient(circle at 30% 0%, rgba(80, 143, 197, 0.22), transparent 42%),
    linear-gradient(180deg, #10283a 0%, #0b1f2e 100%);
  border-right: 1px solid rgba(151, 188, 216, 0.24);
}

.admin-sidebar__brand {
  height: 72px;
  display: grid;
  place-items: center;
  color: #e7f6ff;
  font-size: 16px;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(144, 193, 224, 0.25);
}

.admin-sidebar__icon {
  margin-right: 8px;
}
</style>
