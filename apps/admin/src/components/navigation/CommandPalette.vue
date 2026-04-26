<template>
  <a-modal
    v-model:open="visible"
    title="快速导航"
    :footer="null"
    :width="600"
    @cancel="handleClose"
  >
    <div class="command-palette">
      <a-input
        ref="searchInputRef"
        v-model:value="searchText"
        placeholder="输入关键词搜索页面..."
        size="large"
        allow-clear
        @keydown.enter="handleSelect(filteredCommands[selectedIndex])"
        @keydown.up.prevent="handleArrowUp"
        @keydown.down.prevent="handleArrowDown"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input>

      <div class="command-palette__list">
        <div
          v-for="(command, index) in filteredCommands"
          :key="command.path"
          :class="['command-palette__item', { active: index === selectedIndex }]"
          @click="handleSelect(command)"
          @mouseenter="selectedIndex = index"
        >
          <div class="command-palette__item-icon">
            <component :is="command.icon" />
          </div>
          <div class="command-palette__item-content">
            <div class="command-palette__item-title">{{ command.title }}</div>
            <div class="command-palette__item-description">{{ command.description }}</div>
          </div>
        </div>
        <div v-if="filteredCommands.length === 0" class="command-palette__empty">
          暂无匹配结果
        </div>
      </div>

      <div class="command-palette__footer">
        <span>↑↓ 选择</span>
        <span>Enter 确认</span>
        <span>Esc 关闭</span>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  SearchOutlined,
  DashboardOutlined,
  CarOutlined,
  LineChartOutlined,
} from '@ant-design/icons-vue';

interface Command {
  title: string;
  description: string;
  path: string;
  icon: any;
}

const router = useRouter();
const visible = ref(false);
const searchText = ref('');
const selectedIndex = ref(0);
const searchInputRef = ref();

const commands: Command[] = [
  {
    title: 'AGV 设备管理',
    description: '查看和管理 AGV 设备列表',
    path: '/agv',
    icon: CarOutlined,
  },
  {
    title: '产能报表',
    description: '查看产能统计和趋势分析',
    path: '/capacity',
    icon: DashboardOutlined,
  },
  {
    title: '传感器趋势',
    description: '查看传感器数据和异常趋势',
    path: '/sensor',
    icon: LineChartOutlined,
  },
];

const filteredCommands = computed(() => {
  if (!searchText.value) return commands;
  const keyword = searchText.value.toLowerCase();
  return commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(keyword) ||
      cmd.description.toLowerCase().includes(keyword)
  );
});

watch(filteredCommands, () => {
  selectedIndex.value = 0;
});

watch(visible, async (newVal) => {
  if (newVal) {
    await nextTick();
    searchInputRef.value?.focus();
  } else {
    searchText.value = '';
    selectedIndex.value = 0;
  }
});

const handleArrowUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
  }
};

const handleArrowDown = () => {
  if (selectedIndex.value < filteredCommands.value.length - 1) {
    selectedIndex.value++;
  }
};

const handleSelect = (command: Command) => {
  if (command) {
    router.push(command.path);
    handleClose();
  }
};

const handleClose = () => {
  visible.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    visible.value = !visible.value;
  } else if (e.key === 'Escape' && visible.value) {
    handleClose();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

defineExpose({
  open: () => {
    visible.value = true;
  },
});
</script>

<style scoped>
.command-palette {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.command-palette__list {
  max-height: 400px;
  overflow-y: auto;
}

.command-palette__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.command-palette__item:hover,
.command-palette__item.active {
  background-color: #f5f5f5;
}

.command-palette__item-icon {
  font-size: 20px;
  color: #1890ff;
}

.command-palette__item-content {
  flex: 1;
}

.command-palette__item-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.command-palette__item-description {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 2px;
}

.command-palette__empty {
  text-align: center;
  padding: 32px;
  color: rgba(0, 0, 0, 0.45);
}

.command-palette__footer {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
</style>
