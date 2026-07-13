# 桌面灵感挂件：同类产品界面参考（2026-07-13）

本笔记只采用产品方/平台方的一手资料。目标不是复刻任何产品，而是提炼适合首版「一句话记录」挂件的界面习惯。

## 可直接参考的四个产品

### 1. Microsoft Sticky Notes：列表 + 单条便签

- [官方操作说明](https://support.microsoft.com/en-us/windows/apps/stickynotes/create-a-sticky-note) 展示的主路径是：从笔记列表左上角的 `+` 新建，或按 `Ctrl + N`；内容自动保存；关闭按钮位于单张便签右上角。
- 同一官方说明明确列表按最近修改时间倒序排列。这很适合我们的「刚记下的想法立刻出现在最上面」的需求。
- [官方无障碍指南](https://support.microsoft.com/en-us/accessibility/windows/stickynotes/use-a-screen-reader-with-sticky-notes) 说明：关闭只会把便签从桌面隐藏，之后可从“所有笔记”重新打开；列表还可以搜索。这是“关掉挂件但随时找回”的成熟交互。
- **界面参考**：一个小输入/便签窗口负责快速记录，另一个“全部记录”视图负责浏览；不要让长期列表挤占随手记录区。

### 2. OneNote Quick Notes：小窗口、全局唤起、置顶开关

- [Microsoft 官方 Quick Notes 说明](https://support.microsoft.com/en-us/onenote/onenote-help-and-learning/create-quick-notes) 将其描述为小型便签窗口：可随屏幕移动、可关闭且自动保存，并可在未打开 OneNote 时用 `Win + Alt + N` 新建。
- 该页面还提供 `View > Always on Top`，固定后可移动到任意屏幕位置；再次选择即可取消置顶。
- **界面参考**：标题栏不应只承担装饰：它应是稳定的拖动区域，右侧容纳“置顶/设置/关闭”等低频控制。全局快捷键唤出后应自动聚焦输入框。

### 3. Notezilla：专业桌面便签的“少而全”窗口控制

- [Notezilla 官方产品页与截图](https://www.conceptworld.com/Notezilla/Screenshots) 展示了带颜色、透明度、阴影及清单的桌面便签；产品将其定位为“不打断当前任务的快速记录”。
- [官方帮助文档](https://www.conceptworld.com/Notezilla/HelpTopic/Working-With-Sticky-Notes-Showing-Hiding-Sticky-Notes) 说明每张桌面便签可隐藏，并可从托盘图标菜单恢复；[官方版本介绍](https://www.conceptworld.com/Notezilla/WhatsNew) 展示了从任务栏按钮/右键菜单快速新建和把便签带到最前。
- [官方帮助 PDF](https://www.conceptworld.com/Downloads/Notezilla/Notezilla%20Help.pdf) 进一步说明：置顶是便签工具栏中的 Pin 按钮；“卷起/展开”可减少桌面占用；显示、隐藏、置前均可由托盘菜单或可配置快捷键完成。
- **界面参考**：为了常驻但不遮挡，挂件可提供“收起为一行标题”而非只有关闭；系统托盘菜单需要至少有“显示/隐藏”“新建/聚焦输入”“退出”三项。

### 4. Stickies：最小化、本地优先的传统便签

- [Stickies 官方概览](https://www.zhornsoftware.co.uk/stickies/) 展示的是经典黄色便签取向：便签能调整尺寸，重启后仍保留原来位置，数据保存在本地 SQLite 数据库中。
- [官方版本记录](https://www.zhornsoftware.co.uk/stickies/versions.html) 记录了通知区域（系统托盘）菜单和“单击托盘图标显示/隐藏全部”的行为。
- **界面参考**：本地优先产品也能有完整“显示/隐藏—恢复”的闭环；我们的首版可以借这个可靠性，但采用更现代、更克制的视觉。

## 首版推荐的界面方向

建议采用 **极简半透明卡片**，而非仿纸质便签：目标用户会长期常驻，视觉应轻、信息密度应高，也更方便未来加入深浅色主题。

```text
┌  灵感收集                                  ─  × ┐  ← 顶栏可拖动
│  写下此刻想做的事…                     [记录]   │  ← 输入框始终在顶部
│  ○ 做一个桌面灵感挂件                         ⋯ │
│  ○ 研究安卓与 Windows 同步                   ⋯ │  ← 最近 5–10 条，最新在上
│  ✓ 已完成的事（2）                            › │
│  查看全部记录                                      │
└──────────────────────────────────────────────┘  ← 边缘可缩放
```

- **顶部输入、回车保存**：直接对应 Sticky Notes / Quick Notes 的“立即输入 + 自动保存”模式；保存后清空输入框，焦点保留，支持连续记灵感。
- **最近记录显示 5–10 条**：按最近创建/修改倒序；超过范围交给“查看全部记录”，避免常驻窗变成长列表。
- **每条只保留完成与更多操作**：勾选完成后移至已完成；“更多”中放编辑与删除（删除再确认）。首版不出现分类、标签、提醒、富文本等噪音。
- **顶栏控制克制**：右上角仅最小化/收起和关闭；设置放进托盘或更多菜单。关闭是隐藏，不是退出。
- **常驻能力**：可拖动、边缘缩放、可选置顶；关闭后通过托盘菜单或 `Ctrl + Alt + Space` 显示/隐藏。将快捷键做成设置项，避免日后与其他软件冲突。

## 设计边界

首版不应做：多张自由散落便签、提醒、标签、富文本、云同步。它们都是成熟产品的扩展能力，但会削弱“一句话、两秒记录”的核心体验。未来 Android 与 Windows 同步时，可将本地条目模型预留为 `id / content / createdAt / updatedAt / completedAt`，同步层独立加入。
