const seedrandom = require('seedrandom');
const fs = require("fs");
const unicode = require("../unicode/unicode.js");
const { loadingBarSet, swap } = require("./lib.js");

//replace this with whatever random function you want, as long as it has a seed
function randBinary(seed, n) {
	const rng = seedrandom(seed);
	let binaryString = '';
	for (let i = 0; i < n; i++) {
		const randomBit = Math.floor(rng() * 2);
		binaryString += randomBit.toString();
	}
	return binaryString;
}

function xor(a, b) {
	var result = '';
	for (var i = 0; i < a.length; i++) {
		result += (a[i] ^ b[i]);
	}
	return result;
}


function randInt(seed, min, max) {
	const rng = seedrandom(seed);
	return Math.floor(rng() * (max - min + 1)) + min;
}

function hasDuplicates(obj) {
	const values = Object.values(obj);
	const uniqueValues = new Set(values);
	return values.length !== uniqueValues.size;
}

async function genDictionary(seed, selectedCharset) {

	//helper function to make a new random character
	function makeChar(size, char, r) {
		let newChar = "1" + randBinary(seed + charset[char].join("_").replaceAll(" ", "_") + "_" + r, size) + "1";
		// prevent the seperation string from being in the dict
		while (newChar.includes("1001")) {
			newChar = newChar.replace(/1001/g, "1011");
		}
		newChar = newChar
			.slice(1, -1)
			.replaceAll("0", ".").replaceAll("1", "-");
		return newChar;
	}

	//get charset
	let charset = unicode[selectedCharset] || unicode.small;
	const start = Date.now();
	const chars = {};
	let charkeys = Object.keys(charset);
	//make a new encoding for every char in the charset
	charkeys.forEach((char, i) => {
		let s = 2;
		let newChar = makeChar(s, char, s);
		while (Object.values(chars).includes(newChar)) {
			newChar = makeChar(s - s % 2, char, s);
			s += 1; //future mr: this is why it's slow ;)

		}
		if (i % 20 == 0) {
			//progress bar
			loadingBarSet(i / charkeys.length * 100, "| " + i + "/" + charkeys.length + " | " + char + " | " + ((Date.now() - start) / 1000)) + "seconds";
		}
		chars[char] = newChar;
	})
	const end = Date.now();
	const netTime = end - start;
	console.log(chars);

	console.log(netTime + "ms |", Object.keys(chars).length / netTime * 1000, "per second |", Object.keys(chars).length, "total | has duplicates:", hasDuplicates(Object.values(chars)));
	fs.writeFileSync("dictionaries/dictionary_" + selectedCharset + "_" + Object.keys(charset).length + "_" + seed + ".txt", JSON.stringify(chars));
	return chars;
}

async function compileDict(dict) {
	//make the dictionary something that you can easily encode into
	let out = {};
	for (char in dict) {
		let outchar = dict[char].replace(/\./g, "01").replace(/-/g, "11");
		out[char] = outchar;
	}
	return out;
}

async function getDictionary(seed, charset, flipped = false) {
	//attempt to retrieve dictionary
	let dict = fs.readFileSync("dictionaries/dictionary_" + charset + "_" + Object.keys(unicode[charset]).length + "_" + seed + ".txt");
	if (!dict) {
		//if it doesn't exist, make it
		dict = await genDictionary(seed);
	}
	dict = JSON.parse(dict);
	//compile it before returning
	dict = await compileDict(dict);
	if (flipped) {
		dict = swap(dict)
	}
	return dict;
}


//>>>>obfuscation functions

function chunkSubstr(str, size) {
	let pad = 0;
	if (str % size != 0) {
		pad = str % size;
	}
	str += '='.repeat(pad);
	const numChunks = Math.ceil(str.length / size)
	const chunks = new Array(numChunks)

	for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
		chunks[i] = str.substr(o, size)
	}

	return chunks
}

function invertBits(binary) {
	return binary
		.split("")
		.map(bit => (bit === "0" ? "1" : "0"))
		.join("");
}
function invertChunks(bin) {

	let chunks = chunkSubstr(bin, 4);
	let out = '';
	chunks.forEach(chunk => {
		out = chunk.split("").reverse().join("") + out;
	});
	return out;
}
function obfuscate(bin, seed) {

	let out = bin;
	out = xor(out, randBinary(seed, out.length));
	out = out.split("").reverse().join("");
	out = invertBits(out);
	out = invertChunks(out);
	//	out = rle.encode(out);
	//console.log('obfuscating',{bin,out})
	return out;
}
function deobfuscate(bin, seed) {
	let out = bin;
	//	out = rle.decode(out)
	out = invertChunks(out);
	out = invertBits(out);
	out = out.split("").reverse().join("");
	out = xor(out, randBinary(seed, out.length));
	//console.log('deobfuscating',{bin,out})
	return out;
}

//<<<<obfuscation functions

async function encode(toEncode, key, charset = "chars") {
	//step 1: get dictionary
	const dict = await getDictionary(key, charset);

	//step 2: replace with dictionary binary

	let out = [];
	toEncode.split("").forEach(char => {
		let code = dict[char] || dict["□"];
		out.push(code);
		// console.log(char)
		// console.log(code)
		// console.log(code.length)
	});

	out = out.join("1001");

	//step 3: obfuscate
	out = obfuscate(out, key);

	return out;
}

async function decode(toDecode, key, charset = "chars") {
	//step 1: get dictionary

	const dict = await getDictionary(key, charset, true);

	let out = toDecode;

	//step 2: deobfuscate
	out = deobfuscate(out, key)

	//step 3: split into array of binaries

	//"1001" is the string to split each character by
	out = out.split("1001");

	//step 4: replace binary with chars

	out.forEach((char, i) => {
		out[i] = dict[char];
	});
	out = out.join("");

	return out
}



function compress(toCompress) {
	let out = toCompress;
	return out;
}

function decompress(toDecompress) {
	let out = toDecompress;
	return out;
}





//test
async function test() {
	// await genDictionary(123, "chars");
	let original = "this is a very long string just ready to be encoded and turned into a longer string, because I rather enjoy this file format :). It includes all unicode! (theoretically)";
	let encoded = await encode(original, 123)
	let decoded = await decode(encoded, 123);
	let compressed = compress(encoded);
	let decompressed = decompress(compressed);
	console.log(original);
	console.log(encoded);
	console.log(decoded);
	console.log(compressed)
	console.log(decompressed)
	console.log(decompressed == encoded)
	console.log(encoded.length, original.length, encoded.length / original.length, compressed.length, decompressed.length, compressed.length/decompressed.length);
	fs.writeFileSync("lib/out.txt", original + "\n\n" + encoded)
}
test();


module.exports = {
	encode,
	decode
}