import { App, FuzzySuggestModal, Modal, TextComponent } from 'obsidian'
import { NoteType } from '../settings'
import { settings } from '../global'

export type KeyboardOptionsVariant<T> = {
	modifiers: String[],
	key: String,
	options: T
}

export class NTModal<T> extends FuzzySuggestModal<NoteType> {

	private filter: (type: NoteType) => boolean
	private onChoose: (type: NoteType, data: any) => any
	private defData: any

	constructor(app: App, onChoose: (type: NoteType, data: T) => any, defData: T) {
		super(app)
		this.onChoose = onChoose
		this.defData = defData
	}

	setDefData(data: any) {
		this.defData = data
	}

	setFilter(filter: (type: NoteType) => boolean) {
		this.filter = filter
	}

	setVariants(variants: KeyboardOptionsVariant<T>[]) {
		for (const variant of variants) {
			;(this as any).scope.register(variant.modifiers, variant.key, (evt: KeyboardEvent) => {
				;(evt as any).data = variant.options
				;(this as any).chooser.useSelectedItem(evt)
			})
		}
	}

	getItems(): NoteType[] { 
		return this.filter 
			? settings.types.filter(this.filter)
			: settings.types
	}

	getItemText(item: NoteType): string {
		return item.name || '<no-name>'
	}
	
	onChooseItem(item: NoteType, evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(item, { ...this.defData, ...(evt as any).data })
	}

}
