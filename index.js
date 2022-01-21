require("dotenv").config();
const http = require('http');
const https = require('https');
const Redis = require('ioredis');

const options = {
  hostname: process.env.HOST,
  port: process.env.HOST_PORT,
  path: process.env.HOST_PATH,
  method: process.env.HOST_METHOD
}

const requestListener = async function (req, res) {
	if (req.url === '/') {
        res.writeHead(200);
		res.end('Hello, World!');
    }else if(req.url === '/request'){
		res.setHeader("Content-Type", "application/json");
		makeRequest((jsonObj) => {
			res.writeHead(200);
			res.write(jsonObj);
			res.end();
		});
	}else if(req.url === '/set-redis'){
		res.setHeader("Content-Type", "application/json");
		await setRedisData();
		res.end("Redis Value Set");
	}else if(req.url === '/get-redis'){
		res.setHeader("Content-Type", "application/json");
		const data = await getRedisData();
		res.write(data);
		res.end();
	}
}

function makeRequest(onResult){
	
	const req = https.request(options, res => {
		var data;
		console.log(`statusCode: ${res.statusCode}`);

		res.on('data', d => {
			data += d;
		});
		
		res.on("end", () => {
			data = JSON.stringify(data.replace(/^undefined/g, ''));
			let obj = JSON.parse(data);
			onResult(obj);
		});
	});

	req.on('error', error => {
		console.error(error);
	});

	req.end();
}

async function setRedisData(){
	const redis = new Redis(process.env.REDIS_URL, process.env.REDIS_PORT);
	await redis.set("foo", "bar");
}

async function getRedisData(){
	const redis = new Redis(process.env.REDIS_URL, process.env.REDIS_PORT);
	const data = await redis.get("foo");
	return data;
}

const server = http.createServer(requestListener);
server.listen(process.env.APP_PORT, () => {
	console.log("Listening on " + process.env.APP_PORT);
});
