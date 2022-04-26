import { join } from 'path'
import { evaluateTemplate } from 'src/templates/evaluate-template'

/// Either template or raw text
type MaybeTemplate = { value: string; evaluate: boolean }
export const asTemplate = (value: string) => ({ value, evaluate: true })
export const asText = (value: string) => ({ value, evaluate: false })

/// Depending on whether MaybeTemplate is a template, evaluate it or leave as is
const maybeEvaluate = async (template: MaybeTemplate, context: any) =>
	template.evaluate
		? await evaluateTemplate(template.value, context)
		: template.value

/// Evaluate name, location and content templates
export async function evaluateNoteProperties({ nameTemplate, locationTemplate, contentsTemplate, context = { } }: {
	nameTemplate?: MaybeTemplate,
	locationTemplate?: MaybeTemplate,
	contentsTemplate?: MaybeTemplate,
	context?: any,
}) {

	// Evaluate note name
	const noteName = nameTemplate 
		? await maybeEvaluate(nameTemplate, context) 
		: context['this-name']
	context['this-name'] = noteName // make name accessible to the next (location and contents) evaluators

	// Evaluate note location
	const noteLocation = locationTemplate 
		? await maybeEvaluate(locationTemplate, context) 
		: context['this-folder']
	context['this-folder'] = noteLocation // make location accessible to the next (contents) evaluator

	const notePath = (noteName && noteLocation != null)
		? join(noteLocation, noteName + '.md')
		: undefined
	context['this-path'] = notePath // make path accessible as well

	// Evaluate note contents
	const noteContents = contentsTemplate 
		? await maybeEvaluate(contentsTemplate, context) 
		: context['this-content']

	return { noteName, noteLocation, noteContents, notePath }

}
