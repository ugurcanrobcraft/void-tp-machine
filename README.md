# Void TP Machine - GitHub + Render Server

This repository contains the full code for **Void TP Machine** Add-on (Minecraft Bedrock 1.21.100+) along with a Node.js Express web portal ready to deploy on **Render.com**.

## Features
- **Express Web Server**: Serves a download portal and dynamically generates `.mcaddon` on `/download`.
- **Render Ready**: Includes `render.yaml` for 1-click Render deployment.
- **GitHub Actions**: Automatically builds `.mcaddon` artifacts on push.

## Deploying to Render
1. Push this repository to GitHub.
2. Sign in to [Render.com](https://render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` or use Build Command `npm install` & Start Command `node server.js`.
6. Access your public download page at `https://your-app.onrender.com`!
