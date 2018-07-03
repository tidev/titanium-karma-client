import commonjs from 'rollup-plugin-commonjs';
import node from 'rollup-plugin-node-resolve';

export default {
	input: 'src/karma.js',
	output: {
		file: 'dist/karma.js',
		format: 'cjs'
	},
	external: [ 'ti.socketio' ],
	plugins: [
		node(),
		commonjs()
	]
};
