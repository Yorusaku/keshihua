/**
 * Admin 共享数据提供器
 * 文件职责：为 Admin 各页面提供同一实例，避免每页重复探测数据源。
 */

import { markRaw, shallowRef } from 'vue';
import { createDataProvider, type DataProvider, type DataProviderMode } from '@packages/shared';

const providerRef = shallowRef<DataProvider | null>(null);
let pendingProvider: Promise<DataProvider> | null = null;

export async function ensureSharedProvider(mode: DataProviderMode = 'auto'): Promise<DataProvider> {
  if (providerRef.value) {
    return providerRef.value;
  }

  if (pendingProvider) {
    return pendingProvider;
  }

  pendingProvider = createDataProvider({ mode }).then((provider) => {
    providerRef.value = markRaw(provider);
    return provider;
  });

  try {
    return await pendingProvider;
  } finally {
    pendingProvider = null;
  }
}

export function getSharedProvider(): DataProvider | null {
  return providerRef.value;
}
