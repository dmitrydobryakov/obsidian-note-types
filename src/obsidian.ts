import { App, TFile, FileSystemAdapter, MarkdownView, normalizePath, Notice } from 'obsidian'
import { join, dirname, basename } from 'path'
import { traceError as error, rethrow } from './error'

export class Obsidian {

	constructor(private app: App) {
		this.openNote = new OpenNote(this.app)
	}

	/// Public properties and methods

	openNote: OpenNote

	get vaultPath(): string { 
		return (this.app.vault.adapter as FileSystemAdapter).getBasePath() 
	}

	/// Get full path for obsidian link
	linkPath(obsLink: string): string | null {
		if (!obsLink) return null
		return this.app.metadataCache.getFirstLinkpathDest(obsLink, "")?.path
	}

	/// Get obsidian link for path
	pathLink(path: string): string | null {
		const file = this.app.vault.getAbstractFileByPath(path) as TFile
		if (!file) { return null }
		return this.app.fileManager.generateMarkdownLink(file, "")
	}

	/// Read note content by path
	contentByPath(path: string): Promise<string | null> {
		return this.read(path).catch(() => null)
	}

	/// Read note content by obsidian link
	contentByLink(link: string): Promise<string | null> {
		const path = this.linkPath(link); if (!path) { return null }
		return this.contentByPath(path)
	}

	async exists(path: string): Promise<boolean> {
		return this.app.vault.adapter
			.exists(normalizePath(path), true)
	}

	/// Public operations

	async read(path: string): Promise<string> {
		const npath = normalizePath(path)
		if (!await this.exists(npath)) error('NOT-EXISTS', `Note does not exist: '${npath}'`)
		return this.app.vault.adapter
			.read(npath)
	}

	async write(path: string, content: string): Promise<void> {
		await this.app.vault.adapter
			.write(normalizePath(path), content)
	}

	async create(path: string, content: string): Promise<void> {
		const npath = normalizePath(path)
		if (await this.exists(npath)) error('EXISTS', 'Note exists')
		await this.ensureFolders(npath).catch(rethrow('FOLDERS', 'Cannot ensure location exists'))
		await this.write(npath, content).catch(rethrow('WRITE', 'Cannot write the file'))
	}

	async open(path: string, newLeaf: boolean, sourcePath: string = '') {
		await this.app.workspace.openLinkText(path, sourcePath, newLeaf ? this.openNote.exists : false)
	}

	/// Returns false if note is already there, true if it's moved successfully and throws if an error happens
	async move(from: string, to: string) {
		const file = this.app.vault.getAbstractFileByPath(from)
		const nto = normalizePath(to)
		if (file.path === nto) return false
		if (await this.exists(nto)) error('EXISTS', 'Note exists')
		await this.ensureFolders(nto).catch(rethrow('FOLDERS', 'Cannot ensure location exists'))
		await this.app.fileManager.renameFile(file, nto)
		return true
	}

	async moveToFolder(from: string, toFolder: string) {
		const toNote = normalizePath(join(toFolder, basename(from)))
		return await this.move(from, toNote)
	}

	async moveToFolderOf(from: string, toNote: string) {
		const toFolder = normalizePath(dirname(toNote))
		return await this.moveToFolder(from, toFolder)
	}

	async notice(message: string) {
		new Notice(message)
	}

	/// Private methods

	private async createFolderPath(path: string) {

		async function createFolders(parentPath: string, folders: string[]) {
			if (folders.length === 0) return
			const [folder, ...rest] = folders
			const folderPath = normalizePath(join(parentPath, folder))
			if (!await this.exists(folderPath)) 
				await this.app.vault.createFolder(folderPath)
			await createFolders.call(this, folderPath, rest)
		}

		await createFolders.call(this, '', normalizePath(path).split('/'))

	}

	/// Make sure all path folders exist (create if not) (`path` must be a file)
	private async ensureFolders(path: string) {
		const folders = dirname(path)
		if (!await this.exists(folders)) await this.createFolderPath(folders)
	}

}

/// Represents currently open note
class OpenNote {

	/// Private properties

	private app: App
	private get editor() { return this.app.workspace.getActiveViewOfType(MarkdownView)?.sourceMode?.cmEditor }
	private get file() { return this.app.workspace.getActiveFile() }

	/// Constructor

	constructor(app: App) {
		this.app = app
	}

	/// Public

	get exists(): boolean {
		return this.file ? true : false
	}

	get path(): string {
		return this.file?.path
	}

	get name(): string {
		return this.file?.basename
	}

	get linkText(): string {
		const file = this.file; if (!file) return null
		return this.app.metadataCache.fileToLinktext(file, file.path, true)
	}

	get link(): string {
		const link = this.linkText
		return (link != null) ? `[[${link}]]` : null
	}

	get folderPath(): string { 
		return this.file?.parent.path 
	}

	get frontmatter(): any {
		const file = this.file; if (!file) return null
		return this.app.metadataCache.getFileCache(file)?.frontmatter
	}

	get selection(): string {
		return this.editor?.getSelection()
	}

	pasteText(text: string) { 
		this.editor?.replaceSelection(text)
	}

	async rename(path: string): Promise<void | null> {
		const file = this.file; if (!file) return null
		await this.app.fileManager.renameFile(file, path)
	}

}
