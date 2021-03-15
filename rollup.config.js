import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

export default {
	input: 'src/karma.js',
	output: {
		file: 'dist/karma.js',
		format: 'cjs'
	},
	external: [ 'ti.socketio' ],
	plugins: [
		nodeResolve(),
		commonjs()
	]
};
