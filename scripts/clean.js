#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const tasks = new Map([
  [
    'logs',
    [
      'api-dev.err.log',
      'api-dev.log',
      'web-dev.err.log',
      'web-dev.log',
      'tmp-next-dev.err.log',
      'tmp-next-dev.out.log',
      'apps/api/logs/combined.log',
      'apps/api/logs/error.log',
    ],
  ],
  ['next', ['apps/web/.next', 'apps/docs/.next']],
  ['turbo', ['.turbo', 'apps/web/.turbo', 'apps/api/.turbo', 'apps/docs/.turbo', 'packages/db/.turbo']],
])

const selected = process.argv.slice(2)
const requested = selected.length > 0 ? selected : Array.from(tasks.keys())

function removeTarget(relativePath) {
  const target = path.resolve(root, relativePath)

  if (!target.startsWith(root + path.sep)) {
    throw new Error(`Refusing to remove path outside project: ${relativePath}`)
  }

  if (!fs.existsSync(target)) {
    console.log(`skip ${relativePath}`)
    return
  }

  fs.rmSync(target, { recursive: true, force: true })
  console.log(`removed ${relativePath}`)
}

for (const taskName of requested) {
  const targets = tasks.get(taskName)

  if (!targets) {
    console.error(`Unknown clean task: ${taskName}`)
    console.error(`Available tasks: ${Array.from(tasks.keys()).join(', ')}`)
    process.exitCode = 1
    continue
  }

  for (const target of targets) {
    removeTarget(target)
  }
}
