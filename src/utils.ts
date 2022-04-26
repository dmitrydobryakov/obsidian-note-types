export function scope() {
	const obj: any = { }
	const put = (key: string, value: any) => obj[key] = value
	const take = (key: string) => obj[key]
	return { put, take }
}

const isUndefined = (value: any) => value == undefined

function toInstance<T extends object>(target: T, data: any, { normalize = true, strict = true }: ({ normalize?: boolean, strict?: boolean }) = { }): T {

	if (!strict && isUndefined(target)) return data	// not very safe, as type of data is unknown
	if (isUndefined(target) || isUndefined(data)) return normalize ? _normalize(target) : target
	if (dontConvert(data, target)) return data as T

	function dontConvert(source: any, target: any) {
		// Don't convert if the values are primitive and have the same prototype
		return Object.getPrototypeOf(source) === Object.getPrototypeOf(target)
			&& source !== Object(source) && target !== Object(target)
	}

	function _normalize(target: any) {
		if (Array.isArray(target) && target.hasOwnProperty('__type'))
			delete (target as any).__type
		return target
	}

	// Create a copy of target instance using default constructor
	const another = (instance: T) => new (Object.getPrototypeOf(instance)?.constructor)
	const resInstance: any = another(target)

	if (Array.isArray(target)) {

		// Make sure target has a __type property, as it contains the type of array items
		const itemType = (target as any).__type
		if (!itemType) { throw new Error(`Please, specify Array type using '$Array' function`) }
		
		// Initialize a single target for each array item
		const itemTarget = new itemType

		for (const item of data)
			resInstance.push(toInstance(itemTarget, item, { normalize, strict }))
		
		return resInstance

	}

	for (const propName of Object.getOwnPropertyNames(target)) {
		(resInstance as any)[propName] = toInstance((target as any)[propName], data[propName], { normalize, strict })
	}

	return resInstance as T

}

type Props<Type> = {
	[Property in keyof Type]+?: any
}

/**
 * Creates a default instance of given type and populates it with data recursively.
 * Keeps extra information about the types of the properties.
 * @param type Target type.
 * @param data Source data.
 * @returns Instance of target type created on source data.
 */
export function $new<T extends object>(type: new (...args: any[]) => T, data: Props<T> = { }): T {
	return toInstance(new type, data, { normalize: false, strict: false })
}

/**
 * Converts plain JSON object into an instance of given type recursively (i.e. properties are also converted to
 * their respective types).
 * Removes any extra information about the types of the properties.
 * @param type Target type.
 * @param data Source data (JSON object).
 * @returns Instance of target type created on source data.
 */
export function $$new<T extends object>(type: new (...args: any[]) => T, data: any = { }): T {
	return toInstance(new type, data, { normalize: true, strict: false })
}

/**
 * Creates an empty array of given type.
 * Secretly saves the type of array elements into '__type' property, so that arrays of untyped data can be
 * converted correctly using '$$new' function.
 * @param type Type of array elements.
 * @returns Array that stores the type of its elements.
 */
export function $Array<T>(type: new (...args: any[]) => T, ...args: any[]): Array<T> {
	const arr = new Array(...args)
	;(arr as any).__type = type
	return arr
}

//////////////////////////////////////////////////////////////////////////////////////////

export function descriptors(obj: any): any {

	function copy(to: any, ...fromArr: any[]) {
		for (const from of fromArr)		
			for (const propName in from)
				to[propName] = from[propName]
		return to
	}

	function createCopy(...from: any[]) {
		return copy(Object.create(null), ...from)
	}

	function _props(obj: any, mark: number, res: any): any {
		const own 		= Object.getOwnPropertyDescriptors(obj)
		const proto     = Object.getPrototypeOf(obj)
		res[mark] = createCopy(own)
		if (proto) _props(proto, mark + 1, res)
		return res
	}

	return _props(obj, 0, Object.create(null))

}

export function props(obj: any): any {

	function oMap(obj: any, map: (prop: any) => any): any {
		const res = Object.create(null)
		for (const propName in obj)
			res[propName] = map(obj[propName])
		return res
	}

	return oMap(descriptors(obj), depth => {
		return oMap(depth, descriptor => {
			if (descriptor.hasOwnProperty('value'))
				return descriptor.value
			else if (descriptor.hasOwnProperty('get') || descriptor.hasOwnProperty('set'))
				return { get: descriptor.get, set: descriptor.set }
			else return descriptor
		})
	})

}

export function ownProps(obj: any): any {
	return props(obj)['0']
}

//////////////////////////////////////////////////////////////////////////////////////////

export function arraymove(arr: any[], fromIndex: number, toIndex: number) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}
