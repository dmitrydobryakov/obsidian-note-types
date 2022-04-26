import { App, ExtraButtonComponent, PluginSettingTab, Setting } from 'obsidian'
import NoteTypesPlugin from '../main'
import { scope, arraymove } from '../utils'
import Sortable from 'sortablejs'
import moment from 'moment'

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// TEXT CONSTANTS --------------------------------------------------------------------------------- ///
////////////////////////////////////////////////////////////////////////////////////////////////////////

const CSS_MAIN = 'nt'
const CSS_MLEFT = 'nt-margin-left'
const CSS_MARGIN = 'nt-margin'
const CSS_HINT = 'nt-hint'
const CSS_HINT_END = 'nt-hint-end'
const CSS_TM_SETTING = 'nt-tm-setting'
const CSS_TM_SETTINGS = 'nt-tm-settings'
const CSS_CUSTOM_NAME_DIV = 'nt-custom-name-div'
const CSS_CUSTOM_FLEX = 'nt-custom-flex'
const CSS_SORTABLE_CONTAINER = 'nt-sortable-container'
const CSS_SORTABLE_ELEMENT = 'nt-sortable-element'
const CSS_SORTABLE_GHOST = 'nt-sortable-ghost'
const CSS_SORTABLE_CHOSEN = 'nt-sortable-chosen'
const CSS_SORTABLE_DRAG = 'nt-sortable-drag'
const CSS_SORTABLE_HANDLE = 'nt-sortable-handle'

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// GENERAL SETTINGS

const HDR_MAIN = 'Settings: Note Types'

////////////////////////////////////////////////////////////////////////////////////////////////////////

const NAME_POPUP = 'Pop-up messages'
const DESC_POPUP = 'Show pop-up messages'

////////////////////////////////////////////////////////////////////////////////////////////////////////

const NAME_NOW = 'Default format: {{now}}'
const PH_NOW = 'YYYYMMDDHHmmss'

////////////////////////////////////////////////////////////////////////////////////////////////////////

const NAME_LINKS = 'Click links – override'
const DESC_LINKS = 'Select type when clicking on links to nonexistent notes'

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// TEMPLATES

const HDR_ROOTS = 'Templates'

const NAME_TEMPLATES_CONTENT = 'Content templates: Root folder'
const DESC_TEMPLATES_CONTENT = 'Root folder for templates that define contents of the note'
const PH_TEMPLATES_CONTENT = 'e.g. Templates/Content'

const NAME_CONTENT_DEF_SOURCE = 'Content templates: default input method'
const DESC_CONTENT_DEF_SOURCE = 'Preferred way to enter content templates: PATH = provide file with template, TEXT = type the template directly'

////////////////////////////////////////////////////////////////////////////////////////////////////////

const NAME_TEMPLATES_NAME = 'Name templates: Root folder'
const DESC_TEMPLATES_NAME = 'Root folder for templates that define name of the note'
const PH_TEMPLATES_NAME = 'e.g. Templates/Name'

const NAME_NAME_DEF_SOURCE = 'Name templates: default input method'
const DESC_NAME_DEF_SOURCE = 'Preferred way to enter name templates: PATH = provide file with template, TEXT = type the template directly'

////////////////////////////////////////////////////////////////////////////////////////////////////////

const NAME_TEMPLATES_LOCATION = 'Location templates: Root folder'
const DESC_TEMPLATES_LOCATION = 'Root folder for templates that define folder where the note is created'
const PH_TEMPLATES_LOCATION = 'e.g. Templates/Location'

const NAME_LOCATION_DEF_SOURCE = 'Location templates: default input method'
const DESC_LOCATION_DEF_SOURCE = 'Preferred way to enter location templates: PATH = provide file with template, TEXT = type the template directly'

////////////////////////////////////////////////////////////////////////////////////////////////////////

const HINT_DEF_SOURCE = 'This is applied as default value when new note type is created and can be changed after'



////////////////////////////////////////////////////////////////////////////////////////////////////////
/// NOTE TYPES

const HDR_TYPES = 'Note Types'
const PH_TYPE_NAME = 'NAME'

////////////////////////////////////////////////////////////////////////////////////////////////////////

