const Discord=require("discord.js");
const handler=require("./handler.js");
const server=require("./server.js");
const bot=new Discord.Client();
const token=process.env.BOT_TOKEN;

async function main(){
  await server.init();
await bot.login(token);
bot.on("message",msg=>handler.message(msg,bot))
bot.on("voiceStateUpdate",(old_m,new_m)=>handler.voiceChannelChange(old_m,new_m,bot))
console.log("initialized");
}
main();