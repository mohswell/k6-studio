import { describe, expect, it } from 'vitest'

import { toTypeScriptAst } from './code'
import { format } from './formatting/formatter'
import * as ir from './intermediate/ast'

function buildBrowserTest(): ir.Test {
  const page: ir.Identifier = { type: 'Identifier', name: 'page' }
  const goto: ir.GotoExpression = {
    type: 'GotoExpression',
    target: page,
    url: { type: 'StringLiteral', value: 'https://example.com' },
  }

  const defaultScenario: ir.DefaultScenario = {
    type: 'Scenario',
    name: 'default',
    body: [
      {
        type: 'ExpressionStatement',
        expression: goto,
      },
    ],
  }

  return {
    defaultScenario,
    scenarios: {},
  }
}

describe('browser network profile codegen', () => {
  it('injects fast3g network emulation settings', async () => {
    const test = buildBrowserTest()

    const program = toTypeScriptAst(test, { networkProfile: 'fast3g' })
    const script = await format(program)

    expect(script).toContain('__networkEmulation')
    expect(script).toContain('downstreamBw: 409600')
    expect(script).toContain('upstreamBw: 409600')
    expect(script).toContain('latency: 400')
  })

  it('injects slow3g network emulation settings', async () => {
    const test = buildBrowserTest()

    const program = toTypeScriptAst(test, { networkProfile: 'slow3g' })
    const script = await format(program)

    expect(script).toContain('downstreamBw: 51200')
    expect(script).toContain('upstreamBw: 51200')
    expect(script).toContain('latency: 2000')
  })

  it('omits network emulation when not requested', async () => {
    const test = buildBrowserTest()

    const program = toTypeScriptAst(test)
    const script = await format(program)

    expect(script).not.toContain('__networkEmulation')
  })
})