const NAME_CONTENT = 'Content'
const DESC_CONTENT_PATH = 'Path to template file with note content'
const DESC_CONTENT_TEXT = 'Note content'
const $DESC_CONTENT = (type: string) => type === 'path' ? DESC_CONTENT_PATH : DESC_CONTENT_TEXT
const PH_CONTENT_PATH = 'e.g. Content/Empty'
const PH_CONTENT_TEXT = 'e.g. {{this-name}}'
const $PH_CONTENT = (type: string) => type === 'path' ? PH_CONTENT_PATH : PH_CONTENT_TEXT

const NAME_NAME = 'Name'
const DESC_NAME_PATH = 'Path to template file with note name'
const DESC_NAME_TEXT = 'Note name'
const $DESC_NAME = (type: string) => type === 'path' ? DESC_NAME_PATH : DESC_NAME_TEXT
const PH_NAME_PATH = 'e.g. Name/Now'
const PH_NAME_TEXT = 'e.g. {{now}}'
const $PH_NAME = (type: string) => type === 'path' ? PH_NAME_PATH : PH_NAME_TEXT

const NAME_LOCATION = 'Location'
const DESC_LOCATION_PATH = 'Path to template file with note location'
const DESC_LOCATION_TEXT = 'Note location'
const $DESC_LOCATION = (type: string) => type === 'path' ? DESC_LOCATION_PATH : DESC_LOCATION_TEXT
const PH_LOCATION_PATH = 'e.g. Location/ZK'
const PH_LOCATION_TEXT = 'e.g. Daily/{{now:YYYY-DD-MM}}'
const $PH_LOCATION = (type: string) => type === 'path' ? PH_LOCATION_PATH : PH_LOCATION_TEXT

////////////////////////////////////////////////////////////////////////////////////////////////////////

const NAME_NEWLEAF = 'Open created note in new pane'
const NAME_HOTKEYS = 'Use hotkeys'

////////////////////////////////////////////////////////////////////////////////////////////////////////

const BTN_ADD = 'Add Note Type'

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// ICONS, TOGGLES, HINTS, MESSAGES

const ICON_REORDER = 'up-and-down-arrows'
const ICON_DELETE = 'cross'
const ICON_CONFIGURE = 'three-horizontal-bars'

const TT_TOGGLE = 'toggle'
const TT_REORDER = 'reorder'
const TT_DELETE = 'delete'
const TT_CONFIGURE = 'configure'

const MSG_TEMPLATE_LABEL = (index: number) => `template #${index}`
const MSG_RELOAD = 'Reload plugin to see updated hotkeys'
const MSG_RELOAD_APPLY = 'Reload to apply'

const HINT_TOGGLE = (name: string) => `Turn the switch off to define note ${name} directly (no template files) by default`
const TOGGLE_NAME = HINT_TOGGLE('Name')
const TOGGLE_LOCATION = HINT_TOGGLE('Location')

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

export class NoteTypesSettingTab extends PluginSettingTab {

	plugin: NoteTypesPlugin

