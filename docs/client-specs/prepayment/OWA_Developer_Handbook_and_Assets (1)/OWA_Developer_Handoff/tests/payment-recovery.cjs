const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(process.argv[2]||'prototypes/OWA_PrePayment_Review.html','utf8');
const nodes=new Map(),store=new Map();const node=k=>{if(!nodes.has(k))nodes.set(k,{innerHTML:'',textContent:'',value:'',checked:false,style:{},classList:{add(){},remove(){},toggle(){}},focus(){},scrollIntoView(){},setAttribute(){},removeAttribute(){},files:[]});return nodes.get(k)};
const callbacks=[];const ctx=vm.createContext({callbacks,console,Date,Math,JSON,Set,Map,Array,Number,String,RegExp,Promise,Blob,Uint8Array,Error,structuredClone,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{querySelector:node,querySelectorAll:()=>[],getElementById:node,addEventListener(){},body:node('body'),activeElement:node('focus')},window:{scrollTo(){},addEventListener(){}},setTimeout(fn){callbacks.push(fn)},clearTimeout(){},assert,node});
vm.runInContext(html.match(/<script>([\s\S]*)<\/script>/)[1],ctx);


vm.runInContext(`
auditExample();Object.assign(journey(),{email:'alex@example.com',phone:'+971500000001',terms:true});paymentOutcome='declined';startPayment();
assert.equal(journey().payment,'pending');const reference=journey().attemptReference;startPayment();assert.equal(journey().attemptReference,reference);assert.equal(callbacks.length,1);
callbacks.shift()();assert.equal(journey().payment,'failed');assert.equal(preView,'payment');assert(prePayment().includes('Payment wasn’t completed'));assert.equal(journey().email,'alex@example.com');
paymentOutcome='success';startPayment();assert.equal(journey().payment,'pending');callbacks.shift()();assert.equal(journey().payment,'paid');
const paidAt=journey().paidAt;startPayment();assert.equal(journey().paidAt,paidAt);
`,ctx);console.log('PASS: pending duplicate prevention, decline retry screen, preserved contact details, successful retry, paid re-entry.');
// The live desktop/mobile handoff is tested separately in nomod-check.cjs.
