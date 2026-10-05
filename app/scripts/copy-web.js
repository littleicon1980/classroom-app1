// copies the freshly built clean web app into ./www (the folder Capacitor packages)
const fs=require('fs'),path=require('path');
const flavor=process.env.FLAVOR==='demo'?'www-demo':'www';
const src=path.join(__dirname,'..','..',flavor,'index.html');
fs.mkdirSync(path.join(__dirname,'..','www'),{recursive:true});
fs.copyFileSync(src,path.join(__dirname,'..','www','index.html'));
fs.copyFileSync(path.join(__dirname,'..','..',flavor,'opencv.js'),path.join(__dirname,'..','www','opencv.js'));
console.log('web app ('+flavor+') copied to app/www');
