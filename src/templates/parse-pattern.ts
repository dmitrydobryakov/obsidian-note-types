import { PatternParser, ParsedPattern } from './types'

export function parsePattern(source: string): ParsedPattern {
	// This is a temporary solution that parses only one argument
	// If this argument happens to be formatted as a quote or as a link, the extracted contents get parsed and saved to their own field
	const regex = /(?<name>[\w-]+)(?:.(?<field>(?<=\.)[\w-]+))?(?::(?<args>(?<=:)(?:[\w-]+|"(?<quotes>.*)"|\[\[(?<link>.*)\]\])))?/
	const groups = source.match(regex).groups
	return {
		source,
		name: groups.name,
		args: { 
			field: groups.field, 
			arg: groups.args,
			arg_quotes: groups.quotes,
			arg_link: groups.link
		}
	}
}
