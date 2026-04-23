let path = require('path');

module.exports = {
    entry: './src/main/js/app.tsx',
    devtool: 'source-map',
    cache: true,
    mode: 'development',
    output: {
        path: __dirname,
        filename: './src/main/resources/static/built/bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
        rules: [{
            test: path.join(__dirname, '.'),
            exclude: /(node_modules)/,
            use: 'ts-loader',
        }],
    }
};
