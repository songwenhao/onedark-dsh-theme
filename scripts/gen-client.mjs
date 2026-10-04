// One-shot generator for lib/client.js: builds the three One Dark Pro token
// tables from the source palette and embeds them into the client bundle
// template. Run: node scripts/gen-client.mjs
//
// Palette source: One Dark Pro (https://github.com/Binaryify/OneDark-Pro,
// MIT). The three shipped flavors only shift the background ladder —
// editor.background / sideBar.background per the upstream OneDark-Pro*.json
// workbench sheets; the syntax accents are identical across all upstream
// variants. Token key set mirrors the alias/specific/shiki sheets shipped by
// @deepseek-ai/dsh-client-ui-theme.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const hex = (r, g, b) =>
	"#" + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("");

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

const rgba = (c, a) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

const WHITE = [255, 255, 255];

/** Secondary/tertiary text from the user's ChatGPT dark theme
 *  (chatgpt-dark.user.css — the "蓝灰 One Dark" reference look). */
const TEXT2 = [157, 163, 174]; // #9da3ae
const TEXT3 = [134, 140, 151]; // #868c97

/** Shared One Dark Pro accents (identical across every upstream variant). */
const ODP = {
	fg: [171, 178, 191], // #abb2bf
	fgDim: [92, 99, 112], // #5c6370 (comment)
	red: [224, 108, 117], // #e06c75
	green: [152, 195, 121], // #98c379
	yellow: [229, 192, 123], // #e5c07b
	orange: [209, 154, 102], // #d19a66
	blue: [97, 175, 239], // #61afef
	cyan: [86, 182, 194], // #56b6c2
	purple: [198, 120, 221], // #c678dd
	// chrome grays that upstream keeps constant across variants:
	hover: [44, 49, 58], // #2c313a (list.hoverBackground)
	raise: [62, 68, 82], // #3e4452 (focusBorder)
	button: [64, 71, 84], // #404754 (button.background)
};

/**
 * Per-flavor background ladder, taken verbatim from the upstream
 * OneDark-Pro*.json workbench sheets (editor.background / sideBar.background /
 * input.background / list.hoverBackground). `ladder` is the color the
 * layer-2/3 elevation steps mix toward — raise for the standard flavors,
 * hover for night-flat whose gap to raise would be too stark.
 */
const VARIANTS = [
	{
		id: "onedark-pro",
		bg: [40, 44, 52], // #282c34
		bgAlt: [33, 37, 43], // #21252b
		deep: [29, 31, 35], // #1d1f23
		layer1: ODP.hover,
		ladder: ODP.raise,
	},
	{
		id: "onedark-darker",
		bg: [35, 39, 46], // #23272e
		bgAlt: [30, 34, 39], // #1e2227
		deep: [29, 31, 35], // #1d1f23
		layer1: ODP.hover,
		ladder: ODP.raise,
	},
	{
		id: "onedark-night-flat",
		bg: [22, 25, 29], // #16191d
		bgAlt: [30, 34, 39], // #1e2227
		deep: [29, 31, 35], // #1d1f23
		layer1: [30, 34, 39], // #1e2227 — night-flat's elevated chrome
		ladder: ODP.hover,
	},
];

const DARK = {
	mask1: "rgba(0, 0, 0, 0.5)",
	mask2: "rgba(0, 0, 0, 0.2)",
	mask3: "rgba(0, 0, 0, 0.48)",
	maskPhoto: "rgba(0, 0, 0, 0.88)",
	skeleton: "rgba(255, 255, 255, 0.08)",
	inv: "rgba(255, 255, 255, 0.06)",
	inv2: "rgba(255, 255, 255, 0.08)",
};

