module.exports = {
	entry: './build/src/sweet.js',
	output: {
		path: __dirname + '/browser/scripts',
		library: "sweet",
		libraryTarget: 'amd',
		filename: 'sweet.js'
	}
};