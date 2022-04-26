import { Modal, TextComponent } from 'obsidian'
import { app } from '../global'

export class EnterTextModal extends Modal {
    
	input: TextComponent

	private didSubmit: boolean = false

	constructor() {
        super(app)
		this.input = this.makeInputEl()
    }

	setTitle(title: string) {
		this.titleEl.setText(title)
		return this
	}

	setInput(set: (input: TextComponent) => any) {
		set(this.input)
		return this
	}

	private _onSubmit: (value: string) => any
	onSubmit(onSubmit: (value: string) => any) {
		this._onSubmit = onSubmit
		return this
	}

	private _onCancel: (value: string) => any
	onCancel(onCancel: (value: string) => any) {
		this._onCancel = onCancel
		return this
	}
	
	onOpen() {
		this.didSubmit = false
		this.input.inputEl.focus()
		return this
	}

	onClose() {
		if (!this.didSubmit) 
			this._onCancel?.(this.input.getValue())
		return this
	}

    private makeInputEl() {
		
		const inputDiv = this.contentEl.createDiv({ cls: 'nt-entermodal-div' })
		const form = inputDiv.createEl('form')
		form.type = 'submit'
		form.onsubmit = (e: SubmitEvent) => {
			e.preventDefault()
			this._onSubmit?.(this.input.getValue())
			this.didSubmit = true
			this.close()
        }
		const inputEl = new TextComponent(form)
		inputEl.inputEl.addClass('nt-entermodal-input')
		return inputEl

    }

}

export async function requestName(): Promise<string> {
	return new Promise<string>((resolve) => {
		new EnterTextModal()
			.setTitle('Enter note name')
			.onSubmit(value => resolve(value))
			.onCancel(() => resolve(null))
			.setInput(input => input
				.setPlaceholder('Note name')
				.setValue(''))
			.open()
	})
}
