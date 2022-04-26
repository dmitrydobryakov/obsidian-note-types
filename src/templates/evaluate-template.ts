import replaceAsync from 'string-replace-async'
import { evaluatePattern } from './evaluate-pattern'
import { parsePattern } from './parse-pattern'
import { evaluators, unresolved } from './config'
import { EvaluationContext } from './types'

/// Evaluate a template
export async function evaluateTemplate(text: string, context: EvaluationContext): Promise<string> {
	return replaceAsync(text, /{{(.*?)}}/g, async (_match, source) => {
		const parsed = parsePattern(source)
		return await evaluatePattern(parsed, evaluators, context, { unresolved })
	})
}
