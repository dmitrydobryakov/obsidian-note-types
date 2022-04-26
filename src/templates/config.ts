import { ParsedPattern, EvaluatePattern } from './types'
import * as rs from './pattern-evaluators'

export function unresolved(pattern: ParsedPattern) {
	return `{{${pattern.source}}}`
}

export const evaluators: Map<string, EvaluatePattern> = new Map([
	['src-name', rs.src_name],
	['src-path', rs.src_path],
	['src-folder', rs.src_folder],
	['src-link', rs.src_link],
	['src', rs.src_frontmatter_field],
	['selection', rs.src_selection],
	['this-name', rs.this_name],
	['this-folder', rs.this_folder],
	['this-path', rs.this_path],
	['now', rs.now],
	['clipboard', rs.clipboard],
	['content', rs.content],
	['name', rs.name]
])
