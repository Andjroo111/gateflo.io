import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';

export default {
    input: 'src/gateflo.js',
    external: ['@nimiq/hub-api', 'qrcode'],
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: false
        }),
        commonjs(),
        babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**',
            presets: [
                ['@babel/preset-env', {
                    targets: {
                        browsers: [
                            '>0.2%',
                            'not dead',
                            'not op_mini all'
                        ]
                    },
                    modules: false
                }]
            ]
        }),
        postcss({
            extract: true,
            minimize: true,
            sourceMap: true,
            extensions: ['.css']
        }),
        copy({
            targets: [
                { src: 'src/assets/*', dest: 'dist/assets' }
            ]
        })
    ],
    output: [
        // Original outputs
        {
            file: 'dist/gateflo.js',
            format: 'es',
            sourcemap: true
        },
        {
            file: 'dist/gateflo.min.js',
            format: 'es',
            sourcemap: true,
            plugins: [terser()]
        },
        {
            file: 'dist/gateflo.umd.js',
            format: 'umd',
            name: 'GateFlo',
            sourcemap: true,
            extend: true,
            exports: 'default'
        },
        {
            file: 'dist/gateflo.umd.min.js',
            format: 'umd',
            name: 'GateFlo',
            sourcemap: true,
            extend: true,
            exports: 'default',
            plugins: [terser()]
        },
        // New all-in-one bundle with dependencies
        {
            file: 'dist/gateflo.all.min.js',
            format: 'iife',
            name: 'GateFlo',
            sourcemap: true,
            extend: true,
            exports: 'default',
            plugins: [terser()],
            // Include all external dependencies
            inlineDynamicImports: true,
            globals: {
                '@nimiq/hub-api': 'HubApi',
                'web3': 'Web3',
                'qrcode': 'QRCode'
            }
        }
    ],
    onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;

        // Console everything else
        warn(warning);
    }
};
