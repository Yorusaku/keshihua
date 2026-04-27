/**
 * Mock 认证服务
 */

import type { LoginPayload, LoginResponse } from './types';
import { MOCK_USERS } from './mockUsers';

export async function mockLogin(payload: LoginPayload): Promise<LoginResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = MOCK_USERS.find(
    u => u.username === payload.username && u.password === payload.password
  );

  if (!user) {
    throw new Error('用户名或密码错误');
  }

  const { password, ...userWithoutPassword } = user;
  const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
  const refreshToken = btoa(JSON.stringify({ userId: user.id, type: 'refresh' }));

  return {
    user: userWithoutPassword,
    token,
    refreshToken,
    expiresIn: 7200,
  };
}

export async function mockRefreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    const decoded = JSON.parse(atob(refreshToken));
    if (decoded.type !== 'refresh') {
      throw new Error('无效的刷新令牌');
    }

    const token = btoa(JSON.stringify({ userId: decoded.userId, timestamp: Date.now() }));
    return { token, expiresIn: 7200 };
  } catch {
    throw new Error('刷新令牌失败');
  }
}
