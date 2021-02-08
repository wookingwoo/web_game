const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development', // 실서비스: production 
    devtool: 'eval', // 실서비스:  hidden-source-map
    resolve: {
        extensions: ['.jsx', '.js'],
    },

    entry: {
        app: './client',
    },


    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            options: {
                presets: [
                    ['@babel/preset-env', {
                        targets: {
                            browsers: ['> 1%', '> 1% in KR'], // browserslist
                        },
                        // debug: true, // 개발용
                    }],
                    '@babel/preset-react',
                ],
                plugins: [],
            },
        }],
    },


    plugins: [
        // new webpack.LoaderOptionsPlugin({ debug: true }), // 개발용 (로더 options 내에 debug: true 를 전부 붙여줌)
    ],


    output: {
        filename: 'app.js',
        path: path.join(__dirname, 'dist'),
    },
};