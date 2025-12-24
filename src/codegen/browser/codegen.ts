import { toTypeScriptAst } from './code'
import { format } from './formatting/formatter'
import { toIntermediateAst } from './intermediate'
import { Test } from './types'

export type NetworkProfile = 'none' | 'fast3g' | 'slow3g'

export function emitScript(
  test: Test,
  opts?: { networkProfile?: NetworkProfile }
): Promise<string> {
  const intermediate = toIntermediateAst(test)
  const ast = toTypeScriptAst(intermediate, {
    networkProfile: opts?.networkProfile,
  })

  return format(ast)
}
