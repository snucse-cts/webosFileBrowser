# WebOS File Browser

This is a file browser app for WebOS. It is built with Enact.

## How to install on WebOS device

```bash
cd webosFileBrowserApp
npm run pack
cd ..
ares-package webosFileBrowserApp/dist webosFileBrowserService
ares-install --device <device_name> ./io.webosfilebrowser_1.0.0_all.ipk
```
