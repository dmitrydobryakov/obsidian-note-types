import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import image from 'rollup-plugin-img';

export default {
	input: 'src/main.ts',
	output: {
		dir: '.',
		sourcemap: 'inline',
		format: 'cjs',
		exports: 'default'
	},
	external: [ 'obsidian', 'path', 'fs' ],
	plugins: [ 
		image({ extensions: /\.(png|jpg|jpeg|gif|svg)$/, limit: 10000 }),
		typescript(), 
		nodeResolve({ browser: true }), 
		commonjs()
	]
}
