<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>智造远望</h1>
        <p>Smart Manufacturing Monitor</p>
      </div>

      <a-form
        :model="formState"
        @finish="handleLogin"
        layout="vertical"
        class="login-form"
      >
        <a-form-item
          label="用户名"
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input
            v-model:value="formState.username"
            placeholder="请输入用户名"
            size="large"
          />
        </a-form-item>

        <a-form-item
          label="密码"
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
            size="large"
          />
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model:checked="formState.remember">记住我</a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>

      
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { useAuth } from '@packages/shared';

const router = useRouter();
const route = useRoute();
const { login } = useAuth();

const formState = reactive({
  username: '',
  password: '',
  remember: false,
});

const loading = ref(false);

async function handleLogin() {
  loading.value = true;
  try {
    await login(formState);
    message.success('登录成功');
    const redirect = (route.query.redirect as string) || '/';
    router.push(redirect);
  } catch (error) {
    message.error((error as Error).message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  margin-top: 24px;
}

.login-tips {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #999;
  text-align: center;
}

.login-tips p {
  margin: 4px 0;
}
</style>

