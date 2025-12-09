@echo off
:: 配置当前脚本的代理环境（可选，若已配置系统环境变量可省略）
set HTTP_PROXY=http://127.0.0.1:7897
set HTTPS_PROXY=https://127.0.0.1:7897

npm run server