	constructor(app: App, plugin: NoteTypesPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display() {

		/// Settings
		const s = this.plugin.settings
		const save = () => this.plugin.saveData(s)
		const saveChanges = (changes: () => void) => { changes(); save() }

		/// Display
		const display = (update: () => void) => { update(); this.display() }

		/// Create a shared scope to pass and access objects
		const { put, take } = scope()

		/// -------------------------------------------------------

		const { containerEl } = this
		containerEl.empty()
		containerEl.addClass(CSS_MAIN)

		/// GENERAL SETTINGS

		new Setting(containerEl)
			.setName(DESC_POPUP)
			.addToggle(toggle => {
				toggle
					.setValue(s.popup)
					.onChange(value => saveChanges(() => s.popup = value))
			})

		new Setting(containerEl)
			.setName(NAME_NOW)
			.setDesc(createFragment(el => {
				el.createEl('span', { text: 'Preview: ' })
				const format = (f: string) => moment().format(f)
				const preview = el.createEl('span', { text: format(s.realNowFormat()), cls: CSS_HINT })
				put('now-preview', preview)
				put('now-format', format)
			}))
			.addMomentFormat(moment => { 
				moment
					.setDefaultFormat(s.now_default_format)
					.setValue(s.now_format)
					.onChange(value => { 
						saveChanges(() => s.now_format = value); 
						take('now-preview').setText((take('now-format')(s.realNowFormat())))
					})
			})

		new Setting(containerEl)
			.setName(NAME_LINKS)
			.setDesc(DESC_LINKS)
			.addToggle(toggle => {
				toggle
					.setValue(s.clickLink)
					.onChange(value => saveChanges(() => s.clickLink = value ))
			})

		////////////////////////////////////////////////////////////////////////////////////////////////////////
		/// HEADER: TEMPLATES

		containerEl.createEl('h2', { text: HDR_ROOTS })

		/// CONTENT TEMPLATES
		/// CONTENT TEMPLATES: ROOT FOLDER

		new Setting(containerEl)
			.setName(NAME_TEMPLATES_CONTENT)
			.setDesc(DESC_TEMPLATES_CONTENT)
			.addText(text => {
				text
					.setPlaceholder(PH_TEMPLATES_CONTENT)
					.setValue(s.content_templates.folder)
					.onChange(value => saveChanges(() => s.content_templates.folder = value))
			})
			.addExtraButton(button => {
				button.extraSettingsEl.addClass(CSS_MLEFT)
				button
					.setIcon(ICON_CONFIGURE)
					.setTooltip(TT_CONFIGURE)
					.onClick(() => display(() => saveChanges(() => s.content_templates.show_config = !s.content_templates.show_config)))
			})

		if (s.content_templates.show_config) {

			/// CONTENT TEMPLATES: CONFIG

			const configEl = containerEl.createDiv({ cls: CSS_TM_SETTINGS })

			const content_def_source = new Setting(configEl)
				.setName(NAME_CONTENT_DEF_SOURCE)
				.setDesc(DESC_CONTENT_DEF_SOURCE)
				.addButton(button => {
					button
						.setButtonText(s.content_templates.default_method.toUpperCase())
						.setTooltip('Toggle')
						.onClick(() => display(() => saveChanges(() => s.content_templates.toggleSource())))
				})

			content_def_source.settingEl.addClass(CSS_TM_SETTING)
			content_def_source.descEl.createEl('p', { text: HINT_DEF_SOURCE, cls: CSS_HINT })

		}

		/// NAME TEMPLATES
		/// NAME TEMPLATES: ROOT

		new Setting(containerEl)
			.setName(NAME_TEMPLATES_NAME)
			.setDesc(DESC_TEMPLATES_NAME)
			.addText(text => {
				text
					.setPlaceholder(PH_TEMPLATES_NAME)
					.setValue(s.name_templates.folder)
					.onChange(value => saveChanges(() => s.name_templates.folder = value))
			})
			.addExtraButton(button => {
				button.extraSettingsEl.addClass(CSS_MLEFT)
				button
					.setIcon(ICON_CONFIGURE)
					.setTooltip(TT_CONFIGURE)
					.onClick(() => display(() => saveChanges(() => s.name_templates.show_config = !s.name_templates.show_config)))
			})

		if (s.name_templates.show_config) {

			/// NAME TEMPLATES: CONFIG
			
			const configEl = containerEl.createDiv({ cls: CSS_TM_SETTINGS })

			const name_def_source = new Setting(configEl)
				.setName(NAME_NAME_DEF_SOURCE)
				.setDesc(DESC_NAME_DEF_SOURCE)
				.addButton(button => {
					button
						.setButtonText(s.name_templates.default_method.toUpperCase())
						.setTooltip(TT_TOGGLE)
						.onClick(() => display(() => saveChanges(() => s.name_templates.toggleSource())))
				})

			name_def_source.settingEl.addClass(CSS_TM_SETTING)
			name_def_source.descEl.createEl('p', { text: HINT_DEF_SOURCE, cls: CSS_HINT })

		}

		/// LOCATION TEMPLATES
		/// LOCATION TEMPLATES: ROOT

		new Setting(containerEl)
			.setName(NAME_TEMPLATES_LOCATION)
			.setDesc(DESC_TEMPLATES_LOCATION)
			.addText(text => {
				put('location-input', text)
				text
					.setPlaceholder(PH_TEMPLATES_LOCATION)
					.setValue(s.location_templates.folder)
					.onChange(value => saveChanges(() => s.location_templates.folder = value) )
			})
			.addExtraButton(button => {
				button.extraSettingsEl.addClass(CSS_MLEFT)
				button
					.setIcon(ICON_CONFIGURE)
					.setTooltip(TT_CONFIGURE)
					.onClick(() => display(() => saveChanges(() => s.location_templates.show_config = !s.location_templates.show_config)))
			})

		if (s.location_templates.show_config) {

			/// LOCATION TEMPLATES: CONFIG

			const configEl = containerEl.createDiv({ cls: CSS_TM_SETTINGS })
			
			const location_def_source = new Setting(configEl)
				.setName(NAME_LOCATION_DEF_SOURCE)
				.setDesc(DESC_LOCATION_DEF_SOURCE)
				.addButton(button => {
					button
						.setButtonText(s.location_templates.default_method?.toUpperCase())
						.setTooltip(TT_TOGGLE)
						.onClick(() => display(() => saveChanges(() => s.location_templates.toggleSource())))
				})

			location_def_source.settingEl.addClass(CSS_TM_SETTING)
			location_def_source.descEl.createEl('p', { text: HINT_DEF_SOURCE, cls: CSS_HINT })

		}

		////////////////////////////////////////////////////////////////////////////////////////////////////////
		/// HEADER: NOTE TYPES

		containerEl.createEl('h2', { text: HDR_TYPES })

		const sortableContainer = containerEl.createEl('div', { cls: CSS_SORTABLE_CONTAINER })

		s.types.forEach((type, index) => {

			/// TEXT CONSTANTS

			const [ contentType, nameType, locationType ] = [ type.note_content.method, type.note_name.method, type.note_location.method ]
			const PH_CONTENT = $PH_CONTENT(contentType)
			const PH_NAME = $PH_NAME(nameType)
			const PH_LOCATION = $PH_LOCATION(locationType)
			const DESC_CONTENT = $DESC_CONTENT(contentType)
			const DESC_NAME = $DESC_NAME(nameType)
			const DESC_LOCATION = $DESC_LOCATION(locationType)

			const sortableElement = sortableContainer.createEl('div', { cls: CSS_SORTABLE_ELEMENT })

			/// NOTE TYPE: MAIN SETTING (HEADER)
			
			const ts = new CustomSetting(sortableElement)
				.$addExtraButtonLeft(button => {
					button.extraSettingsEl.addClass(CSS_SORTABLE_HANDLE)
					put(`button-${index}`, button.extraSettingsEl)
					button
						.setIcon(ICON_REORDER)
						// .setTooltip(NT_REORDER)	// disabled for now because it does not go well with Sortable
				})
				.$setName(type.name)
				.addExtraButton(button => {
					button.extraSettingsEl.addClass(CSS_MARGIN)
					button
						.setIcon(ICON_DELETE)
						.setTooltip(TT_DELETE)
						.onClick(() => display(() => saveChanges(() => s.types.remove(type))))
				})
				.addText(text => {
					text
						.setPlaceholder(PH_TYPE_NAME)
						.setValue(type.name)
						.onChange(value => { saveChanges(() => type.name = value); ts.$setName(value) })
				})
				.addExtraButton(button => {
					button.extraSettingsEl.addClass(CSS_MARGIN)
					button
						.setIcon(ICON_CONFIGURE)
						.setTooltip(TT_CONFIGURE)
						.onClick(() => display(() => saveChanges(() => type.show_config = !type.show_config)))
			})

			/// NOTE TYPE: CONFIG

			if (!type.show_config) return

			const configEl = sortableElement.createDiv({ cls: CSS_TM_SETTINGS })

			const s_content = new Setting(configEl)
				.setName(NAME_CONTENT)
				.setDesc(DESC_CONTENT)

			if (type.note_content.method === 'path')
				s_content.addText(text => {
					text
						.setPlaceholder(PH_CONTENT)
						.setValue(type.note_content.data)
						.onChange(value => saveChanges(() => type.note_content.data = value))
				})
			else 
				s_content.addTextArea(text => {
					text
						.setPlaceholder(PH_CONTENT)
						.setValue(type.note_content.data)
						.onChange(value => saveChanges(() => type.note_content.data = value))
				})

			s_content.addButton(button => {
				button.buttonEl.addClass(CSS_MLEFT)
				button
					.setIcon('logo-crystal')
					.setButtonText(type.note_content.method.toUpperCase())
					.setTooltip(TT_TOGGLE)
					.onClick(() => display(() => saveChanges(() => type.note_content.toggle())))
			})


			const s_name = new Setting(configEl)
				.setName(NAME_NAME)
				.setDesc(DESC_NAME)
				.addText(text => { 
					text
						.setPlaceholder(PH_NAME)									
						.setValue(type.note_name.data)
						.onChange(value => saveChanges(() => type.note_name.data = value))
				})
				.addButton(button => {
					button.buttonEl.addClass(CSS_MLEFT)
					button
						.setIcon('logo-crystal')
						.setButtonText(type.note_name.method.toUpperCase())
						.setTooltip(TT_TOGGLE)
						.onClick(() => display(() => saveChanges(() => type.note_name.toggle())))
				})

			const s_location = new Setting(configEl)
				.setName(NAME_LOCATION)
				.setDesc(DESC_LOCATION)
				.addText(text => { 
					text
						.setPlaceholder(PH_LOCATION)
						.setValue(type.note_location.data)
						.onChange(value => saveChanges(() => type.note_location.data = value))
				})
				.addButton(button => {
					button.buttonEl.addClass(CSS_MLEFT)
					button
						.setIcon('logo-crystal')
						.setButtonText(type.note_location.method.toUpperCase())
						.setTooltip(TT_TOGGLE)
						.onClick(() => display(() => saveChanges(() => type.note_location.toggle())))
				})

			const s_hotkeys = new Setting(configEl)
				.setName(NAME_HOTKEYS)
				.addToggle(toggle => {
					toggle
						.setValue(type.hotkeys)
						.onChange(value => saveChanges(() => type.hotkeys = value))
				})

			s_hotkeys.descEl.createEl('p', { text: MSG_RELOAD_APPLY, cls: CSS_HINT })

			;[s_content, s_name, s_location, s_hotkeys].forEach(s => s.settingEl.addClass(CSS_TM_SETTING))

		})

		/// REORDER TYPES

		new Sortable(sortableContainer, {
			animation: 250,
			ghostClass: CSS_SORTABLE_GHOST,
			handle: '.' + CSS_SORTABLE_HANDLE,
			chosenClass: CSS_SORTABLE_CHOSEN,
			dragClass: CSS_SORTABLE_DRAG,
			onUpdate: evt => saveChanges(() => arraymove(s.types, evt.oldIndex, evt.newIndex))
		})

		/// ADD NOTE TYPE

		containerEl.createEl('p', { text: MSG_RELOAD, cls: CSS_HINT_END })

		new Setting(containerEl)
			.addButton(button => {
				button
					.setButtonText(BTN_ADD)
					.onClick(() => display(() => saveChanges(() => s.addNoteType())))
			})

	}

}

class CustomSetting extends Setting {

