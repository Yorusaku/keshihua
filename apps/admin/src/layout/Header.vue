<!--
  Admin 顶部栏
  文件职责：展示当前页面、上下文参数和侧栏折叠控制。
-->

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useBreadcrumb } from '@/composables';
import UserInfo from '@/components/user/UserInfo.vue';

const props = defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  (event: 'toggle'): void;
}>();

const route = useRoute();
const { breadcrumbList } = useBreadcrumb();

const pageTitle = computed(() => (route.meta.title as string) || '工作台');
const contextText = computed(() => {
  const keys = ['lineId', 'agvId', 'sensorId', 'alertId', 'source'] as const;
  const parts = [];
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const value = route.query[key];
    if (typeof value === 'string' && value) {
      parts.push(`${key}: ${value}`);
    }
  }
  return parts.length ? parts.join(' · ') : '无外部上下文';
});
</script>

<template>
  <header class="admin-header">
    <button class="admin-header__toggle" type="button" @click="emit('toggle')">
      {{ props.collapsed ? '展开导航' : '收起导航' }}
    </button>

    <div class="admin-header__title">
      <div class="admin-header__breadcrumb">
        <a-breadcrumb>
          <a-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
            <router-link v-if="!item.active" :to="item.path">
              {{ item.title }}
            </router-link>
            <span v-else>{{ item.title }}</span>
          </a-breadcrumb-item>
        </a-breadcrumb>
      </div>
      <span class="admin-header__context">{{ contextText }}</span>
    </div>

    <div class="admin-header__meta">
      <UserInfo />
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid rgba(150, 179, 200, 0.52);
  background: linear-gradient(90deg, #fafdff 0%, #eef6ff 100%);
  box-shadow: 0 8px 24px rgba(35, 86, 121, 0.12);
}

.admin-header__toggle {
  border: 1px solid rgba(118, 157, 184, 0.7);
  background: #edf6ff;
  color: #1e4f76;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.admin-header__title {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.admin-header__breadcrumb {
  font-size: 15px;
}

.admin-header__breadcrumb :deep(.ant-breadcrumb-link) {
  color: #1d3d58;
  font-weight: 500;
}

.admin-header__breadcrumb :deep(.ant-breadcrumb-link a) {
  color: #567894;
  transition: color 0.2s;
}

.admin-header__breadcrumb :deep(.ant-breadcrumb-link a:hover) {
  color: #1890ff;
}

.admin-header__context {
  color: #567894;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-header__meta {
  color: #3f6585;
  font-size: 13px;
}
</style>
