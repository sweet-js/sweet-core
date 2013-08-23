# build all and run the tests
all:
	node --harmony build

test_all:
	node build build_macros build_test build_browser test

# just build the file `test.js` if it exists
test_file:
	node --harmony build build build_test_file

# build and run the benchmarks
bench:
	node --harmony build benchmark

# build and replace the current version of sweet.js in `lib/`
dist:
	node build build_dist

clean:
	node build clean
