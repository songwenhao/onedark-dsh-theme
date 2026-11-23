#!/usr/bin/env node
/**
 * Generate themes/tui/*.json — One Dark Pro themes for dsh-TUI
 * (dropped into ~/.dsh-tui/themes/, see dsh-TUI docs/themes.md).
 *
 * Palette is the canonical One Dark Pro set (Binaryify/OneDark-Pro, MIT) —
 * the same source the web half's gen-client.mjs builds on. The 95-key
 * dsh-TUI colour plan follows One Dark Pro's own editor conventions:
 * keyword = purple, string = green, comment = base01 gray, number/constant
 * = orange, function = blue, type = yellow, variable = red, operator =
 * cyan; semantic keys: success = green, error = red, warning = yellow,
 * merged = accent (blue — the web brand); brand/interaction group = blue;
 * diff backgrounds at 15% alpha (word 20%); shimmer variants blend the
 * base colour 30% towards text; rainbow slots hue-match the seven dsh-TUI
 * slots (indigo = cyan, violet = purple — One Dark Pro ships seven hues).
 *
 * The three flavors only differ in the surface ramp, mirroring the
 * upstream OneDark-Pro*.json workbench sheets. 20261123: the onedark-pro
 * ramp is lifted one step to match onedark-zcode-theme v0.1.5.
 *
 * Run: node scripts/gen-tui-themes.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(root, 'themes', 'tui')

/** All keys of the dsh-TUI Theme type, in declaration order — the loader
 *  skips unknown keys, so this doubles as a guard against typos. */
const THEME_KEYS = [
  'autoAccept', 'bashBorder', 'claude', 'toolNameMutate', 'toolNameExec',
  'claudeShimmer', 'claudeBlue_FOR_SYSTEM_SPINNER', 'claudeBlueShimmer_FOR_SYSTEM_SPINNER',
  'permission', 'permissionShimmer', 'planMode', 'ide', 'promptBorder', 'promptBorderShimmer',
  'text', 'inverseText', 'inactive', 'inactiveShimmer', 'subtle', 'suggestion', 'remember',
  'background', 'success', 'error', 'warning', 'merged', 'warningShimmer',
  'diffAdded', 'diffRemoved', 'diffAddedDimmed', 'diffRemovedDimmed', 'diffAddedWord', 'diffRemovedWord',
  'toolCardBackground', 'toolCardBackgroundDim',
  'toolDotExec', 'toolDotRead', 'toolDotWrite', 'toolDotWeb', 'toolDotTask',
  'syntaxKeyword', 'syntaxString', 'syntaxComment', 'syntaxNumber', 'syntaxFunction',
  'syntaxType', 'syntaxVariable', 'syntaxOperator', 'syntaxPunctuation', 'syntaxConstant',
  'red_FOR_SUBAGENTS_ONLY', 'blue_FOR_SUBAGENTS_ONLY', 'green_FOR_SUBAGENTS_ONLY',
  'yellow_FOR_SUBAGENTS_ONLY', 'purple_FOR_SUBAGENTS_ONLY', 'orange_FOR_SUBAGENTS_ONLY',
  'pink_FOR_SUBAGENTS_ONLY', 'cyan_FOR_SUBAGENTS_ONLY',
  'professionalBlue', 'chromeYellow', 'clawd_body', 'clawd_background',
  'userMessageBackground', 'userMessageBackgroundHover', 'messageActionsBackground',
  'selectionBg', 'bashMessageBackgroundColor', 'memoryBackgroundColor',
  'rate_limit_fill', 'rate_limit_empty', 'fastMode', 'fastModeShimmer',
  'briefLabelYou', 'briefLabelClaude',
  'rainbow_red', 'rainbow_orange', 'rainbow_yellow', 'rainbow_green', 'rainbow_blue',
  'rainbow_indigo', 'rainbow_violet',
  'rainbow_red_shimmer', 'rainbow_orange_shimmer', 'rainbow_yellow_shimmer',
  'rainbow_green_shimmer', 'rainbow_blue_shimmer', 'rainbow_indigo_shimmer', 'rainbow_violet_shimmer',
  'subagentBullet', 'subagentDescription', 'subagentModel', 'subagentElapsed',
  'subagentToolName', 'subagentStatusRunning', 'subagentStatusCompleted', 'subagentStatusFailed',
]

