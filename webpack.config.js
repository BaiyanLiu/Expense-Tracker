let path = require('path');

module.exports = {
    entry: './src/main/js/app.tsx',
    devtool: 'source-map',
    cache: true,
    mode: 'production',
    output: {
        path: __dirname,
        filename: './src/main/resources/static/built/bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            exclude: /(node_modules)/,
            use: 'ts-loader',
        }],
    }
};
