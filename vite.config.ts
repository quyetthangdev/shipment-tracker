import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // hoặc dùng '0.0.0.0' nếu muốn truy cập từ mạng LAN
    port: 5173, // hoặc để trống nếu muốn port bất kỳ
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok-free.app', // Cho phép tất cả subdomain ngrok
      '.ngrok.io',       // Cho phép cả domain ngrok cũ
      'https://40da179abbf3.ngrok-free.app' // Host cụ thể của bạn
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
