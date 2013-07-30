all:
	node --harmony build

test_file:
	node --harmony build build build_test_file

bench:
	node --harmony build benchmark

dist:
	node build build_dist

clean:
	node build clean
