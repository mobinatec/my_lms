const store=require('../../db/contentStore');
async function getAll(){return store.all('team')}
async function getById(id){return store.get('team',id)}
async function create(payload){return store.save('team',{...payload,id:payload.id||`t_${Date.now()}`})}
async function update(id,payload){const old=await getById(id);if(!old)return null;return store.save('team',{...old,...payload,id})}
async function remove(id){return store.remove('team',id)}
module.exports={getAll,getById,create,update,remove};