function buildTokens(v) {
	const P = ODP;
	const L1 = v.layer1;
	const L2 = mix(L1, v.ladder, 0.35);
	const L3 = mix(L1, v.ladder, 0.6);
	const OV = mix(L1, v.ladder, 0.5);
	const M2 = mix(L1, v.ladder, 0.15); // multi-select / floating / tag
	const M1 = mix(v.bg, v.bgAlt, 0.5); // module platform / elevated
	const SOLID = mix(L1, v.ladder, 0.28); // hover-solid / toast / citation
	const SEGU = mix(v.bg, L1, 0.5); // unselected segment / selector / login input
	// ChatGPT-look code surfaces: an elevated panel one step LIGHTER than the
	// page (#282c34 -> #32373f on onedark-pro, same offset on every flavor),
	// banner merged into the body, inline code one step higher still
	// (#32373f -> #363a42) — the ladder chatgpt-dark.user.css paints.
	const CB = [v.bg[0] + 10, v.bg[1] + 11, v.bg[2] + 11];
	const INLINE = [CB[0] + 4, CB[1] + 3, CB[2] + 3];
	return {
		"--dsw-alias-bg-base": hex(...v.bg),
		"--dsw-alias-bg-layer-1": hex(...L1),
		"--dsw-alias-bg-layer-2": hex(...L2),
		"--dsw-alias-bg-layer-3": hex(...L3),
		"--dsw-alias-bg-mask-1": DARK.mask1,
		"--dsw-alias-bg-mask-2": DARK.mask2,
		"--dsw-alias-bg-mask-3": DARK.mask3,
		"--dsw-alias-bg-mask-photo": DARK.maskPhoto,
		"--dsw-alias-bg-module-platform": hex(...M1),
		"--dsw-alias-bg-multi-select": hex(...M2),
		"--dsw-alias-bg-overlay": hex(...OV),
		"--dsw-alias-bg-skeleton": DARK.skeleton,
		"--dsw-alias-border-inverted": DARK.inv,
		"--dsw-alias-border-inverted2": DARK.inv2,
		"--dsw-alias-border-l1": rgba(P.fg, 0.14),
		"--dsw-alias-border-l2-darkmode-thin": rgba(P.fg, 0.14),
		"--dsw-alias-border-l2": rgba(P.fg, 0.26),
		"--dsw-alias-border-l3": rgba(P.fg, 0.36),
		"--dsw-alias-border-l4": rgba(P.fg, 0.5),
		"--dsw-alias-brand-primary-invert": hex(...v.bg),
		"--dsw-alias-brand-primary-new-colorprimary-new-color": hex(...P.blue),
		"--dsw-static-deepseek-500": hex(...P.blue),
		"--dsw-static-deepseek-200": hex(...mix(P.blue, WHITE, 0.4)),
		"--dsw-static-blue-450": hex(...P.blue),
		"--dsw-static-blue-500": hex(...P.blue),
		"--dsw-static-neutral-bluish-400": hex(...P.fgDim),
		"--dsw-alias-brand-primary": hex(...P.blue),
		"--dsw-alias-brand-text": hex(...v.bg),
		"--dsw-alias-button-contrast-fill": hex(...P.button),
		"--dsw-alias-button-elevated-fill": hex(...M1),
		"--dsw-alias-button-floating-fill": hex(...M2),
		"--dsw-alias-button-floating-hover": hex(...M2),
		"--dsw-alias-button-ghost-active-border": rgba(P.fg, 0.4),
		"--dsw-alias-button-ghost-active-fill": hex(...L2),
		"--dsw-alias-button-ghost-active-hover": hex(...SOLID),
		"--dsw-alias-button-info-fill": hex(...P.cyan),
		"--dsw-alias-button-info-hover": hex(...mix(P.cyan, P.fg, 0.25)),
		"--dsw-odp-cyan": hex(...P.cyan),
		"--dsw-odp-orange": hex(...P.orange),
		"--dsw-odp-purple": hex(...P.purple),
		"--dsw-odp-blue": hex(...P.blue),
		"--dsw-alias-button-primary-dimmed": hex(...L2),
		"--dsw-alias-button-primary-fill": hex(...P.blue),
		"--dsw-alias-button-primary-hover": hex(...mix(P.blue, WHITE, 0.18)),
		"--dsw-alias-button-tool-bar-fill": rgba(P.fg, 0.16),
		"--dsw-alias-button-tool-bar-fill-invisible": rgba(P.fg, 0.11),
		"--dsw-alias-button-tool-bar-hover": rgba(P.fg, 0.22),
		"--dsw-alias-interactive-bg-active": rgba(P.blue, 0.2),
		"--dsw-alias-interactive-bg-hover-accent": rgba(P.blue, 0.28),
		"--dsw-alias-interactive-bg-hover-danger": rgba(P.red, 0.15),
		"--dsw-alias-interactive-bg-hover-solid": hex(...SOLID),
		"--dsw-alias-interactive-bg-hover": rgba(P.blue, 0.12),
		"--dsw-alias-label-caption": hex(...TEXT3),
		"--dsw-alias-label-dimmed": hex(...TEXT3),
		"--dsw-alias-label-primary-bluish": hex(...mix(P.fg, P.blue, 0.25)),
		"--dsw-alias-label-primary-dimmed": hex(...mix(P.fg, TEXT3, 0.5)),
		"--dsw-alias-label-primary-foreground": hex(...v.bg),
		"--dsw-alias-label-primary-inverted": hex(...v.bg),
		"--dsw-alias-label-primary": hex(...P.fg),
		"--dsw-alias-label-secondary": hex(...TEXT2),
		"--dsw-alias-label-tertiary": hex(...TEXT3),
		"--dsw-alias-markdown-citation": hex(...SOLID),
		"--dsw-alias-markdown-code-block-banner": hex(...CB),
		"--dsw-alias-markdown-code-block": hex(...CB),
		"--dsw-alias-markdown-code-segment-selected": hex(...M2),
		"--dsw-alias-markdown-code-segment-unselected": hex(...SEGU),
		"--dsw-alias-markdown-inline-code": hex(...INLINE),
		"--dsw-alias-markdown-placeholder": hex(...M1),
		"--dsw-alias-markdown-tag": hex(...M2),
		"--dsw-alias-scrollbar-bg-l1": hex(...L2),
		"--dsw-alias-scrollbar-bg-l2": hex(...SOLID),
		"--dsw-alias-scrollbar-hover-l1": hex(...mix(L1, v.ladder, 0.45)),
		"--dsw-alias-scrollbar-hover-l2": hex(...mix(L1, v.ladder, 0.5)),
		"--dsw-alias-state-business-primary": hex(...P.blue),
		"--dsw-alias-state-business-tertiary": hex(...L2),
		"--dsw-alias-state-error-primary": hex(...P.red),
		"--dsw-alias-state-error-secondary": hex(...mix(P.red, P.fg, 0.25)),
		"--dsw-alias-state-success-primary": hex(...P.green),
		"--dsw-alias-state-success-secondary": hex(...mix(P.green, P.fg, 0.3)),
		"--dsw-alias-state-success-tertiary": hex(...mix(L1, P.green, 0.15)),
		"--dsw-alias-state-warn-label": hex(...P.yellow),
		"--dsw-alias-state-warn-primary": hex(...mix(P.yellow, P.fg, 0.2)),
		"--dsw-alias-state-warn-secondary": hex(...mix(P.yellow, P.fg, 0.35)),
		"--dsw-alias-state-warn-tertiary": hex(...mix(L1, P.yellow, 0.15)),
		"--dsw-alias-toast-bg": hex(...SOLID),
		"--dsw-alias-tooltip-bg": hex(...L3),
		"--dsw-specific-bubble": hex(...mix(L1, P.blue, 0.08)),
		"--dsw-specific-bubble-highlight": hex(...mix(L1, P.blue, 0.22)),
		"--dsw-specific-input-major": hex(...v.deep),
		"--dsw-specific-login-input": hex(...SEGU),
		"--dsw-specific-menu": hex(...L3),
		"--dsw-specific-selector": hex(...SEGU),
		"--dsw-specific-sidebar-fill": hex(...v.bgAlt),
		"--dsw-specific-sidebar-nav-item-active-accent": hex(...mix(L1, P.blue, 0.3)),
		"--dsw-specific-sidebar-nav-item-active": hex(...SOLID),
		"--dsw-specific-sidebar-nav-item-hover": hex(...mix(v.bg, L1, 0.6)),
		"--dsw-specific-tip": hex(...M1),
		// ChatGPT 蓝灰主题的代码语法色（chatgpt-dark.user.css 的
		// --color-codex-syntax-* / --codeblock-syntax-*）：keyword 粉、
		// string 绿、literal 橙、name/function 蓝、variable 紫、comment 浅灰。
		"--shiki-foreground": hex(...P.fg),
		"--shiki-background": hex(...CB),
		"--shiki-token-constant": "#f1a275",
		"--shiki-token-string": "#83d197",
		"--shiki-token-comment": "#b9b9b9",
		"--shiki-token-keyword": "#f8a6c8",
		"--shiki-token-parameter": "#b897f4",
		"--shiki-token-function": "#63a8f8",
		"--shiki-token-string-expression": "#83d197",
		"--shiki-token-punctuation": hex(...TEXT2),
		"--shiki-token-link": "#66b5ff",
	};
}

