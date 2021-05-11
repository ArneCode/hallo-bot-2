const discordTTS = require('discord-tts'); // text to speech for discord
const server=require("./server.js");
const hellos=["hallo","tach"]
module.exports={message}
async function message(msg,bot){
  const {content,author,guild}=msg
  const guildInfo=await server.getGuildInfo(guild)
  console.log(guildInfo);
  if(hellos.includes(content.toLowerCase())){

  }
}