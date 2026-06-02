import { strict as assert } from 'assert'

const store: Record<string, string> = {}
let htmlClass = ''
globalThis.localStorage = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  get length() { return Object.keys(store).length },
  key: (i: number) => Object.keys(store)[i] ?? null
} as any

function createDarkMode() {
  let isDark = false
  function apply(val: boolean) { isDark = val; htmlClass = val ? 'dark' : ''; localStorage.setItem('dark-mode', val ? 'true' : 'false') }
  function toggle() { apply(!isDark) }
  function init() {
    const saved = localStorage.getItem('dark-mode')
    if (saved === null) apply(false)
    else apply(saved === 'true')
  }
  return { get isDark() { return isDark }, toggle, init }
}

let passed = 0, failed = 0
function test(name: string, fn: () => void) {
  try {
    Object.keys(store).forEach(k => delete store[k]); htmlClass = ''
    fn(); passed++; console.log(`  ✅ ${name}`)
  } catch (e: any) { failed++; console.log(`  ❌ ${name}: ${e.message}`) }
}

console.log('📋 深色模式测试\n')
test('默认 isDark = false', () => { const dm = createDarkMode(); assert.equal(dm.isDark, false) })
test('toggle 后 isDark = true', () => { const dm = createDarkMode(); dm.toggle(); assert.equal(dm.isDark, true) })
test('toggle 两次恢复', () => { const dm = createDarkMode(); dm.toggle(); dm.toggle(); assert.equal(dm.isDark, false) })
test('toggle 添加 dark class', () => { const dm = createDarkMode(); dm.toggle(); assert.equal(htmlClass, 'dark') })
test('toggle 两次移除 dark class', () => { const dm = createDarkMode(); dm.toggle(); dm.toggle(); assert.equal(htmlClass, '') })
test('localStorage 保存偏好', () => { const dm = createDarkMode(); dm.toggle(); assert.equal(localStorage.getItem('dark-mode'), 'true') })
test('从 localStorage 恢复', () => { localStorage.setItem('dark-mode', 'true'); const dm = createDarkMode(); dm.init(); assert.equal(dm.isDark, true) })
test('localStorage false 不开启', () => { localStorage.setItem('dark-mode', 'false'); const dm = createDarkMode(); dm.init(); assert.equal(dm.isDark, false) })

console.log(`\n--- 结果: ${passed} 通过, ${failed} 失败 ---`)
if (failed > 0) process.exit(1)
