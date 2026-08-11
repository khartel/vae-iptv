import { cpSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

cpSync(
  path.join(root, 'webos-meta', 'appinfo.json'),
  path.join(root, 'dist', 'appinfo.json'),
)
cpSync(
  path.join(root, 'webos-meta', 'icon.png'),
  path.join(root, 'dist', 'icon.png'),
)
cpSync(
  path.join(root, 'webos-meta', 'largeIcon.png'),
  path.join(root, 'dist', 'largeIcon.png'),
)

console.log('Copied webOS manifest + icons into dist/')
