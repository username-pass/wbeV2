const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const {encode, decode} = require("./lib/tbf.js");

app.use(express.static(path.join(__dirname,"public")));


app.post("encode",async (req, res) => {
	const toEncode = req.body.data;
	const key = req.body.key;
	const out = await encode(toEncode,key);
	res.send(out);
})

app.post("decode",async (req, res) => {
	const toDecode = req.body.data;
	const key = req.body.key;
	const out = await decode(toDecode,key);
	res.send(out);
})

app.listen(3000);