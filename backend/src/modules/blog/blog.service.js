const store=require('../../db/contentStore');
const getAll=()=>store.all('blog');
const getById=id=>store.get('blog',id);
module.exports={getAll,getById};
