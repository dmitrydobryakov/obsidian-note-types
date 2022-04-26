import { NoteType } from '../settings'
import { create_open, create_open_link, paste, move, paste_move } from './actions'
import { settings, obsidian } from '../global'
import { evaluateNoteProperties, asTemplate, asText } from './evaluateNoteProperties'
import { message, traceError as error } from '../error'
import { requestName } from '../ui/EnterTextModal'
import { join } from 'path'

const defaultContext = () => ({
	name: { special: 'this-name' },
	now_format: settings.realNowFormat()
})

const requestNotEmptyName = async () => {
	const entered = await requestName()
	if (entered === '') error('EMPTY-NAME', 'Name cannot be empty')
	return entered
}

/**
 * Delegates the call to evaluateNoteProperties.
 * @param type Note type to read properties from.
 * @param criticalProps Critical properties – throw if impossible to read.
 * @param context Changes to default context.
 * @returns Evaluated properties.
 */
async function evaluate(type: NoteType, criticalProps: string[] = [ ], _context: any = { }) {

	const context = { 
		...defaultContext(),
		..._context,
	}

	const read = async (prop: 'name' | 'location' | 'content') => {
		if (criticalProps.includes(prop)) return asTemplate(await type.readProperty(prop))
		const nonCritical = await type.readProperty(prop).catch(_ => undefined)
		return (nonCritical != undefined) ? asTemplate(nonCritical) : undefined
	}

	return await evaluateNoteProperties({
		nameTemplate: 		await read('name'),
		locationTemplate: 	await read('location'),
		contentsTemplate: 	await read('content'),
		context
	})

}

/**
 * Returns a note type validator which is based on presence of required properties.
 * The validator returns whether a command should work with given type.
 * @param props Required properties.
 * @returns Validator.
 */
export function validate(props: string[] = ['name', 'location', 'content']) {
	return function(type: NoteType): boolean {
		if (props.includes('name') && !type.note_name.data) return false
		if (props.includes('location') && !type.note_location.data) return false
		if (props.includes('content') && type.note_content.method === 'path' && !type.note_content.data) return false
		return true
	}
}

function catchErrors<T>(f: (type: NoteType, options: T) => Promise<any>) {
	return async function(type: NoteType, options: T) {
		return await f(type, options)
			.catch(err => { console.error(message(err)); obsidian.notice(message(err)) })
	}
}

/////////////////////////////////////////////////////
/// Create, open

/// Creates and opens a note – after user enters a shortcut
async function _shCreateOpen(type: NoteType, options: {
	newPane: boolean
}) {

	const shouldEnterName = type.note_name.data === ''
	const enteredName = shouldEnterName ? await requestNotEmptyName() : undefined
	if (shouldEnterName && enteredName == undefined) return
	const thisProps = enteredName
		? await evaluate(type, ['location', 'content'], { name: { value: enteredName } })
		: await evaluate(type, ['name', 'location', 'content'])
	const name = shouldEnterName ? enteredName : thisProps.noteName

	return await create_open({
		notePath: join(thisProps.noteLocation, name + '.md'),
		noteContents: thisProps.noteContents,
		newPane: options.newPane,
		showPopups: settings.popup,
		typeName: type.name,
	})

}

export const shCreateOpen = {
	command: catchErrors(_shCreateOpen),
	validate: validate(['location', 'content'])
}

/////////////////////////////////////////////////////
/// Create, open, paste link

async function _shCreateOpenLink(type: NoteType, options: {
	newPane: boolean
}) {

	const shouldEnterName = type.note_name.data === ''
	const enteredName = shouldEnterName ? await requestNotEmptyName() : undefined
	if (shouldEnterName && enteredName == undefined) return
	const thisProps = enteredName
		? await evaluate(type, ['location', 'content'], { name: { value: enteredName } })
		: await evaluate(type, ['name', 'location', 'content'])
	const name = shouldEnterName ? enteredName : thisProps.noteName

	return await create_open_link({
		notePath: join(thisProps.noteLocation, name + '.md'),
		noteContents: thisProps.noteContents,
		newPane: options.newPane,
		open: true,
		showPopups: settings.popup,
		typeName: type.name,
	})

}

export const shCreateOpenLink = {
	command: catchErrors(_shCreateOpenLink),
	validate: validate(['location', 'content'])
}

/////////////////////////////////////////////////////
/// Paste contents

async function _shPaste(type: NoteType, _options: { }) {
	const { noteContents } = await evaluate(type, ['content'])
	return await paste({
		noteContents,
		showPopups: settings.popup,
		typeName: type.name,
	})
}

export const shPaste = {
	command: catchErrors(_shPaste),
	validate: validate(['content'])
}

/////////////////////////////////////////////////////
/// Move

async function _shMove(type: NoteType, _options: { }) {
	const name = obsidian.openNote.name
	const { noteLocation } = await evaluate(type, ['location'], { name: { value: name } })
	return await move({
		toPath: join(noteLocation, name + '.md'),
		showPopups: settings.popup,
		typeName: type.name,
	})
}

export const shMove = {
	command: catchErrors(_shMove),
	validate: validate(['location'])
}

/////////////////////////////////////////////////////
/// Paste contents, move

async function _shPasteMove(type: NoteType, _options: { }) {
	const name = obsidian.openNote.name
	const { noteContents, noteLocation } = name
		? await evaluate(type, ['location', 'content'], { name: { value: name } })
		: await evaluate(type, ['location', 'content'])
	return await paste_move({
		contents: noteContents,
		toPath: join(noteLocation, name + '.md'),
		showPopups: settings.popup,
		typeName: type.name,
	})
}

export const shPasteMove = {
	command: catchErrors(_shPasteMove),
	validate: validate(['location', 'content'])
} 

/////////////////////////////////////////////////////
/// Create and open using name of the link

/// Creates and opens a note – after user clicks on a link
async function _lnCreateOpen(type: NoteType, options: {
	newPane: boolean,
	noteName: string
}) {
	const { noteContents, noteLocation } = await evaluate(type, ['location', 'content'], { name: { value: options.noteName }})
	return await create_open({
		typeName: type.name,
		noteContents,
		notePath: join(noteLocation, options.noteName + '.md'),
		newPane: options.newPane,
		showPopups: settings.popup,
	})
}

export const lnCreateOpen = {
	command: catchErrors(_lnCreateOpen),
	validate: validate(['location', 'content'])
}
