import { EvaluatePattern, EvaluationContext, EvaluationOptions, EvaluatedPattern, ParsedPattern } from './types'

/// Notice: returns a string (while evaluators return EvaluatedPattern)
export async function evaluatePattern(
	pattern: ParsedPattern,
	evaluators: Map<string, EvaluatePattern>, 
	context: EvaluationContext,
	options: EvaluationOptions,
): Promise<string> {

	const { unresolved } = options

	/// Find a suitable evaluator. Return a special value defined by 'unresolved' if there is none.
	const evaluator = evaluators.get(pattern.name)
	if (!evaluator) return unresolved(pattern)

	/// Run a suitable evaluator. If not evaluated successfully – return a special value defined by 'unresolved'.
	const evaluated = await evaluator(pattern, context, options)
	if (!evaluated.success()) return unresolved(pattern)

	return evaluated.value

}
