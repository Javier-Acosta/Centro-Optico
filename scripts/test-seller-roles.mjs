import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import PocketBase from 'pocketbase';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const base=process.env.TEST_APP_URL || 'http://localhost:3000';
const adminEmail=process.env.TEST_ADMIN_EMAIL;
const adminPassword=process.env.TEST_ADMIN_PASSWORD;
if (!adminEmail || !adminPassword) throw new Error('Definir TEST_ADMIN_EMAIL y TEST_ADMIN_PASSWORD para ejecutar esta prueba de integracion.');
const pb=new PocketBase(process.env.POCKETBASE_URL);
await pb.collection('_superusers').authWithPassword(process.env.POCKETBASE_SUPERUSER_EMAIL,process.env.POCKETBASE_SUPERUSER_PASSWORD);
function form(html,operation){const forms=[...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].map(m=>m[0]);const source=operation?forms.find(f=>f.includes(`value="${operation}"`)):forms[0];assert.ok(source,'form present');const data=new FormData();for(const m of source.matchAll(/<input\b[^>]*>/g)){const name=m[0].match(/name="([^"]+)"/)?.[1];const value=m[0].match(/value="([^"]*)"/)?.[1]||'';if(name)data.set(name,value.replaceAll('&quot;','"').replaceAll('&amp;','&'));}return data;}
async function post(path,data,cookie=''){return fetch(base+path,{method:'POST',headers:{Origin:base,Cookie:cookie},body:data,redirect:'manual'});}
async function login(email,password){const data=form(await(await fetch(base+'/admin')).text());data.set('email',email);data.set('password',password);const r=await post('/admin',data);return r.headers.get('set-cookie')?.split(';')[0]||'';}
const owner=new PocketBase(process.env.POCKETBASE_URL);await owner.collection('sellers').authWithPassword(adminEmail,adminPassword);const adminCookie='tienda_cata_seller='+owner.authStore.token;
const page=await fetch(base+'/admin/usuarios',{headers:{Cookie:adminCookie}});assert.equal(page.status,200);const html=await page.text();
const email=`test-${randomBytes(6).toString('hex')}@example.com`;const password=randomBytes(20).toString('hex');let id;
try{
const create=form(html,'create');create.set('email',email);create.set('name','Prueba temporal');create.set('password',password);create.set('role','admin');await post('/admin/usuarios',create,adminCookie);
const account=await pb.collection('sellers').getFirstListItem(pb.filter('email = {:email}',{email}));id=account.id;assert.equal(account.role,'assistant');console.log('PASS create helper; forged admin role ignored');
const helperCookie=await login(email,password);assert.ok(helperCookie);const catalog=await fetch(base+'/admin/productos',{headers:{Cookie:helperCookie}});assert.equal(catalog.status,200);assert.ok(!(await catalog.text()).includes('href="/admin/usuarios"'));console.log('PASS helper accesses catalog and sales');
const forbidden=await fetch(base+'/admin/usuarios',{headers:{Cookie:helperCookie},redirect:'manual'});assert.equal(forbidden.headers.get('location'),'/admin/productos');
const attack=form(html,'create');attack.set('name','Forbidden');attack.set('email',email);attack.set('password',password);const denied=await post('/admin/usuarios',attack,helperCookie);assert.match(await denied.text(),/Solo el administrador/);console.log('PASS helper cannot manage users through page or direct action');
const current=await(await fetch(base+'/admin/usuarios',{headers:{Cookie:adminCookie}})).text();
const disable=form(current,'disable');disable.set('id',id);await post('/admin/usuarios',disable,adminCookie);assert.equal((await pb.collection('sellers').getOne(id)).disabled,true);const revoked=await fetch(base+'/admin/productos',{headers:{Cookie:helperCookie},redirect:'manual'});assert.equal(revoked.headers.get('location'),'/admin');assert.equal(await login(email,password),'');console.log('PASS disabling revokes session and prevents login');
const enable=form(current,'disable');enable.set('operation','enable');enable.set('id',id);await post('/admin/usuarios',enable,adminCookie);assert.ok(await login(email,password));
const reset=form(current,'password');reset.set('id',id);reset.set('password',password+'x');await post('/admin/usuarios',reset,adminCookie);assert.equal(await login(email,password),'');assert.ok(await login(email,password+'x'));console.log('PASS reactivation and password change');
const protect=form(current,'disable');protect.set('id',owner.authStore.record.id);const result=await post('/admin/usuarios',protect,adminCookie);assert.match(await result.text(),/Solo pod/);console.log('PASS administrator cannot be disabled through helper controls');
}finally{if(id)await pb.collection('sellers').delete(id);}
