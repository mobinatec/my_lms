const { all, get, save, remove } = require('../../db/contentStore');
function normalize(item){return {...item,courseType:item.courseType||((item.plans||[]).some(p=>p.free===true||p.key==='basic')?'free':'paid'),plans:(item.plans||[]).map(p=>({...p,guestAllowed:p.guestAllowed!==false,free:p.free===true||p.key==='basic'}))}}
async function getAll({level}={}){return (await all('courses',{level})).map(normalize)}
async function getById(id){const item=await get('courses',id);return item?normalize(item):null}
async function create(item){return save('courses',normalize({...item,id:item.id||`c_${Date.now()}`}))}
async function update(id,payload){const old=await getById(id);if(!old)return null;return save('courses',normalize({...old,...payload,id}))}
async function removeCourse(id){return remove('courses',id)}
module.exports={getAll,getById,create,update,remove:removeCourse};
