const path = require('path');
const RefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
module.exports = {
    name: 'word-relay-dev',
    mode: 'development', // 실서비스: production 
    devtool: 'eval', // 실서비스:  hidden-source-map
    resolve: {
        extensions: ['.js', '.jsx'],
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
                        debug: true, // 개발용
                    }],
                    '@babel/preset-react',
                ],
                plugins: [
                    '@babel/plugin-proposal-class-properties',
                    'react-refresh/babel',

                ],
            },
            exclude: path.join(__dirname, 'node_modules'),
        }],
    },


    plugins: [
        new RefreshWebpackPlugin(),
        // new webpack.LoaderOptionsPlugin({ debug: true }), // 개발용 (로더 options 내에 debug: true 를 전부 붙여줌)

    ],


    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        publicPath: '/dist',
    },

    devServer: {

        publicPath: '/dist/',
        hot: true

    }
};