import { Plugin } from 'obsidian'
import { NoteTypesSettingTab } from './ui/ui-settings'
import { NTSettings, DEFAULT_SETTINGS } from './settings'
import { Obsidian } from './obsidian'
import { NoteType } from './settings'
import { settings, setObsidian, setSettings, setApp, setPlugin } from './global'
import { $$new } from './utils'

import { shCreateOpenModal, shCreateOpenLinkModal, shMoveModal, shPasteModal, shPasteMoveModal, lnCreateOpenModal } from './ui/ui-modals'
import { shCreateOpen, shCreateOpenLink, shMove, shPaste, shPasteMove } from './commands/commands'
import { registerContextMenuCommands, registerClickLink } from './ui/link-context-menu'

export default class NoteTypesPlugin extends Plugin {

	settings: NTSettings

	async onload() {

		setObsidian(new Obsidian(this.app))
		setSettings($$new(NTSettings, (await this.loadData()) ?? { }) || DEFAULT_SETTINGS)
		setApp(this.app)
		setPlugin(this)

		this.settings = settings

		this.addCommand({
			id: "create-open",
			name: "Create and open a note of selected type",
			callback: () => shCreateOpenModal().open()
		})

		this.addCommand({
			id: "create-open-link",
			name: "Create and open a note of selected type and paste a link",
			callback: () => shCreateOpenLinkModal().open()
		})

		this.addCommand({
			id: "paste",
			name: "Paste contents of selected type",
			callback: () => shPasteModal().open()
		})

		this.addCommand({
			id: "move",
			name: "Move note to location of selected type",
			callback: () => shMoveModal().open()
		})

		this.addCommand({
			id: "paste-move",
			name: "Paste contents and move note (keep the name)",
			callback: () => shPasteMoveModal().open()
		})

		const filterTypes = (validate: (type: NoteType) => boolean) => 
			this.settings.types.filter(type => validate(type) && type.hotkeys)

		filterTypes(shCreateOpen.validate).forEach((type, index) => {

			this.addCommand({
				id: `create-open-${type.uuid}`,
				name: `'${type.name}' note: create and open`,
				callback: () => shCreateOpen.command(type, { newPane: false })
			})

		})

		filterTypes(shCreateOpenLink.validate).forEach((type, index) => {

			this.addCommand({
				id: `create-open-link-${type.uuid}`,
				name: `'${type.name}' note: paste link, create and open`,
				callback: () => shCreateOpenLink.command(type, { newPane: false })
			})

		})

		filterTypes(shPaste.validate).forEach((type, index) => {

			this.addCommand({
				id: `paste-${type.uuid}`,
				name: `'${type.name}': paste contents`,
				callback: () => shPaste.command(type, { })
			})

		})

		filterTypes(shMove.validate).forEach((type, index) => {

			this.addCommand({
				id: `move-${type.uuid}`,
				name: `'${type.name}': move to location`,
				callback: () => shMove.command(type, { })
			})

		})

		filterTypes(shPasteMove.validate).forEach((type, index) => {

			this.addCommand({
				id: `paste_move-${type.uuid}`,
				name: `'${type.name}': paste contents and move (keep the name)`,
				callback: () => shPasteMove.command(type, { })
			})

		})

		this.addSettingTab(new NoteTypesSettingTab(this.app, this))

		registerContextMenuCommands(this)
		registerClickLink(this, settings.clickLink)

	}

	async onunload() {

		await this.saveData(this.settings)

	}

}

