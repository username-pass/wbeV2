# wbeV2

## What is it?

wbe is a file format I made. this is the rewrite of it, to include all unicode characters.

## What is so special about it?

The output looks like random binary, because it literally is! (It's the encoded string, XOR'd with random binary)

Example output:
```
"test" -> 011111010001110010110100100100010100011111100000111101011000011010110100
```

## How do I use it?

I am working on a web interface, but in the meantime, use the `encode` and `decode` functions in `lib/tbf.js`.

## How can I add my own character set?

in `unicode/unicode.js`, add a new export with the same output format