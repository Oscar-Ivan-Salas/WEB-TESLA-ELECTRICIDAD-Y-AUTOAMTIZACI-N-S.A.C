import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-three': ['three', 'three-stdlib'],
            'vendor-r3f': ['@react-three/fiber', '@react-three/drei'],
          },
        },
      },
    },
    server: {
      port: 3002,
      host: '0.0.0.0',
      watch: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/C:/TeslaBimNMCache/**',
          '**/dist/**',
        ],
      },
    },
  };
});
