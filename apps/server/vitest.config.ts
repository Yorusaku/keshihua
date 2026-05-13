import { defineConfig } from 'vitest/config';  
import { resolve } from 'path';  
  
export default defineConfig({  
  test: {  
    globals: true,  
    environment: 'node',  
    include: ['test/**/*.spec.ts'],  
    testTimeout: 15000,  
  },  
  resolve: {  
    alias: { '@': resolve(__dirname, 'src') },  
  },  
}); 
