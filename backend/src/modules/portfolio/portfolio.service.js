const store=require('../../db/contentStore');
async function getAll({category}={}){return store.all('portfolio',{category})}
async function getById(id){return store.get('portfolio',id)}
async function create(payload){return store.save('portfolio',{...payload,id:payload.id||`p_${Date.now()}`})}
async function update(id,payload){const old=await getById(id);if(!old)return null;return store.save('portfolio',{...old,...payload,id})}
async function remove(id){return store.remove('portfolio',id)}
module.exports={getAll,getById,create,update,remove};
