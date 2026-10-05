const store=require('../../db/contentStore');
const getAll=()=>store.all('services');
module.exports={getAll};
