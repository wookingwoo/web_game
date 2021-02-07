const path = require('path');

module.exports = {
    name: 'word-relay-dev',
    mode: 'development', // 실서비스: production 
    devtool: 'eval',
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    entry: { // 입력
        app: './client',
    },

    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            options: {
                presets: [
                    ['@babel/preset-env', {
                        targets: { browsers: ['last 2 chrome versions'] },
                        debug: true,
                    }],
                    '@babel/preset-react',
                ],
                plugins: ['react-hot-loader/babel'],
            },
            exclude: path.join(__dirname, 'node_modules'),
        }],
    },
    plugins: [],

    output: { // 출력
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: '/dist',
    },
};