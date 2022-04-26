import { $new, $$new, $Array } from './utils'
import { v4 as uuid } from 'uuid'
import { settings, obsidian } from './global'
import { join } from 'path'
import { rethrow } from './error'
import { enableClickLink, disableClickLink } from './ui/link-context-menu'
import { plugin } from './global'

const DEFAULT = {
	NEW_NAME_METHOD: 'text',
	NEW_CONTENT_METHOD: 'path',
	NEW_LOCATION_METHOD: 'text',
	NEW_SHOW_CONFIG: true,
	NEW_HOTKEYS: false,
	NAME_TEMPLATES_FOLDER: '',
	CONTENT_TEMPLATES_FOLDER: 'Templates/',
	LOCATION_TEMPLATES_FOLDER: '',
	SHOW_TEMPLATES_CONFIG: false,
	SHOW_POPUPS: false,
	NOW_FORMAT: '',
	NOW_DEFAULT_FORMAT: 'YYYYMMDDHHmmss',	// used if NOW_FORMAT is empty
	OVERRIDE_CLICK_LINK: true,
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

export class ValueSource {

	constructor(
		public method: 'path' | 'text' = 'text',		// method used to store or access the value
		public data: string = ''						// representation of the value using the method
	) { }

	toggle() {
		if (this.method === 'path') this.method = 'text'
		else if (this.method === 'text') this.method = 'path'
		else { throw new Error(`Unexpected error: unknown source method '${this.method}'`) }
	}

	async read(root: string = '') {
		const md = (expr: string) => expr + '.md' 	// assuming paths are stored without extension in settings
		if (this.method === 'text') return this.data
		if (this.method === 'path') return await obsidian.read(join(root, md(this.data)))
		throw new Error(`Unknown ValueSource method: '${this.method}'`)
	}

}

export class NoteType {

	constructor(
		public name: string = '',
		public note_content = $new(ValueSource),
		public note_name = $new(ValueSource),
		public note_location = $new(ValueSource),
		public show_config: boolean = DEFAULT.NEW_SHOW_CONFIG,
		public hotkeys: boolean = DEFAULT.NEW_HOTKEYS,
	) { }

	readonly uuid: string = uuid()

	async readProperty(property: string) {
		const tryRead = async (vs: ValueSource, root: string, code: string, err: any) => 
			await vs.read(root).catch(rethrow(code, err))
		if (property === 'name') return await tryRead(this.note_name, settings.name_templates.folder, "READ", `Cannot read 'note name' of type '${ this.name }'`)
		if (property === 'location') return await tryRead(this.note_location, settings.location_templates.folder, "READ", `Cannot read 'note location' of type '${ this.name }'`)
		if (property === 'content') return await tryRead(this.note_content, settings.content_templates.folder, "READ", `Cannot read 'note content' of type '${ this.name }'`)
		throw new Error(`Unknown settings property: '${property}'`)
	}

	/**
	 * Reads requested properties from type settings.
	 * @param props Requested properties.
	 * @returns Object with retrieved properties.
	 */
	async readProperties(props: string[] = ['name', 'content', 'location']) {
		const res: any = { }
		if (props.includes('name')) res['name'] = await this.readProperty('name')
		if (props.includes('content')) res['content'] = await this.readProperty('content')
		if (props.includes('location')) res['location'] = await this.readProperty('location')
		return res
	}

}

export class Templates {

	constructor(
		public folder: string,
		public default_method: string,
		public show_config: boolean,
	) { }

	toggleConfig() {
		this.show_config = !this.show_config
	}

	toggleSource() {
		if (this.default_method === 'path') this.default_method = 'text'
		else if (this.default_method === 'text') this.default_method = 'path'
		else { throw new Error(`Unexpected error: unknown source method '${this.default_method}'`) }
	}

}

export class NTSettings {

	private click_link: boolean = DEFAULT.OVERRIDE_CLICK_LINK

	popup: boolean = DEFAULT.SHOW_POPUPS

	now_format: string = DEFAULT.NOW_FORMAT

	now_default_format: string = DEFAULT.NOW_DEFAULT_FORMAT

	content_templates: Templates = $new(Templates, { 
		folder: DEFAULT.CONTENT_TEMPLATES_FOLDER, 
		default_method: DEFAULT.NEW_CONTENT_METHOD,
		show_config: DEFAULT.SHOW_TEMPLATES_CONFIG 
	})

	name_templates: Templates = $new(Templates, { 
		folder: DEFAULT.NAME_TEMPLATES_FOLDER,
		default_method: DEFAULT.NEW_NAME_METHOD,
		show_config: DEFAULT.SHOW_TEMPLATES_CONFIG 
	})

	location_templates = $new(Templates, { 
		folder: DEFAULT.LOCATION_TEMPLATES_FOLDER, 
		default_method: DEFAULT.NEW_LOCATION_METHOD,
		show_config: DEFAULT.SHOW_TEMPLATES_CONFIG 
	})

	types: NoteType[] = $Array(NoteType)

	getContentDefaultSource() {
		return this.content_templates.default_method
	}

	addNoteType() {
		this.types.push($new(NoteType, {
			name: '',
			note_content: { method: DEFAULT.NEW_CONTENT_METHOD },
			note_name: { method: DEFAULT.NEW_NAME_METHOD },
			note_location: { method: DEFAULT.NEW_LOCATION_METHOD },
		}))
	}

	realNowFormat() {
		return this.now_format || this.now_default_format
	}

	get clickLink() {
		return this.click_link
	}

	set clickLink(value) {

		if (this.click_link === value) return

		if (value) enableClickLink(plugin)
		else disableClickLink(plugin)

		this.click_link = value

	}

}

export const DEFAULT_SETTINGS = $$new(NTSettings)
