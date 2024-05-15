import discordjs from "discord.js";
const { Client, GatewayIntentBits, ActivityType } = discordjs;
import valveserverquery from '@fabricio-191/valve-server-query';
const { Server, RCON } = valveserverquery;

const config = {};

const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers] });

var dnsfailure = 0;

import url from "url";

client.on("ready", () => {
  console.log(`Bot has started, with ${client.guilds.cache.size} guilds.`);

  if ('name' in config) {
    setUsername();
   // setInterval(setUsername, 6000000);
  }

  client.user.setPresence({
    activities: [{
      name: 'customstatus',
      type: ActivityType.Custom,
      state: ' '
    }],
    status: 'dnd'
  });
  
  updateCount();
  setInterval(updateCount, 60000);
});

client.on("guildCreate", guild => {
  console.log(`Joined Guild: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
  console.log(`Removed Guild: ${guild.name} (id: ${guild.id})`);
});

async function setUsername() {
 /*
   // attempt to set nickname in every guild, broken due to djs14 doing weird shit again
  client.guilds.cache.each(guild => {
    guild.me.setNickname(config.name);
    console.log(`Nickname Set: ${config.name} on ${guild.name}`);
  });
  */
  client.user.setUsername(config.name)
  .then(user => console.log(`Username Set: ${user.username}`))
  .catch(console.error);
}

async function updateCount() {

  try {

    const server = await Server({
      ip: config.qhostname,
      port: config.qport,
      timeout: 3000,
    });

    const info = await server.getInfo();

    client.user.setPresence({
      activities: [{
        name: 'customstatus',
        type: ActivityType.Custom,
        state: `${info.players.online}/${info.players.max} playing`
      }],
      status: 'online'
    });

    dnsfailure = 0;
  } catch (error) {
    const { message } = error;

    if (message == "Response timeout.") {
      console.log("server query timed out.")
      client.user.setPresence({
        activities: [{
          name: 'customstatus',
          type: ActivityType.Custom,
          state: ' '
        }],
        status: 'idle'
      });
    } else if (message == "Invalid IP/Hostname") {
      console.log(`dns failure: ${dnsfailure}`)
      dnsfailure += 1;
      if (dnsfailure > 4) {
        client.destroy();
      }
    } else {
      console.log(error);
    }
  }
}

function checkParameters() {
  console.log("Checking parameters...")
  if ('TOKEN' in process.env) {
    config.token=process.env.TOKEN;
  } else {
    console.log("No TOKEN environment variable set. See Documentation")
    return false;
  }

  if ('QUERY' in process.env) {
    const { hostname, port } = url.parse("udp:" + process.env.QUERY);
    config.qhostname = hostname;
    config.qport = parseInt(port);
  } else {
    console.log("No QUERY environment variable set. See Documentation")
    return false;
  }

  if ('NAME' in process.env) {
    config.name = process.env.NAME;
  }
  console.log("Parameters OK.")
  return true;
}

if (checkParameters()) {
  client.login(config.token);
}