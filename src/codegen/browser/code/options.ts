import { TSESTree as ts } from '@typescript-eslint/types'

import { fromObjectLiteral } from '@/codegen/estree'
import { exhaustive } from '@/utils/typescript'

import * as ir from '../intermediate/ast'

function isBrowserScenario(scenario: ir.Scenario) {
  function visitAssertion(node: ir.Assertion): boolean {
    switch (node.type) {
      case 'TextContainsAssertion':
      case 'IsVisibleAssertion':
      case 'IsHiddenAssertion':
      case 'IsCheckedAssertion':
      case 'IsNotCheckedAssertion':
      case 'IsIndeterminateAssertion':
      case 'IsAttributeEqualToAssertion':
      case 'HasValueAssertion':
        return true

      default:
        return exhaustive(node)
    }
  }

  function visit(node: ir.Node): boolean {
    switch (node.type) {
      case 'ExpressionStatement':
        return visit(node.expression)

      case 'NewPageExpression':
      case 'GotoExpression':
      case 'ReloadExpression':
      case 'NewRoleLocatorExpression':
      case 'NewLabelLocatorExpression':
      case 'NewCssLocatorExpression':
      case 'NewAltTextLocatorExpression':
      case 'NewPlaceholderLocatorExpression':
      case 'NewTitleLocatorExpression':
      case 'NewTestIdLocatorExpression':
      case 'ClickExpression':
      case 'ClickOptionsExpression':
      case 'FillTextExpression':
      case 'CheckExpression':
      case 'SelectOptionsExpression':
      case 'WaitForExpression':
      case 'WaitForOptionsExpression':
      case 'WaitForNavigationExpression':
        return true

      case 'Identifier':
      case 'StringLiteral':
      case 'PromiseAllExpression':
        return false

      case 'VariableDeclaration':
        return visit(node.value)

      case 'ExpectExpression':
        return visit(node.actual) || visitAssertion(node.expected)

      default:
        return exhaustive(node)
    }
  }

  return scenario.body.some(visit)
}

function getNetworkSettings(profile?: string) {
  const profiles: Record<
    string,
    { downstreamBw: number; upstreamBw: number; latency: number }
  > = {
    fast3g: {
      downstreamBw: 400 * 1024,
      upstreamBw: 400 * 1024,
      latency: 400,
    },
    slow3g: {
      downstreamBw: 50 * 1024,
      upstreamBw: 50 * 1024,
      latency: 2000,
    },
  }

  return profile ? profiles[profile] : undefined
}

function emitBrowserOptions(_scenario: ir.Scenario, networkProfile?: string) {
  if (!isBrowserScenario(_scenario)) {
    return undefined
  }

  const networkSettings = getNetworkSettings(networkProfile)

  const browserOptions = {
    type: 'chromium' as const,
    ...(networkSettings && {
      __networkEmulation: fromObjectLiteral(networkSettings),
    }),
  }

  return fromObjectLiteral({
    browser: fromObjectLiteral(browserOptions),
  })
}

function emitSharedIterationsExecutor(
  options: ts.ObjectExpression | undefined,
  exec?: string
) {
  return fromObjectLiteral({
    executor: 'shared-iterations',
    exec,
    options,
  })
}

function emitExecutor(
  scenario: ir.Scenario,
  exec?: string,
  networkProfile?: string
) {
  const options = emitBrowserOptions(scenario, networkProfile)

  return emitSharedIterationsExecutor(options, exec)
}

function emitScenarioOptions(
  { defaultScenario, scenarios }: ir.Test,
  networkProfile?: string
) {
  const withDefaultScenario = defaultScenario
    ? {
        [defaultScenario.name ?? 'default']: emitExecutor(
          defaultScenario,
          undefined,
          networkProfile
        ),
      }
    : {}

  const withNamedScenarios = Object.entries(scenarios).reduce(
    (acc, [name, scenario]) => {
      acc[name] = emitExecutor(scenario, name, networkProfile)

      return acc
    },
    withDefaultScenario
  )

  return fromObjectLiteral(withNamedScenarios)
}

export function emitOptions(test: ir.Test, networkProfile?: string) {
  return fromObjectLiteral({
    scenarios: emitScenarioOptions(test, networkProfile),
  })
}
