import { MarkdownPostProcessorContext, Menu, App, Workspace, PluginSettingTab } from 'obsidian'
import NoteTypesPlugin from '../main'
import { lnCreateOpenModal } from './ui-modals'
import { obsidian } from '../global'
import CodeMirror from 'codemirror'
import { getClickableTokenAt } from 'src/lib/getClickableTokenAt'

//////////////////////////////////////////////////////////////////////////////////////////////////
/// Utils

const parents: (node: Element) => Element[] = node => 
	(node.parentElement ? parents(node.parentElement) : [ ]).concat([ node ])

const isChild = (node: Element, of: Element) => parents(node).includes(of)

const unresolvedLinkText = (editor: CodeMirror.Editor, event: MouseEvent) => {
	const pos = editor.coordsChar({ left: event.clientX, top: event.clientY }, 'window')
	const clickableToken = getClickableTokenAt(editor, pos)
	if (!clickableToken || clickableToken.type !== 'internal-link') return undefined
	if (obsidian.linkPath(clickableToken.text)) return undefined	// note exists
	return clickableToken.text
}

const getCodeMirrors = (app: App) => {
	const codemirrors: CodeMirror.Editor[] = [ ]
	app.workspace.iterateCodeMirrors(cm => codemirrors.push(cm))
	return codemirrors
}

//////////////////////////////////////////////////////////////////////////////////////////////////

export function registerContextMenuCommands(plugin: NoteTypesPlugin) {
	registerContextMenuPreview(plugin)
	registerContextMenuEditor(plugin)
}

/// Custom Menu that should open when you right-click on an unresolved link 
function createContextMenu(plugin: NoteTypesPlugin, href: string) {
	const menu = new Menu(plugin.app)
	return menu.addItem(item => {
		item.setTitle('Create with selected type')
		item.setIcon('create-new')
		item.onClick(() => {
			// Use href as note name
			lnCreateOpenModal(href).open()
		})
	})
}

function registerContextMenuPreview(plugin: NoteTypesPlugin) {

	const mdPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {

		// Find all links
		const links = Array.from(el.querySelectorAll('.internal-link'))

		// Listen to 'contextmenu' event on all links
		for (const link of links) {

			link.addEventListener('contextmenu', e => {

				// If the link is resolved – do nothing
				const link = e.target as Element
				if (!link.hasClass('is-unresolved')) return
				
				// Otherwise prevent any default behavior
				e.preventDefault()

				/// And show a custom menu

				// Make sure event is a MouseEvent
				if (!(e instanceof MouseEvent)) return

				// Create a custom menu and pass in the link as a string
				const href = (link as HTMLLinkElement).dataset.href
				const menu = createContextMenu(plugin, href)

				// This will choose a menu corner to put into the cursor position, to make sure the menu is visible on the screen
				;(menu as any).showAtMouseEvent(e)

			})

		}

	}

	plugin.registerMarkdownPostProcessor(mdPostProcessor)

}

function registerContextMenuEditor(plugin: NoteTypesPlugin) {

	const codemirrors: { cm: CodeMirror.Editor, events: any[] } [ ] = [ ]
	
	plugin.registerCodeMirror(cm => {

		const onContextMenu = onEditorContextMenu(cm, plugin)

		// Have to add a capturing event listener to the document (and not codemirror) to override default menu (and avoid some strange behavior)
		document.addEventListener('contextmenu', onContextMenu, true)

		// Save codemirror to be able to unregister unnecessary document events
		codemirrors.push({ cm, events: [ onContextMenu ] })

	})

	// Remove events for unused codemirrors
	plugin.app.workspace.on('layout-change', () => { 

		const usedCodemirrors = getCodeMirrors(plugin.app)
		for (const codemirror of codemirrors) {
			const { cm, events } = codemirror

			// Skip if codemirror is in use
			if (usedCodemirrors.includes(cm)) continue

			// Remove codemirror from saved codemirrors
			codemirrors.remove(codemirror)

			// Remove events
			for (const event of events)
				document.removeEventListener('contextmenu', event, true)

		}

	})

	// Looks like Obsidian API does not provide a way to register capturing events – let's unload them manually
	plugin.register(() => {
		for (const { events } of codemirrors)
			for (const event of events)
				document.removeEventListener('contextmenu', event, true)
	})

}

function onEditorContextMenu(cm: CodeMirror.Editor, plugin: NoteTypesPlugin) {

	return function(e: MouseEvent) {

		// Check if this instance of codemirror was clicked
		if (!isChild(e.target as Element, cm.getScrollerElement())) return

		// Check if an unresolved link was clicked
		const name = unresolvedLinkText(cm, e)
		if (name != undefined) {
			e.stopPropagation()
			const menu = createContextMenu(plugin, name)
			;(menu as any).showAtMouseEvent(e)
		}

	}

}

//////////////////////////////////////////////////////////////////////////////////////////////////

var ENABLE_CLICK_LINK = false

export function registerClickLink(plugin: NoteTypesPlugin, enable: boolean) {

	ENABLE_CLICK_LINK = enable

	const mdPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {

		// Find all links
		const links = Array.from(el.querySelectorAll('.internal-link'))

		// Listen to 'contextmenu' event on all links
		for (const link of links) {

			link.addEventListener('mousedown', e => {

				if (!ENABLE_CLICK_LINK) return

				// Make sure event is a MouseEvent
				if (!(e instanceof MouseEvent)) return

				// Handle left button clicks only
				if ((e as MouseEvent).button !== 0) return

				// If the link is resolved – do nothing
				const link = e.target as Element
				if (!link.hasClass('is-unresolved')) return
				
				// Otherwise prevent any default behavior
				e.preventDefault()

				// Open command modal directly
				const href = (link as HTMLLinkElement).dataset.href
				lnCreateOpenModal(href).open()

			})

		}

	}

	plugin.registerMarkdownPostProcessor(mdPostProcessor)

}

export function enableClickLink(plugin: NoteTypesPlugin) {
	ENABLE_CLICK_LINK = true
}

export function disableClickLink(plugin: NoteTypesPlugin) {
	ENABLE_CLICK_LINK = false
}