const THEMES = VARIANTS.map((v) => ({ id: v.id, colorScheme: "dark", tokens: buildTokens(v) }));

function tokensBlock() {
	const out = [];
	for (const theme of THEMES) {
		out.push(`\t{\n\t\tid: "${theme.id}",\n\t\tcolorScheme: "${theme.colorScheme}",\n\t\ttokens: {`);
		for (const [key, value] of Object.entries(theme.tokens)) {
			out.push(`\t\t\t"${key}": "${value}",`);
		}
		out.push(`\t\t}\n\t},`);
	}
	return out.join("\n");
}

const CLIENT_TEMPLATE = `// onedark-dsh-theme — browser half (client plugin bundle).
//
// Loaded by dsh-client-modules at /plugins/onedark-dsh-theme/client.js and
// executed through the vendored cordis Loader's lazy-CJS module table
// (window.__ModuleLoader__.load). The factory body is plain CJS with
// require() resolved against the shell's module table — the same shape the
// shipped ui-* packages' tsdown bundles emit.
//
// Persistence note: the chosen theme is stored in localStorage. DSH's Host
// settings wire only exposes an allowlisted set of namespaces to browser
// clients (dsh-host-apiproxy's WEB_SETTINGS_NAMESPACES), so a third-party
// namespace would answer "settings-not-exposed"; the product itself keeps
// remote browser preferences process-local, and localStorage matches that
// boundary for a visual preference while surviving reloads on the same
// origin.
//
// Token tables are generated by scripts/gen-client.mjs from the One Dark Pro
// palette (https://github.com/Binaryify/OneDark-Pro, MIT); the key set
// mirrors the alias/specific/shiki sheets shipped by
// @deepseek-ai/dsh-client-ui-theme.
window.__ModuleLoader__.load({
	id: "onedark-dsh-theme",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _react = require("react");

		//#region onedark-dsh-theme: definitions
		/** The settings row's locale namespace. */
		const SETTINGS_NS = "settings.onedark";
		/** localStorage key holding the selected theme id. */
		const STORAGE_KEY = "onedark-dsh-theme:theme";
		/** localStorage key remembering the last built-in preference. */
		const RESTORE_KEY = "onedark-dsh-theme:restore";
		/** Sentinel meaning "no custom theme — follow the built-in appearance". */
		const DEFAULT_THEME = "system";

		/**
		 * The three curated themes. Each is a third-party theme for the built-in
		 * ThemeRuntime: an id, the base palette it builds on (colorScheme drives
		 * body[data-ds-dark-theme]), and token overrides applied as inline
		 * custom properties on <body> by ui-layout's ThemePresenter. Values are
		 * concrete colors (no var() indirection); the --shiki-* entries restore
		 * the canonical One Dark Pro code palette in markdown code blocks.
		 */
		const THEMES = [
__TOKENS__
		];

		/**
		 * Simplified Chinese dictionary (the key-set source of truth). Theme
		 * labels live under "theme.<id>" so the picker cards derive their key
		 * directly from the theme id — no id→key mapping to keep in sync.
		 */
		const zh = {
			"theme.title": "One Dark Pro 主题",
			"theme.default": "默认",
			"theme.onedark-pro": "One Dark Pro",
			"theme.onedark-darker": "One Dark Pro Darker",
			"theme.onedark-night-flat": "One Dark Pro Night Flat"
		};

		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"theme.title": "One Dark Pro themes",
			"theme.default": "Default",
			"theme.onedark-pro": "One Dark Pro",
			"theme.onedark-darker": "One Dark Pro Darker",
			"theme.onedark-night-flat": "One Dark Pro Night Flat"
		};
		//#endregion

		//#region onedark-dsh-theme: persistence
		/** Read a localStorage string value (null on absence or error). */
		function readStorage(key) {
			try {
				const value = window.localStorage.getItem(key);
				return typeof value === "string" ? value : null;
			} catch {
				return null;
			}
		}

		/** Write (or remove with null) a localStorage value. */
		function writeStorage(key, value) {
			try {
				if (value === null) window.localStorage.removeItem(key);
				else window.localStorage.setItem(key, value);
			} catch {
				// storage unavailable / quota — the preference stays process-local
			}
		}

		/** Saved theme id (may be unknown/absent). */
		function readSavedTheme() {
			return readStorage(STORAGE_KEY);
		}

		/** Persist a theme choice; DEFAULT_THEME clears the stored value. */
		function writeSavedTheme(id) {
			writeStorage(STORAGE_KEY, id === DEFAULT_THEME ? null : id);
		}

		/**
		 * Remember a built-in preference (system/light/dark) whenever the
		 * runtime is not on one of our themes, so turning the theme off
		 * hands the user back exactly what they had before the plugin —
		 * instead of dropping them onto "system".
		 */
		function rememberBuiltinPreference(preference) {
			if (THEMES.some((themeDefinition) => themeDefinition.id === preference)) return;
			if (preference === "light" || preference === "dark" || preference === DEFAULT_THEME) {
				writeStorage(RESTORE_KEY, preference);
			}
		}

		/** The preference to restore when turning the theme off (default: system). */
		function readRestoredPreference() {
			const raw = readStorage(RESTORE_KEY);
			return raw === "light" || raw === "dark" ? raw : DEFAULT_THEME;
		}
		//#endregion

		//#region onedark-dsh-theme: settings row subscription
		/**
		 * Theme row subscription: the row reads the live theme preference
		 * through _react.useSyncExternalStore, so the plugin only owns a
		 * listener set it pokes on theme/change. Since DSH 0.1.2 the frozen
		 * module table has no dsh-client-runtime (its slots role moved to
		 * dsh-client-ui-renderer), so nothing in this bundle may require()
		 * that package — snapshot stores are plugin-owned here.
		 */
		const themeListeners = new Set();
		function emitTheme() {
			for (const listener of [...themeListeners]) listener();
		}
		//#endregion

		//#region onedark-dsh-theme: settings row
		/** Inline style sheet for the row (kept dependency-free). */
		const styles = {
			group: {
				borderBottom: "1px solid var(--dsw-alias-border-l2)",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
				padding: "16px 0"
			},
			title: {
				color: "var(--dsw-alias-label-primary)",
				fontSize: "14px",
				fontWeight: 400,
				lineHeight: "22px"
			},
			grid: {
				display: "flex",
				flexWrap: "wrap",
				gap: "10px"
			},
			card: {
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: "6px",
				width: "96px",
				padding: "3px",
				borderRadius: "10px",
				// Longhands, not the border shorthand: React removes borderColor
				// on deselect, and with the shorthand gone too the remaining
				// width/style fall back to currentColor (black/white border).
				borderWidth: "2px",
				borderStyle: "solid",
				borderColor: "transparent",
				background: "transparent",
				cursor: "pointer",
				font: "inherit",
				boxSizing: "border-box"
			},
			cardSelected: {
				borderColor: "var(--dsw-alias-brand-primary)",
				background: "var(--dsw-alias-interactive-bg-hover)"
			},
			cardLabel: {
				color: "var(--dsw-alias-label-secondary)",
				fontSize: "12px",
				lineHeight: "16px",
				// wrap, don't clip: the upstream flavor names outgrow the 96px card
				whiteSpace: "normal",
				overflowWrap: "break-word"
			},
			cardLabelSelected: {
				color: "var(--dsw-alias-label-primary)"
			},
			swatch: {
				width: "100%",
				height: "52px",
				borderRadius: "8px",
				boxSizing: "border-box",
				padding: "8px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				gap: "6px"
			},
			swatchLine: {
				height: "7px",
				borderRadius: "4px"
			},
			defaultSwatch: {
				width: "100%",
				height: "52px",
				borderRadius: "8px",
				boxSizing: "border-box",
				display: "flex",
				overflow: "hidden",
				border: "1px solid var(--dsw-alias-border-l2)"
			}
		};

		/** Mini palette preview driven by one theme's token table. The
		 *  background must be bg-base and the first line the sidebar fill:
		 *  those are the only tokens that differ between the three flavors
		 *  (layer-1 is shared by pro/darker, so a layer-1 swatch would render
		 *  two identical cards). */
		function ThemeSwatch({ tokens }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				style: {
					...styles.swatch,
					background: tokens["--dsw-alias-bg-base"],
					border: "1px solid " + tokens["--dsw-alias-border-l2"]
				},
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						style: {
							...styles.swatchLine,
							width: "70%",
							background: tokens["--dsw-specific-sidebar-fill"]
						}
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: {
							...styles.swatchLine,
							width: "45%",
							background: tokens["--dsw-alias-brand-primary"]
						}
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: {
							...styles.swatchLine,
							width: "55%",
							background: tokens["--dsw-alias-label-primary"],
							opacity: 0.85
						}
					})
				]
			});
		}

		/** "Default" chip: follow the built-in appearance (light + dark halves). */
		function DefaultSwatch() {
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.defaultSwatch,
				children: [
					(0, react_jsx_runtime.jsx)("div", { style: { flex: 1, background: "#f4f4f5" } }),
					(0, react_jsx_runtime.jsx)("div", { style: { flex: 1, background: "#1c1c20" } })
				]
			});
		}

		/** One selectable theme card. */
		function ThemeCard({ theme, selected, onSelect, t }) {
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onSelect,
				"aria-pressed": selected,
				style: {
					...styles.card,
					...(selected ? styles.cardSelected : {})
				},
				children: [
					(0, react_jsx_runtime.jsx)(ThemeSwatch, { tokens: theme.tokens }),
					(0, react_jsx_runtime.jsx)("span", {
						style: {
							...styles.cardLabel,
							...(selected ? styles.cardLabelSelected : {})
						},
						children: t("theme." + theme.id)
					})
				]
			});
		}

		/**
		 * Theme picker row registered into the Settings → General item slot,
		 * right after the built-in Appearance row: title + a "Default" chip and
		 * one swatch card per curated theme.
		 */
		function ThemeRow({ t, setTheme, getTheme, subscribeTheme }) {
			const theme = _react.useSyncExternalStore(subscribeTheme, getTheme);
			const selected = THEMES.some((candidate) => candidate.id === theme) ? theme : null;
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.group,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.title,
						children: t("theme.title")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						style: styles.grid,
						children: [
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setTheme(DEFAULT_THEME),
								"aria-pressed": selected === null,
								style: {
									...styles.card,
									...(selected === null ? styles.cardSelected : {})
								},
								children: [
									(0, react_jsx_runtime.jsx)(DefaultSwatch, {}),
									(0, react_jsx_runtime.jsx)("span", {
										style: {
											...styles.cardLabel,
											...(selected === null ? styles.cardLabelSelected : {})
										},
										children: t("theme.default")
									})
								]
							}),
							THEMES.map((themeDefinition) => (0, react_jsx_runtime.jsx)(ThemeCard, {
								theme: themeDefinition,
								selected: selected === themeDefinition.id,
								onSelect: () => setTheme(themeDefinition.id),
								t
							}, themeDefinition.id))
						]
					})
				]
			});
		}
		//#endregion

		//#region onedark-dsh-theme: client plugin body
		/**
		 * Required services: theme runtime (registration and switching), the
		 * settings slot and locale (the picker row). Persistence is
		 * localStorage, so no settings transport is needed.
		 */
		const inject = [
			"slots",
			"locale",
			"theme"
		];

		/**
		 * Client plugin body: register the three themes into the theme runtime,
		 * restore the saved theme, keep the row store in sync with
		 * theme/change, and register the picker row into Settings → General.
		 * @param ctx - client cordis context.
		 */
		function apply(ctx) {
			const disposers = THEMES.map((themeDefinition) => ctx.theme.register(themeDefinition));
			ctx.effect(() => () => {
				for (const dispose of disposers) dispose();
			}, "onedark-dsh-theme: theme registration");

			// Component-level color accents, mirroring dsh-catppuccin: user
			// bubble tint, composer + button, tool call labels, timestamps,
			// sidebar hovers, homepage gradient and more. Selectors are
			// boosted with :not(#dsh-onedark) to out-rank the shipped
			// ui-* sheets (injected after ours at equal specificity), and
			// the whole sheet mounts only while one of our themes is
			// active — the Default preference stays pixel-identical.
			const boost = (selector) =>
				selector.split(",").map((part) => \`\${part.trim()}:not(#dsh-onedark)\`).join(",");
			const SURFACE_RULES = [
				[
					'[class$="_userStack"] [class$="_bubble"]',
					'  background: color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent);'
				],
				[
					'button[class$="_add"][aria-haspopup="listbox"]',
					'  color: var(--dsw-odp-cyan);'
				],
				[
					'[class$="_refChip"]',
					'  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent);'
				],
				[
					'[class$="_thinkBody"]',
					'  color: color-mix(in srgb, var(--dsw-odp-orange) 72%, var(--dsw-alias-label-tertiary));'
				],
				[
					'[class$="_QWLzlG_title"]',
					'  color: var(--dsw-odp-orange);'
				],
				[
					'[class$="_o3BgMG_title"]',
					'  color: var(--dsw-odp-cyan);'
				],
				[
					'[class$="_infostring"]',
					[
						'  display: inline-block;',
						'  background: rgba(255, 255, 255, 0.06);',
						'  border-radius: 6px;',
						'  padding: 2px 8px;',
						'  font-size: 12px;',
						'  color: var(--dsw-alias-label-secondary);'
					].join('\\n')
				],
				[
					'pre',
					'  border-radius: 12px;'
				],
				[
					'[class$="_timeStart"]',
					'  color: var(--dsw-odp-purple);'
				],
				[
					'[class$="o3BgMG_summary"]',
					'  color: color-mix(in srgb, var(--dsw-odp-cyan) 55%, var(--dsw-alias-label-tertiary));'
				],
				[
					'[class$="QWLzlG_summary"]',
					'  color: color-mix(in srgb, var(--dsw-odp-orange) 55%, var(--dsw-alias-label-tertiary));'
				],
				[
					'[class$="_title_9cl6j_64"]:not([class$="QWLzlG_title"]):not([class$="o3BgMG_title"])',
					'  color: var(--dsw-odp-blue);'
				],
				[
					'[class*="_copyButton"]:hover',
					'  color: var(--dsw-alias-brand-primary);'
				],
				[
					'[class$="p-xYUq_actions"] button:hover, [class$="Sxvs8a_actions"] button:hover, [class$="_7yHdaG_actions"] button:hover, [class$="osXY9a_actions"] button:hover',
					'  color: var(--dsw-alias-brand-primary);'
				],
				[
					'[class$="YDXeBa_selected"] [class$="YDXeBa_title"]',
					'  color: var(--dsw-alias-brand-primary);'
				],
				[
					'[class$="YDXeBa_title"]:hover',
					'  color: var(--dsw-alias-brand-primary);'
				],
				[
					'[class$="YDXeBa_time"]',
					'  color: var(--dsw-odp-purple);'
				],
				[
					'[class~="hHd-Xa_newSessionLabel"]:hover',
					'  color: var(--dsw-alias-brand-primary);'
				],
				[
					'[class~="hHd-Xa_iconButton"]:hover, [class~="qDHVXG_iconButton"]:hover, [class~="qDHVXG_searchButton"]:hover, [class~="YDXeBa_iconButton"]:hover',
					'  color: var(--dsw-alias-brand-primary);'
				],
				[
					'[class~="VOzbGW_trigger"]:hover',
					'  color: var(--dsw-alias-brand-primary);'
				],
				[
					'[class$="wSkVaW_crumbCurrent"]',
					'  color: var(--dsw-alias-brand-primary);'
				],
				[
					'[class$="pXSMma_headlineText"]',
					[
						'  background: linear-gradient(90deg, var(--dsw-odp-orange), var(--dsw-odp-cyan), var(--dsw-alias-brand-primary));',
						'  -webkit-background-clip: text;',
						'  background-clip: text;',
						'  -webkit-text-fill-color: transparent;',
						'  color: transparent;'
					].join('\\n')
				],
				[
					'[class$="pXSMma_workspaceLabel"]',
					'  color: var(--dsw-odp-purple);'
				],
				[
					'[class$="pXSMma_previewBadge"]',
					'  color: var(--dsw-alias-state-warn-label);'
				],
				[
					'[class$="_7KE1Ra_triggerEffort"]',
					'  color: var(--dsw-odp-purple);'
				],
				[
					'[class$="Sh0Q9G_triggerLabel"]:hover, [class$="_7KE1Ra_triggerLabel"]:hover',
					'  color: var(--dsw-alias-brand-primary);'
				],
				[
					'[class$="_7KE1Ra_option"]:hover:not(:disabled), [class$="mufS8W_row"]:hover',
					'  color: var(--dsw-alias-brand-primary);'
				],
				[
					'[class$="uV2eYG_card"]:hover',
					'  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 55%, transparent);'
				],
				[
					'[class$="uV2eYG_primary"]:hover',
					'  filter: brightness(1.08);'
				],
				[
					'[class$="uV2eYG_primary"]:is([aria-label="停止"],[aria-label="Stop"])',
					[
						'  background: var(--dsw-alias-state-error-primary);',
						'  filter: none;'
					].join('\\n')
				]
			].map(([selector, body]) => \`\${boost(selector)} {\\n\${body}\\n}\`).join("\\n")
				// ::before must stay out of boost(): a pseudo-element has to end
				// its selector, so :not() appended after it would invalidate the
				// rule. Nothing else defines this rule — no boost needed.
				+ '\\n[class$="_infostring"]::before {\\n  content: "</>";\\n  margin-right: 6px;\\n  opacity: 0.65;\\n  font-family: var(--ds-font-family-code);\\n}\\n';
			const style = document.createElement("style");
			style.textContent = SURFACE_RULES;
			const syncSurfaceTint = () => {
				const active = THEMES.some((themeDefinition) => themeDefinition.id === ctx.theme.getTheme().preference);
				if (active && !style.isConnected) document.head.appendChild(style);
				if (!active && style.isConnected) style.remove();
			};
			syncSurfaceTint();
			ctx.on("theme/change", syncSurfaceTint);
			ctx.effect(() => () => {
				style.remove();
			}, "onedark-dsh-theme: surface tint lifecycle");

			// Restore the saved theme. The ThemeService adopts its durable
			// built-in preference from the Host settings scope asynchronously
			// after boot, and re-adopts it on every settings-document reload
			// — switching a model rewrites the settings doc and clobbers our
			// third-party preference back to the document's value ("system"
			// when never written, or a persisted light/dark). So instead of
			// a one-shot boot window, defend on every theme/change.
			//
			// The one seam that tells "the user clicked light/dark in the
			// Appearance row THIS session" apart from "adopt() copied the
			// settings document at boot/reload" is the setTheme wrapper:
			// adopt() writes the runtime preference directly and never goes
			// through setTheme. A built-in preference only wins while it
			// matches a live explicit pick; values adopted from the document
			// (livePick null) are stale for us — the theme row choice is
			// newer than the document's light/dark — so the theme is
			// re-applied then. Picking a theme clears the record.
			let liveBuiltinPick = null;
			const originalSetTheme = ctx.theme.setTheme;
			ctx.theme.setTheme = (id) => {
				liveBuiltinPick = id === "light" || id === "dark" || id === DEFAULT_THEME ? id : null;
				originalSetTheme.call(ctx.theme, id);
			};
			const reassertSaved = () => {
				const current = ctx.theme.getTheme().preference;
				if ((current === "light" || current === "dark") && current === liveBuiltinPick) return;
				const latest = readSavedTheme();
				if (typeof latest === "string" && latest !== DEFAULT_THEME && THEMES.some((themeDefinition) => themeDefinition.id === latest)) {
					ctx.theme.setTheme(latest);
				}
			};
			reassertSaved();

			// Durable two-layer persistence: localStorage is the instant
			// layer, the host's onedark-state.json (under $DSH_HOME)
			// survives Desktop's per-launch port churn where localStorage
			// always starts empty. Hydrate once at boot when localStorage
			// has no choice, then debounce-flush every change to the file.
			const STATE_ROUTE = "/onedark/state";
			let stateTimer = null;
			const flushState = () => {
				const saved = readSavedTheme();
				fetch(STATE_ROUTE, {
					method: "PUT",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ version: 1, theme: saved })
				}).catch(() => {
					// best-effort; localStorage still holds the choice
				});
			};
			const scheduleFlush = () => {
				if (stateTimer !== null) clearTimeout(stateTimer);
				stateTimer = setTimeout(() => {
					stateTimer = null;
					flushState();
				}, 300);
			};
			const hydrateFromFile = async () => {
				if (readSavedTheme() !== null) return;
				try {
					const response = await fetch(STATE_ROUTE);
					if (!response.ok) return;
					const state = await response.json();
					const theme = state && typeof state.theme === "string" && THEMES.some((themeDefinition) => themeDefinition.id === state.theme) ? state.theme : null;
					if (theme !== null) {
						writeSavedTheme(theme);
						if (ctx.theme.getTheme().preference === DEFAULT_THEME) ctx.theme.setTheme(theme);
					}
				} catch {
					// route absent (older host) — localStorage-only mode
				}
			};
			hydrateFromFile();

			ctx.on("theme/change", (snapshot) => {
				emitTheme();
				const pref = snapshot.preference;
				// Record the built-in preference on every non-theme
				// observation (boot, adopt() reloads, explicit Appearance
				// changes) BEFORE any re-assert, so turning the theme off
				// can hand the user back exactly what they had.
				rememberBuiltinPreference(pref);
				// If the preference moved to another plugin's third-party theme,
				// drop our stored choice so only the last-picked plugin restores
				// at boot (both plugins must implement this convention).
				if (pref !== DEFAULT_THEME && pref !== "light" && pref !== "dark" && !THEMES.some((themeDefinition) => themeDefinition.id === pref)) {
					writeSavedTheme(DEFAULT_THEME);
				}
				// Re-assert from a fresh task: a re-entrant setTheme inside the
				// dispatch is missed by other subscribers (ui-layout's
				// ThemePresenter), so the restored theme would never reach the DOM.
				scheduleFlush();
				setTimeout(() => {
					reassertSaved();
				}, 0);
			});

			ctx.effect(() => ctx.locale.register(SETTINGS_NS, {
				zh,
				en
			}), "onedark-dsh-theme: settings row dictionaries");

			const themeInjected = () => ({
				setTheme: (id) => {
					// persist first: setTheme publishes a synchronous
					// theme/change, so the re-assert handler must already
					// see the new saved value (otherwise toggling back to
					// the default re-applies the old theme)
					writeSavedTheme(id);
					// turning the theme off restores the user's last
					// built-in preference instead of forcing "system"
					ctx.theme.setTheme(id === DEFAULT_THEME ? readRestoredPreference() : id);
					scheduleFlush();
				},
				getTheme: () => ctx.theme.getTheme().preference,
				subscribeTheme: (listener) => {
					themeListeners.add(listener);
					return () => {
						themeListeners.delete(listener);
					};
				}
			});
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "onedark",
				order: 20,
				locale: SETTINGS_NS,
				inject: themeInjected
			}, ThemeRow));

			ctx.effect(() => () => {
				if (stateTimer !== null) clearTimeout(stateTimer);
				// undo the setTheme wrapper so a stopped plugin leaves the
				// runtime as it found it
				ctx.theme.setTheme = originalSetTheme;
			}, "onedark-dsh-theme: state flush timer");
		}
		//#endregion

		exports.SETTINGS_NS = SETTINGS_NS;
		exports.THEMES = THEMES;
		exports.DEFAULT_THEME = DEFAULT_THEME;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
`;

writeFileSync(join(root, "lib/client.js"), CLIENT_TEMPLATE.replace("__TOKENS__", tokensBlock()));
console.log("wrote lib/client.js");
