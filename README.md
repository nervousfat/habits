# 习惯打卡

按日期打卡、连续记录和完成情况统计。这是一个可独立运行、可独立上传 GitHub 的浏览器 demo。

## 本地运行

需要 Node.js 22 或更新版本，无第三方依赖，无需 npm install。

```powershell
cd habits
npm start
```

打开 http://127.0.0.1:4173 。在本项目目录执行 `npm test` 运行领域逻辑测试，`npm run check` 检查脚本语法。若同时启动多个项目，先使用 `$env:PORT=4174` 等不同端口。

## 数据与使用

所有处理在浏览器本地完成，不调用远程接口。数据型 demo 使用 localStorage；请使用导出备份功能保存重要数据。浏览器清理站点数据后，本地保存的记录会消失。请通过本地 HTTP 服务访问，不要直接双击 HTML。

## 目录

- `index.html`：页面入口
- `app.js`：界面和浏览器交互
- `core.js`：可测试的领域逻辑
- `core.test.js`：边界条件及行为测试
- `base.css` / `style.css`：界面样式
- `server.mjs`：仅监听本机的静态文件服务

## 提交检查

执行 `npm run history` 查看当前仓库提交总数、日期和代码变更量；执行 `npm run history -- --details` 查看逐条提交明细。

## 演示提交历史

本仓库于 2026-09-10 创建。提交日期按要求分布在 2025-04-29 至 2026-09-10，属于本次生成的演示历史，并不代表实际历时一年多的开发。提交包含实际代码、测试或文档变更，没有空提交；时间顺序严格递增。作者与提交者邮箱使用用户指定的邮箱，不使用本机 GitHub 身份。

本项目具有独立的 Git 历史，可单独推送到 GitHub；推送不会改变既有提交日期。GitHub 贡献图是否记录这些提交取决于提交邮箱是否已关联并验证，以及是否位于符合条件的仓库默认分支等规则，详见 [GitHub 官方说明](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference)。


## 使用与维护文档

- [数据模型](docs/data-model.md)：名称、日期、星期编号和日志约束。
- [日历与连续记录](docs/calendar-and-streaks.md)：今日宽限、最佳连续和完成率。
- [备份与恢复](docs/backups-and-recovery.md)：UTF-8 大小上限、替换导入与本地迁移。
- [测试与维护](docs/testing.md)：定向测试、时区验证和浏览器检查范围。
