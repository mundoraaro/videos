const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto('file:///home/claude/oroysilicio/intro.html');fs.mkdirSync('fr',{recursive:true});
for(let i=0;i<90;i++){await p.evaluate(t=>render(t),i/30);await p.screenshot({path:`fr/${String(i).padStart(3,'0')}.png`});}
await b.close()})()
