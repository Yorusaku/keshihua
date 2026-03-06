import { defineConfig, UserConfig } from 'vite'

export function createBaseConfig(): UserConfig {
  return defineConfig({
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            echarts: ['echarts'],
            'ant-design-vue': ['ant-design-vue'],
            s2: ['@antv/s2'],
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@tanstack/vue-query',
        'echarts',
        'ant-design-vue',
      ],
    },
  })
}

export default createBaseConfig
