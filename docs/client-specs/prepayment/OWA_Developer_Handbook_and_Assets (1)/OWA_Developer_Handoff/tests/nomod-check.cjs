const fs=require('fs'),vm=require('vm'),assert=require('assert');
for(const path of process.argv.slice(2)){
 const html=fs.readFileSync(path,'utf8'),nodes=new Map(),store=new Map();
 const node=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',checked:false,style:{},classList:{add(){},remove(){},toggle(){}},focus(){},scrollIntoView(){},setAttribute(){},removeAttribute(){},files:[]});return nodes.get(k)};
 const ctx=vm.createContext({console,Date,Math,JSON,Set,Map,Array,Number,String,RegExp,Promise,Blob,Uint8Array,Error,structuredClone,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{querySelector:node,querySelectorAll:()=>[],getElementById:node,addEventListener(){},body:node('body'),activeElement:node('focus')},window:{scrollTo(){},addEventListener(){}},setTimeout(){},clearTimeout(){},assert,node});
 vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1],ctx);
 vm.runInContext(`
 Object.assign(journey(),{package:'individual',name:'Alex Example',email:'alex@example.com',phone:'+971500000001',payment:'unpaid',nomodConsent:false});
 journey().applicants.forEach(a=>Object.assign(a,{age:true,national:true,assets:true,married:false,children:false}));
 let prevented=false;const evt={preventDefault(){prevented=true}};
 assert.equal(prepareNomodCheckout(evt),true);assert(!prevented);assert.equal(journey().payment,'unpaid');assert.equal(journey().nomodHandoff.status,'opened_not_verified');
 journey().nomodConsent=true;
 for(const [pkg,url,amount] of [['individual','https://pay.nomodapp.com/en/l/3de8ba889b5942b8',999],['couples','https://pay.nomodapp.com/en/l/d5c977670ef34c97',1799]]){
   journey().package=pkg;prevented=false;
   assert.equal(nomodPaymentUrl(),url);
   const screen=prePayment();assert.equal(screen.split('href="'+url+'"').length-1,2);
   assert.equal(screen.split('onclick="return prepareNomodCheckout(event)"').length-1,2);
   assert.equal(screen.split('rel="noopener noreferrer"').length-1,2);
   assert(!screen.includes('onclick="startPayment()"'));assert(!screen.includes('TEST MODE'));
   assert(!screen.includes('Test payment only'));assert(!screen.includes('payment-terms'));assert(!screen.includes('saas-policy'));assert(!screen.includes('saas-next'));assert(!screen.includes('Next: your guided questionnaire'));
   assert.equal(prepareNomodCheckout(evt),true);assert(!prevented);
   assert.equal(journey().nomodHandoff.amount,amount);assert.equal(journey().nomodHandoff.url,url);
   assert.equal(journey().nomodHandoff.status,'opened_not_verified');assert.equal(journey().payment,'unpaid');
   assert(!journey().nomodHandoff.url.includes('@'));assert(!journey().nomodHandoff.url.includes('?'));
 }
 journey().payment='paid';assert.equal(prepareNomodCheckout(evt),false);
 journey().payment='pending';assert.equal(prepareNomodCheckout(evt),false);
 journey().payment='unpaid';journey().email='';assert.equal(prepareNomodCheckout(evt),false);
 journey().email='alex@example.com';journey().applicants[1].age=false;assert.equal(prepareNomodCheckout(evt),false);
 journey().applicants[1].age=true;journey().package='unknown';assert.equal(nomodPaymentUrl(),'');assert.equal(prepareNomodCheckout(evt),false);
 `,ctx);
 console.log('PASS',path,': both package links, both CTAs, direct handoff/validation guards, no PII in URLs, no false paid state.');
}
