import { shCreateOpen, shCreateOpenLink, shMove, shPaste, shPasteMove, lnCreateOpen } from '../commands/commands'
import { app } from '../global'
import { NTModal } from './NTModal'

//////////////////////////////////////////////////////////////////////////////////////////
/// Create, open

/// Appears when user enters a shortcut to create and open new note
export function shCreateOpenModal(): NTModal<any> {
	const modal = new NTModal(app, shCreateOpen.command, { newPane: false })
	modal.setFilter(shCreateOpen.validate)
	modal.setVariants([ { modifiers: ['Mod'], key: 'Enter', options: { newPane: true } } ])
	modal.setPlaceholder('Create and open')
	modal.setInstructions([
		{ command: '↑↓', purpose: 'to navigate' },
		{ command: '↵', purpose: 'to create and open' },
		{ command: 'cmd↵', purpose: 'to create and open in new pane' },
		{ command: 'esc', purpose: 'to dismiss' },
	])
	return modal
}

//////////////////////////////////////////////////////////////////////////////////////////
/// Create, open, paste link

export function shCreateOpenLinkModal(): NTModal<any> { 
	const modal = new NTModal(app, shCreateOpenLink.command, { newPane: false })
	modal.setFilter(shCreateOpenLink.validate)
	modal.setVariants([ { modifiers: ['Mod'], key: 'Enter', options: { newPane: true } } ])
	modal.setPlaceholder('Create, open and leave a link')
	modal.setInstructions([
		{ command: '↑↓', purpose: 'to navigate' },
		{ command: '↵', purpose: 'to create, open and paste a link' },
		{ command: 'cmd↵', purpose: 'to create, open in new pane and paste a link' },
		{ command: 'esc', purpose: 'to dismiss' },
	])
	return modal
}

//////////////////////////////////////////////////////////////////////////////////////////
/// Paste contents

/// Appears when user enters a shortcut to apply a type to the current note
export function shPasteModal(): NTModal<any> {
	const modal = new NTModal(app, shPaste.command, { })
	modal.setFilter(shPaste.validate)
	modal.setPlaceholder('Paste template')
	modal.setInstructions([
		{ command: '↑↓', purpose: 'to navigate' },
		{ command: '↵', purpose: 'to paste template' },
		{ command: 'esc', purpose: 'to dismiss' }
	])
	return modal
}

//////////////////////////////////////////////////////////////////////////////////////////
/// Move

/// Appears when user enters a shortcut to move current note
export function shMoveModal(): NTModal<any> {
	const modal = new NTModal(app, shMove.command, { })
	modal.setFilter(shMove.validate)
	modal.setPlaceholder('Move note')
	modal.setInstructions([
		{ command: '↑↓', purpose: 'to navigate' },
		{ command: '↵', purpose: 'to move' },
		{ command: 'esc', purpose: 'to dismiss' }
	])
	return modal
}

//////////////////////////////////////////////////////////////////////////////////////////
/// Paste contents, move

/// Appears when user enters a shortcut to apply a type to the current note
export function shPasteMoveModal(): NTModal<any> {
	const modal = new NTModal(app, shPasteMove.command, { })
	modal.setFilter(shPasteMove.validate)
	modal.setPlaceholder('Apply (paste contents and move note)')
	modal.setInstructions([
		{ command: '↑↓', purpose: 'to navigate' },
		{ command: '↵', purpose: 'to paste template and move' },
		{ command: 'esc', purpose: 'to dismiss' }
	])
	return modal
}

//////////////////////////////////////////////////////////////////////////////////////////
/// Create and open using name of the link

/// Appears when user clicks an unresolved link to create and open new note
export function lnCreateOpenModal(noteName: string): NTModal<any> {
	const modal = new NTModal(app, lnCreateOpen.command, { newPane: false, noteName })
	modal.setFilter(lnCreateOpen.validate)
	modal.setVariants([ { modifiers: ['Mod'], key: 'Enter', options: { newPane: true, noteName } } ])
	modal.setPlaceholder(`Create and open '${noteName}''`)
	modal.setInstructions([
		{ command: '↑↓', purpose: 'to navigate' },
		{ command: '↵', purpose: 'to create and open' },
		{ command: 'cmd↵', purpose: 'to create and open in new pane'},
		{ command: 'esc', purpose: 'to dismiss' },
	])
	return modal
}
