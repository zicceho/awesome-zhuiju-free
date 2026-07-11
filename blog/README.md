# Typecho 博客文章库

这个目录用于存放未来发布到 Typecho 博客的文章。每篇文章都按「复制正文到 Typecho 编辑器即可发布」的目标编写，尽量减少发布前二次整理。

## 目录约定

```text
blog/
├── README.md              # 写作与发布规范
├── _template.md           # Typecho 文章模板
└── articles/              # 正式文章或待发布草稿
```

文章文件建议放在 `articles/` 目录，命名格式：

```text
YYYY-MM-DD-文章主题.md
```

示例：

```text
2026-07-12-awesome-zhuiju-free-guide.md
```

## Typecho 复制规范

每篇文章顶部使用 HTML 注释保存发布信息：

```html
<!--
标题：文章标题
分类：使用教程
标签：追剧,免费影视,开源项目
Slug: article-slug
摘要：一句话说明文章价值。
-->
```

这段信息用于发布前填写 Typecho 的标题、分类、标签和自定义链接。复制到 Typecho 正文里通常不会显示在前台页面。

正文从文章标题后的导语开始即可直接复制。正文中可以保留：

- `<!--more-->`：Typecho 摘要分隔符。
- Markdown 标题、列表、表格、引用、代码块。
- 站内链接和 GitHub 链接。

## 推荐文章结构

一篇教程文章建议使用下面的节奏：

1. 先讲用户痛点：为什么需要这个教程。
2. 给出结论：读者能得到什么。
3. 分步骤操作：每一步尽量有明确动作。
4. 补充常见问题：减少评论区重复解释。
5. 结尾给入口：网站、GitHub、反馈渠道。

## 发布前检查

- 标题是否具体，避免只写「使用教程」。
- 首屏 3 段内是否说明了文章价值。
- 每个步骤是否能独立照做。
- 链接是否完整可点击。
- 是否包含 `<!--more-->`。
- 是否避免承诺「永久可用」「绝对安全」这类不准确表达。
- 是否说明资源可用性会随时间变化。

## 常用项目入口

- 网站：https://zhuiju.me
- GitHub：https://github.com/laoma2053/awesome-zhuiju-free
- Gitee 镜像：https://gitee.com/laoma2053/awesome-zhuiju-free
- 推荐新资源：https://github.com/laoma2053/awesome-zhuiju-free/issues/new?template=resource.yml
- 报告失效：https://github.com/laoma2053/awesome-zhuiju-free/issues/new?template=broken-link.yml