/* ---------------- colour helpers (all palette-canonical) ---------------- */

const channels = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const toHex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`

/** Blend colour `a` towards colour `b` by ratio t (0..1); shimmer variants. */
function blend(p, a, b, t) {
  const [ar, ag, ab] = channels(p[a])
  const [br, bg, bb] = channels(p[b])
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t])
}

/** Palette colour + alpha byte (diff bgs 15%/20%, selection 25%). */
function alpha(p, name, ratio) {
  return p[name] + Math.round(ratio * 255).toString(16).padStart(2, '0')
}

/* ----------------------- normalized palette builders ----------------------- */

const HEX = {
  red: '#e06c75',
  green: '#98c379',
  yellow: '#e5c07b',
  orange: '#d19a66',
  blue: '#61afef',
  purple: '#c678dd',
  cyan: '#56b6c2',
}

/** Per-flavor surface ramp from the upstream workbench sheets:
 *  base = editor.background, surface0/1 = sideBar/tabs chrome,
 *  surface2 = focusBorder (prompt border). */
const PALETTES = {
  // 20261123: onedark-pro 阶梯整体上提一档（与 onedark-zcode-theme v0.1.5 对齐），
  // base/surface0-1/surface2 = #2c313a / #262b34 / #475062；Darker 与 Night Flat 原档不动。
  'onedark-pro': {
    ...HEX,
    base: '#2c313a', text: '#abb2bf', sub: '#8f96a3', dim: '#5c6370', punct: '#787f8c',
    surface0: '#262b34', surface1: '#262b34', surface2: '#475062',
  },
  'onedark-darker': {
    ...HEX,
    base: '#23272e', text: '#abb2bf', sub: '#8f96a3', dim: '#5c6370', punct: '#787f8c',
    surface0: '#1e2227', surface1: '#1e2227', surface2: '#3e4452',
  },
  'onedark-night-flat': {
    ...HEX,
    base: '#16191d', text: '#abb2bf', sub: '#8f96a3', dim: '#5c6370', punct: '#787f8c',
    surface0: '#1e2227', surface1: '#1e2227', surface2: '#3e4452',
  },
}

/* ------------------------------ colour plan ------------------------------ */

function buildColors(p) {
  const shimmer = (name) => blend(p, name, 'text', 0.3)
  const accent = 'blue' // matches the web half's brand

  return {
    autoAccept: p[accent],
    bashBorder: p.purple,
    claude: p[accent],
    toolNameMutate: p.yellow,
    toolNameExec: p.cyan,
    claudeShimmer: shimmer(accent),
    claudeBlue_FOR_SYSTEM_SPINNER: p[accent],
    claudeBlueShimmer_FOR_SYSTEM_SPINNER: shimmer(accent),
    permission: p[accent],
    permissionShimmer: shimmer(accent),
    planMode: p.green,
    ide: p[accent],
    promptBorder: p.surface2,
    promptBorderShimmer: p[accent],
    text: p.text,
    inverseText: p.base,
    inactive: p.sub,
    inactiveShimmer: p.text,
    subtle: p.dim,
    suggestion: p[accent],
    remember: p[accent],
    background: p[accent],
    success: p.green,
    error: p.red,
    warning: p.yellow,
    merged: p[accent],
    warningShimmer: shimmer('yellow'),
    diffAdded: alpha(p, 'green', 0.15),
    diffRemoved: alpha(p, 'red', 0.15),
    diffAddedDimmed: alpha(p, 'green', 0.08),
    diffRemovedDimmed: alpha(p, 'red', 0.08),
    diffAddedWord: alpha(p, 'green', 0.2),
    diffRemovedWord: alpha(p, 'red', 0.2),
    toolCardBackground: p.surface0,
    toolCardBackgroundDim: p.dim,
    toolDotExec: p.green,
    toolDotRead: p.cyan,
    toolDotWrite: p[accent],
    // stays blue so the five tool dots remain distinguishable
    toolDotWeb: p.blue,
    toolDotTask: p.purple,
    // One Dark Pro's own editor mapping: keyword purple, string green,
    // number/constant orange, function blue, type yellow, variable red.
    syntaxKeyword: p.purple,
    syntaxString: p.green,
    syntaxComment: p.dim,
    syntaxNumber: p.orange,
    syntaxFunction: p.blue,
    syntaxType: p.yellow,
    syntaxVariable: p.red,
    syntaxOperator: p.cyan,
    syntaxPunctuation: p.punct,
    syntaxConstant: p.orange,
    red_FOR_SUBAGENTS_ONLY: p.red,
    blue_FOR_SUBAGENTS_ONLY: p.blue,
    green_FOR_SUBAGENTS_ONLY: p.green,
    yellow_FOR_SUBAGENTS_ONLY: p.yellow,
    purple_FOR_SUBAGENTS_ONLY: p.purple,
    orange_FOR_SUBAGENTS_ONLY: p.orange,
    // One Dark Pro ships seven hues — pink doubles as the red-pink.
    pink_FOR_SUBAGENTS_ONLY: p.red,
    cyan_FOR_SUBAGENTS_ONLY: p.cyan,
    professionalBlue: p[accent],
    chromeYellow: p.yellow,
    clawd_body: p.orange,
    clawd_background: p.base,
    // userMessageBackground omitted: built-in bases define '' (no fill)
    userMessageBackgroundHover: alpha(p, 'surface0', 0.5),
    messageActionsBackground: p.surface0,
    selectionBg: alpha(p, 'blue', 0.25),
    bashMessageBackgroundColor: alpha(p, 'surface0', 0.6),
    memoryBackgroundColor: alpha(p, 'surface0', 0.6),
    rate_limit_fill: p[accent],
    rate_limit_empty: p.surface1,
    fastMode: p.orange,
    fastModeShimmer: shimmer('orange'),
    briefLabelYou: p.yellow,
    briefLabelClaude: p[accent],
    // seven ODP hues over seven slots: indigo = cyan, violet = purple
    rainbow_red: p.red,
    rainbow_orange: p.orange,
    rainbow_yellow: p.yellow,
    rainbow_green: p.green,
    rainbow_blue: p.blue,
    rainbow_indigo: p.cyan,
    rainbow_violet: p.purple,
    rainbow_red_shimmer: shimmer('red'),
    rainbow_orange_shimmer: shimmer('orange'),
    rainbow_yellow_shimmer: shimmer('yellow'),
    rainbow_green_shimmer: shimmer('green'),
    rainbow_blue_shimmer: shimmer('blue'),
    rainbow_indigo_shimmer: shimmer('cyan'),
    rainbow_violet_shimmer: shimmer('purple'),
    subagentBullet: p.purple,
    subagentDescription: p.text,
    subagentModel: p.sub,
    subagentElapsed: p.sub,
    subagentToolName: p[accent],
    subagentStatusRunning: p[accent],
    subagentStatusCompleted: p.green,
    subagentStatusFailed: p.red,
  }
}

/* --------------------------------- emit ---------------------------------- */

const THEMES = [
  { id: 'onedark-pro', label: 'One Dark Pro', base: 'dark' },
  { id: 'onedark-darker', label: 'One Dark Pro Darker', base: 'dark' },
  { id: 'onedark-night-flat', label: 'One Dark Pro Night Flat', base: 'dark' },
]

const HEX_VALUE = /^(?:#[0-9a-f]{6}(?:[0-9a-f]{2})?|)$/

mkdirSync(OUT_DIR, { recursive: true })
for (const { id, label, base } of THEMES) {
  const colors = buildColors(PALETTES[id])

  // Guard: keys exactly the dsh-TUI Theme set minus deliberately omitted
  // keys, values well-formed (the TUI loader skips bad entries per key).
  const omitted = new Set(['userMessageBackground'])
  delete colors.userMessageBackground
  const keys = Object.keys(colors)
  const expected = THEME_KEYS.filter((k) => !omitted.has(k))
  if (keys.join(',') !== expected.join(',')) {
    const missing = expected.filter((k) => !keys.includes(k))
    const extra = keys.filter((k) => !expected.includes(k))
    throw new Error(`${id}: key mismatch — missing: ${missing}, extra: ${extra}`)
  }
  for (const [key, value] of Object.entries(colors)) {
    if (!HEX_VALUE.test(value)) throw new Error(`${id}: bad value for ${key}: ${value}`)
  }

  const file = join(OUT_DIR, `${id}.json`)
  writeFileSync(
    file,
    `${JSON.stringify(
      { name: id, displayName: label, base, colors },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log(`wrote ${file} (${keys.length} keys)`)
}