	/*
		Extends `nameEl`, supplementing it with additional components on left and right sides
		setName() should not be used or it will erase custom components, use $setName() instead
	*/

	constructor(containerEl: HTMLElement) {
		super(containerEl)
		this.init()
	}

	customEl: HTMLElement

	customLeftEl: HTMLElement
	customNameEl: HTMLElement
	customRightEl: HTMLElement

	private init() {

		this.customEl = createDiv({ cls: CSS_CUSTOM_FLEX })
		this.customLeftEl = createDiv({ cls: CSS_CUSTOM_FLEX })
		this.customNameEl = createDiv({ cls: CSS_CUSTOM_NAME_DIV })
		this.customRightEl = createDiv({ cls: CSS_CUSTOM_FLEX })

		this.customEl.appendChild(this.customLeftEl)
		this.customEl.appendChild(this.customNameEl)
		this.customEl.appendChild(this.customRightEl)

		this.nameEl.appendChild(this.customEl)

	}

	$addExtraButtonLeft(cb: (component: ExtraButtonComponent) => any) {
		cb(new ExtraButtonComponent(this.customLeftEl))
		return this
	}

	$addExtraButtonRight(cb: (component: ExtraButtonComponent) => any) {
		cb(new ExtraButtonComponent(this.customRightEl))
		return this
	}

	$setName(name: string) {
		this.customNameEl.textContent = name
		return this
	}

}
