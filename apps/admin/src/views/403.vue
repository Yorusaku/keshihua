<template>
  <div class="forbidden-container">
    <div class="forbidden-content">
      <div class="forbidden-icon">403</div>
      <h1>无权限访问</h1>
      <p>抱歉，您没有权限访问此页面</p>
      <a-space>
        <a-button type="primary" @click="goBack">返回上一页</a-button>
        <a-button @click="goHome">返回首页</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goBack() {
  router.back();
}

function goHome() {
  router.push('/');
}
</script>

<style scoped>
.forbidden-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.forbidden-content {
  text-align: center;
}

.forbidden-icon {
  font-size: 120px;
  font-weight: 700;
  color: #ff4d4f;
  margin-bottom: 24px;
}

.forbidden-content h1 {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.forbidden-content p {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
}
</style>
