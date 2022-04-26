import { Obsidian } from 'src/obsidian'
import { NTSettings } from 'src/settings'
import { App } from 'obsidian'
import NoteTypesPlugin from './main'

let _obsidian: Obsidian
export { _obsidian as obsidian }
export function setObsidian(obsidian: Obsidian) { _obsidian = obsidian }

let _settings: NTSettings
export { _settings as settings }
export function setSettings(settings: NTSettings) { _settings = settings }

let _app: App
export { _app as app }
export function setApp(app: App) { _app = app }

let _plugin: NoteTypesPlugin
export { _plugin as plugin }
export function setPlugin(plugin: NoteTypesPlugin) { _plugin = plugin }
