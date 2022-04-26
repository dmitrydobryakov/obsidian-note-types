import { EvaluatePattern, maybeEvaluated, notEvaluated, evaluated } from './types'
import { obsidian } from 'src/global'
import { read } from 'clipboardy'
import moment from 'moment'

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Source note (src) – the note that is open when pattern is evaluated

/// Name of the source note
export const src_name: EvaluatePattern = () => {
	return maybeEvaluated(obsidian.openNote.name, 'No open note (cannot evaluate src-name)')
}

/// Path of the source note
export const src_path: EvaluatePattern = () => {
	return maybeEvaluated(obsidian.openNote.path, 'No open note (cannot evaluate src-path)')
}

/// Folder of the source note
export const src_folder: EvaluatePattern = () => {
	return maybeEvaluated(obsidian.openNote.folderPath, 'No open note (cannot evaluate src-folder)')
}

/// Link to the source note
export const src_link: EvaluatePattern = () => {
	return maybeEvaluated(obsidian.openNote.link, 'No open note (cannot evaluate src-link)')
}

/// Frontmatter field of the source note
export const src_frontmatter_field: EvaluatePattern = (pattern) => {
	const field = pattern.args.field; if (!field) return notEvaluated(`No 'field' argument (cannot evaluate src-frontmatter-field)`)
	return maybeEvaluated(obsidian.openNote.frontmatter?.[field], `Frontmatter field '${field}' is not defined (cannot evaluate src-frontmatter-field)`)
}

/// Selected text of the source note
export const src_selection: EvaluatePattern = () => {
	return maybeEvaluated(obsidian.openNote.selection, 'No open note (cannot evaluate src-selection')
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// This note (this) – the note with properties defined in note type settings (does not exist as a file)

const readFromContext: (name: string) => EvaluatePattern = (name: string) => 
	(_, context) => maybeEvaluated((context as any)[name], `'${name}' is not defined`)

export const this_name: EvaluatePattern = readFromContext('this-name')
export const this_folder: EvaluatePattern = readFromContext('this-folder')
export const this_path: EvaluatePattern = readFromContext('this-path')

////////////////////////////////////////////////////////////////////////////////////////////////////////

export const name: EvaluatePattern = (pattern, context, options) => {
	const fromContext = (context as any)['name']
	if (fromContext == undefined) return notEvaluated(`'name' is not defined`)
	const { value, special } = fromContext
	if (value != undefined) return evaluated(value)
	if (special === 'this-name') return this_name(pattern, context, options)
	return notEvaluated(`Cannot evaluate 'name'`)
}

/// Current date / time (now)
export const now: EvaluatePattern = (pattern, { now_format }) => {
	const DEFAULT_FORMAT = typeof now_format === 'string' ? now_format : 'YYMMDDHHmmss'
	const _now: (format?: string) => string = (format) => moment().format(format || DEFAULT_FORMAT)
	return evaluated(_now(pattern.args.arg_quotes ?? pattern.args.arg))
}

/// Value stored in clipboard
export const clipboard: EvaluatePattern = async () => {
	return evaluated(await read())
}

/// Contents of specified file
export const content: EvaluatePattern = async (pattern) => {
	if (!pattern.args.arg) return notEvaluated('No file specified (cannot evaluate content)')
	const content = pattern.args.arg_quotes
		? await obsidian.contentByPath(pattern.args.arg_quotes)
		: await obsidian.contentByLink(pattern.args.arg_link)
	return maybeEvaluated(content, 'Cannot read content (cannot evaluate content)')
}
