# 管理员手册

本项目把 Issue 当作候选线索，把 `resources/resources.json` 当作唯一正式数据库。任何用户提交的 Issue 都不会直接写入正式数据。

## 推荐资源处理流程

1. 用户使用“推荐新资源”Issue 模板提交信息。
2. 管理员检查链接、简介、风险说明和提交者关系披露。
3. 对已完成验证、确认收录的 Issue 评论：

   ```text
   ok
   ```

   如需补充或覆盖资源介绍，可在 `ok` 后继续写说明：

   ```text
   ok
   TVBox 二开影视 App，附带视频源，手机端和平板端适配较好。
   ```

   也可以使用带标签的写法：

   ```text
   ok
   简介：TVBox 二开影视 App，附带视频源，手机端和平板端适配较好。
   短介：TVBox 二开影视 App
   ```

4. 如果明确不收录，评论：

   ```text
   no
   ```

   GitHub Actions 会自动回复并关闭 Issue。
5. GitHub Actions 自动把资源加入正式数据库，并设置为 README 首页精选。
6. 自动任务会同步 README、检测精选资源可用性、校验数据，然后提交到默认分支并关闭 Issue。

自动发布的默认值：

- 状态为 `caution`，开源项目为 `recommended`
- 评分全部为 `4.0`
- `featured` 为 `true`
- `summary_short` 会从维护者补充说明或用户提交简介中自动生成
- 常见影视、网盘、磁力、订阅和播放器类资源默认标记较高版权风险

只有拥有仓库 `write`、`maintain` 或 `admin` 权限的人可以执行 `ok` / `no`。不要把该权限授予普通提交者。旧命令 `/approve-resource` 仍然可用。

## 回复 `ok` 前检查

- 主页是 HTTPS 链接，不是单部影视作品链接。
- 名称与简介中立，没有推广话术。
- Issue 分类、简介、风险说明和测试日期可信。
- 如用户简介不够适合首页展示，在 `ok` 后补充简介或短介。
- 只有确实值得在 README 展示的资源才回复 `ok`。
- 高风险、失效和权利通知按贡献指南记录到 `reports`。

## 自动更新范围

| 事件 | 自动结果 |
| --- | --- |
| 管理员在资源 Issue 评论 `ok` | 发布资源、更新 README、检测可用性并关闭 Issue |
| 管理员在资源 Issue 评论 `no` | 回复并关闭 Issue |
| `resources/resources.json` 发生变化 | 根据精选资源重新生成 README，并执行可用性检测 |
| 每天北京时间约 09:00 | 检测精选资源主页状态，更新 README 和 `reports/availability.json` |
| 每周日北京时间约 22:00 | 根据正式数据库、可用性报告和上一期周报生成 GitHub Release 周报 |

README 的精选榜单由 `scripts/sync-readme.mjs` 生成。不要直接修改 `<!-- featured-resources:start -->` 与 `<!-- featured-resources:end -->` 之间的内容，自动任务会覆盖这些修改。

每周 Release 由 `scripts/generate-weekly-release.mjs` 和 `.github/workflows/weekly-release.yml` 生成。Release tag 使用 `weekly-YYYY-Www` 格式，例如 `weekly-2026-W28`。首次没有上一期 tag 时，脚本会按本周新增日期生成摘要；后续会自动对比上一期周报 tag。

## 建议的仓库设置

- 为 `main` 开启分支保护时，确保 GitHub Actions 有权限提交自动发布结果，或允许该工作流绕过保护规则。
- 开启 Issue 和 Actions，并把 Workflow permissions 设置为可读写。
- 定期查看 Actions 失败记录、待验证 Issue 和权利人请求。
- 权利人请求和安全问题必须人工处理，不应自动批准或自动关闭。
