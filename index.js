const tmi = require('tmi.js');
const https = require('https');
const _ = require('lodash');
const { exec } = require('child_process');
let { channels } = require('./config.json');
const { debug, clientId } = require('./config.json');

const notifyMethod = process.platform === 'win32' ? 'msg' : 'notify-send';

const options = {
  host: 'api.twitch.tv',
  path: '/helix/streams?game_id=491931',
  headers: {
    'Client-Id': clientId,
  },
  method: 'GET',
};

const getStreams = () => {
  const req = https.request(options, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      const dataParsed = JSON.parse(data);
      channels = _.map(dataParsed.data, (channel) => {
        channels.push(`#${channel.user_name}`);
      });
      console.log(`${channels.length} channels to be scanned`);
    });
  }).on('error', (err) => {
    console.log(`Error: ${err.message}`);
  });
  req.end();
};
getStreams();
setInterval(() => { getStreams(); }, 1800000);

const opts = {
  options: { debug },
  connection: {
    reconnect: true,
    secure: true,
  },
  channels,
};

console.log('starting tmi');
const client = new tmi.Client(opts);
client.connect();
console.log('connected to twitch');

exec(`${notifyMethod} TwitchScaper "notifications enabled"`);
client.on('message', (channel, tags, message) => {
  const regex = /[A-z0-9]{5}-[A-z0-9]{5}-[A-z0-9]{5}-[A-z0-9]{5}/g;
  const found = message.toLowerCase().match(regex);

  if (!_.isEmpty(found)) {
    console.log(found);
    exec(`${notifyMethod} TwitchScaper "${found}"`);
  }
});
