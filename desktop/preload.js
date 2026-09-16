/* Cầu nối tối thiểu giữa ứng dụng và giao diện.
   Giao diện KHÔNG được chạm vào Node — mọi việc đi qua đúng ba hàm dưới đây. */
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('GITA_DESKTOP', {
  ban: true,
  nenTang: process.platform,
  phienBan: () => ipcRenderer.invoke('gita:phien-ban')
});
