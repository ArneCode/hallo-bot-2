const discordTTS = require('discord-tts'); // text to speech for discord
const server = require("./server.js");
const hellos = ["hallo", "tach"]
const roles_allowed = ["KAKTUS RAT", "Admin"]
module.exports = { message, voiceChannelChange }
const prefix = "hallobot "
async function message(msg, bot) {
  let { content, author, guild, member } = msg
  if (author.bot) { return }
  const guildInfo = await server.getGuildInfo(guild)
  const memberInfo = await server.getMemberInfo(member, guildInfo)
  if (content.toLowerCase().startsWith(prefix)) {
    content = content.slice(prefix.length)
    handleCommand(content, msg, memberInfo, guildInfo)
  }
  if (hellos.includes(content.toLowerCase())) {
    let suffix = ""
    let { state } = memberInfo
    if (state) {
      suffix = ", " + state
    }
    if(state=="ignore"){
      return
    }
    let text = `hallo${suffix}`
    msg.channel.send(text)
    if (msg.member.voice.channel) {
      say(msg.member.voice.channel,"./audio/Hallo.mp3",suffix)
    }
  }
}
async function handleCommand(content, msg, memberInfo, guildInfo) {
  let text_split = content.split(" ")
  let command = text_split[0]
  let roles = await getRoleNames(msg.member)
  switch (command) {
    case "set": {
      if (!roles_allowed.some(role => roles.includes(role))) {
        msg.channel.send(`you need to be one of: ${roles_allowed.join(", ")}`)
        console.log(getRoleNames(member),roles_allowed)
        break;
      }
      let target = msg.mentions.members.first()
      let state = text_split.slice(2).join(" ")
      if(state=="null"){
        state=null
      }
      let targetInfo = await server.getMemberInfo(target, guildInfo)
      targetInfo.state = state
      console.log(state, guildInfo, target.id, targetInfo)
      server.updateGuildInfo(guildInfo)
      msg.channel.send(`<@${target.id}> is now a "${state}"`)
      break;
    }
  }
}
async function voiceChannelChange(old_m, new_m, bot) {
  try {
    if (old_m.member.id == bot.user.id) {
      return;
    }
    let oldChannel = old_m.channel;
    let newChannel = new_m.channel;
    if (newChannel != null && oldChannel == null) {
      console.log(`${new_m.member.displayName} joined ${newChannel.name}. HALLO!`);
      let state=await getState(new_m)
      if(["ignore","silent"].includes(state)){
        return
      }
      let suffix = await getSuffix(state);
      let text = new_m.member.displayName + suffix
      say(newChannel, "./audio/Hallo.mp3", text)
    } else if (newChannel == null && oldChannel != null) {
      console.log(`${old_m.member.displayName} left ${oldChannel.name}. Tschüss!`);
      let state=await getState(old_m)
      if(["ignore","silent"].includes(state)){
        return
      }
      let suffix = await getSuffix(state);
      let text = old_m.member.displayName + suffix
      say(oldChannel, "./audio/Tschuess.mp3", text)
    }
  } catch (err) {
    console.log(err);
  }
}
async function getRoleNames(member) {
  let roles = await member.roles.cache.map(role => role.name)
  console.log(roles)
  return roles
}
async function getState(member){
  let guildInfo = await server.getGuildInfo(member.guild)
  let { state } = await server.getMemberInfo(member, guildInfo)
  return state
}
async function getSuffix(state) {
  if (state) {
    return `, ${state}`
  }
  return ""
}
async function say(channel, file, text) {
  const connection = await channel.join()
  let ttsVoice = discordTTS.getVoiceStream(text, {lang:'de'}) //probably works, had problem with language
  //console.log(1)
  setTimeout(() => {
    let speech = connection.play(file);
      //console.log(2)
    speech.on("speaking", (speaking) => {
      if (!speaking) {
        //file has finished playing
          //console.log(3)
        let dispatcher = connection.play(
          ttsVoice
        );
        //console.log(ttsVoice,text);
        dispatcher.on('speaking', speaking => {
          if (!speaking) {
              console.log(4)
            connection.disconnect();
          }
        });
      }
    })
  }, 1500)
}