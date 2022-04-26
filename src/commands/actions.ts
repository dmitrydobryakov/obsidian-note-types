/*
	_ delimits multiple actions in one function
*/

import { obsidian } from '../global'
import { TraceError, rethrow, traceError as error } from '../error'

function handleError(err: any, onError?: (err: any, notice: any) => any) {
	
	/// Not a custom TraceError
	if (!(err instanceof TraceError)) { 
		console.error(err)
		if (!onError) obsidian.notice(err)
		else onError(err, obsidian.notice)
		return 
	}

	/// Console
	console.error(err.traceCodes())
	console.error(err.traceMessages())

	/// Display
	if (!onError) obsidian.notice(err.traceMessages())
	else onError(err, obsidian.notice) 

}

/// Create and open a note
export async function create_open({ typeName, notePath, noteContents, newPane, showPopups, onError }: {
	noteContents: string,	// contents of the note
	notePath: string,		// path of the note
	newPane: boolean, 		// open in new pane
	showPopups: boolean,	// show popups with success messages
	typeName: string,		// name of the type
	onSuccess?: (notice: any) => any			// what to do on success
	onError?: (err: any, notice: any) => any	// what to do on error
}) {

	try {

		// Create a note at notePath
		await obsidian.create(notePath, noteContents)
			.catch(rethrow('CREATE', 'Cannot create note'))

		// Open the note
		await obsidian.open(notePath, newPane)
			.catch(rethrow('OPEN', 'Cannot open note'))

		// Show a popup with a success message
		if (showPopups)
			obsidian.notice(`'${typeName}' note created`)

	}

	catch (err) { handleError(err, onError) }

}

/// Create and open new note and paste a link to it from current note
export async function create_open_link({ noteContents, notePath, newPane, showPopups, typeName }: {
	noteContents:	string,		// contents of the note
		notePath: 	string,		// path of the note
		 newPane: 	boolean, 	// open in new pane
		    open: 	boolean, 	// open new note or not
	  showPopups: 	boolean,	// show popups with success messages
		typeName: 	string,		// name of the type
}) { 

	try {

		// Create a note at notePath
		await obsidian.create(notePath, noteContents)
			.catch(rethrow('CREATE', 'Cannot create note'))

		// Check if there is an open note and get its path
		const openNotePath = obsidian.openNote.path
		if (openNotePath == null) 
			error('NO-OPEN-NOTE', 'No open note')

		// Paste link
		obsidian.openNote.pasteText(obsidian.pathLink(notePath))

		// Open the created note
		if (open)
			await obsidian.open(notePath, newPane)
				.catch(rethrow('OPEN', 'Cannot open created note'))

		// Success message
		if (showPopups) 
			obsidian.notice(`'${typeName}' note created (link inserted)`)

	}

	catch (err) { handleError(err) }

}

/// Paste contents into the open note (apply template)
export async function paste({ noteContents, showPopups, typeName }: {
	noteContents: string,	// contents of the note
	showPopups: boolean,	// show popups with success messages
	typeName: string, 		// name of the type
}) {

	try {

		// Check if there is an open note and get its path
		const openNotePath = obsidian.openNote?.path
		if (openNotePath == null)
			error('NO-OPEN-NOTE', 'No open note')

		// Paste contents
		obsidian.openNote.pasteText(noteContents)

		// Success message
		if (showPopups) 
			obsidian.notice(`'${typeName}' contents inserted`)

	}

	catch(err) { handleError(err) }
	
}

/// Move the open note to 
export async function move({ toPath, showPopups, typeName }: {
	toPath: string, 		// where to move the note
	showPopups: boolean,	// show popups with success messages
	typeName: string, 		// name of the type
}) {

	try {

		// Check if there is an open note and get its path
		const openNotePath = obsidian.openNote?.path
		if (openNotePath == null)
			error('NO-OPEN-NOTE', 'No open note')

		// Move the note
		const move = await obsidian.moveToFolderOf(openNotePath, toPath)
			.catch(rethrow('MOVE', 'Cannot move note'))

		// Success message
		if (showPopups) 
			obsidian.notice(move 
				? `Moved to '${typeName}' location` 
				: `Note is already there: '${typeName}'`)

	}

	catch(err) { handleError(err) }

}

/// Move to location and paste contents
export async function paste_move({ typeName, contents, toPath, showPopups }: {
	contents: string,		// contents to paste
	toPath: string			// where to move the note
	showPopups: boolean,	// show popups with success messages
	typeName: string, 		// name of the type
}) { 

	try { 

		// Check if there is an open note and get its path
		const openNote = obsidian.openNote
		const openNotePath = openNote.path
		if (openNotePath == null)
			error('NO-OPEN-NOTE', 'No open note')

		// Insert contents
		openNote.pasteText(contents)

		// Move the note
		const move = await obsidian.moveToFolderOf(openNotePath, toPath)
			.catch(rethrow('MOVE', 'Cannot move note'))

		// Success message
		if (showPopups) obsidian.notice(`'${typeName}' contents inserted and note ${ move ? 'is moved' : 'is already there' }`)

	}

	catch(err) { handleError(err) }

}
