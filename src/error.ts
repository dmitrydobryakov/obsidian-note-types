function isObject(obj: any) {
	return obj === Object(obj)
}

function isError(obj: any): obj is Error {
	return isObject(obj) && 'message' in obj && 'name' in obj
}

function toError(obj: any, fallbackName?: string): Error { 
	return ({ 
		...obj,
		name: obj.name ?? fallbackName,
		message: obj.message ?? JSON.stringify(obj),
		stack: obj.stack
	})
}

/// Some of Error properties are not own / enumerated, they need to be copied manually
function copyError(error: Error): Error {
	return ({ 
		...error,
		name: error.name,
		message: error.message,
		stack: error.stack
	})
}

/// Just wraps an (error / message / any thrown object) to give it a code
export class CodeError implements Error {
	name: string; message: string
	constructor(error: any, public code?: string) {
		const sourceError: Error = isError(error)
			? copyError(error)
			: (typeof error === 'string')
				? { ...toError(new Error(error)), name: 'CodeError' }
				: toError(error, 'CodeError')
		Object.assign(this, sourceError)
	}
}

/// Error with cause
export class TraceError implements Error {

	name: string
	message: string
	cause?: any

	constructor(error: any, cause?: any) {
		const sourceError: Error = isError(error) 
			? copyError(error)
			: (typeof error === 'string')
				? toError(new Error(error), 'TraceError')
				: toError(error, 'TraceError')
		Object.assign(this, sourceError)
		this.cause = cause
	}

	trace(): any[] {

		// Handle infinite recursion later (or maybe not)
		function addToTrace(obj: any) {
			if (obj === undefined) return
			trace.push(obj)
			addToTrace(obj.cause)
		}

		const trace: any[] = [ ]
		addToTrace(this)
		return trace

	}

	traceCodes(delimiter: string = ' <- '): string {
		return this.trace().map(err => err.code).join(delimiter)
	}

	traceMessages(delimiter: string = '\n<- '): string {
		return this.trace().map(err => err.message).join(delimiter)
	}

}

export function traceCodeError(code: string, error: any, cause?: any) {
	const codeError = new CodeError(error, code)
	return new TraceError(codeError, cause)
}

export const rethrow = (code: string, err: any) => (cause?: any) => { throw traceCodeError(code, err, cause) }
export const traceError = (code: string, err: any, cause?: any) => { throw traceCodeError(code, err, cause) }

export function message(err: any) {
	return err instanceof TraceError
		? err.traceMessages()
		: err.message ?? err
}
