import { Obsidian } from '../obsidian'

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Parse Pattern

export type ParsedPattern = {
	source: string,
	name: string,
	args: any
}

export type PatternParser = (source: string) => ParsedPattern

////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Evaluate Pattern

class Context {
	private _data: { [ key: string ]: any } = { }
	set(key: string, data: any) { this._data[key] = data }
	get(key: string) { return this._data[key] }
}

export interface EvaluationContext {
	[key: string]: any
	obsidian?: Obsidian
	"this-name"?: string
	"this-folder"?: string
	"this-path"?: string
	"this-content"?: string
}

export interface EvaluationOptions {
	unresolved?: any
}

export class EvaluatedPattern {
	constructor(obj: { value?: string, error?: Error | string }) {
		if (obj.value !== undefined) this._result = { value: obj.value }
		else if (obj.error === null) this._result = { error: undefined }
		else this._result = { error: obj.error }
	}
	private _result: { value: string } | { error?: Error | string }
	success(): boolean {
		return (this._result as any).value !== undefined
	}
	get value(): string {
		const value = (this._result as any).value
		if (value === undefined) throw new Error('Cannot get value of failed EvaluatedPattern')
		return value
	}
	get error(): string | null {
		const value = (this._result as any).value
		const error = (this._result as any).error
		if (value !== undefined) throw new Error('Cannot get error of successful EvaluatedPattern')
		return error
	}
}

/// If value is null or undefined, return successful EvaluatedPattern – otherwise return EvauatedPattern with error
export function maybeEvaluated(value: string | null | undefined, error: Error | string) {
	if (value == undefined) return new EvaluatedPattern({ error })
	return new EvaluatedPattern({ value })
}

export function notEvaluated(error: Error | string) {
	return new EvaluatedPattern({ error })
}

export function evaluated(value: string | null | undefined) {
	return new EvaluatedPattern({ value })
}

export type EvaluatePattern = (
	pattern: ParsedPattern,
	context: EvaluationContext,
	options: EvaluationOptions
) => Promise<EvaluatedPattern> | EvaluatedPattern
