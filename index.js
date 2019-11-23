const tmi = require('tmi.js');
var https = require('https');
var _ = require('lodash');

var gameId = 491931;
var channels = [];

var options = {
    host: 'api.twitch.tv',
    path: '/helix/streams?game_id=491931',
    headers: {
      'Client-Id': 'u8fkxgiy0vgvcutn63juxdxmq95eld',
    },
    method: 'GET',
}

let req = https.request(options, (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    let dataParsed = JSON.parse(data)
    channels = _.map(dataParsed.data, channel => {
        channels.push('#'+ channel.user_name);
    });
    console.log(channels.length + ' channels to be scanned')
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

req.end();

// Define configuration options
const opts = {
  options: { debug: false },
	connection: {
		reconnect: true,
		secure: true
	},
	channels,
};

console.log('starting tmi');
const client = new tmi.Client(opts);
client.connect();
console.log('connected to twitch');

client.on('message', (channel, tags, message, self) => {
    // if(self) return;
    let regex = /.....-.....-.....-...../g;
    let found = message.toLowerCase().match(regex);
	if(!_.isEmpty(found)) {
        
        console.log(found);
        console.log('///////////////////////');
	}
});