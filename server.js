const Mongo=require("mongodb");
const mongo_username = process.env.MONGO_USERNAME;
const mongo_password = process.env.MONGO_PASSWORD;
const cluster_url = `mongodb+srv://${mongo_username}:${mongo_password}@cluster0-bot1.vffbm.mongodb.net/dcb1?retryWrites=true&w=majority
`;
const cluster = new Mongo.MongoClient(cluster_url, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
let guildInfos={}
async function createGuildInfo(guild){
  let info={
    _id:guild.id,
    name:guild.name,
    members:{}
  }
  await cluster
  .db("hallo-bot")
  .collection("guilds")
  .insertOne(info)
  return info
}
async function updateGuildInfo(guildInfo){
  await cluster
  .db("hallo-bot")
  .collection("guilds")
  .updateOne({_id:guildInfo._id},{$set:guildInfo})
}
async function getGuildInfo(guild){
  const {id}=guild
  if(!guildInfos[id]){
    let info=await cluster
    .db("hallo-bot")
    .collection("guilds")
    .findOne({_id:guild.id})
    if(info){
      guildInfos[id]=info
    }else{
      guildInfos[id]=createGuildInfo(guild)
    }
  }
  return guildInfos[id]
}
async function createMemberInfo(member,guildInfo){
  let info={
    state:null
  }
  guildInfo.members[member.id]=info
  await updateGuildInfo(guildInfo)
  return info
}
async function getMemberInfo(member,guildInfo){
  //let guildInfo=await getGuildInfo(member.guild)
  let {members}=guildInfo
  let {id}=member
  if(id in members){
    return members[id]
  }else{
    return await createMemberInfo(member,guildInfo)
  }
}
async function init(){
  await cluster.connect()
}
module.exports={getGuildInfo,getMemberInfo,updateGuildInfo,init}