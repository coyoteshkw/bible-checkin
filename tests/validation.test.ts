// 测试章节验证逻辑
import { strict as assert } from 'assert'
import { validateCheckIn } from '../server/utils/validation'

let passed = 0
let failed = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (e: any) {
    console.log(`  ❌ ${name}: ${e.message}`)
    failed++
  }
}

console.log('📋 章节验证测试\n')

// ====== 测试 1: 有效章节 ======
test('有效章节通过验证', () => {
  const errors = validateCheckIn({
    book: '创世记',
    chapter_start: 1,
    chapter_end: 10
  })
  assert.equal(errors.length, 0)
})

// ====== 测试 2: 超出范围的章 ======
test('拒绝超出书卷范围的章 (创世记 51 章)', () => {
  const errors = validateCheckIn({
    book: '创世记',
    chapter_start: 51
  })
  assert.ok(errors.length > 0, '应该有验证错误')
  assert.equal(errors[0].field, 'chapter_start')
  assert.ok(errors[0].message.includes('50'), `错误信息应该提到最大章数 50，实际: ${errors[0].message}`)
})

// ====== 测试 3: 结束章 < 起始章 ======
test('拒绝结束章小于起始章 (10→5)', () => {
  const errors = validateCheckIn({
    book: '创世记',
    chapter_start: 10,
    chapter_end: 5
  })
  assert.ok(errors.length > 0)
  assert.equal(errors[0].field, 'chapter_end')
})

// ====== 测试 4: 结束节 < 起始节 ======
test('拒绝结束节小于起始节 (10→5)', () => {
  const errors = validateCheckIn({
    book: '创世记',
    chapter_start: 1,
    verse_start: 10,
    verse_end: 5
  })
  assert.ok(errors.length > 0)
  assert.equal(errors[0].field, 'verse_end')
})

// ====== 测试 5: 单章书卷 ======
test('单章书卷 (俄巴底亚书 1 章) 通过', () => {
  const errors = validateCheckIn({
    book: '俄巴底亚书',
    chapter_start: 1
  })
  assert.equal(errors.length, 0)
})

// ====== 测试 6: 未选书卷 ======
test('拒绝未选择书卷', () => {
  const errors = validateCheckIn({
    book: '',
    chapter_start: 1
  })
  assert.ok(errors.length > 0)
})

// ====== 测试 7: 边界值 ======
test('诗篇 150 章通过', () => {
  const errors = validateCheckIn({
    book: '诗篇',
    chapter_start: 150
  })
  assert.equal(errors.length, 0)
})

test('拒绝诗篇 151 章', () => {
  const errors = validateCheckIn({
    book: '诗篇',
    chapter_start: 151
  })
  assert.ok(errors.length > 0)
})

test('单节打卡 (无结束节) 通过', () => {
  const errors = validateCheckIn({
    book: '创世记',
    chapter_start: 1,
    verse_start: 16,
    verse_end: null
  })
  assert.equal(errors.length, 0)
})

console.log(`\n--- 结果: ${passed} 通过, ${failed} 失败 ---`)
if (failed > 0) process.exit(1)
