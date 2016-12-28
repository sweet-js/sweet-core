module.exports = {
	entry: './build/src/browser-sweet.js',
	output: {
		path: __dirname + '/browser/scripts',
		library: "sweet",
		libraryTarget: 'amd',
		filename: 'sweet.js'
	}
};