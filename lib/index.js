/**
 * onedark-dsh-theme — host half.
 *
 * One exact webServer route (the same pattern the shipped ui-* packages
 * use), mirroring dsh-catppuccin:
 *   - `/onedark/state` (GET / PUT): durable theme persistence in a small
 *     JSON file under `$DSH_HOME` (`onedark-state.json`), written
 *     atomically (temp + rename). The browser localStorage is the instant
 *     layer; this file survives DSH Desktop's random per-launch loopback
 *     port, where localStorage (scoped per origin, port included) always
 *     starts empty.
 *
 * `webServer` is a hard inject dependency so this half only activates where
 * the service is live (headless profiles have none and stay inert).
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))

export const name = 'onedark'
export const inject = ['webServer']

const STATE_PATH = '/onedark/state'
const STATE_FILENAME = 'onedark-state.json'

/* ------------------------------ durable state ------------------------------ */

function dshHome() {
  return process.env.DSH_HOME || join(homedir(), '.dsh')
}

function stateFilePath() {
  return join(dshHome(), STATE_FILENAME)
}

/** Read the durable state; absent or unparseable means none yet. */
function readDurableState() {
  try {
    const parsed = JSON.parse(readFileSync(stateFilePath(), 'utf8'))
    if (typeof parsed !== 'object' || parsed === null) return null
    return parsed
  } catch {
    return null
  }
}

/** Write atomically: temp file + rename over the target (mode 0600 keeps
 *  the preference private; a failed rename leaves the previous file). */
function writeDurableState(state) {
  const path = stateFilePath()
  mkdirSync(dirname(path), { recursive: true })
  const tmp = `${path}.tmp`
  writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 })
  renameSync(tmp, path)
}

/* ---------------------------------- http ----------------------------------- */

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

/** Cordis entry: register the route and release it on teardown. */
export function apply(ctx) {
  const webServer = ctx.get('webServer')
  if (webServer === undefined) return
  const dispose = webServer.register({
    kind: 'exact',
    path: STATE_PATH,
    handler: async (req, res) => {
      if (req.method === 'GET') {
        json(res, 200, readDurableState() ?? {})
        return
      }
      if (req.method === 'PUT') {
        try {
          const parsed = JSON.parse(await readBody(req))
          if (typeof parsed !== 'object' || parsed === null) throw new Error('bad body')
          writeDurableState(parsed)
          json(res, 200, { ok: true })
        } catch (error) {
          json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
        }
        return
      }
      json(res, 405, { ok: false, error: 'method not allowed' })
    },
  })
  ctx.effect(() => dispose, 'onedark-dsh-theme: host routes')
}
