# One Dark Pro for DeepSeek Harness

Atom 的传奇 **One Dark Pro** 配色（[Binaryify/OneDark-Pro](https://github.com/Binaryify/OneDark-Pro)，MIT）移植到 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的主题插件，一套包覆盖三个端：

- 🌐 **Web GUI**（`dsh web`）与 **DSH Desktop**
- 💻 **dsh-TUI**（终端客户端）

主题注册进内置主题系统，与 light/dark/system 选项同级：在 **Settings → General** 一键切换、记住选择。代码块采用 ChatGPT 式悬浮面板（比页面亮一档、圆角、`</>` 语言胶囊头部），语法色沿用 [chatgpt-dark.user.css](../chatgpt-dark.user.css)（蓝灰 One Dark 风格）的 codex 配色。

## 主题

| 主题 | 主背景 | 侧栏/工具区 | 说明 |
| --- | --- | --- | --- |
| **One Dark Pro** | `#282c34` | `#21252b` | 经典默认外观 |
| **One Dark Pro Darker** | `#23272e` | `#1e2227` | 整体更深一档 |
| **One Dark Pro Night Flat** | `#16191d` | `#1e2227` | 近纯黑的 OLED 友好变体 |

三个变体只调整背景梯度，语法色与上游各变体完全一致。每个颜色都取自上游 `OneDark-Pro*.json` 工作区配色与 `tokenColors` 语法色的规范值，没有默认的 DeepSeek 蓝灰残留。

## 安装

**DSH Desktop：**

```sh
dsh plugin --profile desktop add github:songwenhao/onedark-dsh-theme
```

**Web GUI：**

```sh
dsh plugin --profile web add github:songwenhao/onedark-dsh-theme
```

**dsh-TUI（终端主题）：**

```sh
dsh plugin --profile dsh-tui add github:songwenhao/onedark-dsh-theme
```

然后在 TUI 内选择主题：`/theme onedark-pro`（另有 `onedark-darker`、`onedark-night-flat`）。

> 本地目录安装同样可用：`dsh plugin --profile desktop add /path/to/onedark-dsh-theme`。
> 装完 Web/Desktop 后重启 `dsh web` 或 DSH Desktop 生效。

## 使用

打开 Web UI / DSH Desktop，进入 **Settings → General**，在 "One Dark Pro 主题" 一行选择三个主题之一（或 **默认** 跟随内置外观）。

- 选择保存在浏览器 `localStorage`，并在 `$DSH_HOME/onedark-state.json` 留有持久副本 —— Desktop 每次启动端口随机变化、localStorage 清空时也能恢复。
- 切回 **默认** 会恢复你之前在内置 Appearance 里选的 light/dark/system，而不是强制回到 "system"。
- 关闭/卸载插件即完全还原内置外观，零残留。

## 设计映射

DSH 的主题运行时接受一组 `--dsw-alias-*` / `--dsw-specific-*` 别名 token，本插件把 One Dark Pro 的规范色映射上去：

- **背景阶梯**：`#282c34`（编辑器底）→ `#2c313a`（悬浮）→ `#3e4452`（凸起），侧栏用 `#21252b`、输入框用 `#1d1f23`，全部照搬上游工作区配色。
- **品牌色**：`#61afef`（One Dark Pro 蓝）用于链接、选中、气泡着色；实心按钮配深色文字保证对比度。
- **代码块（ChatGPT 观感）**：代码区比页面亮一档（Pro 上即 `#32373f`），头部条与代码区同色，行内代码 `#363a42`，附加 CSS 提供圆角与 `</>` 语言胶囊。
- **语法色**（代码块 shiki token，取自 chatgpt-dark.user.css 的 codex 配色）：keyword `#f8a6c8`、string `#83d197`、literal/constant `#f1a275`、function/name `#63a8f8`、variable/parameter `#b897f4`、comment `#b9b9b9`、link `#66b5ff`。
- **文字层级**：正文 `#abb2bf`、次级 `#9da3ae`、三级 `#868c97`，与 ChatGPT 主题一致。

## 开发

```sh
node scripts/gen-client.mjs      # 重新生成 lib/client.js（token 表 → 浏览器 bundle）
node scripts/gen-tui-themes.mjs  # 重新生成 themes/tui/*.json
```

调色板与映射公式都在这两个脚本里；改完运行即可，不要手改 `lib/client.js`。

## 致谢

- [Binaryify/OneDark-Pro](https://github.com/Binaryify/OneDark-Pro) — One Dark Pro 主题（MIT）
- [zhijun-dai/Solarized-dsh-theme](https://github.com/zhijun-dai/Solarized-dsh-theme) — 本插件移植所参照的 dsh 主题插件结构（MIT）
- [DeepSeek](https://github.com/deepseek-ai) — DeepSeek Harness

## License

[MIT](LICENSE) © 2026-present onedark-dsh-theme contributors
