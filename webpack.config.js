const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: './src/index.tsx',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'main.js'
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
	},
	module: {
		rules: [{
			test: /\.(js|ts)x?$/,
			exclude: /node_modules/,
			loader: 'babel-loader'
		}, {
			test: /\.(js|ts)x?$/,
			exclude: /node_modules/,
			loader: 'eslint-loader',
			options: {
				fix: true
			}
		}, {
			test: /\.css$/,
			loader: ['style-loader', 'css-loader']
		}, {
			test: /\.s[ac]ss$/,
			loader: ['style-loader', 'css-loader', 'sass-loader']
		}]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'index.html')
		})
	]
}