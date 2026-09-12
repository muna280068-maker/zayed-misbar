
/* ===== MISBAR extracted script 1: main ===== */

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function safeArray(v){
  if(Array.isArray(v)) return v;
  if(v===null||v===undefined||v==='') return [];
  if(typeof v==='string'){
    const t=v.trim();
    if(!t) return [];
    try{const j=JSON.parse(t); if(Array.isArray(j)) return j;}catch(e){}
    return t.split(/[،,|]/).map(x=>x.trim()).filter(Boolean);
  }
  if(typeof v==='object') return Object.values(v);
  return [v];
}
function safeObject(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}

const authDialog=$('#authDialog'), saifDialog=$('#saifDialog');
const appShell=$('#appShell'), publicSite=$('#publicSite'), publicNav=$('#publicNav'), publicActions=$('#publicActions'), userChip=$('#userChip');
let currentUser={name:'مستخدم مِسبار',role:'معلم / معلمة',subject:'العلوم',subjects:['العلوم'],grades:[],classes:[],email:''};
const USERS_KEY='misbarZayedUsersV12';
const SESSION_KEY='misbarZayedPersistentSessionV1';
const LAST_EMAIL_KEY='misbarZayedLastEmailV1';
const SAVED_PASSWORD_KEY='misbarZayedSavedPasswordV1'; // legacy key; never stores a password
const SIGNED_OUT_KEY='misbarZayedExplicitSignedOutV1';
const ASSESSMENTS_KEY='misbarZayedAssessmentsV12';
const SCORES_KEY='misbarZayedScoresV12';
const INTERVENTIONS_KEY='misbarZayedInterventionsV15';
const EVIDENCE_KEY='misbarZayedEvidenceV15';
// V62 — تنظيف نهائي لمرة واحدة: يحذف جميع بيانات التجارب السابقة من هذا المتصفح/الجهاز.
// بعد تنفيذ هذا التنظيف مرة واحدة، تبدأ المنصة ببيانات فارغة وتحفظ البيانات الحقيقية الجديدة بشكل طبيعي.
(function cleanPreviousMisbarExperimentsOnce(){
  const CLEAN_FLAG='misbarZayedCleanStartV62';
  try{
    if(localStorage.getItem(CLEAN_FLAG)==='1') return;
    const keys=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k && (k.startsWith('misbarZayed') || k.startsWith('misbar_'))) keys.push(k);
    }
    keys.forEach(k=>localStorage.removeItem(k));
    localStorage.setItem(CLEAN_FLAG,'1');
  }catch(e){ console.warn('تعذر تنفيذ التنظيف المحلي الأولي',e); }
})();
function loadUsers(){try{const v=JSON.parse(localStorage.getItem(USERS_KEY)||'[]');let changed=false;const arr=safeArray(v).map(u=>{let x={...safeObject(u),subjects:safeArray(u?.subjects),grades:safeArray(u?.grades),classes:safeArray(u?.classes)};if(String(x.email||'').trim().toLowerCase()==='muna.zebaiboh@moe.sch.ae'&&x.role!=='معلم / معلمة'){x={...x,role:'معلم / معلمة',subject:'العلوم',subjects:['العلوم'],grades:['6','7'],classes:['6G1','6G2','6G3','7G3']};changed=true;}return x});if(changed)localStorage.setItem(USERS_KEY,JSON.stringify(arr));return arr}catch{return[]}}
function saveUsers(users){localStorage.setItem(USERS_KEY,JSON.stringify(safeArray(users).map(u=>{const x={...safeObject(u)};delete x.password;return x})))}
function savePersistentSession(user){if(!user||!user.email)return;localStorage.removeItem(SIGNED_OUT_KEY);localStorage.setItem(SESSION_KEY,JSON.stringify({email:user.email,at:Date.now()}));localStorage.setItem(LAST_EMAIL_KEY,user.email)}
function clearPersistentSession(){localStorage.removeItem(SESSION_KEY)}
function loadPersistentSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function selectedValues(sel){return Array.from(sel.selectedOptions).map(o=>o.value||o.textContent)}
function isTeacher(){return currentUser.role==='معلم / معلمة'}
function isLeadership(){return ['مديرة المدرسة','نائبة المديرة','النائب الأكاديمي','مديرة النطاق'].includes(currentUser.role)}
let authMode='signup';
function openSignup(){ authMode='signup'; $('#authTitle').textContent='إنشاء حساب جديد'; $('#signupFields').hidden=false; $('#loginFields').hidden=true; $('#authContinue').hidden=false; $('#authContinue').textContent='إنشاء الحساب'; $('#signupName').value=''; $('#signupEmail').value=''; $('#signupPassword').value=''; $('#roleSelect').value='معلم / معلمة'; $('#teacherFields').hidden=false; document.querySelectorAll('#subjectPicks input,#gradePicks input,#classPicks input').forEach(x=>x.checked=false); buildClassPicks(); updateRegSummary(); if(!authDialog.open) authDialog.showModal(); }
function openLogin(){ authMode='login'; $('#authTitle').textContent='تسجيل الدخول'; $('#signupFields').hidden=true; $('#loginFields').hidden=false; $('#authContinue').hidden=true; $('#loginStatus').textContent=''; $('#loginEmail').value=localStorage.getItem(LAST_EMAIL_KEY)||''; $('#loginPassword').value=''; $('#rememberLogin').checked=true; if(!authDialog.open) authDialog.showModal(); setTimeout(()=>{ if($('#loginEmail').value && $('#loginPassword').value) $('#loginSubmit').focus(); else $('#loginEmail').focus(); },50); }
['signupBtn','heroSignup','topSignupEntry'].forEach(id=>{
  const el=document.getElementById(id);
  if(el) el.onclick=openSignup;
});['coverSignup','coverHeroSignup'].forEach(id=>{
  const el=document.getElementById(id);
  if(el) el.onclick=openSignup;
});

['loginBtn','topLoginEntry','coverLogin','coverHeroLogin'].forEach(id=>{
  const el=document.getElementById(id);
  if(el) el.onclick=openLogin;
});

const GRADE_OPTIONS=[['4','الصف الرابع'],['5','الصف الخامس'],['6','الصف السادس'],['7','الصف السابع'],['8','الصف الثامن'],['9-general','الصف التاسع - عام'],['9-advanced','الصف التاسع - متقدم'],['10-general','الصف العاشر - عام'],['10-advanced','الصف العاشر - متقدم'],['11-general','الصف الحادي عشر - عام'],['11-advanced','الصف الحادي عشر - متقدم'],['12-general','الصف الثاني عشر - عام'],['12-advanced','الصف الثاني عشر - متقدم']];
function checkedValues(id){return Array.from(document.querySelectorAll(`#${id} input:checked`)).map(x=>x.value)}
function buildGradePicks(){ $('#gradePicks').innerHTML=GRADE_OPTIONS.map(([v,t])=>`<label><input type="checkbox" value="${v}"> ${t}</label>`).join(''); $('#gradePicks').addEventListener('change',()=>{buildClassPicks();updateRegSummary()}); }
function buildClassPicks(){ const grades=checkedValues('gradePicks'); const box=$('#classPicks'); if(!grades.length){box.innerHTML='<span class="note">اختاري الصفوف أولًا لتظهر الشعب.</span>';return} box.innerHTML=grades.flatMap(g=>{const n=g.split('-')[0], track=g.includes('advanced')?'متقدم':g.includes('general')?'عام':'';return [1,2,3,4,5,6,7].map(i=>{const val=`${n}G${i}${track?' - '+track:''}`;return `<label><input type="checkbox" value="${val}"> ${val}</label>`})}).join(''); box.addEventListener('change',updateRegSummary,{once:true}); box.querySelectorAll('input').forEach(x=>x.addEventListener('change',updateRegSummary)); }
function updateRegSummary(){ const subjects=checkedValues('subjectPicks'), grades=checkedValues('gradePicks'), classes=checkedValues('classPicks'); $('#regSummary').textContent=`المواد: ${subjects.length||0} • الصفوف: ${grades.length||0} • الشعب: ${classes.length||0}`; }
buildGradePicks(); $('#subjectPicks').addEventListener('change',updateRegSummary);
$('#roleSelect').addEventListener('change',()=>{$('#teacherFields').hidden=$('#roleSelect').value!=='معلم / معلمة';});
function applyAccess(){
  if(isTeacher()){
    $('#accessBanner').textContent='حساب معلم/معلمة: تظهر لك نتائج شعبك وطلابك فقط، ولا يمكنك رؤية نتائج أي معلم آخر.';
    const subjects=(currentUser.subjects&&currentUser.subjects.length)?currentUser.subjects:[currentUser.subject||'العلوم'];
    subjectFilter.innerHTML=subjects.map(v=>`<option>${v}</option>`).join('');
    currentUser.subject=subjectFilter.value;
    const grades=currentUser.grades.length?currentUser.grades:['6'];
    gradeFilter.innerHTML=grades.map(v=>`<option value="${v}">${gradeArabicName(v)}</option>`).join('');
    syncGradeFilters(); syncSubjectPopup();
  }else{
    $('#accessBanner').textContent=currentUser.role==='مديرة النطاق'?'حساب مديرة النطاق: تعرض المؤشرات والنتائج المصرح بها للمدارس التابعة للنطاق.':'حساب قيادة مدرسية: تظهر نتائج جميع طلاب المدرسة والمواد والصفوف وفق صلاحية الحساب.';
    subjectFilter.innerHTML=['العلوم','الرياضيات','اللغة العربية','اللغة الإنجليزية','الدراسات الاجتماعية','التربية الإسلامية'].map(v=>`<option>${v}</option>`).join('');
    const all=['4','5','6','7','8','9-general','9-advanced','10-general','10-advanced','11-general','11-advanced','12-general','12-advanced'];
    gradeFilter.innerHTML=all.map(v=>`<option value="${v}">${gradeArabicName(v)}</option>`).join('');
    syncGradeFilters(); syncSubjectPopup();
  }
}

const publicSiteAnchor = document.createComment('public-site-anchor');
if(publicSite && publicSite.parentNode){ publicSite.parentNode.insertBefore(publicSiteAnchor, publicSite); }
function detachPublicLanding(){ if(publicSite && publicSite.isConnected){ publicSite.remove(); } }
function restorePublicLanding(){ if(publicSite && !publicSite.isConnected && publicSiteAnchor.parentNode){ publicSiteAnchor.parentNode.insertBefore(publicSite, publicSiteAnchor.nextSibling); } }

function enterApp(user){
  currentUser={...safeObject(user||currentUser),subjects:safeArray((user||currentUser)?.subjects?.length?(user||currentUser).subjects:[(user||currentUser)?.subject||'العلوم']),grades:safeArray((user||currentUser)?.grades),classes:safeArray((user||currentUser)?.classes)};
  authDialog.close(); publicSite.hidden=true; publicSite.style.display='none'; detachPublicLanding(); publicNav.hidden=true; publicActions.hidden=true; userChip.hidden=false; $('#appTopbar').style.display='flex'; appShell.hidden=false; appShell.style.display='grid'; document.documentElement.classList.add('app-open'); document.body.classList.add('app-mode'); document.body.style.overflow='hidden'; window.scrollTo(0,0);
  $('#chipName').textContent=currentUser.name.startsWith('أ.')?currentUser.name:`أ. ${currentUser.name}`;
  $('#chipRole').textContent=isTeacher()?`معلم/معلمة ${safeArray(currentUser.subjects?.length?currentUser.subjects:[currentUser.subject]).join('، ')}`:currentUser.role;
  $('#sideSubject').textContent=isTeacher()?safeArray(currentUser.subjects?.length?currentUser.subjects:[currentUser.subject]).join('، '):(currentUser.role==='مديرة النطاق'?'لوحة النطاق':'القيادة المدرسية');
  $$('.leadership-only').forEach(el=>el.style.display=isTeacher()?'none':'block');
  $('#workspaceEyebrow').textContent=isTeacher()?`معلم/معلمة ${safeArray(currentUser.subjects?.length?currentUser.subjects:[currentUser.subject]).join('، ')}`:currentUser.role;
  applyAccess();
  showView('overview',{fromHistory:true});
  history.replaceState({view:'overview'},'', '#page-overview');
}
async function misbarPasswordHash(value){
  const text=String(value||'');
  try{
    if(window.crypto&&crypto.subtle){
      const bytes=new TextEncoder().encode('MISBAR-ZAYED|'+text);
      const digest=await crypto.subtle.digest('SHA-256',bytes);
      return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }
  }catch(err){}
  // Fallback avoids storing the raw password even when Web Crypto is unavailable.
  let h1=0x811c9dc5,h2=0x01000193;
  for(let i=0;i<text.length;i++){h1^=text.charCodeAt(i);h1=Math.imul(h1,16777619);h2^=(text.charCodeAt(i)+i);h2=Math.imul(h2,2246822519)}
  return 'fallback-'+(h1>>>0).toString(16).padStart(8,'0')+(h2>>>0).toString(16).padStart(8,'0');
}
function sanitizeStoredUser(user){
  const u={...safeObject(user)}; delete u.password; return u;
}
const MISBAR_CLOUD_URL='https://script.google.com/macros/s/AKfycbwIoQz55Ocv24PHikIzWNg3fWJGTf9wTGFpZkt9fF5p00NUDnLZIuk_YXT0pKQtoxvb/exec';
// Apps Script Web Apps redirect cross-origin POST responses to googleusercontent.com.
// Some browsers block reading that redirected response from GitHub Pages even though
// the request itself reaches the backend.  We therefore send POSTs in no-cors mode,
// tag each request with a requestId, then read the small result through JSONP.
function cloudRequestId(){
  try{return crypto.randomUUID().replace(/-/g,'')+Date.now().toString(36)}catch(_){return 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2)}
}
function cloudJsonp(params={}, timeoutMs=15000){
  return new Promise((resolve,reject)=>{
    const cb='__misbar_cb_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2);
    const q=new URLSearchParams();
    Object.entries(params).forEach(([k,v])=>q.set(k,typeof v==='string'?v:JSON.stringify(v)));
    q.set('callback',cb);
    const s=document.createElement('script');
    let done=false;
    const clean=()=>{if(done)return;done=true;try{delete window[cb]}catch(_){window[cb]=undefined}try{s.remove()}catch(_){}};
    const timer=setTimeout(()=>{clean();reject(new Error('CLOUD_TIMEOUT'))},timeoutMs);
    window[cb]=(payload)=>{clearTimeout(timer);clean();resolve(payload)};
    s.onerror=()=>{clearTimeout(timer);clean();reject(new Error('CLOUD_JSONP_FAILED'))};
    s.src=MISBAR_CLOUD_URL+'?'+q.toString();
    document.head.appendChild(s);
  });
}
async function cloudGet(action,data={}){
  return await cloudJsonp({action,...data});
}
async function cloudPost(action, data={}){
  const requestId=cloudRequestId();
  const frameName='misbar_post_'+requestId;
  let iframe=null, form=null;
  try{
    iframe=document.createElement('iframe');
    iframe.name=frameName;
    iframe.style.display='none';
    iframe.setAttribute('aria-hidden','true');
    document.body.appendChild(iframe);

    form=document.createElement('form');
    form.method='POST';
    form.action=MISBAR_CLOUD_URL;
    form.target=frameName;
    form.style.display='none';
    const payload={action,requestId,...data};
    Object.entries(payload).forEach(([k,v])=>{
      const input=document.createElement('input');
      input.type='hidden'; input.name=k;
      input.value=typeof v==='string'?v:JSON.stringify(v);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();

    const started=Date.now();
    let lastErr=null;
    while(Date.now()-started<25000){
      try{
        const res=await cloudJsonp({action:'result',requestId},5000);
        if(res&&res.ready)return res.result||{ok:false,error:'EMPTY_RESULT'};
      }catch(err){ lastErr=err; }
      await new Promise(r=>setTimeout(r,450));
    }
    throw lastErr||new Error('CLOUD_RESULT_TIMEOUT');
  }finally{
    try{form&&form.remove()}catch(_){}
    try{iframe&&iframe.remove()}catch(_){}
  }
}
function cloudToken(){ try{return localStorage.getItem('misbarCloudTokenV1')||''}catch(e){return''} }
function saveCloudToken(t){ try{if(t)localStorage.setItem('misbarCloudTokenV1',t);else localStorage.removeItem('misbarCloudTokenV1')}catch(e){} }
function cloudSnapshot(){
  const out={};
  const skip=new Set([USERS_KEY,SESSION_KEY,LAST_EMAIL_KEY,SAVED_PASSWORD_KEY,SIGNED_OUT_KEY,'misbarCloudTokenV1','misbarCloudHydratedV1']);
  try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||skip.has(k))continue;if(k.startsWith('misbarZayed')||k.startsWith('misbar_'))out[k]=localStorage.getItem(k)}}catch(e){}
  return out;
}
function applyCloudSnapshot(snapshot){
  if(!snapshot||typeof snapshot!=='object')return;
  try{Object.entries(snapshot).forEach(([k,v])=>{if((k.startsWith('misbarZayed')||k.startsWith('misbar_'))&&typeof v==='string')localStorage.setItem(k,v)});}catch(e){}
}
let cloudPushTimer=null, cloudApplying=false;
async function pushCloudNow(){
  const token=cloudToken(); if(!token||cloudApplying)return false;
  try{const res=await cloudPost('push',{token,snapshot:cloudSnapshot()});updateCloudBadge(res.ok?'متصل ومحفوظ':'تعذر الحفظ');return !!res.ok}catch(e){updateCloudBadge('غير متصل');return false}
}
function scheduleCloudPush(){if(!cloudToken()||cloudApplying)return;clearTimeout(cloudPushTimer);cloudPushTimer=setTimeout(pushCloudNow,900)}
function updateCloudBadge(text){
  let b=document.getElementById('misbarCloudBadge');
  if(!b){b=document.createElement('span');b.id='misbarCloudBadge';b.style.cssText='font-size:12px;font-weight:800;padding:6px 10px;border-radius:999px;background:#eef6f8;color:#31576d;margin-inline:6px';const chip=document.querySelector('.user-chip');if(chip)chip.appendChild(b)}
  if(b)b.textContent='☁️ '+text;
}
function clearCloudSyncedData(){
  const skip=new Set([USERS_KEY,SESSION_KEY,LAST_EMAIL_KEY,SAVED_PASSWORD_KEY,SIGNED_OUT_KEY,'misbarCloudTokenV1','misbarCloudHydratedV1']);
  try{
    const keys=[];
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith('misbarZayed')||k.startsWith('misbar_'))&&!skip.has(k))keys.push(k)}
    keys.forEach(k=>localStorage.removeItem(k));
  }catch(e){console.warn('Could not clear previous account data',e)}
}
async function hydrateFromCloud(snapshot){cloudApplying=true;try{clearCloudSyncedData();applyCloudSnapshot(snapshot||{});localStorage.setItem('misbarCloudHydratedV1','1')}finally{cloudApplying=false}}
async function performLogin(e){
  if(e)e.preventDefault();
  const email=$('#loginEmail').value.trim().toLowerCase(),password=$('#loginPassword').value,status=$('#loginStatus'),btn=$('#loginSubmit');
  if(status){status.style.color='#8a3b12';status.textContent=''}
  if(!email||!password){if(status)status.textContent='أدخل البريد الإلكتروني وكلمة المرور.';return}
  if(btn?.dataset.busy==='1')return;
  if(btn){btn.dataset.busy='1';btn.disabled=true;btn.textContent='جارٍ الدخول...'}
  try{
    if(status)status.textContent='جارٍ التحقق من الحساب السحابي...';
    const passwordHash=await misbarPasswordHash(password);
    const res=await cloudPost('login',{email,passwordHash});
    if(!res||!res.ok){if(status)status.textContent='بيانات الدخول غير صحيحة أو الحساب غير مفعّل.';return}
    saveCloudToken(res.token);
    if(status)status.textContent='تم التحقق. جارٍ تحميل بيانات الحساب...';
    const pulled=await cloudGet('pull',{token:res.token});
    if(!pulled||!pulled.ok)throw new Error('CLOUD_PULL_FAILED');
    await hydrateFromCloud(pulled.snapshot||{});
    const users=loadUsers(),idx=users.findIndex(u=>String(u.email||'').toLowerCase()===email),user={...res.user,passwordHash};
    if(idx>=0)users[idx]=user;else users.push(user);saveUsers(users);
    try{localStorage.removeItem(SIGNED_OUT_KEY);localStorage.setItem(LAST_EMAIL_KEY,email);if($('#rememberLogin')?.checked)savePersistentSession(user)}catch(_){ }
    updateCloudBadge('متصل');
    enterApp(user);
    scheduleCloudPush();
  }catch(err){
    console.error('MISBAR login failed',err);
    saveCloudToken('');
    if(status)status.textContent='تعذر إكمال تسجيل الدخول السحابي. أعيدي المحاولة مرة واحدة.';
  }finally{
    if(btn){btn.dataset.busy='0';btn.disabled=false;btn.textContent='دخول المنصة'}
  }
}
async function directAdminLogin(){
  const code=window.prompt('أدخل رمز إدارة المدرسة:');if(code===null)return;const status=$('#loginStatus');
  try{const accessHash=await misbarPasswordHash(code);const res=await cloudPost('adminAccess',{accessHash});if(!res.ok){if(status)status.textContent='رمز الإدارة غير صحيح.';return}saveCloudToken(res.token);const pulled=await cloudGet('pull',{token:res.token});if(pulled&&pulled.ok)await hydrateFromCloud(pulled.snapshot);const user=res.user;const users=loadUsers(),i=users.findIndex(u=>u.email===user.email);if(i>=0)users[i]=user;else users.push(user);saveUsers(users);savePersistentSession(user);enterApp(user);updateCloudBadge('متصل')}catch(e){if(status)status.textContent='تعذر الاتصال بالسحابة.'}
}
$('#adminDirectLogin').onclick=directAdminLogin;
async function ownerRecoveryLogin(){
  const status=$('#loginStatus');if(status){status.style.color='#8a3b12';status.textContent=''}
  const recovery=window.prompt('أدخلي رمز الاسترداد المؤقت الخاص بصاحبة المنصة:');if(recovery===null)return;
  const p1=window.prompt('اختاري كلمة مرور سحابية جديدة (6 أحرف على الأقل):');if(p1===null)return;if(String(p1).length<6){if(status)status.textContent='كلمة المرور يجب أن تكون 6 أحرف على الأقل.';return}
  const p2=window.prompt('أعيدي كتابة كلمة المرور الجديدة:');if(p2===null)return;if(p1!==p2){if(status)status.textContent='كلمتا المرور غير متطابقتين.';return}
  try{
    if(status)status.textContent='جارٍ تفعيل الحساب السحابي...';
    const recoveryHash=await misbarPasswordHash(recovery),passwordHash=await misbarPasswordHash(p1);
    const res=await cloudPost('ownerBootstrap',{email:'muna.zebaiboh@moe.sch.ae',recoveryHash,passwordHash});
    if(!res.ok){if(status)status.textContent='تعذر التفعيل: رمز الاسترداد غير صحيح أو السحابة غير محدثة.';return}
    saveCloudToken(res.token);
    // أول تفعيل: نحفظ بيانات هذا الجهاز في السحابة قبل أي سحب حتى لا تضيع البيانات الحالية.
    const user={...res.user,passwordHash};const users=loadUsers(),i=users.findIndex(u=>u.email===user.email);if(i>=0)users[i]=user;else users.push(user);saveUsers(users);savePersistentSession(user);localStorage.setItem(LAST_EMAIL_KEY,user.email);
    await pushCloudNow();enterApp(user);updateCloudBadge('متصل ومحفوظ');if(status){status.style.color='#176b42';status.textContent='تم تفعيل الحساب السحابي بنجاح.'}
  }catch(err){console.error(err);if(status)status.textContent='تعذر الاتصال بالسحابة.'}
}
$('#ownerRecoveryLogin').onclick=ownerRecoveryLogin;
async function handleAuthSubmit(e){
  if(e)e.preventDefault();
  if(authMode==='login')return performLogin(e);
  const name=$('#signupName').value.trim(),email=$('#signupEmail').value.trim().toLowerCase(),password=$('#signupPassword').value,role=$('#roleSelect').value;
  if(!name||!email||password.length<6){alert('أكملي الاسم والبريد وكلمة مرور من 6 أحرف على الأقل.');return}
  const subjects=role==='معلم / معلمة'?checkedValues('subjectPicks'):[],grades=role==='معلم / معلمة'?checkedValues('gradePicks'):[],classes=role==='معلم / معلمة'?checkedValues('classPicks'):[];
  if(role==='معلم / معلمة'&&(!subjects.length||!grades.length||!classes.length)){alert('اختاري المادة والصفوف والشعب التي تدرسينها.');return}
  try{const passwordHash=await misbarPasswordHash(password);const res=await cloudPost('register',{name,email,passwordHash,role,subject:subjects[0]||'',subjects,grades,classes});if(!res.ok){const msg=res.error==='ACCOUNT_EXISTS'?'هذا البريد مسجل بالفعل. استخدمي تسجيل الدخول.':res.error==='MISSING_FIELDS'?'تعذر إنشاء الحساب: بعض بيانات التسجيل لم تصل إلى السحابة.':res.error==='SERVER_ERROR'?'تعذر إنشاء الحساب بسبب خطأ في السحابة: '+(res.message||'SERVER_ERROR'):'تعذر إنشاء الحساب السحابي ('+(res.error||'UNKNOWN')+').'+(res.message?' '+res.message:'');console.error('MISBAR register error',res);alert(msg);return}saveCloudToken(res.token);const user={...res.user,passwordHash};const users=loadUsers();const existingIdx=users.findIndex(u=>String(u.email||'').toLowerCase()===email);if(existingIdx>=0)users[existingIdx]=user;else users.push(user);saveUsers(users);savePersistentSession(user);localStorage.setItem(LAST_EMAIL_KEY,email);enterApp(user);updateCloudBadge('متصل');scheduleCloudPush()}catch(err){alert('تعذر الاتصال بالسحابة. تحقق من الإنترنت.')}
}
$('#authContinue').onclick=handleAuthSubmit;
$('#loginSubmit').onclick=performLogin;
$('#authForm').addEventListener('submit',e=>{ if(authMode==='login') performLogin(e); else handleAuthSubmit(e); });
$('#loginPassword').addEventListener('keydown',e=>{if(e.key==='Enter')performLogin(e)});
$('#loginEmail').addEventListener('keydown',e=>{if(e.key==='Enter')performLogin(e)});
['loginEmail','loginPassword'].forEach(id=>$('#'+id).addEventListener('input',()=>{
  if(!$('#rememberLogin')?.checked) return;
  try{ localStorage.setItem(LAST_EMAIL_KEY,$('#loginEmail').value.trim().toLowerCase()); localStorage.removeItem(SAVED_PASSWORD_KEY); }catch(err){}
}));
$('#rememberLogin').addEventListener('change',()=>{
  if($('#rememberLogin').checked){
    try{ localStorage.setItem(LAST_EMAIL_KEY,$('#loginEmail').value.trim().toLowerCase()); localStorage.removeItem(SAVED_PASSWORD_KEY); }catch(err){}
  }else{
    try{ localStorage.removeItem(LAST_EMAIL_KEY); localStorage.removeItem(SAVED_PASSWORD_KEY); clearPersistentSession(); }catch(err){}
  }
});
$('#logoutBtn').onclick=()=>{
  try{
    clearPersistentSession();
    localStorage.setItem(SIGNED_OUT_KEY,'1');
  }catch(err){}
  document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});
  appShell.hidden=true;appShell.style.display='none';userChip.hidden=true;$('#appTopbar').style.display='none';
  restorePublicLanding();publicSite.hidden=false;publicSite.style.display='';publicNav.hidden=false;publicActions.hidden=false;
  document.documentElement.classList.remove('app-open');document.body.classList.remove('app-mode');document.body.style.overflow='';
  history.replaceState({},'',location.pathname);window.scrollTo({top:0,behavior:'auto'});
};

function prepareRememberedLogin(){
  // Visitor links and explicit logout must always stay on the public landing page.
  const visitorMode=new URLSearchParams(location.search).get('visitor')==='1';
  let explicitlySignedOut=false;
  try{ explicitlySignedOut=localStorage.getItem(SIGNED_OUT_KEY)==='1'; }catch(err){}
  // Restore an existing remembered account only when the user has not explicitly signed out.
  try{
    const session=(!visitorMode&&!explicitlySignedOut)?loadPersistentSession():null;
    if(session?.email){
      const email=String(session.email).trim().toLowerCase();
      const user=loadUsers().find(u=>String(u.email||'').trim().toLowerCase()===email);
      if(user){
        enterApp(user);
        return;
      }
    }
  }catch(err){ console.error('Session restore failed',err); }

  // No valid remembered session: show the public landing page normally.
  restorePublicLanding();
  publicSite.hidden=false;
  publicSite.style.display='';
  publicNav.hidden=false;
  publicActions.hidden=false;
  appShell.hidden=true;
  appShell.style.display='none';
  userChip.hidden=true;
  $('#appTopbar').style.display='none';
  document.documentElement.classList.remove('app-open');
  document.body.classList.remove('app-mode');
  document.body.style.overflow='';
  if(location.hash && location.hash.startsWith('#page-')){
    history.replaceState({},'',location.pathname);
  }
  window.scrollTo(0,0);
  if(visitorMode){
    setTimeout(()=>{
      try{
        if(typeof renderVisitorPreviewV38==='function') renderVisitorPreviewV38();
        else if(typeof renderVisitorPreview==='function') renderVisitorPreview();
        const d=document.getElementById('visitorDialog'); if(d&&!d.open)d.showModal();
      }catch(err){console.error(err)}
    },180);
  }
}
setTimeout(prepareRememberedLogin,0);
function setupVisitorQr(){
  const base='https://muna280068-maker.github.io/zayed-misbar/?visitor=1';
  const embeddedQr='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZoAAAGaAQAAAAAefbjOAAADBUlEQVR4nO2cS26jQBCGvxqQvGykOUCO0r7aHCk3gKP4AJHoZSTQP4t+GM+sMslgBxerpvEnF/LvelG2iQ8f04+PM+CQQw455JBDDh0TsnL01NO+7ZnZObXVXcxzaH8oSpLmsqmR1aS5E1ES0EnKq7uY59D+UCoOwGxYDcIChAX9GlYDit+4m3kO7Qb1f27E15MsXk4ywgx59RXv5NA3habsI95NI6vZOa8exjyH/jdUfUQQkADCDKQBg5NsGuacPWw7WQ9+Tw59ATSZmdkAxEuPnelEnK+nay417mWeQ3v7iK0DCAvAaoJ30/TybsWD3MM8h3aHyFVlnIFcZM5dCRNjUD2uVyVpfPB7cugzUFEEQSJqQSO1C1FUAsSZzQVXxKEhytceIM6dchdCWjZS0RiKQNxHHB+qHzydNF7FMFMFQlc8SHuxK+LQEDVVWIoEohZK/AhlL69KYHFFHByqX/vQZKGlXGl5hNRk4Yo4PLTJI3LuSFg2ZUbJIzYxxRVxcKhGjZlNmIBrXVFTiBw/XBGHhzaKoOmgpJI10cxdq1yRuiKODuWepQEIVoM0AKlfthdSjybraobx4Pfk0Gegm7ZD27stLoqPmL36fAaoRY2u5QxdSTSl29DhPcungsK7Qapzlmc6MQ2rSXM9zS+5k3kO7QbduoKbJxwtqdx4EPcRzwLFS5+HJDSmHkg9ZnbKrQimAYC1TlN9j3ty6BO1BgRhhLcyLjG9LL1Ig0EACG8m0kkWx33Nc2h3qCoiDYh0ElGridTDdO4WYO2BnjyIu7d5Du0OtSdd17Z1Kzzn8kijjkt4rfEM0KZDBXSLSsGx9kxD9hEG6WduTmlv8xy6FxRrK9typdkmb3NSGZa8svN9zHNo9+ozz11fZ6jmejn3LIHc1vSe5fNB8XKS2YvKQMRkZjWtWP2XwE8A/fUrv2nAyBVG6GTxdQCSoTxft7N5Du0O1ajRHm5s5yzhOjGDT+c/B9Qmb4GWT+YZqjJG11rZ8hmqZ4DM/5nMIYcccsghhxz6R+g3l1yLQS1QcfcAAAAASUVORK5CYII=';
  ['heroVisitorQr','visitorQrImage'].forEach(id=>{const img=document.getElementById(id);if(img){img.src=embeddedQr;img.title='دخول الزوار إلى لوحة الأثر';img.onclick=()=>window.open(base,'_blank','noopener');img.style.cursor='pointer';}});
}
setTimeout(setupVisitorQr,0);


function showView(name,opts={}){
  if(name==='assessments')setTimeout(renderAssessmentCards,0);
  if(name==='scores')setTimeout(prepareScores,0);
  if(name==='gaps')setTimeout(renderGaps,0);
  if(name==='interventions')setTimeout(renderInterventions,0);
  if(name==='evidence')setTimeout(renderEvidence,0);
  if(name==='remeasure')setTimeout(renderRemeasure,0);
  if(name==='weekly')setTimeout(renderWeekly,0);
  if(name==='impact')setTimeout(renderImpact,0);
  if(name==='student')setTimeout(renderStudentProfile,0);
  if(name==='leadership')setTimeout(renderLeadership,0);
  if(name==='reports')setTimeout(renderReports,0);
  $$('.view').forEach(v=>v.classList.remove('active'));
  $(`#view-${name}`)?.classList.add('active');
  $$('.side-link').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  const titles={overview:'مرحبًا بك في مِسبار زايد',assessments:'الاختبارات التشخيصية',scores:'إدخال الدرجات',gaps:'فجوات التعلّم',interventions:'الإجراءات العلاجية',evidence:'الأدلة والشواهد',remeasure:'إعادة القياس',weekly:'المتابعة الأسبوعية',impact:'سجل الأثر',student:'ملف الطالب/الطالبة',leadership:'لوحة القيادة والمقارنات',reports:'التقارير',recognition:'التميز والتقدير'};
  $('#workspaceTitle').textContent=titles[name]||'مِسبار زايد';
  const ws=document.querySelector('.workspace'); if(ws) ws.scrollTop=0;
  const av=document.querySelector('.view.active'); if(av) av.scrollTop=0;
  if(!opts.fromHistory){const hash='#page-'+name;if(location.hash!==hash)history.pushState({view:name},'',hash);}
}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
window.addEventListener('popstate',()=>{if(!document.body.classList.contains('app-mode'))return;const h=(location.hash||'').replace('#page-','');if(h)showView(h,{fromHistory:true});});

const subjectFilter=$('#subjectFilter'), gradeFilter=$('#gradeFilter'), classFilter=$('#classFilter');
const subjectPopupBtn=$('#subjectPopupBtn'), subjectDialog=$('#subjectDialog'), subjectChoiceGrid=$('#subjectChoiceGrid');
const ALL_SUBJECTS=['العلوم','الرياضيات','اللغة العربية','اللغة الإنجليزية','الدراسات الاجتماعية','التربية الإسلامية'];
function allowedSubjects(){if(!isTeacher())return ['العلوم','الرياضيات','اللغة العربية','اللغة الإنجليزية','الدراسات الاجتماعية','التربية الإسلامية'];return (currentUser.subjects&&currentUser.subjects.length)?currentUser.subjects:[currentUser.subject||'العلوم'];}
function renderSubjectChoices(){const list=allowedSubjects();subjectChoiceGrid.innerHTML=list.length?list.map(s=>`<button type="button" class="subject-choice ${s===subjectFilter.value?'active':''}" data-subject="${s}"><b>${s}</b><span>${s===subjectFilter.value?'المادة الحالية':'اضغط للاختيار'}</span></button>`).join(''):'<div class="subject-dialog-list-empty">لا توجد مواد مسندة لهذا الحساب.</div>';subjectChoiceGrid.querySelectorAll('.subject-choice').forEach(b=>b.onclick=()=>{subjectFilter.value=b.dataset.subject;currentUser.subject=b.dataset.subject;subjectPopupBtn.firstChild.textContent=b.dataset.subject+' ';subjectDialog.close();refreshAssessmentUI();$('#sideSubject').textContent=isTeacher()?b.dataset.subject:(currentUser.role==='مديرة النطاق'?'لوحة النطاق':'القيادة المدرسية');});}
subjectPopupBtn.addEventListener('click',()=>{renderSubjectChoices();subjectDialog.showModal();});
function syncSubjectPopup(){subjectPopupBtn.firstChild.textContent=(subjectFilter.value||'اختيار المادة')+' ';renderSubjectChoices();}
function gradeArabicName(v){const names={'4':'الرابع','5':'الخامس','6':'السادس','7':'السابع','8':'الثامن','9-general':'التاسع - عام','9-advanced':'التاسع - متقدم','10-general':'العاشر - عام','10-advanced':'العاشر - متقدم','11-general':'الحادي عشر - عام','11-advanced':'الحادي عشر - متقدم','12-general':'الثاني عشر - عام','12-advanced':'الثاني عشر - متقدم'};return names[v]||v;}
function cycleForGrade(v){const n=parseInt(v);return n<=5?'الحلقة الأولى':n<=8?'الحلقة الثانية':'الحلقة الثالثة';}
function classesForGrade(v){const n=parseInt(v), track=v.includes('advanced')?'متقدم':v.includes('general')?'عام':'';return [1,2,3,4,5,6,7].map(i=>`${n}G${i}${track?' - '+track:''}`);}
function syncGradeFilters(){const v=gradeFilter.value;currentUser.subject=subjectFilter.value||currentUser.subject;let opts=classesForGrade(v);if(isTeacher()&&currentUser.classes.length){opts=opts.filter(x=>currentUser.classes.includes(x));}if(!opts.length&&isTeacher())opts=['لا توجد شعبة مسندة'];classFilter.innerHTML=opts.map(x=>`<option>${x}</option>`).join('');$('#workspaceEyebrow').textContent=isTeacher()?`معلم/معلمة ${currentUser.subject} • ${cycleForGrade(v)}`:currentUser.role; if(isTeacher())$('#sideSubject').textContent=currentUser.subject; refreshAssessmentUI();}
gradeFilter.addEventListener('change',syncGradeFilters); subjectFilter.addEventListener('change',()=>{currentUser.subject=subjectFilter.value;syncSubjectPopup();refreshAssessmentUI();}); ('change',refreshAssessmentUI);

classFilter.addEventListener('change',()=>{
  refreshAssessmentUI();
  renderRemeasure();
  renderImpact();
});
$('#askSaif').onclick=()=>saifDialog.showModal(); $('#sideSaif').onclick=()=>saifDialog.showModal();
$('#talkSaif').onclick=()=>{saifDialog.showModal();setTimeout(()=>speak('مرحبًا، أنا سيف. كيف أستطيع مساعدتك في مِسبار زايد؟'),200)};
let saifMuted=false;
function pickSaifVoice(){
  if(!('speechSynthesis' in window)) return null;

  const voices = speechSynthesis.getVoices() || [];

  const maleNames = [
    'hamdan',
    'hamid',
    'tariq',
    'naayf',
    'majed',
    'omar',
    'hamed'
  ];

  const emiratiVoices = voices.filter(v =>
    (v.lang || '').toLowerCase().replace('_','-').startsWith('ar-ae')
  );

  const emiratiMale = emiratiVoices.find(v =>
    maleNames.some(name =>
      (v.name || '').toLowerCase().includes(name)
    )
  );

  if(emiratiMale) return emiratiMale;

  if(emiratiVoices.length) return emiratiVoices[0];

  const arabicMale = voices.find(v =>
    (v.lang || '').toLowerCase().startsWith('ar') &&
    maleNames.some(name =>
      (v.name || '').toLowerCase().includes(name)
    )
  );

  if(arabicMale) return arabicMale;

  return voices.find(v =>
    (v.lang || '').toLowerCase().startsWith('ar')
  ) || null;
}
function speak(text){
  if(saifMuted || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='ar-AE'; u.rate=.92; u.pitch=.86; u.volume=1;
  const v=pickSaifVoice(); if(v) u.voice=v;
  speechSynthesis.speak(u);
}
if('speechSynthesis' in window){speechSynthesis.onvoiceschanged=()=>pickSaifVoice();}
function routeFromSaif(t){
  const map=[['درجات','scores'],['فج','gaps'],['إجراء','interventions'],['علاج','interventions'],['دليل','evidence'],['شواهد','evidence'],['إعادة','remeasure'],['أثر','impact'],['تحسن','impact'],['تقرير','reports'],['شهاد','recognition'],['اختبار','assessments']];
  for(const [k,v] of map) if(t.includes(k)){ if(!appShell.hidden)showView(v); return v; } return null;
}
function demoSaifAnswer(q){const t=q.trim();if(!t)return'اكتب أو قل طلبك.'; const v=routeFromSaif(t); if(v==='gaps')return'فتحت فجوات التعلّم. ستظهر الأولويات وفق النتائج الحقيقية المعتمدة.'; if(v==='interventions')return'فتحت الإجراءات العلاجية. يمكنك اختيار الإجراء من القائمة دون أي كتابة.'; if(v==='scores')return'فتحت إدخال الدرجات، وكل طالبة لها قائمة درجات جاهزة.'; if(v==='evidence')return'فتحت الأدلة والشواهد. ارفعي الملف أو الصورة فقط، ومِسبار يتولى بقية التوثيق.'; if(v==='weekly')return'فتحت المتابعة الأسبوعية. يمكنك إضافة اختبار قصير Quiz بدرجة نهائية مفتوحة وتتبع الإتقان أسبوعًا بعد أسبوع.'; if(v==='impact')return'فتحت سجل الأثر. ستجدين رحلة كل طالب من التشخيص إلى التدخل والدليل وإعادة القياس وحالة إغلاق الفجوة.'; if(v==='reports')return'فتحت التقارير. يمكن إنشاء تقرير النتائج أو الفجوات أو الأثر بضغطة واحدة.'; if(t.includes('اشرح')||t.includes('نبض'))return'سيظهر تحليل نبض الشعبة بعد إدخال واعتماد النتائج الحقيقية.'; if(t.includes('اسبوع')||t.includes('أسبوع')||t.includes('quiz')||t.includes('كويز')){showView('weekly');return 'فتحت المتابعة الأسبوعية.';} if(t.includes('علوم'))return isTeacher()?'قسم العلوم هو مساحتك الحالية، وسأعرض فقط الصفوف والشعب المسندة لك.':'يمكنني عرض نتائج العلوم على مستوى المدرسة وفق صلاحيتك.'; return'فهمت طلبك. يمكنني التنقل والتحليل وشرح النتائج ضمن صلاحيتك.';}
$('#sendSaif').onclick=()=>{const ans=demoSaifAnswer($('#saifInput').value);$('#saifResponse').textContent=ans;speak(ans)};
let saifRecognition=null, saifListening=false;
function setVoiceStatus(message,type=''){
  const status=$('#voiceStatus'),mic=$('#micSaif');
  status.textContent=message; status.classList.remove('listening','error'); if(type)status.classList.add(type);
  mic.classList.toggle('listening',type==='listening'); mic.textContent=type==='listening'?'⏹️':'🎙️';
}
function speechErrorMessage(code){
  const map={
    'not-allowed':'لم يتم السماح باستخدام الميكروفون. اسمحي للموقع بالوصول للميكروفون ثم حاولي مرة أخرى.',
    'service-not-allowed':'خدمة التعرف على الصوت غير مسموحة في هذا المتصفح.',
    'audio-capture':'لم أتمكن من الوصول إلى الميكروفون. تأكدي أنه متصل وغير مستخدم في تطبيق آخر.',
    'no-speech':'لم أسمع كلامًا واضحًا. اضغطي الميكروفون وحاولي مرة أخرى.',
    'network':'تعذر تشغيل التعرف الصوتي بسبب الاتصال بالشبكة.',
    'aborted':'تم إيقاف الاستماع.'
  }; return map[code]||'تعذر التقاط الصوت. حاولي مرة أخرى.';
}
async function requestMicrophonePermission(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia) return true;
  const stream=await navigator.mediaDevices.getUserMedia({audio:true});
  stream.getTracks().forEach(t=>t.stop()); return true;
}
async function startSaifListening(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){setVoiceStatus('التعرف الصوتي غير مدعوم هنا. افتحي المنصة في Chrome أو Edge الحديث.','error');return;}
  if(saifListening&&saifRecognition){saifRecognition.stop();return;}
  if(!window.isSecureContext && location.protocol!=='file:'){
    setVoiceStatus('الميكروفون يحتاج رابطًا آمنًا HTTPS عند نشر المنصة.','error');return;
  }
  try{setVoiceStatus('جاري طلب إذن الميكروفون…');await requestMicrophonePermission();}
  catch(e){setVoiceStatus('لم يتم السماح باستخدام الميكروفون. من إعدادات المتصفح اختاري السماح للميكروفون ثم أعيدي المحاولة.','error');return;}
  const r=new SR(); saifRecognition=r; r.lang='ar-AE'; r.interimResults=true; r.continuous=false; r.maxAlternatives=1;
  let finalText='';
  r.onstart=()=>{saifListening=true;setVoiceStatus('سيف يستمع إليك الآن… تحدثي بوضوح.','listening');};
  r.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)finalText+=t;else interim+=t;} $('#saifInput').value=(finalText||interim).trim(); if(interim&&!finalText)setVoiceStatus('أسمعك… '+interim,'listening');};
  r.onspeechend=()=>{try{r.stop()}catch{}};
  r.onend=()=>{saifListening=false;saifRecognition=null;if(finalText.trim()){setVoiceStatus('تم التقاط طلبك. سيف يجيب الآن…');$('#saifInput').value=finalText.trim();$('#sendSaif').click();}else if(!$('#voiceStatus').classList.contains('error'))setVoiceStatus('جاهز للمحادثة');};
  r.onerror=e=>{saifListening=false;saifRecognition=null;setVoiceStatus(speechErrorMessage(e.error),'error');};
  try{r.start()}catch(e){setVoiceStatus('تعذر بدء الميكروفون الآن. أغلقي أي تسجيل صوتي آخر وحاولي مرة أخرى.','error');}
}
$('#micSaif').onclick=startSaifListening;
$('#explainChart').onclick=()=>{saifDialog.showModal();$('#saifInput').value='اشرح نبض شعبتي';$('#sendSaif').click()};

$$('.subject-enter').forEach(btn=>btn.onclick=()=>{openSignup(); const subj=btn.closest('.subject-card').querySelector('h4').textContent.trim(); document.querySelectorAll('#subjectPicks input').forEach(x=>x.checked=x.value===subj); updateRegSummary();});

const demoStudents=[]; // V62: لا توجد أسماء تجريبية في النسخة المعتمدة
const BUILTIN_ROSTERS={"5G1":["امنه وليد ثانى مبارك ثانى","جوهرة الخميس قاسم ادريس العيرج","حمده على محمد بن فريش الكندى","حور يوسف هلال يوسف الزعابي","دانه هيثم محمد عبيد الشحي","ريم خالد وليد عيسى الدرمكي","ريم سيف احمد عبيد الكندي","ريم فيصل سهيل حمدان الزعابي","ساره موسى عبدالله على","سلامه على ذئب خميس الكعبى","شيخه ماجد عبيد موسى الهوره","عائشه خليل ابراهيم احمد البلوشي","عائشه مؤمن ابراهيم احمد","عائشه نبيل عبيد لعوينه الكندي","عفراء عبدالعزيز عتيق محمد الكندي","عليا راشد سعيد سيف الزعابي","فردوس العواد","فطيم ابراهيم موسي علي عبدالرحمن","فواغى يوسف عبدالرحمن محمد البلوشي","مثايل عبدالرحمن على حمود اليماحي","مريم أحمد عيسى مراد درويش","مريم سعيد إبراهيم جاسم الزعابي","مريم موسى محمد عيسى البلوشي","مها احمد عيسى محمد","موزه سعيد حميد الوالى الكندى","ميره عبيد سرور ربيع المزروعي","نورة أحمد عتيق محمد الكندي"],"5G2":["الهنوف عبيد محمد سيف النقبي","امنه مبارك محمد عبد الله الكندي","اميره احمد سبيل سالم راشد","جمانه ابراهيم محمد محمد شاف الدين","دانه احمد عبدالله الحلو اليماحي","دانه ايمن سالم جمعه","ريم بنت يونس بن مراد بن محمد البلوشيه","سلامه حسن علي الزري الزعابي","سندس خليفه سعيد على اليماحى","شما محمد خلفان الوالي الكندي","عائشة جاسم محمد سليمان اللوغاني","عليا محمد سعيد سيف السعدي","علياء صالح عبدالله صالح","غايه على سعيد راشد الكندي","فاطمة سالم مراد محمد بشكردي","فاطمه حسن حميد النهم المراشده","فاطمه عبدالله حميد ابراهيم المراشده","فاطمه منصور راشد الحيد الزعابي","مريم عبدالله محمد علي الزعابي","مريم محمد مفتاح الشاعر الزعابي","مريم موسى باروت موسى البارودى","ميثه اسماعيل ابراهيم سليمان اسماعيل","ميثه سلطان علي محمد الزعابي","نور ابراهيم حسن محمد عبدالله","هند راشد عبيد حامد الغافري"],"5G3":["اصايل صالح علي ناصر الزعابي","الجوري نادر محمد عبدالرحمن البلوشي","امل علي موسي ابراهيم جداع","جود احمد عبيد مرشودي الدرمكي","حمده احمد محمد مصبح الدرمكى","روضه محمد على محمد عبدالله","سلامه عبدالرحيم عيسى يوسف الدرمكي","سلامه موسى عبدالله محمد البلوشي","شهد علي ابراهيم بلم","شوق أحمد محمد الوشاحي الكتبي","شيخة خليل مبارك بلال المطروشي","شيخه بنت جاسم بن عبدالله بن حسن المطروشية","شيخه موسى اسماعيل عبدالله صالح","عائشة سالم حسن المطروشي الزعابي","عائشه راشد خميس الابلم النقبي","عائشه عبدالله سعيد مراد محمد","عائشه عبدالله محمد علي المراشده","غاليه فهد محمد حمود اليماحي","غلا اسهيل احمد حمدان الزعابي","فاطمة عبدالله سعيد راشد الكندي","مروه عمر محمد جمعه النقبي","مزنه احمد سهيل صنقور الزعابي","ميثه خلفان سالم خميس الكندي","ميره محمد علي احمد الشاووش","هند حسن على ابوشهاب","هند خلفان سعيد الوالي الكندي","هند ياسر احمد الشيخ علي الشحي"],"5G4":["الجوري علي مراد صقر الدرمكي","امنه عمر سلطان الشحصى الزعابي","حمده محمد خلفان محمد","روضه سيف على عيسى الكندي","سلامه عيسى علي صديق عيسى","سلامه محمد هاشم محمد الدرمكى","شما سعيد خليفه سالم الدهمانى","شيخة خلفان محمد الوشاحي","ضى عمر نوروز غريب","عذاري سيف عبدالله حميد السويجي","عزه أحمد إبراهيم محمد البلوشي","عوشه عادل احمد يوسف","غالية يوسف إبراهيم الجسمي","فاطمه خميس سلمان ربيع الزعابي","فاطمه عبدالله محمد عيسى البلوشى","فاطمه محمد أحمد محمد ضيف الله","فاطمه يوسف عبدالله محمد","لطيفه خالد محمد عباس","مآثر علي محمد عباس البلوشي","ماريه رحمه مجبل عنتر آل علي","مريم سالم احمد عباس البلوشي","مريم سلطان علي محمد الشامسي","مهرة عبدالله خميس الدرمكي","مهره عبدالله جمعه يتوم","موزه حامد موسى على عبدالرحمن","ميره احمد جاسم الباروت البارود","هاجر محمد حسين حسن البلوشي","وصايف ابراهيم عبدالله الزعابي"],"5G5":["الريم عبدالله خليفة علي الكعبي","العنود سبت جمعه العنوان البلوشى","المها سالم مطر سالم المراشدة","اليازيه محمد علي محمد الشامسي","ايه عبدالله خميس راشد الابلم النقبي","بشرى بنت يعقوب بن يوسف بن محمد البلوشيه","بيان علي يوسف محمد الزعابي","حفصه هاشم محمد عباس البلوشى","حمده ابراهيم عبدالرحمن عيسى البلوشي","حور عمر سيف على الكندى","خوله ماجد راشد بدر الحطب","رغد محمد جمعه العكله النقبي","ساره محمد عبدالله أبوصيم آل علي","شهد احمد درويش صنقور الزعابي","شيخه احمد عبدالله مراد على","شيخه يوسف جمعه عبدالله المراشده","صالحه نايف سرور خميس الزعابي","عائشه محمد عبيد خميس","غاليه فهد محمد سرحان الزعابي","مريم سعيد حمد هزيم الزعابي","مريم مصبح راشد خلفان الكندي","مزنه أحمد محمد عباس البلوشي","مهره محمد عبدالله البديع النقبي","ميثة علي محمد سريع القايدي","نوره محمد راشد خلف الزعابى","همس عمران علي عمران الشرفاء","هيا خالد عبدالسلام سالم الدرمكي","هيا سعيد عبدالله ابراهيم الأميري"],"6G1":["آمنه حامد سيف محمد الدرمكي","الريم عبدالكريم جاسم اسماعيل الدرمكي","اميره فيصل على محمد اللوغانى","بشرى احمد عبدالله السويجي الزعابي","تسنيم الفناسى","حفصه احمد عتيق محمد الكندي","حور محمد مبارك بن موسى اللوغاني","روان راشد محمد سالم الزعابى","روضه محمود يوسف بن محمود الدرمكي","ريان وليد سعيد راشد الكندي","ريم ابراهيم محمد عبدالله الاميرى","ساره عمر سعيد على النقبى","شما موسى اسماعيل عبدالله صالح","بشرى بنت يعقوب بن يوسف بن محمد البلوشيه","بيان علي يوسف محمد الزعابي","حفصه هاشم محمد عباس البلوشى","حمده ابراهيم عبدالرحمن عيسى البلوشي","حور عمر سيف على الكندى","خوله ماجد راشد بدر الحطب","رغد محمد جمعه العكله النقبي","ساره محمد عبدالله أبوصيم آل علي","شهد احمد درويش صنقور الزعابي","شيخه احمد عبدالله مراد على","قصايد خليفه محمد عبدالله الكندي","مريم على محمد الغيلى الزعابي","مهره احمد خلفان لحمودى القايدى","ميره محمد راشد علي الحفيتي","هند عبيد محمد سيف النقبي","هيا احمد مراد ميرزا عبدالنبى"],"6G2":["الجازى خلفان محمد احمد الزعابي","الجوري ياسر عبدالسلام سالم الدرمكي","امنه حمد احمد محمد ضيف الله","انوار وليد محمد صالح هاشم فكرى","جنان أحمد عبدالله العضب المطروشي","جنى أحمد عبدالله العضب المطروشي","حور محمد خميس عبدالله العاشق","ريم ابراهيم عبيد محمد الزعابي","سجى جابر ابراهيم مراد عبدالله","سلامه جابر محمد صالح عبدالله","سلامه محمد على التفاق","شما محمد مسعود عبدالله الكلبانى","شمه احمد جمعه بالحاج المراشده","شيخه بنت سلطان بن راشد بن سعيد المطروشيه","ضى سيف غانم سيف الزعابي","عائشه سعيد عبيد سرور الزعابي","عائشه سعيد مبارك سالمين توبي","عهد خالد ابراهيم مراد عبدالله","غلا عبدالله خميس احمد البلوشى","فاطمه يوسف عبدالله حسن المطروشى","ماريا عبدالله سالم عبيد الزعابي","مروة ياسر احمد عبيد النقبي","مريم حمد علي محمد المزروعي","مريم على حسن احمد حيدر","مريم عيسى محمد عباس البلوشي","مزنه محمد علي محمد حسن","موزه فهد احمد على الرئيسي","موزه محمد عبدالله خلفان الكندي","ميره محمد علي محمد حسن","ندى على سعيد ساعود المزروعي"],"6G3":["اليازى عمر عبدالله سرحان الزعابي","امنه هزاع على محمد عبدالله","جواهر عبدالعزيز عادل على","ديما يوسف محمد يعقوب سواويد","رحمه سعيد حسن سيف الدرمكي","رهف راشد سيف مصاقره الزعابي","ريم حمد سيف خفيف المزروعي","ريم محمد حارب محمد الزعابي","سلامه راشد سعيد الوالي الكندي","شوق سالم مبارك سالمين سعيد","شيخه حسن عبدالله يوسف الدرمكى","شيخه مطر سعيد هلال الزعابي","عليا حمدان حميد جمعه المراشده","غدير فهد محمد حمود اليماحي","غلا حميد علي سالم الكلباني","فاطمه فهد عبيد ضاحي الزعابي","فاطمه محمد حمد صياح المعمري","مريم صقر احمد الهوره المراشده","مزنه عباس محمد عباس البلوشي","مهره محمد عبيد خميس الكندي","موزه هيثم حسن هلال الزعابي","مى حسن على محمد","ميثه خالد محمد عبدالله الزعابى","ميثه فهد عبدالله حسن النقبى","ميره عدنان عباس مراد محمد","نور احمد على","نورا حسن موسى علي الدرمكي","نوره خالد اسماعيل بلال البارود","هيام سهيل محمد علي اليماحي"],"6G4":["الريم حمود علي راشد الكندي","العنود راشد احمد عبيد النقبى","حليمه احمد قاسم بيرق اللوغاني","حمده بدر سالم على العبدولي","ريم راشد عبدالله محمد سالم","سلمى احمد عبيد محمد الزعابي","سميه احمد عبيد الهوره المراشده","شهلاء عبيد عبدالسلام سالم الدرمكي","شيخه راشد سيف عبيد الكندي","عائشه ايمن درويش حميد الزعابي","غزلان عبدالله سلطان المرشودي الدرمكي","فاطمه احمد خميس محمد النقبي","فاطمه محمد عبيد حامد","فاطمه محمد علي جعفر الأنصاري","فواغي عبدالله شاهين محمد عبدالله","مريم عبدالرحمن عيسى يوسف الدرمكي","مريم عبدالله راشد عبدالله القائدى","مزون ربيع سلمان ربيع الزعابي","مها خلفان راشد علي الزعابي","مهرة راشد يوسف عبيد الدرمكي","مهره محمد مراد علي الرئيسي","نورة مبارك موسى بن موسى اللوغاني","هاجر سعيد سيف المزروعي","هديل ماجد عبدالله ابراهيم جاسم","هند خالد مطر الزري الزعابي","هند سعيد على عبدالله الزعابى","هند طارق يوسف بالحاى المراشده","هيا هاشم محمد عباس البلوشى","ورده عمر جمعه محمد المراشده","يقين احمد سلطان الشحصى الزعابي"],"6G5":["آمنه عبدالله حسن هلال الزعابي","العنود محمد عبدالرحمن عمران المطوع","اليازيه حسن محمد حسن الطنيجي","اميره خميس عبيد احمد السماحى","بشاير احمد محمد الابلم الدرمكي","جواهر جوهر مصبح عبيد المزروعي","حصه حمدان سيف علي الذباحي","حمده وليد حسن على الدرمكي","ديما عبدالله حسن على","ديمه على يوسف صابر","روضه عبيد سيف عبيد الكندي","شما احمد حسن عيسى البلوشي","شيخه رحمه مجبل عنتر آل علي","شيخه سعيد سيف خميس الدرمكي","شيخه سعيد على راشد الكندي","شيخه عيسى عبيد العواسيه الزعابي","شيخه محمد حسن الوالى الكندى","عائشه حمد سيف على الذباحي","عائشه سعيد على ربيع","عائشه سعيد محمد علي الزعابي","غلا خميس محمد سريح القائدى","فاطمه احمد عبدالله عبيد الدرمكي","فرح فهد صابر صنقور المراشده","مريم طارق احمد علي السعدي","مريم عبدالله سيف خفيف المزروعي","مهره خميس سرور ربيع المزروعي","مهره راشد بشير الباروت البارود","ميثه حمد سيف على الذباحي","نوره على موسى على عبدالرحمن","ود راشد موسى محمد الكندي"],"7G1":["أفنان حمد سعيد عبدالله الزعابي","ابرار خالد محمد سعيد الزعابى","العنود احمد على جميع الهنداسى","انفال عبدالعزيز ابراهيم محمد صالح","بدريه حسين حسن موسى عبدالله","جورى ابراهيم سعيد العاجل الزعابى","جورى عيسى عبدالله بوصيم آل علي","حليمه راشد جمعه الهوره المراشده","حمده صقر جمعة صنقور جمعة صنقور الزعابي","حور اسماعيل غانم اسماعيل السويدى","حور جاسم محمد مبارك النقبي","حور راشد عبدالله محمد سالم","خديجه عادل درويش حميد","خلود سعيد سالم سعيد المزاحمى","رغد محمد سعيد راشد الكندي","ريم محمد سيف مفتاح الزعابي","سارة ابراهيم حسن علي الزعابي","سلامه على سعيد راشد الكندي","شموخ يونس صالح محمد الرئيسي","شهد خلف يوسف خلف النقبي","شيخه جاسم خميس بن ربيع النقبي","شيخه سعيد سرور عبيد الزعابي","ضى صالح مبارك عواسيه الزعابى","عائشة بنت علي بن خميس بن جمعه المزينيه","عليا ابراهيم سالم محمد الدهماني","عليا جاسم محمد حسن الجداع","فاطمة بدر احمد كميل البلوشي","مايا محمد جمال الدين محمد عمران","مريم احمد عيسى يوسف الدرمكي","مزون محمد جمعه محمد البلوشي","ملك حماده محمد رضا جلال صالح","ميثاء بلال سلمان ربيع الزعابي"],"7G2":["أميره اسماعيل علي محمد عبدالله","اخلاص ملاكو انقدا تقنجا","الجوري عبيد خديم محمد الكندي","الريم ابراهيم عبدالله يوسف الدرمكي","امنه احمد سيف محمد","جواهر مبارك موسى علي عبدالرحمن","جود خالد محمد حمود اليماحي","جورى حسن على حمدان","جورى يوسف محمد عباس محمد","حور اسماعيل ابراهيم سليمان اسماعيل","خلود خالد محمد عبدالرحمن المدحاني","روضه يوسف محمد عبدالله البلوشي","سلامه محمد سهيل محمد الزعابي","شمسه احمد سليمان عبيد الزعابى","شمسه خليل ابراهيم احمد البلوشي","شهد عبدالعزيز مبارك بن موسى اللوغاني","ضى راشد على سالم الكلباني","عائشه حسن على عبدالله الزعابي","عائشه محمد على راشد الكندي","عايشه علي محمد الزرى الزعابي","فاطمه على حسن على الذباحي","فاطمه مانع علي جمعه النقبي","فاطمه وليد أحمد جمعه الأميري","فرح فيصل احمد خاوي الزعابي","فى احمد حسن عيسى البلوشي","ماريا راشد حمد الارناق اليماحي","مريم حميد مراد أحمد جعفر","مريم علي محمد عباس البلوشي","مها فيصل عبدالله محمد الدرمكي","ميثه عبدالله محمد عبدالله الزعابى","نور وليد ثانى مبارك ثانى","هيا حسن عبدالكريم اللغاى النقبي"],"7G3":["آمنه ياسر سعيد خدوم الكندي","اصيله خلفان سالم خميس الكندي","الجوري عيسى محمد عيسى علي","امنه خالد خميس البديوى الكندي","امنه عيسى محمد مراد الأميري","حصة عبدالله جمعة يتوم","حور بدر على محمد اللوغاني","خديه حسن صنقور فيروز البلوشى","ريان عيسى سلطان سعيد المرشودى","ساره سيف خلف جابر","سليمه حمدان سيف على الذباحى","شما مطر على عبدالله الزعابي","شما يعقوب سيف صالح الزعابي","عائشه خالد سهيل حمدان الزعابي","عائشه ياسر خلفان حمدان الزعابي","عهود يوسف هلال يوسف الزعابي","فاطمه خلفان راشد خلفان الكندي","فاطمه عباس محمد عباس البلوشي","قصايد بنت راشد بن جمعه بن سالم الجابريه","مريم خالد جمعه جاسم الزعابى","مريم عيسى محمد حيدر","مريم فريد محمد راشد الزعابي","مريم يوسف محمد حسن الزعابى","مزنه بشير راشد خلف الزعابي","مهرة بنت محمد بن حاتم البلوشية","مهره محمد عيسى محمد البلوشي","ميثاء وليد علي حسين مشاري","ميثه بلال سلمان ربيع الزعابي","ميره علي خلفان حمدان الزعابي","نوف على احمد على عبدالله","هاجر ماجد حارب الصوايه النعيمي","هيا عبدالله جاسم محمد الرئيسى"],"7G4":["آمنه محمد خلفان خميس النقبي","أمنه عبدالرحمن عيسى يوسف الدرمكي","الجورى محمد محمد عبدالله البلوشي","امنه يوسف محمد صابر البلوشي","انفال ابراهيم محمد","حمدة عبدالرحيم عيسى يوسف الدرمكي","حور سالم مسعود عبدالله الكلباني","دانه احمد سلطان الشحصى الزعابي","روضه خالد خدوم اسماعيل البارود","ريم خليل ابرهيم على البلوشى","ساره عادل خميس سالم الزعابي","سلامه سالم سعيد سيف السعدي","سلامه سلطان سيف علي الذباحي","شما عارف خميس مفتاح الكعبي","شهد يعقوب يوسف محمد الدرمكي","عائشه ابراهيم خليفه خميس الملص","عائشه جمعه محمود مراد حسين","عائشه عبدالله احمد على المرزوقى","فاطمه خالد حميد النهم المراشده","فاطمه راشد على الرشود الكندي","فاطمه على مراد محمد عمر","فاطمه موسى بشير الباروت البارود","قصايد موسى محمد عيسى البلوشي","ماريه خالد أحمد حمدان الزعابي","مريم على موسى ابراهيم","مهره الماس جمعه الماس البلوشي","مهره جاسم بشير محمد علي","مهره سالم سعيد راشد الكندى","موزه عبدالله راشد محمد الحفيتي","موزه عمر سلطان الشحصى","نوف نايف سرور خميس الزعابى","هاجر محمد علي محمد عبدالله","هنايف علي حسن شمل الرئيسي"],"7G5":["جواهر خميس سرور ربيع المزروعى","جواهر علي سليمان البلوشي","جوري ماجد سعيد محمد البلوشي","حور حسن مراد عبدالله البلوشي","دانه احمد سعيد راشد الكندي","ريم سلطان على محمد","ساره عبدالله على بشران المقبالى","شريفه علي حسن محمد عبدالله","شوق بكر راشد خلف الزعابي","عائشه حمود علي راشد الكندي","عذارى فهد صابر صنقور المراشده","فاطمه عبيد علي التفاق المراشده","فاطمه محمد يعقوب كيسرى سواويد","لبنى عبدالله سعيد عبدالله الزعابي","مريم احمد خميس حسن الكندي","مريم احمد سبيل سالم راشد","مريم حسن علي أبوشهاب المراشده","مريم محمد على احمد الشاووش","مريم محمد علي محمد عبدالله","مزنه محمود عبدالسلام سالم الدرمكي","مزنه هلال سيف عبيد الكندى","مهره عبدالعزيز عتيق محمد الكندي","ميثه يوسف عبدالرحمن سليمان البلوشي","ميعاد سيف محمد جمعه النقبي","هند أحمد درويش صنقورالزعابي","هند سعود حسين محمد الاوغاني","هند عمران على المطوع الشرفاء","هند يوسف عبدالله محمد","وديمه على عبدالله محمد سليمان","وديمه ياسر عبدالسلام سالم الدرمكى","وصايف بنت صالح بن حمد بن عيسى البلوشية","وضحى على سالم عبيد الكندى"],"8G1":["ازهار حسين عبيد على الكعبي","امل عبدالرحمن خميس عبيد الكعبي","بشاير مبارك محمد عبدالله الكندي","جنى على على على علام","حليمه يعقوب عبدالله البيرق اللوغانى","حمده علي عمران المطوع الشرفاء","حور يوسف حسين بيرق اللوغاني","دانه خالد عباس مراد محمد","ريم بنت خالد بن على بن عبدالله البلوشيه","زمزم محمد حسين حسن البلوشي","ساره محمود ميرزا محمد البلوشى","ساميه علي يوسف محمد الزعابي","سلامه حمد علي بن عفيد القايدي","شذى يحيى مطر الزرى","شهد جاسم حسن احمد البلوشي","شوق فهد محمد عبدالله الأميري","شيخه حمد حميد جمعه المراشده","عائشه جمعه موسى الهوره المراشده","عائشه عبدالله مصبح بن تميم الدرمكي","عائشه محمد سيف خفيف المزروعي","عليا عادل مبارك عواسيه الزعابي","عهد صالح علي محمد البلوشي","غايه محمد جمعه عبدالرحمن البدواوي","غلا محمد حسن على اليليلى","غنيمه ايمن ثاني مبارك ثاني","فرح عبدالعزيز عيسى يوسف","مزنه عبدالله محمد عبدالله","مها سلطان راشد سلطان الاشخرى","موزه راشد خميس الابلم النقبي","ميثا ابراهيم خلف صالح الزعابي","هند سيف عبدالله الشوكه الحمادي","هيا عبدالله حميد ابراهيم المراشده"],"8G2":["العنود خليفه هلال محمد الغافري","بدور على سهيل محمد الزعابي","جواهر اسماعيل عبدالله يوسف الدرمكى","خديجه محمد رمزي شعبان شبل","ديالا علي محمد الزري الزعابي","روضه عيسى حسن محمد حسين","سلامه أحمد جمعه محمد المراشده","سلامه فهد موسى كيسرى","شمه محمد حسن بن حنيفه البلوشي","شمسه محمد سعيد سيف السعديه","شهد سعيد سالم عزيز السعدي","شهد علي سعيد علي الغافري","شيماء علي حسن احمد حيدر","ظبيه بنت فهد بن سالم بن عزيز السعدية","غلا فيصل على مراد","فاطمه بطي سعيد عبيد سيف","فاطمه حسن خميس علي زبيبوه","فاطمه يعقوب يوسف خلف النقبي","ماريه ياسر خلفان حمدان الزعابي","مريم احمد حسن شمل","مريم بنت جاسم بن عبدالله بن حسن المطروشية","مريم سلطان على محمد الزعابى","مزنه محمد حسن على الدرمكى","ميره حسين علي البديع النقبي","ميره محمد جاسم شهرين النقبي","ميره يوسف عبيد محمد الزعابي","ناعمه مهند عقاب الباروت البارود","هدى عبدالله حسن احمد البلوشي","هند علي حسين محمد البلوشي","هيا محمد صالح سالم المراشده","وصايف سلطان محمد الغيلى","وضحى عبدالرحمن محمد عبدالله سلطان"],"8G3":["الهنوف بنت راشد بن درويش بن راشد الظهورية","بدور عبيد عبدالرحمن قمبر الزرعوني","حليمه سعيد محمد على","حليمه محمد عبيد حامد","ريم حسن سليمان سلمان الشرفاء","ريم خميس خديم محمد الكندي","سارة بنت عبد السلام عروس","ساره إبراهيم موسى علي عبدالرحمن","سلامه حسين علي محمد المزروعي","سلامه حمود علي راشد الكندي","سميه عمر احمد المغني النقبي","شهد خميس محمد سالم الزعابي","عائشه حمد عبيد محمد الزعابي","عهد موسى باروت الباروت البارودى","عهود وليد فيروز وليد النقبي","غلا ابراهيم احمد البوصى النقبى","فاطمه ابراهيم خميس محمد الغنامى","فاطمه علي ابراهيم عرب الزعابي","لولوه على سالم سيف حماد الدرمكى","ماريه حمد سيف عبيد الكندي","مريم عبدالله سليمان علي البلوشي","مسك بسام محمد حسين","مهره سالم علي سالم المزروعي","ميثا يعقوب احمد السركال ال على","ميثه احمد ابراهيم احمد المعيني","ميثه على ذئب خميس","ميره راشد يوسف بن محمود الدرمكي","ميره سعيد يوسف محمد الزعابي","نوره خالد محمد عبدالرحمن المدحاني","نوره علي خميس عبدالله الزعابي","هدى يوسف أحمد حمدان الزعابي"],"8G4":["امنه احمد عيسى محمد حيدر","امنه على موسى ابراهيم جداع","جواهر راشد سالم راشد الزحمي","جوري وحيد محمد حمود اليماحي","حنين مشعل سالم جرش الزعابى","دانه عارف سلطان الخبيل المحرزى","ريان طارق مراد عبدالله البلوشي","ريم سعيد جاسم عثمان البلوشي","ريم عبدالرحيم حسين يوسف الاميري","ريم مطر سعيد هلال الزعابي","سلمى محمد على خلفان الدرمكي","سهيله سالم حسن المطروشي الزعابي","شما صقر جمعه صنقور الزعابي","شما عبدالله سعيد غانم الزعابي","شيخه محمد يوسف محمد الرئيسي","عائشه عبدالرحمن سلطان الشحصي الزعابي","عائشه عبدالله سعيد راشد الكندي","عائشه عمر سلطان الشحصى","علياء عبدالله شاهين محمد عبدالله","فاطمة عبدالله خليفة علي الكعبي","فاطمه حسن ابرهيم على مراد","فاطمه حمد حميد جمعه المراشده","فاطمه عمار محمد النهم المراشده","فجر محمد خميس المدفع الكندي","لولوه طارق أحمد علي السعدي","مريم احمد حسن علي الزعابي","مريم سعيد هلال حميد الزعابى","مريم جميل حسن عبدالله البلوشي","موزه علي درويش حسن المراشده","نور فيصل عبدالرحمن محمد البلوشي","هنادي احمد خميس على الكعبي","هند جاسم خميس محمد الدرمكي"],"8G5":["أنفال حمد علي محمد المزروعي","الريم محمد عبدالرحمن المطوع شرفاء","امنه محمد سيف خميس الدرمكي","جواهر أحمد عبدالرحمن سليمان البلوشي","حصه عبدالرحمن عباس عبدالله هوتى","خلود طارق يوسف بوصيم آل علي","زينب على موسى ابراهيم جداع","ساره حسن محمد على الشحى","شريفه يوسف عبدالله حسن المطروشى","شهد عبدالله سعيد مراد محمد","شهد فهد ابراهيم عبدالرحمن البلوشي","عائشة يوسف محمد فكري البستكي","عائشه جاسم احمد الشحصى الزعابي","عائشه طارق عبدالسلام سالم الدرمكي","عنود مراد صقر يوسف الدرمكى","غايه على خليفه سالم الدهماني","فاطمة درويش عبدالرحمن عبدالله","فاطمه نبيل مراد اسماعيل البلوشى","فاطمه يوسف محمد سليمان عبدالله","فدوى احمد عبدالله عبيد الدرمكي","مروه يونس سعيد محمد البلوشي","مريم حسين على الظنين النقبي","مريم فهد أحمد علي الرئيسي","مشاعل راشد محمد علي الزيودي","مهره فهد سعيد عبدالله الدرمكى","موزه احمد على مبارك الكندي","موزه على محمد راشد الكندي","ميره محمد سالم جرش الزعابى","ميره ياسر احمد الشيخ علي الشحي","نوره خليفه حسين علي اللوغاني","هيام خلفان راشد على الزعابي","وسميه يوسف راشد خلف الزعابي"]};
const ROSTER_OVERRIDES_KEY='misbar_roster_overrides_v1';
const OFFICIAL_ROSTER_REFRESH_V79='misbar_official_roster_refresh_v79';
try{
  if(!localStorage.getItem(OFFICIAL_ROSTER_REFRESH_V79)){
    const _ov=safeObject(JSON.parse(localStorage.getItem(ROSTER_OVERRIDES_KEY)||'{}'));
    ['6G1','6G2','6G3','7G3'].forEach(k=>delete _ov[k]);
    localStorage.setItem(ROSTER_OVERRIDES_KEY,JSON.stringify(_ov));
    localStorage.setItem(OFFICIAL_ROSTER_REFRESH_V79,'1');
  }
}catch(e){}

function loadRosterOverrides(){try{return safeObject(JSON.parse(localStorage.getItem(ROSTER_OVERRIDES_KEY)||'{}'))}catch{return {}}}
function saveRosterOverrides(v){localStorage.setItem(ROSTER_OVERRIDES_KEY,JSON.stringify(v));scheduleCloudPush()}
function rosterClassKey(){return classFilter?.value||''}
function rosterForCurrentClass(){const k=rosterClassKey(),o=loadRosterOverrides();if(Array.isArray(o[k]))return [...o[k]];if(Array.isArray(BUILTIN_ROSTERS[k]))return [...BUILTIN_ROSTERS[k]];return []}
let roster=[];
function syncRosterFromClass(){roster=rosterForCurrentClass();if($('#view-scores')?.classList.contains('active'))renderScores();updateOverviewStudentCount()}
function updateOverviewStudentCount(){
  const students=roster.length||0;
  const st=$('#overviewStudents'); if(st)st.textContent=students;
  let rows=[];
  try{
    const assessments=currentContextAssessments().filter(a=>!a.weekly&&!String(a.type||'').startsWith('اختبار قصير'));
    const all=loadAllScores();
    assessments.forEach(a=>{
      const s=all[assessmentKey(a.id)];
      if(s?.rows?.length){
        const max=Number(s.max||a.max||100)||100;
        s.rows.forEach(r=>{
          const score=Number(r.score);
          if(Number.isFinite(score))rows.push({score,max});
        });
      }
    });
  }catch(e){}
  const diagnosed=rows.length;
  const pcts=rows.map(r=>r.max?r.score/r.max*100:0);
  const mastery=diagnosed?Math.round(pcts.reduce((a,b)=>a+b,0)/diagnosed):null;
  const need=pcts.filter(p=>p<60).length;
  const d=$('#overviewDiagnosed'),m=$('#overviewMastery'),n=$('#overviewNeed'),c=$('#overviewCompletion');
  if(d)d.textContent=diagnosed;
  if(m)m.textContent=mastery===null?'—':mastery+'%';
  if(n)n.textContent=need;
  if(c)c.textContent=diagnosed?(students?Math.min(100,Math.round(diagnosed/students*100))+'% مكتمل':'تم إدخال النتائج'):'لا توجد نتائج بعد';
  const title=$('#overviewPriorityTitle'),body=$('#overviewPriorityText');
  if(!diagnosed){
    if(title)title.textContent='بانتظار النتائج الحقيقية';
    if(body)body.textContent='بعد إدخال واعتماد نتائج الاختبار التشخيصي سيظهر هنا ملخص الفجوة ذات الأولوية.';
  }else{
    if(title)title.textContent=need?'توجد حالات تحتاج تدخلًا':'لا توجد أولوية تدخل حاليًا';
    if(body)body.textContent=need?`${need} من الطالبات/الطلاب أقل من 60% ويحتاجون متابعة.`:'النتائج الحالية لا تتضمن حالات أقل من 60%.';
  }
}
function persistCurrentRoster(){const o=loadRosterOverrides();o[rosterClassKey()]=[...roster];saveRosterOverrides(o)}
function renderRosterManager(){const box=$('#rosterManageList');if(!box)return;$('#rosterDialogTitle').textContent=`طالبات ${classFilter.value} • ${roster.length} طالبة`;box.innerHTML=roster.length?roster.map((n,i)=>`<div style="display:grid;grid-template-columns:42px 1fr auto;gap:8px;align-items:center;padding:8px;border-bottom:1px solid #edf3f7"><b>${i+1}</b><span>${n}</span><span style="display:flex;gap:6px"><button class="btn ghost small roster-edit" data-i="${i}">تعديل</button><button class="btn ghost small roster-delete" data-i="${i}">حذف</button></span></div>`).join(''):'<div class="empty-inline">لا توجد أسماء لهذه الشعبة في الملف المرفوع. يمكنك إضافة الطالبات يدويًا.</div>';$$('.roster-edit').forEach(b=>b.onclick=()=>{const i=+b.dataset.i,n=prompt('عدّلي اسم الطالبة:',roster[i]);if(n&&n.trim()){roster[i]=n.trim();persistCurrentRoster();renderRosterManager();renderScores();updateOverviewStudentCount()}});$$('.roster-delete').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(confirm(`حذف ${roster[i]} من هذه الشعبة؟`)){roster.splice(i,1);persistCurrentRoster();renderRosterManager();renderScores();updateOverviewStudentCount()}})}

let activeAssessmentId='';
function loadAssessments(){try{const v=JSON.parse(localStorage.getItem(ASSESSMENTS_KEY)||'[]');return safeArray(v).map(a=>({...safeObject(a),skills:safeArray(a?.skills),max:Number(a?.max)||100}))}catch{return[]}}
function saveAssessments(v){localStorage.setItem(ASSESSMENTS_KEY,JSON.stringify(v));scheduleCloudPush()}
function loadAllScores(){try{const raw=safeObject(JSON.parse(localStorage.getItem(SCORES_KEY)||'{}'));const out={};Object.entries(raw).forEach(([k,v])=>{const o=safeObject(v);out[k]={...o,rows:safeArray(o.rows).map(r=>safeObject(r))};});return out}catch{return{}}}
function saveAllScores(v){localStorage.setItem(SCORES_KEY,JSON.stringify(v));scheduleCloudPush()}
function contextKey(){return [currentUser.email||'demo',subjectFilter?.value||currentUser.subject,gradeFilter?.value||'',classFilter?.value||''].join('|')}
function assessmentKey(id){return contextKey()+'|'+id}
function currentContextAssessments(){
  const ctx=contextKey();
  return loadAssessments().filter(a=>a.context===ctx);
}
function defaultAssessmentIdForContext(ctx=contextKey()){
  let h=2166136261;
  for(let i=0;i<ctx.length;i++){h^=ctx.charCodeAt(i);h=Math.imul(h,16777619)}
  return 'AUTO_DIAGNOSTIC_'+(h>>>0).toString(36).toUpperCase();
}
function subjectMaxScore(subject){return 10}
function syncSubjectMaxUI(){const max=subjectMaxScore(subjectFilter?.value);if($('#maxScoreSelect'))$('#maxScoreSelect').value=String(max);if($('#newAssessmentMax'))$('#newAssessmentMax').value=String(max);return max}
function assessmentSkillsForSubject(subject){
  const map={
    'العلوم':['الاستقصاء العلمي','تفسير البيانات','المفاهيم العلمية','التطبيق والاستدلال'],
    'الرياضيات':['الأعداد والعمليات','الجبر','الهندسة والقياس','البيانات والاحتمالات','حل المشكلات'],
    'اللغة العربية':['القراءة والفهم','المفردات','القواعد والتراكيب','الكتابة','الاستماع والتحدث'],
    'اللغة الإنجليزية':['Reading','Vocabulary','Grammar','Writing','Listening & Speaking']
  }; return map[subject]||['المهارة 1','المهارة 2','المهارة 3'];
}
function renderAssessmentSkillChoices(selected=[]){const box=$('#assessmentSkillChoices');if(!box)return;box.innerHTML=assessmentSkillsForSubject(subjectFilter.value).map(s=>`<button type="button" class="${selected.includes(s)?'selected':''}" data-skill="${s}">${s}</button>`).join('');$$('#assessmentSkillChoices button').forEach(b=>b.onclick=()=>b.classList.toggle('selected'))}
function selectedAssessmentSkills(){return $$('#assessmentSkillChoices button.selected').map(b=>b.dataset.skill)}
function assessmentSignature(a){return [a.context,a.type,a.date||'',a.interventionId||'',a.week||''].join('||')}
function cleanupDuplicateAssessments(){
  const all=loadAssessments(),scores=loadAllScores(),seen=new Map(),kept=[];
  for(const a of all){
    const sig=assessmentSignature(a);
    if(!seen.has(sig)){seen.set(sig,a);kept.push(a);continue}
    const first=seen.get(sig);
    const firstSaved=scores[String(first.context||'')+'|'+first.id];
    const thisSaved=scores[String(a.context||'')+'|'+a.id];
    if(!firstSaved&&thisSaved){
      const idx=kept.findIndex(x=>x.id===first.id&&x.context===first.context);
      if(idx>=0)kept[idx]=a;
      seen.set(sig,a);
    }
  }
  if(kept.length!==all.length)saveAssessments(kept);
  return kept;
}
function ensureDefaultAssessment(){
  try{
    const ctx=contextKey();
    let all=loadAssessments();
    let list=all.filter(a=>a.context===ctx);
    if(!list.length){
      const id=defaultAssessmentIdForContext(ctx);
      const a={id,context:ctx,type:'التشخيص الأولي',max:10,date:new Date().toISOString().slice(0,10),status:'in_progress',skills:assessmentSkillsForSubject(subjectFilter?.value||currentUser.subject),locked:false,autoCreated:true};
      all.push(a);
      saveAssessments(all);
      const check=loadAssessments().find(x=>x.id===id&&x.context===ctx);
      if(!check)throw new Error('تعذر إنشاء سجل التشخيص الافتراضي');
      list=[check];
      // Migrate scores created by V89-V92 under the temporary DIRECT_DIAGNOSTIC key.
      const store=loadAllScores(), oldKey=ctx+'|DIRECT_DIAGNOSTIC', newKey=ctx+'|'+id;
      if(store[oldKey]&&!store[newKey]){
        store[newKey]={...safeObject(store[oldKey]),migratedFrom:'DIRECT_DIAGNOSTIC'};
        saveAllScores(store);
      }
    }
    if(!activeAssessmentId||!list.some(a=>a.id===activeAssessmentId))activeAssessmentId=list[0].id;
    return list;
  }catch(err){
    console.error('Default assessment creation failed',err);
    return currentContextAssessments();
  }
}
function assessmentUiStatus(a,saved){if(a.locked)return['معتمد','locked'];if(!saved||!saved.rows?.length)return['لم يبدأ','draft'];const total=rosterForCurrentClass().length||roster.length,entered=saved.rows.length;if(entered<total)return[`جارٍ الإدخال ${entered}/${total}`,'progress'];return['مكتمل','done']}
function renderAssessmentCards(){if(!$('#assessmentCards'))return;const list=ensureDefaultAssessment();$('#assessmentContext').textContent=`${subjectFilter.value} • الصف ${gradeArabicName(gradeFilter.value)} • ${classFilter.value}`;const box=$('#assessmentCards');if(!list.length){box.innerHTML='<div class="assessment-empty">لا توجد اختبارات لهذه الشعبة بعد.</div>';return}const scores=loadAllScores();box.innerHTML=list.map(a=>{const saved=scores[assessmentKey(a.id)],st=assessmentUiStatus(a,saved),skills=safeArray(a.skills).map(s=>`<span>${s}</span>`).join('');return `<article class="assessment-card ${a.locked?'locked-card':''}"><div class="assessment-meta"><span>${subjectFilter.value}</span><span>${classFilter.value}</span><span>من ${a.max}</span></div><h4>${a.type}</h4><small>${a.date||'بدون تاريخ'}</small><span class="assessment-status ${st[1]}">${st[0]}</span>${skills?`<div class="assessment-skills">${skills}</div>`:''}<div class="card-actions"><button class="btn ghost small open-assessment" data-id="${a.id}">فتح</button><button class="btn primary small score-assessment" data-id="${a.id}">${a.locked?'عرض النتائج':'إدخال الدرجات'}</button></div></article>`}).join('');$$('.open-assessment,.score-assessment').forEach(b=>b.onclick=()=>{activeAssessmentId=b.dataset.id;showView('scores');prepareScores()})}
function populateAssessmentSelect(){
  const list=ensureDefaultAssessment(),sel=$('#assessmentSelect');
  if(!list.length){
    sel.innerHTML='<option value="">لا يوجد اختبار تشخيصي</option>';
    activeAssessmentId='';
    $('#scoreTitle').textContent='لا يوجد اختبار تشخيصي';
    return;
  }
  sel.innerHTML=list.map(a=>`<option value="${a.id}">${a.type}${a.locked?' • معتمد':''}</option>`).join('');
  if(activeAssessmentId&&list.some(a=>a.id===activeAssessmentId))sel.value=activeAssessmentId;else activeAssessmentId=sel.value;
  const a=list.find(x=>x.id===sel.value);
  if(a){$('#maxScoreSelect').value=String(a.max);$('#scoreTitle').textContent=`${a.type} • ${classFilter.value}`}
}
function scoreLevel(score,max){const pct=max?score/max*100:0;if(pct>=80)return['متقن','good'];if(pct>=60)return['يحتاج دعماً','medium'];return['أولوية تدخل','danger']}
function scoreDraftKey(key){return 'misbarZayedScoreDraftV90|'+key}
function loadScoreDraft(key){try{return safeObject(JSON.parse(localStorage.getItem(scoreDraftKey(key))||'{}'))}catch{return{}}}
function scoreRowsFromDom(){
  const rows=[];
  $$('#scoreTable tbody tr').forEach(tr=>{
    const sel=tr.querySelector('select.score-select');
    if(!sel)return;
    const name=sel.dataset.studentName||tr.children[1]?.textContent.trim()||'';
    if(name && sel.value!=='')rows.push({name,score:+sel.value});
  });
  return rows;
}
function persistVisibleScoresNow(){
  try{
    const sels=$$('#scoreTable tbody select.score-select');
    if(!sels.length)return false;
    const first=sels[0], key=first.dataset.scoreKey||assessmentKey(activeAssessmentId||'DIRECT_DIAGNOSTIC');
    const rows=scoreRowsFromDom();
    const all=loadAllScores(), existing=safeObject(all[key]);
    const max=Number(first.dataset.max||10)||10;
    if(rows.length){
      all[key]={...existing,rows,max,savedAt:new Date().toISOString(),autoSaved:true,
        subject:first.dataset.subject||'',grade:first.dataset.grade||'',className:first.dataset.className||'',
        teacherEmail:currentUser.email||'',teacherName:currentUser.name||''};
    }else if(existing?.rows?.length){
      // Do not erase previously saved results merely because the UI is being redrawn/left.
      return true;
    }
    saveAllScores(all);
    localStorage.setItem(scoreDraftKey(key),JSON.stringify(Object.fromEntries(rows.map(r=>[r.name,r.score]))));
    return true;
  }catch(err){console.error('Persist visible scores failed',err);return false;}
}
function saveSingleScoreImmediate(sel){
  try{
    const list=ensureDefaultAssessment();
    if(!activeAssessmentId&&list.length)activeAssessmentId=list[0].id;
    const a=list.find(x=>x.id===activeAssessmentId)||list[0];
    if(!a)throw new Error('missing assessment');
    activeAssessmentId=a.id;
    const key=assessmentKey(a.id), name=sel.dataset.studentName;
    if(!name)throw new Error('missing student');
    sel.dataset.scoreKey=key;
    const all=loadAllScores(), existing=safeObject(all[key]);
    const map=new Map(safeArray(existing.rows).map(r=>[String(r.name),+r.score]));
    const draft=loadScoreDraft(key);Object.entries(draft).forEach(([n,v])=>map.set(n,+v));
    if(sel.value==='')map.delete(name);else map.set(name,+sel.value);
    const rows=[...map.entries()].filter(([,score])=>Number.isFinite(score)).map(([name,score])=>({name,score}));
    const max=Math.max(1,Number(a.max)||10);
    if(sel.value!=='' && (+sel.value<0 || +sel.value>max)){sel.value='';throw new Error('score out of range');}
    all[key]={...existing,rows,max,savedAt:new Date().toISOString(),autoSaved:true,
      subject:subjectFilter.value,grade:gradeFilter.value,className:classFilter.value,
      teacherEmail:currentUser.email||'',teacherName:currentUser.name||'',skills:safeArray(a.skills)};
    saveAllScores(all);
    localStorage.setItem(scoreDraftKey(key),JSON.stringify(Object.fromEntries(rows.map(r=>[r.name,r.score]))));
    const verify=loadAllScores()[key];
    const ok=sel.value==='' ? !safeArray(verify?.rows).some(r=>String(r.name)===String(name)) : safeArray(verify?.rows).some(r=>String(r.name)===String(name)&&Number(r.score)===Number(sel.value));
    const note=$('#savedNote');if(note)note.textContent=ok?`✓ تم حفظ درجة ${name} تلقائيًا`:'⚠️ تعذر تثبيت الدرجة';
    return ok;
  }catch(err){console.error('Immediate score save failed',err);const note=$('#savedNote');if(note)note.textContent='⚠️ تعذر الحفظ التلقائي';return false;}
}
function renderScores(){
  const tb=$('#scoreTable tbody');if(!tb)return;
  const list=ensureDefaultAssessment();
  if(!list.length){tb.innerHTML='<tr><td colspan="5">تعذر تجهيز الاختبار التشخيصي.</td></tr>';return;}
  if(!activeAssessmentId||!list.some(a=>a.id===activeAssessmentId))activeAssessmentId=list[0].id;
  const a=list.find(x=>x.id===activeAssessmentId)||list[0];
  const max=Math.max(1,Number(a.max)||10),all=loadAllScores(),locked=!!a.locked,key=assessmentKey(a.id),saved=all[key],draft=loadScoreDraft(key);
  const savedMap=saved?Object.fromEntries(safeArray(saved.rows).map(r=>[r.name,r.score])):{};Object.assign(savedMap,draft);
  tb.innerHTML='';
  roster.forEach((name,i)=>{
    let val=savedMap[name]??'';
    if(val!=='' && (+val<0 || +val>max)) val='';
    const maxInt=Math.max(1,Math.floor(max));
    const opts=['<option value="">—</option>'].concat(Array.from({length:maxInt+1},(_,x)=>`<option value="${x}" ${String(val)===String(x)?'selected':''}>${x}</option>`)).join('');
    const tr=document.createElement('tr');
    tr.innerHTML=`<td class="student-index">${i+1}</td><td><button type="button" class="student-name-link" data-student="${name.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}">${name}</button></td><td><select class="score-select" ${locked?'disabled':''}>${opts}</select></td><td class="pct-cell">—</td><td class="level-cell">—</td>`;
    const sel=tr.querySelector('.score-select');
    sel.dataset.scoreKey=key;sel.dataset.studentName=name;sel.dataset.max=String(max);sel.dataset.subject=subjectFilter.value;sel.dataset.grade=gradeFilter.value;sel.dataset.className=classFilter.value;
    tb.appendChild(tr);
  });
  $$('#scoreTable .student-name-link').forEach(b=>b.onclick=()=>openStudentProfile(b.dataset.student));
  updateLevels();
  if($('#saveScores')){$('#saveScores').textContent=locked?'فتح للتعديل':'حفظ واعتماد';$('#saveScores').classList.toggle('warn',locked)}
  if($('#savedNote'))$('#savedNote').innerHTML=locked?'<span class="locked-note">النتائج معتمدة ومقفلة ضد التعديل غير المقصود.</span>':'';
}
// Capture score changes at document level so saving survives any table re-render.
document.addEventListener('change',function(e){
  const sel=e.target?.closest?.('#scoreTable select.score-select');
  if(!sel)return;
  updateLevels();
  saveSingleScoreImmediate(sel);
},true);
// Save the visible table BEFORE navigation or context filters can change.
document.addEventListener('click',function(e){
  if(e.target?.closest?.('[data-view], .side-nav button, .quick-grid button'))persistVisibleScoresNow();
},true);
window.addEventListener('pagehide',persistVisibleScoresNow);
window.addEventListener('beforeunload',persistVisibleScoresNow);
function updateLevels(){const max=+$('#maxScoreSelect').value;let g=0,m=0,d=0,entered=0;$$('#scoreTable tbody tr').forEach(tr=>{const raw=tr.querySelector('select').value,pct=tr.querySelector('.pct-cell'),cell=tr.querySelector('.level-cell');if(raw===''){pct.textContent='—';cell.textContent='—';cell.className='level-cell';return}entered++;const score=+raw,p=Math.round(score/max*100),[txt,cls]=scoreLevel(score,max);pct.textContent=p+'%';cell.innerHTML=`<span class="level-chip ${cls}">${txt}</span>`;if(cls==='good')g++;else if(cls==='medium')m++;else d++});$('#sumCount').textContent=roster.length;$('#sumGood').textContent=g;$('#sumMedium').textContent=m;$('#sumDanger').textContent=d;if($('#kpiEntered'))$('#kpiEntered').textContent=entered;if($('#kpiMastery'))$('#kpiMastery').textContent=(entered?Math.round(g/entered*100):0)+'%';if($('#kpiBoost'))$('#kpiBoost').textContent=m;if($('#kpiPriority'))$('#kpiPriority').textContent=d;if($('#kpiOpenGaps'))$('#kpiOpenGaps').textContent=(m>0?1:0)+(d>0?1:0)}
function autoSaveCurrentScores(){
  try{
    const list=ensureDefaultAssessment();
    if(!activeAssessmentId&&list.length)activeAssessmentId=list[0].id;
    if(!activeAssessmentId)return false;
    const ass=loadAssessments();
    const a=ass.find(x=>x.id===activeAssessmentId&&x.context===contextKey());
    if(!a||a.locked)return false;
    const ok=persistVisibleScoresNow();
    if(a.status==='not_started'){
      a.status='in_progress';
      saveAssessments(ass);
    }
    return ok;
  }catch(err){
    console.error('Auto-save scores failed',err);
    const note=$('#savedNote');if(note)note.textContent='تعذر الحفظ التلقائي — استخدمي حفظ واعتماد';
    return false;
  }
}

function prepareScores(){
  populateAssessmentSelect();
  const a=currentContextAssessments().find(x=>x.id===activeAssessmentId);
  if(a){
    if(a.weekly||String(a.type||'').startsWith('اختبار قصير')){
      $('#maxScoreSelect').innerHTML=`<option value="${Number(a.max)||10}">${Number(a.max)||10}</option>`;
      $('#maxScoreSelect').value=String(Number(a.max)||10);
    }else{
      const expected=10;
      if(a.max!==expected){
        a.max=expected;
        const all=loadAssessments(),idx=all.findIndex(x=>x.id===a.id);
        if(idx>=0){all[idx].max=expected;saveAssessments(all)}
      }
      $('#maxScoreSelect').innerHTML='<option value="10">10</option>';
      $('#maxScoreSelect').value='10';
    }
  }
  $('#scoreSubject').value=subjectFilter.value;
  $('#scoreClass').value=classFilter.value;
  renderScores();
}
function refreshAssessmentUI(){if(!subjectFilter||!gradeFilter||!classFilter)return;currentUser.subject=subjectFilter.value||currentUser.subject;syncRosterFromClass();syncSubjectMaxUI();cleanupDuplicateAssessments();renderAssessmentCards();if($('#view-scores').classList.contains('active'))prepareScores()}
$('#addAssessmentBtn').onclick=()=>{if(classFilter.value==='لا توجد شعبة مسندة'){alert('لا توجد شعبة مسندة لهذا الصف.');return}$('#newAssessmentSubject').value=subjectFilter.value;$('#newAssessmentClass').value=classFilter.value;$('#newAssessmentDate').value=new Date().toISOString().slice(0,10);$('#newAssessmentMax').value='10';const existing=currentContextAssessments();const diagNums=existing.map(a=>{const m=String(a.type).match(/التشخيص (الأول|الثاني|الثالث|الرابع|الخامس)/);return m?m[1]:null}).filter(Boolean);$('#newAssessmentType').value=existing.some(a=>a.type==='التشخيص الأول')?'التشخيص الثاني':'التشخيص الأول';const defaultSkills=assessmentSkillsForSubject(subjectFilter.value);renderAssessmentSkillChoices(defaultSkills);$('#assessmentDialog').showModal()};
function migrateAssessmentScaleToTen(){
  const marker='misbarScale10MigrationV28';
  try{if(localStorage.getItem(marker)==='1')return}catch(_){}
  try{
    const assessments=loadAssessments();
    const scores=loadAllScores();
    let changed=false;
    assessments.forEach(a=>{
      const oldMax=Number(a.max||10)||10;
      if(oldMax!==10 && !a.weekly){
        const key=String(a.context||'')+'|'+a.id;
        const sv=scores[key];
        if(sv&&Array.isArray(sv.rows)){
          sv.rows=sv.rows.map(r=>({...r,score:Math.max(0,Math.min(10,Math.round((Number(r.score)||0)/oldMax*10)))}));
          sv.max=10; changed=true;
        }
        a.max=10; changed=true;
      }
      if(a.type==='التشخيص الأول')a.type='التشخيص الأولي';
    });
    if(changed){saveAssessments(assessments);saveAllScores(scores)}
    localStorage.setItem(marker,'1');
  }catch(e){console.warn('Scale migration skipped',e)}
}
migrateAssessmentScaleToTen();
function repairStoredPlatformData(){
  try{
    saveAssessments(loadAssessments());
    const sc=loadAllScores(); localStorage.setItem(SCORES_KEY,JSON.stringify(sc));
    localStorage.setItem(INTERVENTIONS_KEY,JSON.stringify(loadInterventions()));
    localStorage.setItem(EVIDENCE_KEY,JSON.stringify(loadEvidence()));
    localStorage.setItem(SUPPORT_KEY,JSON.stringify(loadSupportPlans()));
  }catch(e){console.warn('Data repair skipped',e)}
}
repairStoredPlatformData();
window.createDiagnosticAssessmentNow=function(event){
  if(event){event.preventDefault();event.stopPropagation();}
  const btn=document.getElementById('confirmAssessment');
  try{
    const sf=document.getElementById('subjectFilter');
    const cf=document.getElementById('classFilter');
    const type=document.getElementById('newAssessmentType')?.value||'التشخيص الأول';
    const date=document.getElementById('newAssessmentDate')?.value||new Date().toISOString().slice(0,10);
    if(!sf?.value||!cf?.value||cf.value==='لا توجد شعبة مسندة'){
      alert('اختاري المادة والشعبة أولاً.'); return false;
    }
    let skills=safeArray(selectedAssessmentSkills());
    if(!skills.length){
      skills=safeArray(assessmentSkillsForSubject(sf.value));
      renderAssessmentSkillChoices(skills);
    }
    const ctx=contextKey();
    const dup=currentContextAssessments().find(a=>a.type===type&&String(a.date||'')===String(date||''));
    if(dup){
      activeAssessmentId=dup.id;
      document.getElementById('assessmentDialog')?.close();
      showView('scores');
      prepareScores();
      return false;
    }
    const a={id:'A'+Date.now(),context:ctx,type:type,max:10,date:date,status:'not_started',skills:[...skills],locked:false};
    const all=loadAssessments();
    all.push(a);
    saveAssessments(all);
    // verify the save before leaving the dialog
    const saved=loadAssessments().find(x=>x.id===a.id);
    if(!saved) throw new Error('Assessment was not persisted');
    activeAssessmentId=a.id;
    if(btn){btn.disabled=true;btn.textContent='تم إنشاء الاختبار ✓';}
    document.getElementById('assessmentDialog')?.close();
    renderAssessmentCards();
    showView('scores');
    prepareScores();
    setTimeout(()=>{if(btn){btn.disabled=false;btn.textContent='إنشاء الاختبار';}},700);
  }catch(err){
    console.error('Assessment creation failed',err);
    if(btn){btn.disabled=false;btn.textContent='إنشاء الاختبار';}
    alert('تعذر إنشاء الاختبار: '+(err?.message||'خطأ غير معروف'));
  }
  return false;
};

$('#goScoresBtn').onclick=()=>{showView('scores');prepareScores()};
$('#assessmentSelect').addEventListener('change',()=>{activeAssessmentId=$('#assessmentSelect').value;const a=currentContextAssessments().find(x=>x.id===activeAssessmentId);if(a)$('#maxScoreSelect').value=String(subjectMaxScore(subjectFilter.value));prepareScores()});
$('#maxScoreSelect').addEventListener('change',()=>{syncSubjectMaxUI();renderScores()});
if($('#useDemoRoster')) $('#useDemoRoster').remove();
$('#rosterFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{const text=String(reader.result||'').replace(/^\uFEFF/,'');const names=text.split(/\r?\n/).map(line=>line.split(',')[0].trim()).filter(Boolean).filter(x=>!/^name|اسم|student/i.test(x));if(!names.length){alert('لم أتمكن من قراءة أسماء من الملف. استخدمي CSV أو TXT ويكون الاسم في العمود الأول.');return}roster=names.slice(0,200);persistCurrentRoster();renderScores();updateOverviewStudentCount();};reader.readAsText(f,'UTF-8')});
$('#manageRosterBtn').onclick=()=>{syncRosterFromClass();renderRosterManager();$('#rosterDialog').showModal()};
$('#closeRosterDialog').onclick=()=>$('#rosterDialog').close();
$('#addStudentBtn').onclick=()=>{const n=prompt('اكتب/اكتبي اسم الطالب/الطالبة:');if(n&&n.trim()){roster.push(n.trim());persistCurrentRoster();renderRosterManager();renderScores();updateOverviewStudentCount()}};
$('#resetRosterBtn').onclick=()=>{const k=rosterClassKey();if(!confirm('استعادة القائمة الأصلية لهذه الشعبة؟'))return;const o=loadRosterOverrides();delete o[k];saveRosterOverrides(o);roster=rosterForCurrentClass();renderRosterManager();renderScores();updateOverviewStudentCount()};
// V93: single authoritative save/approve handler.
(function installV93ScoreSaveHandler(){
  const btn=document.getElementById('saveScores');
  if(!btn)return;
  btn.onclick=null;
  btn.addEventListener('click',async function(ev){
    ev.preventDefault();
    ev.stopImmediatePropagation();
    try{
      const list=ensureDefaultAssessment();
      if(!list.length)throw new Error('تعذر تجهيز الاختبار التشخيصي');
      if(!activeAssessmentId||!list.some(a=>a.id===activeAssessmentId))activeAssessmentId=list[0].id;
      let ass=loadAssessments();
      let idx=ass.findIndex(a=>a.id===activeAssessmentId&&a.context===contextKey());
      if(idx<0)throw new Error('سجل الاختبار غير موجود بعد إنشائه');
      const a=ass[idx];
      if(a.locked){
        if(!confirm('النتائج معتمدة. هل تريد/تريدين فتحها للتعديل؟'))return;
        a.locked=false;a.status='in_progress';a.reopenedAt=new Date().toISOString();
        saveAssessments(ass);renderScores();renderAssessmentCards();return;
      }
      const rows=scoreRowsFromDom();
      if(!rows.length){alert('أدخل/أدخلي درجة واحدة على الأقل قبل الحفظ.');return;}
      const total=roster.length;
      if(!confirm(`سيتم حفظ واعتماد ${rows.length} نتيجة من أصل ${total}. ${rows.length<total?'الطلبة دون درجة سيبقون «بانتظار التشخيص».':''}\nهل تريد/تريدين المتابعة؟`))return;
      const max=Math.max(1,Number(a.max)||100),key=assessmentKey(a.id),all=loadAllScores(),existing=safeObject(all[key]);
      if(rows.some(r=>!Number.isFinite(+r.score)||+r.score<0||+r.score>max)){alert(`توجد درجة خارج النطاق 0–${max}. صححيها قبل الحفظ.`);return;}
      all[key]={...existing,rows,max,savedAt:new Date().toISOString(),approvedAt:new Date().toISOString(),autoSaved:false,
        subject:subjectFilter.value,grade:gradeFilter.value,className:classFilter.value,skills:safeArray(a.skills),
        teacherEmail:currentUser.email||'',teacherName:currentUser.name||''};
      saveAllScores(all);
      localStorage.setItem(scoreDraftKey(key),JSON.stringify(Object.fromEntries(rows.map(r=>[r.name,r.score]))));
      a.status=rows.length===total?'completed':'in_progress';a.locked=true;a.approvedAt=new Date().toISOString();ass[idx]=a;saveAssessments(ass);
      const verify=loadAllScores()[key];
      if(!verify||safeArray(verify.rows).length!==rows.length)throw new Error('فشل التحقق من النتائج بعد الحفظ');
      const note=document.getElementById('savedNote');if(note)note.textContent=`✓ تم الحفظ محليًا • جارٍ المزامنة السحابية`;
      const cloudSaved=await pushCloudNow();
      if(note)note.textContent=cloudSaved?`✓ تم الحفظ والمزامنة السحابية • ${rows.length} نتيجة`:`⚠️ تم الحفظ محليًا وتعذرت المزامنة السحابية`;
      renderAssessmentCards();renderScores();updateOverviewStudentCount();
      alert(cloudSaved?`تم حفظ واعتماد ${rows.length} نتيجة ومزامنتها مع السحابة بنجاح.`:`تم حفظ واعتماد ${rows.length} نتيجة على هذا الجهاز، لكن تعذرت المزامنة السحابية. أعيدي المحاولة عند استقرار الاتصال.`);
    }catch(err){
      console.error('V93 save/approve failed',err);
      alert('تعذر حفظ واعتماد الدرجات: '+(err?.message||'خطأ غير معروف'));
    }
  },true);
})();

function loadInterventions(){try{const v=JSON.parse(localStorage.getItem(INTERVENTIONS_KEY)||'[]');return safeArray(v).map(i=>({...safeObject(i),students:safeArray(i?.students),actions:safeArray(i?.actions),evidenceIds:safeArray(i?.evidenceIds)}))}catch{return[]}}
function saveInterventions(v){localStorage.setItem(INTERVENTIONS_KEY,JSON.stringify(v));scheduleCloudPush()}
function loadEvidence(){try{const v=JSON.parse(localStorage.getItem(EVIDENCE_KEY)||'[]');return safeArray(v).map(e=>safeObject(e))}catch{return[]}}
function saveEvidence(v){localStorage.setItem(EVIDENCE_KEY,JSON.stringify(v));scheduleCloudPush()}
function latestSavedAssessment(){const list=currentContextAssessments();const all=loadAllScores();const saved=list.map(a=>({a,s:all[assessmentKey(a.id)]})).filter(x=>x.s).sort((x,y)=>String(y.s.savedAt).localeCompare(String(x.s.savedAt)));return saved[0]||null}
function studentLevelsFromLatest(){const x=latestSavedAssessment();if(!x)return {good:[],medium:[],danger:[],all:[],assessment:null};const max=x.s.max||x.a.max||subjectMaxScore(subjectFilter.value);const out={good:[],medium:[],danger:[],all:[],assessment:x.a};x.s.rows.forEach(r=>{const pct=Math.round(r.score/max*100),[,cls]=scoreLevel(r.score,max);const item={name:r.name,score:r.score,pct};out[cls].push(item);out.all.push({...item,level:cls})});return out}
function renderGaps(){if(!$('#gapDynamic'))return;const lv=studentLevelsFromLatest();const total=rosterForCurrentClass().length,diagnosed=lv.all.length,pending=Math.max(0,total-diagnosed);$('#gapContext').innerHTML=`<span>${subjectFilter.value}</span><span>الصف ${gradeArabicName(gradeFilter.value)}</span><span>${classFilter.value}</span>${lv.assessment?`<span>${lv.assessment.type}</span>`:''}`;$('#gapRosterTotal').textContent=total;$('#gapDiagnosed').textContent=diagnosed;$('#gapPending').textContent=pending;$('#gapGoodCount').textContent=lv.good.length;$('#gapMediumCount').textContent=lv.medium.length;$('#gapDangerCount').textContent=lv.danger.length;const box=$('#gapDynamic');if(!lv.assessment){box.innerHTML='<div class="empty-inline" style="grid-column:1/-1">احفظي نتائج اختبار تشخيصي أولًا ليظهر التحليل تلقائيًا.</div>';return}const avg=a=>a.length?Math.round(a.reduce((s,x)=>s+x.pct,0)/a.length):0;box.innerHTML=`<div class="gap-card danger"><b>أولوية تدخل</b><strong>${avg(lv.danger)}%</strong><span>${lv.danger.length} طالب/طالبة</span><small>يقترح سيف: تدخل علاجي مباشر ومجموعة دعم صغيرة</small><details><summary>عرض الطلبة</summary><div>${lv.danger.map(x=>`${x.name} • ${x.pct}%`).join('<br>')||'لا يوجد'}</div></details><button class="btn primary small choose-action" data-level="danger" type="button" onclick="openIntervention('danger')">اختيار إجراء</button></div><div class="gap-card medium"><b>يحتاج دعماً</b><strong>${avg(lv.medium)}%</strong><span>${lv.medium.length} طالب/طالبة</span><small>يقترح سيف: دعم علاجي موجّه ثم متابعة قصيرة</small><details><summary>عرض الطلبة</summary><div>${lv.medium.map(x=>`${x.name} • ${x.pct}%`).join('<br>')||'لا يوجد'}</div></details><button class="btn ghost small choose-action" data-level="medium" type="button" onclick="openIntervention('medium')">اختيار إجراء</button></div><div class="gap-card good"><b>إتقان جيد</b><strong>${avg(lv.good)}%</strong><span>${lv.good.length} طالب/طالبة</span><small>يستمرون في مسار الإثراء والمتابعة.</small><details><summary>عرض الطلبة</summary><div>${lv.good.map(x=>`${x.name} • ${x.pct}%`).join('<br>')||'لا يوجد'}</div></details></div>`;$$('.choose-action').forEach(b=>b.onclick=()=>openIntervention(b.dataset.level))}
let interventionSourceLevel='danger';
function openIntervention(level='all'){
  try{
    const lv=studentLevelsFromLatest();
    // عند فتح النافذة من قسم الإجراءات دون اختيار فئة محددة،
    // نختار الفئة الفعلية ذات الطلبة تلقائيًا: أولوية التدخل أولًا، ثم يحتاج دعماً.
    // هذا يمنع ظهور «تدخل علاجي مكثف» لطالبات 60–79% عندما لا توجد حالات أولوية تدخل.
    let effectiveLevel=level;
    // لا نعرض فئة لا تحتوي على طلبة. عند الفتح العام: الدعم أولاً للفئة 60–79،
    // والتدخل المكثف فقط عندما تكون فئة أولوية التدخل هي المقصودة فعلًا.
    if(level==='all') effectiveLevel=lv.medium.length?'medium':(lv.danger.length?'danger':'medium');
    if(effectiveLevel==='danger' && !lv.danger.length && lv.medium.length) effectiveLevel='medium';
    if(effectiveLevel==='medium' && !lv.medium.length && lv.danger.length) effectiveLevel='danger';
    interventionSourceLevel=effectiveLevel;
    const students=effectiveLevel==='medium'?lv.medium:lv.danger;
    const supportLabel=effectiveLevel==='danger'?'تدخل علاجي مكثف':'دعم علاجي';
    const context=$('#interventionContext'), list=$('#interventionStudents'), dlg=$('#interventionDialog');
    if(!dlg){alert('تعذر فتح نافذة الإجراءات. أعيدي تحميل الصفحة.');return;}
    if(context)context.innerHTML=`<span>${subjectFilter.value}</span><span>الصف ${gradeArabicName(gradeFilter.value)}</span><span>${classFilter.value}</span><span>${supportLabel}</span>`;
    if(list)list.innerHTML=students.length?students.map((s,i)=>`<label><input type="checkbox" value="${s.name.replace(/"/g,'&quot;')}" checked> <span>${s.name}</span><small>${s.pct}%</small></label>`).join(''):'<div class="empty-inline">لا يوجد طلبة في هذه الفئة حاليًا. يمكنك فتح النافذة واختيار الإجراء ثم العودة بعد إدخال النتائج.</div>';
    $$('#supportLevelChoices button').forEach(b=>b.classList.toggle('selected',b.textContent===supportLabel));
    // V96: مرجع نهائي يعتمد على درجات الطلبة الظاهرين في النافذة نفسها، لا على حالة زر قديمة.
    const listedNames=new Set(students.map(x=>x.name));
    const listedScores=lv.all.filter(x=>listedNames.has(x.name)).map(x=>Number(x.pct)).filter(Number.isFinite);
    const hasPriority=listedScores.some(x=>x<60);
    const forcedSupport=hasPriority?'تدخل علاجي مكثف':'دعم علاجي';
    interventionSourceLevel=hasPriority?'danger':'medium';
    $$('#supportLevelChoices button').forEach(b=>b.classList.toggle('selected',b.textContent===forcedSupport));
    if(context){
      const spans=[...context.querySelectorAll('span')];
      if(spans.length) spans[spans.length-1].textContent=forcedSupport;
    }
    $$('#actionChoices button').forEach((b,i)=>b.classList.toggle('selected',i===0));
    if($('#interventionNote'))$('#interventionNote').value='';
    if(typeof dlg.showModal==='function'){
      if(!dlg.open)dlg.showModal();
    }else{
      dlg.setAttribute('open','');
      dlg.style.display='block';
      dlg.style.position='fixed';dlg.style.inset='5vh auto auto 50%';dlg.style.transform='translateX(-50%)';dlg.style.zIndex='9999';
    }
  }catch(err){console.error(err);alert('حدث خطأ أثناء فتح الإجراءات. أعيدي تحميل الصفحة ثم حاولي مرة أخرى.');}
}
$('#quickIntervention')?.addEventListener('click',()=>openIntervention('all'));
$('#newIntervention')?.addEventListener('click',()=>openIntervention('all'));
$('#toggleAllStudents').onclick=()=>{const boxes=$$('#interventionStudents input[type=checkbox]');const all=[...boxes].every(x=>x.checked);boxes.forEach(x=>x.checked=!all);$('#toggleAllStudents').textContent=all?'تحديد الكل':'إلغاء تحديد الكل'};
$$('.chips.single').forEach(group=>group.addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')return;group.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));e.target.classList.add('selected')}));
$('#actionChoices').addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')return;e.target.classList.toggle('selected')});
$('#saifSuggestActions').onclick=()=>{const buttons=$$('#actionChoices button');buttons.forEach(b=>b.classList.remove('selected'));const preferred=interventionSourceLevel==='medium'?[0,2,4,8]:[0,1,6,8,15];preferred.forEach(i=>buttons[i]?.classList.add('selected'));$('#saifActionHint').textContent='اقترح سيف إجراءات مناسبة حسب مستوى الفجوة. يمكنك تعديل الاختيارات قبل الحفظ.'};
$('#confirmIntervention').onclick=()=>{const students=[...$$('#interventionStudents input:checked')].map(x=>x.value);if(!students.length){alert('اختاري طالبًا/طالبة واحدة على الأقل.');return}const actions=Array.from($$('#actionChoices .selected')).map(b=>b.textContent.trim());const action=actions.length?actions.join(' + '):'إعادة شرح المهارة',support=$('#supportLevelChoices .selected')?.textContent||'دعم علاجي',timing=$('#remeasureTimingChoices .selected')?.textContent||'بعد أسبوعين';const note=$('#interventionNote')?.value.trim()||'';const item={id:'I'+Date.now(),owner:currentUser.email,context:contextKey(),subject:subjectFilter.value,grade:gradeFilter.value,className:classFilter.value,students,action,actions,support,timing,note,createdAt:new Date().toISOString(),status:'planned',evidenceIds:[],remeasureAssessmentId:''};const all=loadInterventions();all.push(item);saveInterventions(all);$('#interventionDialog').close();if($('#interventionNote'))$('#interventionNote').value='';renderInterventions();showView('interventions')};
function contextInterventions(){return loadInterventions().filter(i=>i.context===contextKey())}
function renderInterventions(){const box=$('#interventionList');if(!box)return;const list=contextInterventions();if(!list.length){box.innerHTML='<div class="empty-inline">لا توجد إجراءات علاجية معتمدة بعد. اختاري إجراءً من فجوات التعلّم.</div>';return}box.innerHTML=list.map(i=>`<article class="workflow-card"><div class="top"><div><h4>${i.action}</h4><div class="workflow-meta">${i.support} • ${i.students.length} طالب/طالبة • ${i.timing}</div></div><span class="student-count">${i.students.length}</span></div><div class="workflow-status"><span class="status-dot ${i.status!=='planned'?'done':'wait'}">${i.status==='planned'?'بانتظار التنفيذ':'تم التنفيذ'}</span><span class="status-dot ${i.evidenceIds?.length?'done':'wait'}">${i.evidenceIds?.length?'الدليل مرفوع':'الدليل بانتظار الرفع'}</span><span class="status-dot ${i.remeasureAssessmentId?'done':'wait'}">${i.remeasureAssessmentId?'إعادة القياس بدأت':'إعادة القياس لم تبدأ'}</span></div><div class="workflow-actions"><button class="btn ghost small mark-done" data-id="${i.id}">${i.status==='planned'?'تم التنفيذ':'منفذ ✓'}</button><button class="btn ghost small add-evidence" data-id="${i.id}">إرفاق دليل</button><button class="btn primary small start-remeasure" data-id="${i.id}">بدء إعادة القياس</button></div></article>`).join('');$$('.mark-done').forEach(b=>b.onclick=()=>{const all=loadInterventions(),i=all.find(x=>x.id===b.dataset.id);if(i){i.status='done';saveInterventions(all);renderInterventions()}});$$('.add-evidence').forEach(b=>b.onclick=()=>openEvidenceDialog(b.dataset.id));$$('.start-remeasure').forEach(b=>b.onclick=()=>startRemeasure(b.dataset.id))}
let activeEvidenceIntervention='';
function visibleEvidence(){const all=loadEvidence();if(isTeacher())return all.filter(e=>e.owner===currentUser.email&&e.context===contextKey());return all.filter(e=>e.context===contextKey())}
function openEvidenceDialog(interventionId=''){const ints=contextInterventions();const sel=$('#evidenceInterventionSelect');sel.innerHTML='<option value="">دليل ام / غير مرتبط بإجراء</option>'+ints.map(i=>`<option value="${i.id}" ${i.id===interventionId?'selected':''}>${i.action} • ${i.students.length} طالب/طالبة</option>`).join('');const roster=rosterForCurrentClass(gradeFilter.value,classFilter.value);$('#evidenceStudentSelect').innerHTML='<option value="">دليل عام للشعبة</option>'+roster.map(n=>`<option value="${n.replace(/"/g,'&quot;')}">${n}</option>`).join('');$('#evidenceType').value=interventionId?'إجراء علاجي':'الاختبار التشخيصي';$('#evidenceContext').innerHTML=`<span>${subjectFilter.value}</span><span>الصف ${gradeArabicName(gradeFilter.value)}</span><span>${classFilter.value}</span>`;$('#evidenceDialog').showModal()}
$('#confirmEvidence').onclick=()=>{const f=$('#evidenceFile').files[0],iid=$('#evidenceInterventionSelect').value;if(!f){alert('اختاري ملفًا أو صورة لتسجيل بيانات الدليل أولًا.\nملاحظة: محتوى الملف نفسه لا يُحفظ داخل النسخة المحلية.');return}const privacy=$('#privacyChoices .selected')?.textContent||'خاص',student=$('#evidenceStudentSelect').value||'',type=$('#evidenceType').value||'أخرى',ev={id:'E'+Date.now(),interventionId:iid,student,type,owner:currentUser.email,ownerName:currentUser.name,context:contextKey(),subject:subjectFilter.value,grade:gradeFilter.value,className:classFilter.value,fileName:f.name,fileType:f.type||'',storageMode:'metadata-only',privacy,createdAt:new Date().toISOString()};const all=loadEvidence();all.push(ev);saveEvidence(all);if(iid){const ints=loadInterventions(),it=ints.find(x=>x.id===iid);if(it){it.evidenceIds=it.evidenceIds||[];it.evidenceIds.push(ev.id);saveInterventions(ints)}}$('#evidenceDialog').close();$('#evidenceFile').value='';renderEvidence();showView('evidence');alert('تم حفظ سجل الدليل داخل المنصة.\nالملف الأصلي نفسه غير محفوظ هنا؛ احتفظ/احتفظي به في OneDrive أو مجلد المدرسة المعتمد.');};
function renderEvidence(){const grid=$('#evidenceGrid');if(!grid)return;const ints=Object.fromEntries(loadInterventions().map(i=>[i.id,i]));let list=visibleEvidence();const tf=$('#evidenceTypeFilter')?.value||'all',pf=$('#evidencePrivacyFilter')?.value||'all';if(tf!=='all')list=list.filter(e=>(e.type||'أخرى')===tf);if(pf!=='all')list=list.filter(e=>e.privacy===pf);const base=visibleEvidence();$('#evTotal').textContent=base.length;$('#evLeadership').textContent=base.filter(e=>['متاح للقيادة','معتمد للزوار'].includes(e.privacy)).length;$('#evVisitors').textContent=base.filter(e=>e.privacy==='معتمد للزوار').length;$('#evStudents').textContent=new Set(base.filter(e=>e.student).map(e=>e.student)).size;if(!list.length){grid.innerHTML='<div class="empty-state">لا توجد أدلة مطابقة للعرض الحالي.</div>';return}grid.innerHTML=list.map(e=>{const i=ints[e.interventionId];const icon=(e.fileType||'').startsWith('image/')?'ص':'ملف';return `<div class="evidence-card"><div class="evidence-thumb">${icon}</div><div><b>${e.fileName}</b><span class="evidence-type">${e.type||'أخرى'}</span><span>${e.subject||subjectFilter.value} • الصف ${gradeArabicName(e.grade||gradeFilter.value)} • ${e.className||classFilter.value}</span><small>${e.student?'مرتبط: '+e.student:'دليل عام للشعبة'} • ${i?i.action:'بدون إجراء مرتبط'}</small><small>${e.privacy} • ${new Date(e.createdAt).toLocaleDateString('ar-AE')}</small></div><div class="e-actions"><span class="status-dot done">سجل محفوظ ✓</span><small style="display:block;margin-top:6px">الملف الأصلي محفوظ خارجيًا</small></div></div>`}).join('')}
$('#evidenceTypeFilter')?.addEventListener('change',renderEvidence);$('#evidencePrivacyFilter')?.addEventListener('change',renderEvidence);

function baselineMapForIntervention(i){
  const all = loadAllScores();
  const map = {};

  const candidates = currentContextAssessments()
    .filter(a => a.type !== 'إعادة القياس')
    .map(a => ({
      a,
      s: all[assessmentKey(a.id)]
    }))
    .filter(x => x.s && Array.isArray(x.s.rows))
    .sort((x,y) =>
      String(y.s.savedAt || '').localeCompare(String(x.s.savedAt || ''))
    );

  i.students.forEach(student => {
    for(const x of candidates){
      const row = x.s.rows.find(r => r.name === student);

      if(row){
        const score = Number(row.score);
        const max = Number(x.s.max || x.a.max || 100);

        if(Number.isFinite(score) && max > 0){
          map[student] = Math.round(score / max * 100);
          break;
        }
      }
    }
  });

  return map;
}
  
function renderRemeasure(){
  const box = $('#remeasureList');
  if(!box) return;

  const list = contextInterventions();

  if(!list.length){
    box.innerHTML = '<div class="empty-inline">لا توجد إجراءات علاجية جاهزة لإعادة القياس.</div>';
    return;
  }

  box.innerHTML = list.map(i => `
    <article class="assessment-card">
      <div>
        <strong>${i.students.join('، ')}</strong>
        <div class="hint">${i.actions ? i.actions.join(' + ') : 'إجراء علاجي'}</div>
      </div>
      <button
        type="button"
        class="btn primary remeasure-start-btn"
        data-id="${i.id}">
        ${i.remeasureAssessmentId ? 'إعادة القياس مرة أخرى' : 'بدء إعادة القياس'}
      </button>
    </article>
  `).join('');

  $$('.remeasure-start-btn').forEach(btn => {
    btn.onclick = () => startRemeasure(btn.dataset.id);
  });
}
function latestWeeklyMap(){
  const all = loadAllScores();

  const candidates = currentContextAssessments()
    .filter(a => String(a.type || '').startsWith('اختبار قصير'))
    .map(a => ({
      a,
      s: all[assessmentKey(a.id)]
    }))
    .filter(x => x.s && Array.isArray(x.s.rows))
    .sort((x,y) =>
      String(y.s.savedAt || '').localeCompare(String(x.s.savedAt || ''))
    );

  if(!candidates.length) return {};

  const s = candidates[0].s;
  const max = Number(s.max || 10);
  const map = {};

  s.rows.forEach(r => {
    const score = Number(r.score);
    if(Number.isFinite(score) && max > 0){
      map[r.name] = Math.round(score / max * 100);
    }
  });

  return map;
}
function weeklyAssessments(){return currentContextAssessments().filter(a=>a.weekly||String(a.type).startsWith('اختبار قصير')||/^Quiz\s+\d+/.test(String(a.type))).sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
function renderWeekly(){
  const box=$('#weeklyQuizList');
  if(!box)return;
  const list=weeklyAssessments();
  const allScores=loadAllScores();
  $('#weeklyCount').textContent=list.length;

  let latestAvg=null, latestMastery=null, previousAvg=null;
  const summaries=list.map(a=>{
    const s=allScores[assessmentKey(a.id)];
    const rows=s?.rows||[];
    const max=Number(s?.max||a.max||10);
    const pcts=rows.map(r=>max?Number(r.score)/max*100:0).filter(Number.isFinite);
    const avg=pcts.length?Math.round(pcts.reduce((x,y)=>x+y,0)/pcts.length):null;
    const mastery=pcts.length?Math.round(pcts.filter(p=>p>=80).length/pcts.length*100):null;
    return {a,s,rows,max,avg,mastery};
  });
  if(summaries.length){
    const last=summaries[summaries.length-1];
    latestAvg=last.avg; latestMastery=last.mastery;
    if(summaries.length>1) previousAvg=summaries[summaries.length-2].avg;
  }
  $('#weeklyLatest').textContent=latestAvg===null?'—':latestAvg+'%';
  $('#weeklyMastery').textContent=latestMastery===null?'—':latestMastery+'%';
  $('#weeklyTrend').textContent=(latestAvg===null||previousAvg===null)?'—':latestAvg>previousAvg?'صاعد ↑':latestAvg<previousAvg?'متراجع ↓':'مستقر';

  if(!list.length){
    box.innerHTML='<div class="assessment-empty" style="grid-column:1/-1">لا يوجد اختبار قصير Quiz بعد. اضغطي «إضافة اختبار قصير Quiz» للبدء.</div>';
    return;
  }
  box.innerHTML=summaries.map((x,i)=>`
    <article class="assessment-card">
      <h4>${x.a.type}</h4>
      <div class="assessment-meta">
        <span>${x.a.date||'بدون تاريخ'}</span>
        <span>من ${x.max}</span>
        <span>${x.rows.length} نتيجة</span>
      </div>
      <p class="hint">${x.avg===null?'بانتظار إدخال الدرجات':`المتوسط ${x.avg}% • الإتقان ${x.mastery}%`}</p>
      <div class="card-actions">
        <button class="btn primary small weekly-enter" data-id="${x.a.id}">${x.rows.length?'عرض / تعديل الدرجات':'إدخال الدرجات'}</button>
      </div>
    </article>`).join('');
  $$('.weekly-enter').forEach(b=>b.onclick=()=>{
    activeAssessmentId=b.dataset.id;
    showView('scores');
    prepareScores();
  });
}
function openWeeklyQuizDialog(){
  if(classFilter.value==='لا توجد شعبة مسندة'){alert('لا توجد شعبة مسندة لهذا الصف.');return}
  const list=weeklyAssessments();
  if(list.length>=10){alert('تم الوصول إلى الحد الأقصى: 10 اختبارات أسبوعية لهذه المادة/الصف/الشعبة.');return}
  $('#weeklyWeekNo').value=String(list.length+1);
  $('#weeklyMaxScore').value='10';
  $('#weeklyQuizDate').value=new Date().toISOString().slice(0,10);
  $('#weeklyQuizDialog').showModal();
}
function createWeeklyQuiz(){
  const list=weeklyAssessments();
  if(list.length>=10){alert('تم الوصول إلى الحد الأقصى: 10 اختبارات أسبوعية.');return}
  const max=Number($('#weeklyMaxScore').value);
  const date=$('#weeklyQuizDate').value||new Date().toISOString().slice(0,10);
  if(!Number.isFinite(max)||max<1){alert('أدخلي درجة نهائية صحيحة للاختبار.');return}
  const week=list.length+1;
  const a={
    id:'W'+Date.now(),
    context:contextKey(),
    type:`Quiz ${week}`,
    weekly:true,
    max,
    date,
    status:'not_started',
    skills:[],
    locked:false
  };
  const all=loadAssessments();
  all.push(a); saveAssessments(all);
  activeAssessmentId=a.id;
  $('#weeklyQuizDialog').close();
  renderWeekly();
  showView('scores');
  prepareScores();
}
$('#addWeeklyQuiz').onclick=openWeeklyQuizDialog;
$('#confirmWeeklyQuiz').onclick=createWeeklyQuiz;

function startRemeasure(interventionId){
  const all=loadInterventions();
  const item=all.find(i=>String(i.id)===String(interventionId));
  if(!item){alert('لم يتم العثور على الإجراء');return;}

  const scoreText=prompt('أدخلي درجة إعادة القياس من 10');
  if(scoreText===null) return;

  const score=Number(scoreText);

if(!Number.isFinite(score) || score<0 || score>10){
    alert('أدخلي درجة صحيحة من 0 إلى 10');
    return;
}
  

  const assessmentId='R'+Date.now();

  const allScores=loadAllScores();
  allScores[assessmentKey(assessmentId)]={
    id:assessmentId,
    type:'إعادة القياس',
    date:new Date().toISOString(),
    max:10,
    rows:(item.students||[]).map(name=>({
      name:name,
      score:score,
      max:10
    }))
  };

  saveAllScores(allScores);

  item.remeasureAssessmentId=assessmentId;
  item.status='done';
  saveInterventions(all);

  renderRemeasure();
}

function afterMapForIntervention(i){
  const allScores = loadAllScores();
  if(!i.remeasureAssessmentId) return {};

  

  const s =
    allScores[assessmentKey(i.remeasureAssessmentId)] ||
    allScores[i.remeasureAssessmentId];

  if(!s || !Array.isArray(s.rows)) return {};

  const map = {};

  s.rows.forEach(r => {
    const max = Number(r.max || s.max || 100);
    const score = Number(r.score);

    if(Number.isFinite(score) && Number.isFinite(max) && max > 0){
      map[r.name] = Math.round(score / max * 100);
    }
  });

  return map;
}
  function openFollowupIntervention(student){
interventionSourceLevel='danger';
  $('#interventionContext').innerHTML=`<span>${subjectFilter.value}</span><span>الصف ${gradeArabicName(gradeFilter.value)}</span><span>${classFilter.value}</span><span>متابعة ثانية</span>`;
  $('#interventionStudents').innerHTML=`<label><input type="checkbox" value="${student.replace(/"/g,'&quot;')}" checked> <span>${student}</span><small>تدخل ثانٍ</small></label>`;
  $('#supportLevelChoices button').forEach(b=>b.classList.toggle('selected',b.textContent==='تدخل علاجي مكثف'));
  $('#interventionDialog').showModal();
}
function renderImpact(){function impactState(score){
  const n = Number(score);

  if(!Number.isFinite(n)){
    return {cls:'follow', label:'بانتظار إعادة القياس'};
  }

  if(n >= 80){
    return {cls:'closed', label:'فجوة أُغلقت'};
  }

  if(n >= 60){
    return {cls:'boost', label:'تحسن يحتاج تعزيزًا'};
  }

  return {cls:'follow', label:'يحتاج تدخلاً ثانيًا'};
}
  const body=$('#impactTableBody'); if(!body)return;
  const list=contextInterventions(),weekly=latestWeeklyMap(); let rows=[],closed=0,improved=0,follow=0;
  list.forEach(i=>{const before=baselineMapForIntervention(i),after=afterMapForIntervention(i); i.students.forEach(student=>{const b=before[student],a=after[student],state=impactState(a); if(state.cls==='closed')closed++;else if(a!==undefined&&state.cls==='boost')improved++;else if(state.cls==='follow')follow++; rows.push({i,student,b,a,w:weekly[student],state});});});
  $('#impactStudents').textContent=rows.length; $('#impactClosed').textContent=closed; $('#impactImproved').textContent=improved; $('#impactFollow').textContent=follow;
  if(!rows.length){body.innerHTML='<tr><td colspan="9"><div class="empty-inline">لا يوجد سجل أثر بعد. ابدئي من الاختبار التشخيصي ثم اختاري إجراءً علاجيًا.</div></td></tr>';return;}
  body.innerHTML=rows.map((r,idx)=>{const delta=(r.a===undefined||r.b===undefined)?null:r.a-r.b;const ev=(r.i.evidenceIds||[]).length;return `<tr><td>${idx+1}</td><td><button type="button" class="student-name-link impact-student-link" data-student="${r.student.replace(/&/g,'&amp;').replace(/\"/g,'&quot;')}">${r.student}</button><div class="journey-mini"><span class="done">تشخيص</span><span class="done">تدخل</span><span class="${ev?'done':''}">دليل</span><span class="${r.a!==undefined?'done':''}">إعادة قياس</span><span class="${r.w!==undefined?'done':''}">اختبار قصير</span></div></td><td>${r.b===undefined?'—':r.b+'%'}</td><td>${r.i.action}</td><td>${ev?'<span class="impact-state closed">مرفق ✓</span>':'<span class="impact-state boost">اختياري</span>'}</td><td>${r.a===undefined?'—':r.a+'%'}</td><td>${r.w===undefined?'—':r.w+'%'}</td><td>${delta===null?'—':(delta>=0?'+':'')+delta+' نقطة'}</td><td><span class="impact-state ${r.state.cls}">${r.state.label}</span></td><td>${r.state.cls==='follow'?`<button class="btn ghost small followup-btn" data-student="${r.student.replace(/"/g,'&quot;')}">اختيار تدخل ثانٍ</button>`:r.state.cls==='closed'?'<span class="impact-state closed">مؤهل للتقدير</span>':'—'}</td></tr>`}).join('');
  $$('.followup-btn').forEach(b=>b.onclick=()=>openFollowupIntervention(b.dataset.student));$$('.impact-student-link').forEach(b=>b.onclick=()=>openStudentProfile(b.dataset.student));
}
$('#refreshImpact')?.addEventListener('click',renderImpact);



// V34: individual student learning profile and academic progress curve
let activeStudentName='';
function studentNamesForContext(){return roster.slice()}
function populateStudentProfileSelect(){const s=$('#studentProfileSelect');if(!s)return;const names=studentNamesForContext();s.innerHTML=names.map(n=>`<option value="${n.replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" ${n===activeStudentName?'selected':''}>${n}</option>`).join('');if(!activeStudentName&&names.length)activeStudentName=names[0];s.value=activeStudentName||''}
function openStudentProfile(name){activeStudentName=name;showView('student');setTimeout(renderStudentProfile,0)}
function studentSeries(name){
  const all = loadAllScores();
  const ass = currentContextAssessments();
  const points = [];

  // التشخيص
  const diagnostic = ass
    .filter(a => !a.weekly && !String(a.type || '').startsWith('اختبار قصير') && a.type !== 'إعادة القياس')
    .map(a => ({a, s: all[assessmentKey(a.id)]}))
    .filter(x => x.s)
    .sort((x,y) => String(x.s.savedAt || '').localeCompare(String(y.s.savedAt || '')))[0];

  if(diagnostic){
    const r = (diagnostic.s.rows || []).find(x => x.name === name);
    if(r){
      points.push({
        label: 'التشخيص',
        pct: Math.round(r.score / (diagnostic.s.max || 100) * 100),
        raw: `${r.score}/${diagnostic.s.max || 100}`
      });
    }
  }

  // الاختبارات الأسبوعية
  weeklyAssessments().forEach((a, idx) => {
    const s = all[assessmentKey(a.id)];
    const r = s?.rows?.find(x => x.name === name);

    if(r){
      points.push({
        label: `Quiz ${idx + 1}`,
        pct: Math.round(r.score / (s.max || a.max || 100) * 100),
        raw: `${r.score}/${s.max || a.max || 100}`
      });
    }
  });

  // إعادة القياس
  const interventions = contextInterventions()
    .filter(i => (i.students || []).includes(name) && i.remeasureAssessmentId);

  interventions.forEach((i, idx) => {
    const s =
      all[assessmentKey(i.remeasureAssessmentId)] ||
      all[i.remeasureAssessmentId];

    const r = s?.rows?.find(x => x.name === name);

    if(r){
      points.push({
        label: interventions.length > 1 ? `إعادة القياس ${idx + 1}` : 'إعادة القياس',
        pct: Math.round(Number(r.score) / Number(s.max || 100) * 100),
        raw: `${r.score}/${s.max || 100}`
      });
    }
  });

  return points;
}
function studentInterventionsFor(name){return contextInterventions().filter(i=>(i.students||[]).includes(name))}
function drawStudentProgress(points){const box=$('#studentProgressChart');if(!box)return;if(!points.length){box.innerHTML='<div class="empty-inline">لا توجد نتائج محفوظة لهذا الطالب/الطالبة بعد.</div>';return}const W=760,H=270,pad=48,maxX=Math.max(points.length-1,1),x=i=>pad+i*(W-pad*2)/maxX,y=v=>H-pad-(v/100)*(H-pad*2);let grid='';[0,20,40,60,80,100].forEach(v=>{grid+=`<line x1="${pad}" y1="${y(v)}" x2="${W-pad}" y2="${y(v)}" stroke="#dce9ee"/><text x="${pad-10}" y="${y(v)+4}" text-anchor="end" font-size="12" fill="#6a7d86">${v}%</text>`});const poly=points.map((p,i)=>`${x(i)},${y(p.pct)}`).join(' ');const dots=points.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.pct)}" r="6" fill="#0b6070"/><text x="${x(i)}" y="${y(p.pct)-12}" text-anchor="middle" font-size="12" font-weight="700" fill="#0b6070">${p.pct}%</text><text x="${x(i)}" y="${H-18}" text-anchor="middle" font-size="12" fill="#506974">${p.label}</text><title>${p.label}: ${p.raw} = ${p.pct}%</title>`).join('');box.innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="منحنى المستوى الأكاديمي">${grid}<line x1="${pad}" y1="${y(80)}" x2="${W-pad}" y2="${y(80)}" stroke="#9ebf8c" stroke-dasharray="6 6"/><polyline points="${poly}" fill="none" stroke="#0b6070" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg>`}
const SUPPORT_KEY='misbarZayedSupportPlansV36';
function loadSupportPlans(){try{return safeObject(JSON.parse(localStorage.getItem(SUPPORT_KEY)||'{}'))}catch{return{}}}
function saveSupportPlans(v){localStorage.setItem(SUPPORT_KEY,JSON.stringify(v))}
function supportKey(name){return `${contextKey()}|${name}`}
function openSupportPlan(){const name=activeStudentName||$('#studentProfileSelect')?.value;if(!name){alert('اختاري طالبًا/طالبة أولًا.');return}const plan=loadSupportPlans()[supportKey(name)]||{adaptations:[]};$$('#supportChoices input').forEach(x=>x.checked=plan.adaptations.includes(x.value));$('#supportDialog').showModal()}
$('#editSupportPlan')?.addEventListener('click',openSupportPlan);
$('#saveSupportPlan')?.addEventListener('click',()=>{const name=activeStudentName||$('#studentProfileSelect')?.value;if(!name)return;const all=loadSupportPlans();all[supportKey(name)]={student:name,context:contextKey(),adaptations:[...$$('#supportChoices input:checked')].map(x=>x.value),updatedAt:new Date().toISOString(),updatedBy:currentUser.email};saveSupportPlans(all);$('#supportDialog').close();renderStudentProfile()});
function renderSupportPlan(name){const box=$('#studentSupport');if(!box)return;const plan=loadSupportPlans()[supportKey(name)];box.innerHTML=plan?.adaptations?.length?plan.adaptations.map(x=>`<span class="profile-chip">${x}</span>`).join(''):'<span class="profile-chip">لا توجد خطة دعم فردية مسجلة حاليًا</span>'}

function renderStudentProfile(){populateStudentProfileSelect();const name=activeStudentName||$('#studentProfileSelect')?.value;if(!name)return;activeStudentName=name;$('#studentProfileName').textContent=name;$('#studentProfileContext').textContent=`${subjectFilter.value} • الصف ${gradeArabicName(gradeFilter.value)} • ${classFilter.value}`;const pts=studentSeries(name),base=pts[0]?.pct,last=pts[pts.length-1]?.pct,delta=(base!==undefined&&last!==undefined)?last-base:null;$('#spBaseline').textContent=base===undefined?'—':base+'%';$('#spLatest').textContent=last===undefined?'—':last+'%';$('#spDelta').textContent=delta===null?'—':(delta>=0?'+':'')+delta+' نقطة';const state=last===undefined?'بانتظار البيانات':last>=80?'متقن':last>=60?'يحتاج تعزيزًا':'يحتاج تدخلًا';$('#spState').textContent=state;drawStudentProgress(pts);let summary='لا توجد بيانات كافية بعد.';if(pts.length){if(pts.length===1)summary=`نتيجة التشخيص الحالية ${base}%. ستظهر قراءة الاتجاه بعد إضافة اختبار قصير Quiz.`;else summary=`بدأ المسار عند ${base}% ووصل إلى ${last}%، بتغير ${delta>=0?'+':''}${delta} نقطة مئوية. الاتجاه الحالي ${delta>0?'صاعد':delta<0?'متراجع':'مستقر'}، والحالة: ${state}.`;}$('#studentSaifSummary').textContent=summary;const ints=studentInterventionsFor(name);$('#studentInterventions').innerHTML=ints.length?ints.map(i=>`<span class="profile-chip">${i.action||'إجراء'} • ${new Date(i.createdAt||Date.now()).toLocaleDateString('ar-AE')}</span>`).join(''):'<span class="profile-chip">لا توجد إجراءات مرتبطة بهذا الطالب/الطالبة.</span>';const ev=loadEvidence().filter(e=>ints.some(i=>i.id===e.interventionId));$('#studentEvidence').innerHTML=ev.length?ev.map(e=>`<span class="profile-chip">${e.fileName} • ${e.privacy||'خاص'}</span>`).join(''):'<span class="profile-chip">لا توجد أدلة مرتبطة بهذا الطالب/الطالبة.</span>';const latest=last===undefined?null:last;const diagAss=currentContextAssessments().find(a=>!a.weekly&&a.type!=='إعادة القياس'&&safeArray(a.skills).length);const targetSkills=safeArray(diagAss?.skills);$('#studentSkills').innerHTML=targetSkills.length?targetSkills.map(s=>`<span class="profile-chip">${s} • ${latest===null?'بانتظار النتيجة':latest>=80?'ضمن الإتقان العام':latest>=60?'يحتاج متابعة':'أولوية تدخل'}</span>`).join(''):'<span class="profile-chip">لم تُحدد مهارات مستهدفة لهذا التشخيص بعد.</span>';renderSupportPlan(name)}
$('#studentProfileSelect')?.addEventListener('change',e=>{activeStudentName=e.target.value;renderStudentProfile()});$('#printStudentProfile')?.addEventListener('click',()=>window.print());

// V33: leadership dashboard and stage comparisons
function cycleFromGrade(g){const n=parseInt(String(g),10);if(n<=4)return 'cycle1';if(n<=8)return 'cycle2';return 'cycle3'}
function cycleLabel(c){return c==='cycle1'?'الحلقة الأولى':c==='cycle2'?'الحلقة الثانية':'الحلقة الثالثة'}
function diagnosticScoreRecords(){
  const scoreStore=loadAllScores(), assessments=loadAssessments(), byId=Object.fromEntries(assessments.map(a=>[a.id,a]));
  const rows=[];
  Object.entries(scoreStore).forEach(([key,sv])=>{
    const parts=key.split('|'); const aid=parts[parts.length-1], a=byId[aid];
    if(a&&(a.weekly||String(a.type).startsWith('اختبار قصير')||a.type==='إعادة القياس'))return;
    const subject=sv.subject||parts[1], grade=sv.grade||parts[2], className=sv.className||parts[3], max=sv.max||a?.max||100;
    (sv.rows||[]).forEach(r=>rows.push({subject,grade,className,cycle:cycleFromGrade(grade),name:r.name,pct:max?Math.round(r.score/max*100):0}));
  });
  return rows;
}
function aggregateRecords(rows){
  if(!rows.length)return {count:0,avg:null,mastery:null,priority:null};
  const avg=Math.round(rows.reduce((s,r)=>s+r.pct,0)/rows.length), mastery=Math.round(rows.filter(r=>r.pct>=80).length/rows.length*100), priority=Math.round(rows.filter(r=>r.pct<60).length/rows.length*100);
  return {count:rows.length,avg,mastery,priority};
}
function renderLeaderMatrix(all){
  const subjects=['العلوم','الرياضيات','اللغة العربية','اللغة الإنجليزية','الدراسات الاجتماعية','التربية الإسلامية'],cycles=['cycle1','cycle2','cycle3'];
  const body=$('#leaderMatrixBody'); if(!body)return;
  body.innerHTML=subjects.map(s=>`<tr><td><b>${s}</b></td>${cycles.map(c=>{const a=aggregateRecords(all.filter(r=>r.subject===s&&r.cycle===c));return `<td><span class="matrix-pill">${a.avg===null?'—':a.avg+'%'}</span><small style="display:block;color:#7a8c98;margin-top:4px">${a.count} نتيجة</small></td>`}).join('')}</tr>`).join('');
}
function renderLeadership(){
  if(!$('#view-leadership'))return; const all=diagnosticScoreRecords(), subject=$('#leaderSubject').value, mode=$('#leaderMode').value, cycle=$('#leaderCycle').value;
  $('#leaderCycleWrap').style.display=mode==='subjects'?'grid':'none'; let groups=[], focus=[];
  if(mode==='cycles'){
    focus=all.filter(r=>r.subject===subject); groups=['cycle1','cycle2','cycle3'].map(c=>({label:cycleLabel(c),...aggregateRecords(focus.filter(r=>r.cycle===c))}));
    $('#leaderChartTitle').textContent=`${subject} بين الحلقات الثلاث`;
  }else{
    const subjects=['العلوم','الرياضيات','اللغة العربية','اللغة الإنجليزية','الدراسات الاجتماعية','التربية الإسلامية']; focus=all.filter(r=>r.cycle===cycle); groups=subjects.map(s=>({label:s,...aggregateRecords(focus.filter(r=>r.subject===s))}));
    $('#leaderChartTitle').textContent=`المواد داخل ${cycleLabel(cycle)}`;
  }
  const total=aggregateRecords(focus); $('#leaderStudents').textContent=total.count; $('#leaderAvg').textContent=total.avg===null?'—':total.avg+'%'; $('#leaderMastery').textContent=total.mastery===null?'—':total.mastery+'%'; $('#leaderPriority').textContent=total.priority===null?'—':total.priority+'%';
  const chart=$('#leaderChart');
  if(!groups.some(g=>g.count)){chart.innerHTML='<div class="leader-empty">لا توجد نتائج محفوظة كافية لهذه المقارنة حتى الآن.</div>';$('#leaderSaifSummary').textContent='عند اكتمال إدخال النتائج سيحدد سيف أعلى حلقة/مادة وأولوية المتابعة تلقائيًا.'}
  else{
    chart.innerHTML=groups.map(g=>`<div class="cycle-row"><b>${g.label}</b><div class="track"><div class="fill" style="width:${g.avg||0}%"></div></div><strong>${g.avg===null?'—':g.avg+'%'}</strong></div>`).join('');
    const valid=groups.filter(g=>g.avg!==null), best=valid.slice().sort((a,b)=>b.avg-a.avg)[0], low=valid.slice().sort((a,b)=>a.avg-b.avg)[0];
    $('#leaderSaifSummary').textContent=valid.length?`أعلى متوسط حاليًا: ${best.label} (${best.avg}%). أولوية المتابعة: ${low.label} (${low.avg}%). تعرض المقارنة النتائج المحفوظة فقط.`:'لا توجد بيانات كافية للتحليل.';
  }
  renderLeaderMatrix(all);
}
function exportLeadershipCsv(){
  const all=diagnosticScoreRecords();
  const rows=all.map(r=>`<tr><td>${r.subject}</td><td>${cycleLabel(r.cycle)}</td><td>${r.grade}</td><td>${r.className}</td><td>${r.name}</td><td>${r.pct}%</td></tr>`).join('');
  const html=`<html dir="rtl"><head><meta charset="UTF-8">
<style>
.assessment-status.progress{background:#fff3cd;color:#8a6500}.assessment-status.locked{background:#e8f3ff;color:#174d78}.assessment-card.locked-card{border-color:#b9d7ef;background:linear-gradient(180deg,#fff,#f7fbff)}
.field-label{display:block;font-weight:800;margin-bottom:8px;color:#153b55}.choice-grid{display:flex;flex-wrap:wrap;gap:8px}.choice-grid button{border:1px solid #cbdce7;background:#fff;border-radius:999px;padding:8px 12px;cursor:pointer;font-weight:700;color:#31576d}.choice-grid button.selected{background:#0e7892;color:#fff;border-color:#0e7892}.assessment-skills{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.assessment-skills span{font-size:.78rem;background:#eef6fa;border-radius:999px;padding:5px 8px;color:#31576d}.locked-note{font-size:.82rem;color:#174d78;font-weight:700}.score-select:disabled{background:#f2f6f8;color:#566b78}.btn.warn{background:#fff3cd;color:#735c00;border:1px solid #eed98a}
</style>

<style id="v49-approved-landing-fix">
/* V49 — restore the approved Saif landing image as the sole public home screen.
   Interactive hotspots remain real HTML buttons; the image is never duplicated by live text. */
body:not(.app-mode){background:#eef6fb;overflow-x:hidden}
body:not(.app-mode) .public-auth-entry{display:none!important}
body:not(.app-mode) #publicSite>.hero,
body:not(.app-mode) #publicSite>.section,
body:not(.app-mode) #publicSite>footer{display:none!important}
body:not(.app-mode) .approved-cover{
  position:relative!important;
  width:min(100%,1536px)!important;
  min-height:0!important;
  margin:0 auto!important;
  padding:0!important;
  display:block!important;
  overflow:hidden!important;
  background:#eef6fb!important;
  border:0!important;
}
body:not(.app-mode) .approved-cover img{
  display:block!important;
  width:100%!important;
  height:auto!important;
  max-width:none!important;
  max-height:none!important;
  object-fit:contain!important;
  object-position:center top!important;
  border-radius:0!important;
  box-shadow:none!important;
  filter:contrast(1.07) saturate(1.04) brightness(1.01)!important;
}
body:not(.app-mode) main{padding:0!important;margin:0!important}
body:not(.app-mode) .cover-hotspot{position:absolute!important;z-index:8!important}
/* hotspot positions matched to the approved 1280×853 artwork */
body:not(.app-mode) .cover-signup{top:2.0%!important;left:22.1%!important;width:10.0%!important;height:5.3%!important}
body:not(.app-mode) .cover-login{top:2.0%!important;left:9.0%!important;width:12.8%!important;height:5.3%!important}
body:not(.app-mode) .cover-hero-signup{top:38.0%!important;left:35.2%!important;width:14.5%!important;height:5.4%!important}
body:not(.app-mode) .cover-hero-login{top:38.0%!important;left:50.2%!important;width:15.7%!important;height:5.4%!important}
body:not(.app-mode) .cover-saif{top:40.7%!important;right:18.1%!important;width:10.6%!important;height:6.0%!important}
body:not(.app-mode) .cover-impact{top:2.0%!important;right:35.0%!important;width:8.0%!important;height:5.2%!important}
@media(max-width:760px){
 body:not(.app-mode) .approved-cover{width:100%!important}
 body:not(.app-mode) .approved-cover img{width:100%!important}
}
</style>
</head><body><table border="1"><thead><tr><th>المادة</th><th>الحلقة</th><th>الصف</th><th>الشعبة</th><th>الطالب/الطالبة</th><th>النسبة</th></tr></thead><tbody>${rows}</tbody></table>



<script id="v60-hardening">
(function(){
  try{localStorage.removeItem('misbarZayedSavedPasswordV1')}catch(e){}
  window.addEventListener('DOMContentLoaded',()=>{
    const p=document.getElementById('loginPassword'); if(p) p.value='';
  });
})();
<\/script>
<div id="misbarVersionBadge" style="position:fixed;left:8px;bottom:8px;z-index:999999;font:700 11px Arial;background:#fff;border:1px solid #b8cbd8;border-radius:8px;padding:4px 7px;color:#315b73">V92</div>
<div id="misbarBuildMarker" style="position:fixed;bottom:4px;left:6px;z-index:9999;font:10px Arial;color:#789;opacity:.55">V95</div>






<script id="misbar-v16-nav-icons">
document.addEventListener('DOMContentLoaded',()=>{
 const icons={overview:'⌂',assessments:'▣',scores:'▥',gaps:'◎',interventions:'⚙',evidence:'▧',remeasure:'↗',weekly:'▤',impact:'✦',student:'♙',leadership:'◫',reports:'▨',recognition:'♛'};
 document.querySelectorAll('#appShell .side-link[data-view]').forEach(b=>{if(!b.dataset.v16icon){const i=icons[b.dataset.view]||'•';b.innerHTML='<span style="display:inline-block;width:25px;text-align:center;font-size:18px;margin-left:6px">'+i+'</span>'+b.textContent;b.dataset.v16icon='1';}});
});
<\/script>

</body></html>`;
  const blob=new Blob(['\ufeff',html],{type:'application/vnd.ms-excel;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='misbar-zayed-results.xls';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
}
['leaderSubject','leaderMode','leaderCycle'].forEach(id=>$('#'+id)?.addEventListener('change',renderLeadership));
$('#exportLeadershipCsv')?.addEventListener('click',exportLeadershipCsv); $('#printLeadership')?.addEventListener('click',()=>window.print());

function renderVisitorPreview(){const ev=loadEvidence().filter(e=>e.privacy==='معتمد للزوار');$('#visitorEvidenceCount').textContent=ev.length;$('#visitorEvidenceList').innerHTML=ev.length?ev.slice(-6).reverse().map(e=>`<div><b>${e.type||'دليل وشاهد'}</b><small>${e.subject||''} • ${e.className||''} • ${new Date(e.createdAt).toLocaleDateString('ar-AE')}</small></div>`).join(''):'<div>لا توجد أدلة معتمدة للنشر بعد.</div>';const ints=loadInterventions().filter(i=>safeArray(i.evidenceIds).some(id=>ev.some(e=>e.id===id)));$('#visitorInterventions').textContent=ints.length;$('#visitorMastery').textContent='—';$('#visitorImprovement').textContent='—'}
$('#visitorPreviewBtn').onclick=()=>{renderVisitorPreview();$('#visitorDialog').showModal()};
$('#saifAnalyzeGaps').onclick=()=>{const lv=studentLevelsFromLatest();saifDialog.showModal();if(!lv.assessment){$('#saifResponse').textContent='لا توجد نتائج محفوظة لهذه الشعبة حتى الآن. احفظي درجات الاختبار التشخيصي أولًا.';return}const entered=lv.all.length, mastery=entered?Math.round(lv.good.length/entered*100):0;$('#saifResponse').textContent=`حللت نتائج ${entered} طالب/طالبة. نسبة الإتقان ${mastery}%. يحتاج ${lv.medium.length} إلى دعم، و${lv.danger.length} إلى تدخل علاجي مكثف. يمكنك اختيار الإجراء مباشرة من بطاقات الفجوات دون كتابة.`;speak($('#saifResponse').textContent)};




// ===== V38: report center + visitor impact dashboard =====
function allClassesForReport(){
  const set=new Set(); diagnosticScoreRecords().forEach(r=>set.add(r.className));
  return [...set].sort();
}
function syncReportClassOptions(){
  const sel=$('#reportClass'); if(!sel)return; const current=sel.value;
  const allowed=isTeacher()?currentUser.classes||[]:allClassesForReport();
  sel.innerHTML='<option value="all">جميع الشعب المسموح بها</option>'+allowed.map(c=>`<option value="${c}">${c}</option>`).join('');
  if([...sel.options].some(o=>o.value===current))sel.value=current;
}
function reportFilters(){return {type:$('#reportType')?.value||'full',subject:$('#reportSubject')?.value||'all',cycle:$('#reportCycle')?.value||'all',className:$('#reportClass')?.value||'all'}}
function filteredDiagnosticRows(){
  const f=reportFilters(); let rows=diagnosticScoreRecords();
  if(isTeacher()){const subs=safeArray(currentUser.subjects);const cls=safeArray(currentUser.classes);rows=rows.filter(r=>(!subs.length||subs.includes(r.subject))&&(!cls.length||cls.includes(r.className)))}
  if(f.subject!=='all')rows=rows.filter(r=>r.subject===f.subject); if(f.cycle!=='all')rows=rows.filter(r=>r.cycle===f.cycle); if(f.className!=='all')rows=rows.filter(r=>r.className===f.className);
  return rows;
}
function reportAssessments(){
  const f=reportFilters(); let arr=loadAssessments().filter(a=>!a.weekly&&!String(a.type||'').startsWith('اختبار قصير'));
  if(isTeacher()){const subs=safeArray(currentUser.subjects);const cls=safeArray(currentUser.classes);arr=arr.filter(a=>(!subs.length||subs.includes(a.subject))&&(!cls.length||cls.includes(a.className)))}
  if(f.subject!=='all')arr=arr.filter(a=>a.subject===f.subject); if(f.className!=='all')arr=arr.filter(a=>a.className===f.className); if(f.cycle!=='all')arr=arr.filter(a=>cycleFromGrade(a.grade)===f.cycle); return arr;
}
function reportInterventions(){const f=reportFilters();let arr=loadInterventions();if(isTeacher()){const subs=safeArray(currentUser.subjects);const cls=safeArray(currentUser.classes);arr=arr.filter(i=>(!subs.length||subs.includes(i.subject))&&(!cls.length||cls.includes(i.className)))}if(f.subject!=='all')arr=arr.filter(i=>i.subject===f.subject);if(f.className!=='all')arr=arr.filter(i=>i.className===f.className);return arr}
function reportEvidence(){const f=reportFilters();let arr=loadEvidence();if(isTeacher()){const subs=safeArray(currentUser.subjects);const cls=safeArray(currentUser.classes);arr=arr.filter(e=>(!subs.length||subs.includes(e.subject))&&(!cls.length||cls.includes(e.className)))}if(f.subject!=='all')arr=arr.filter(e=>e.subject===f.subject);if(f.className!=='all')arr=arr.filter(e=>e.className===f.className);return arr}
function weeklyRowsForReport(){
  const f=reportFilters(), scoreStore=loadAllScores(), assessments=loadAssessments(), byId=Object.fromEntries(assessments.map(a=>[a.id,a])); const rows=[];
  Object.entries(scoreStore).forEach(([key,sv])=>{const aid=key.split('|').pop(),a=byId[aid];if(!a||!(a.weekly||String(a.type||'').startsWith('اختبار قصير')))return;const subject=sv.subject||a.subject,grade=sv.grade||a.grade,className=sv.className||a.className,max=sv.max||a.max||100;if(isTeacher()){if(safeArray(currentUser.subjects).length&&!safeArray(currentUser.subjects).includes(subject))return;if(safeArray(currentUser.classes).length&&!safeArray(currentUser.classes).includes(className))return}if(f.subject!=='all'&&subject!==f.subject)return;if(f.className!=='all'&&className!==f.className)return;if(f.cycle!=='all'&&cycleFromGrade(grade)!==f.cycle)return;(sv.rows||[]).forEach(r=>rows.push({subject,grade,className,name:r.name,quiz:a.type||'Quiz',score:r.score,max,pct:max?Math.round(r.score/max*100):0,date:a.date||''}))});return rows;
}
function renderReports(){
  if(!$('#view-reports'))return; syncReportClassOptions(); const rows=filteredDiagnosticRows(),ass=reportAssessments(),ints=reportInterventions(),ev=reportEvidence(),weekly=weeklyRowsForReport(),f=reportFilters();
  const names=[...new Set(rows.map(r=>r.name))]; $('#reportStudents').textContent=names.length;$('#reportAssessments').textContent=rows.length;$('#reportInterventions').textContent=ints.length;$('#reportEvidence').textContent=ev.length;
  const labels={full:'ملف أثر كامل',results:'نتائج الاختبارات التشخيصية',skills:'المهارات والفجوات',interventions:'الإجراءات العلاجية والإثرائية',weekly:'Quiz الأسبوعي',evidence:'الأدلة والشواهد'};$('#reportPreviewTitle').textContent=labels[f.type]||'تقرير';
  const avg=aggregateRecords(rows); let blocks=[];
  if(f.type==='full'||f.type==='results'){blocks.push(`<section class="report-section"><h4>ملخص النتائج التشخيصية</h4><p>عدد النتائج: <b>${rows.length}</b> • متوسط الأداء: <b>${avg.avg===null?'—':avg.avg+'%'}</b> • الإتقان: <b>${avg.mastery===null?'—':avg.mastery+'%'}</b> • أولوية التدخل: <b>${avg.priority===null?'—':avg.priority+'%'}</b></p><table class="report-mini-table"><thead><tr><th>المادة</th><th>الحلقة</th><th>الصف</th><th>الشعبة</th><th>الطالب/الطالبة</th><th>النسبة</th></tr></thead><tbody>${rows.slice(0,80).map(r=>`<tr><td>${r.subject}</td><td>${cycleLabel(r.cycle)}</td><td>${r.grade}</td><td>${r.className}</td><td>${r.name}</td><td>${r.pct}%</td></tr>`).join('')||'<tr><td colspan="6">لا توجد بيانات</td></tr>'}</tbody></table></section>`)}
  if(f.type==='full'||f.type==='skills'){const skillRows=ass.flatMap(a=>safeArray(a.skills).map(s=>({subject:a.subject,className:a.className,skill:s,status:a.status||'—'})));blocks.push(`<section class="report-section"><h4>المهارات المستهدفة والفجوات</h4><table class="report-mini-table"><thead><tr><th>المادة</th><th>الشعبة</th><th>المهارة</th><th>حالة الاختبار</th></tr></thead><tbody>${skillRows.map(x=>`<tr><td>${x.subject||''}</td><td>${x.className||''}</td><td>${x.skill}</td><td>${x.status}</td></tr>`).join('')||'<tr><td colspan="4">لا توجد مهارات مرتبطة بعد</td></tr>'}</tbody></table></section>`)}
  if(f.type==='full'||f.type==='interventions'){blocks.push(`<section class="report-section"><h4>الإجراءات العلاجية والإثرائية</h4><table class="report-mini-table"><thead><tr><th>المادة</th><th>الشعبة</th><th>الإجراء</th><th>عدد الطلبة</th><th>التاريخ</th></tr></thead><tbody>${ints.map(i=>`<tr><td>${i.subject||''}</td><td>${i.className||''}</td><td>${i.action||safeArray(i.actions).join('، ')||'إجراء'}</td><td>${safeArray(i.students).length||'—'}</td><td>${i.createdAt?new Date(i.createdAt).toLocaleDateString('ar-AE'):'—'}</td></tr>`).join('')||'<tr><td colspan="5">لا توجد إجراءات</td></tr>'}</tbody></table></section>`)}
  if(f.type==='full'||f.type==='weekly'){blocks.push(`<section class="report-section"><h4>المتابعة الأسبوعية Quiz</h4><table class="report-mini-table"><thead><tr><th>المادة</th><th>الشعبة</th><th>الطالب/الطالبة</th><th>Quiz</th><th>الدرجة</th><th>النسبة</th></tr></thead><tbody>${weekly.slice(0,120).map(w=>`<tr><td>${w.subject}</td><td>${w.className}</td><td>${w.name}</td><td>${w.quiz}</td><td>${w.score}/${w.max}</td><td>${w.pct}%</td></tr>`).join('')||'<tr><td colspan="6">لا توجد نتائج أسبوعية</td></tr>'}</tbody></table></section>`)}
  if(f.type==='full'||f.type==='evidence'){blocks.push(`<section class="report-section"><h4>الأدلة والشواهد</h4><table class="report-mini-table"><thead><tr><th>النوع</th><th>المادة</th><th>الشعبة</th><th>الملف</th><th>الإتاحة</th></tr></thead><tbody>${ev.map(e=>`<tr><td>${e.type||''}</td><td>${e.subject||''}</td><td>${e.className||''}</td><td>${e.fileName||''}</td><td>${e.privacy||'خاص'}</td></tr>`).join('')||'<tr><td colspan="5">لا توجد أدلة</td></tr>'}</tbody></table></section>`)}
  $('#reportPreview').innerHTML=blocks.join('');
}
function exportDiagnosticRowsForTransfer(){
  // V86: teacher transfer must not depend on the visible report filters.
  // Read every saved diagnostic result belonging to the signed-in teacher,
  // including older/orphaned diagnostic saves whose assessment card was later removed.
  if(!isTeacher())return filteredDiagnosticRows().map(r=>({...r,score:r.pct,max:100}));
  const scoreStore=loadAllScores(), assessments=loadAssessments(), byId=Object.fromEntries(assessments.map(a=>[a.id,a]));
  const subs=safeArray(currentUser.subjects), cls=safeArray(currentUser.classes), rows=[];
  Object.entries(scoreStore).forEach(([key,sv])=>{
    if(sv?.imported)return;
    const parts=key.split('|'), aid=parts[parts.length-1], a=byId[aid];
    if(a&&(a.weekly||String(a.type||'').startsWith('اختبار قصير')||a.type==='إعادة القياس'))return;
    const subject=sv.subject||parts[1]||'', grade=String(sv.grade||parts[2]||''), className=sv.className||parts[3]||'', max=Number(sv.max||a?.max||100)||100;
    if(subs.length&&!subs.includes(subject))return;
    if(cls.length&&!cls.includes(className))return;
    safeArray(sv.rows).forEach(r=>{
      const score=Number(r.score); if(!r.name||!Number.isFinite(score))return;
      rows.push({subject,grade,className,cycle:cycleFromGrade(grade),name:r.name,score,max,pct:Math.round(score/max*100)});
    });
  });
  return rows;
}
function exportFullExcel(){
  const rows=exportDiagnosticRowsForTransfer(),ass=reportAssessments(),ints=reportInterventions(),ev=reportEvidence(),weekly=weeklyRowsForReport(); const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const tbl=(title,heads,body,id='')=>`<h2>${title}</h2><table ${id?`id="${id}"`:''} border="1"><thead><tr>${heads.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${body||`<tr><td colspan="${heads.length}">لا توجد بيانات</td></tr>`}</tbody></table><br>`;
  const teacherName=esc(currentUser?.name||currentUser?.email||'مستخدم');
  let body=`<table id="misbarExportMeta" border="1"><tbody><tr><th>نوع الملف</th><td>MISBAR_TEACHER_TRANSFER_V86</td></tr><tr><th>المعلم/المعلمة</th><td>${teacherName}</td></tr><tr><th>تاريخ التصدير</th><td>${new Date().toISOString()}</td></tr></tbody></table><br>`;
  body+=tbl('ملخص النتائج',['المعلم/المعلمة','المادة','الحلقة','الصف','الشعبة','الطالب/الطالبة','الدرجة','الدرجة النهائية','النسبة'],rows.map(r=>`<tr><td>${teacherName}</td><td>${esc(r.subject)}</td><td>${esc(cycleLabel(r.cycle))}</td><td>${esc(r.grade)}</td><td>${esc(r.className)}</td><td>${esc(r.name)}</td><td>${Number.isFinite(Number(r.score))?r.score:r.pct}</td><td>${Number.isFinite(Number(r.max))?r.max:100}</td><td>${r.pct}%</td></tr>`).join(''),'misbarDiagnosticResults');
  body+=tbl('المهارات',['المادة','الشعبة','المهارة','الحالة'],ass.flatMap(a=>safeArray(a.skills).map(s=>`<tr><td>${esc(a.subject)}</td><td>${esc(a.className)}</td><td>${esc(s)}</td><td>${esc(a.status||'')}</td></tr>`)).join(''));
  body+=tbl('الإجراءات',['المادة','الشعبة','الإجراء','الطلبة'],ints.map(i=>`<tr><td>${esc(i.subject)}</td><td>${esc(i.className)}</td><td>${esc(i.action||safeArray(i.actions).join('، ')||'')}</td><td>${esc(safeArray(i.students).join('، '))}</td></tr>`).join(''));
  body+=tbl('Quiz الأسبوعي',['المادة','الشعبة','الطالب/الطالبة','Quiz','الدرجة','النسبة'],weekly.map(w=>`<tr><td>${esc(w.subject)}</td><td>${esc(w.className)}</td><td>${esc(w.name)}</td><td>${esc(w.quiz)}</td><td>${w.score}/${w.max}</td><td>${w.pct}%</td></tr>`).join(''));
  body+=tbl('الأدلة والشواهد',['النوع','المادة','الشعبة','الملف','الإتاحة'],ev.map(e=>`<tr><td>${esc(e.type)}</td><td>${esc(e.subject)}</td><td>${esc(e.className)}</td><td>${esc(e.fileName)}</td><td>${esc(e.privacy)}</td></tr>`).join(''));
  const html=`<html dir="rtl"><head><meta charset="UTF-8"><title>مسبار زايد - المعلم - ${teacherName}</title></head><body>${body}


</body></html>`,blob=new Blob(['\ufeff',html],{type:'application/vnd.ms-excel;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;const who=(currentUser?.name||currentUser?.email||'مستخدم').replace(/[\\/:*?"<>|]/g,'-'); const scope=isTeacher()?'المعلم-'+who:'الإدارة'; a.download='مسبار-زايد-'+scope+'-'+new Date().toISOString().slice(0,10)+'.xls';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
}
// V80: simple offline management import of teacher-exported Excel (.xls HTML tables)
(function(){
  const input=document.getElementById('teacherExcelFiles'), btn=document.getElementById('importTeacherExcel'), status=document.getElementById('adminImportStatus');
  if(!input||!btn)return;
  btn.addEventListener('click',()=>input.click());
  function clean(t){return String(t||'').replace(/\s+/g,' ').trim()}
  function parsePct(t){const n=parseFloat(clean(t).replace('%',''));return Number.isFinite(n)?Math.max(0,Math.min(100,n)):null}
  function gradeFromClass(c){const m=String(c||'').match(/(\d{1,2})\s*G/i);return m?m[1]:''}
  function teacherLabel(doc,file){
    const meta=[...doc.querySelectorAll('#misbarExportMeta tr')].find(tr=>clean(tr.cells?.[0]?.textContent)==='المعلم/المعلمة');
    if(meta?.cells?.[1])return clean(meta.cells[1].textContent);
    const title=clean(doc.querySelector('title')?.textContent||'');
    const m=(title+' '+file.name).match(/المعلم\s*[- ـ:]\s*([^\.]+)/); return m?clean(m[1]):clean(file.name.replace(/\.(xls|html?)$/i,''));
  }
  function findResultsTable(doc){
    const direct=doc.querySelector('#misbarDiagnosticResults'); if(direct)return direct;
    const hs=[...doc.querySelectorAll('h1,h2,h3')];
    const h=hs.find(x=>clean(x.textContent).includes('ملخص النتائج'));
    if(h){let n=h.nextElementSibling;while(n&&n.tagName!=='TABLE')n=n.nextElementSibling;if(n)return n}
    return [...doc.querySelectorAll('table')].find(t=>clean(t.textContent).includes('الطالب/الطالبة')&&clean(t.textContent).includes('النسبة'))||null;
  }
  async function importOne(file){
    const text=await file.text(), doc=new DOMParser().parseFromString(text,'text/html'), table=findResultsTable(doc);
    if(!table)throw new Error('لم أجد جدول ملخص النتائج');
    const fallbackTeacher=teacherLabel(doc,file);
    const headers=[...table.querySelectorAll('thead th')].map(th=>clean(th.textContent));
    const col=name=>headers.indexOf(name);
    const hasV86=col('الطالب/الطالبة')>=0&&col('النسبة')>=0;
    const rows=[...table.querySelectorAll('tbody tr')], grouped={}; let count=0;
    rows.forEach(tr=>{
      const c=[...tr.querySelectorAll('td')].map(td=>clean(td.textContent));
      if(!c.length||c.some(x=>x==='لا توجد بيانات'))return;
      let teacher=fallbackTeacher,subject='',gradeRaw='',className='',name='',pct=null,score=null,max=100;
      if(hasV86){
        const at=n=>{const i=col(n);return i>=0?c[i]:''};
        teacher=at('المعلم/المعلمة')||fallbackTeacher; subject=at('المادة'); gradeRaw=at('الصف'); className=at('الشعبة'); name=at('الطالب/الطالبة'); pct=parsePct(at('النسبة'));
        const s=parseFloat(at('الدرجة')), m=parseFloat(at('الدرجة النهائية')); if(Number.isFinite(s))score=s;if(Number.isFinite(m)&&m>0)max=m;
      }else if(c.length>=6){
        // Compatibility with V80–V85 exports: مادة، حلقة، صف، شعبة، اسم، نسبة
        [subject,,gradeRaw,className,name]=c; pct=parsePct(c[5]); score=pct; max=100;
      }
      const grade=clean(gradeRaw)||gradeFromClass(className);
      if(!subject||!className||!name||pct===null)return;
      const gkey=[teacher,subject,grade,className].join('|');
      const normalizedScore=(Number.isFinite(score)&&max>0)?score:pct;
      (grouped[gkey]??={teacher,subject,grade,className,max,rows:[]}).rows.push({name,score:normalizedScore}); count++;
    });
    const store=loadAllScores();
    Object.values(grouped).forEach(g=>{
      const key=['ADMINIMPORT',g.teacher,g.subject,g.grade,g.className].join('|');
      store[key]={subject:g.subject,grade:g.grade,className:g.className,max:g.max||100,imported:true,teacher:g.teacher,sourceFile:file.name,importedAt:Date.now(),rows:g.rows};
    });
    saveAllScores(store); return {file:file.name,teacher:fallbackTeacher,count,groups:Object.keys(grouped).length};
  }
  input.addEventListener('change',async()=>{
    const files=[...input.files]; if(!files.length)return;
    btn.disabled=true; if(status)status.textContent='جارٍ استيراد النتائج…';
    let ok=[],bad=[];
    for(const f of files){try{ok.push(await importOne(f))}catch(e){bad.push(f.name+' — '+e.message)}}
    btn.disabled=false; input.value='';
    if(status){const n=ok.reduce((a,x)=>a+x.count,0);const empty=(ok.length&&n===0)?'<br><b>الملف سليم، لكنه لا يحتوي نتائج تشخيصية محفوظة للتجميع.</b>':'';status.innerHTML=`تم استيراد <b>${ok.length}</b> ملف/ملفات و<b>${n}</b> نتيجة بنجاح.${empty}${bad.length?'<br>تعذر: '+bad.join('، '):''}<br><small>عند استيراد ملف محدث لنفس المعلم/المادة/الصف/الشعبة يتم استبدال المجموعة السابقة.</small>`}
    try{renderReports();renderLeadership()}catch(e){}
  });
})();

['reportType','reportSubject','reportCycle','reportClass'].forEach(id=>$('#'+id)?.addEventListener('change',renderReports));$('#exportFullExcel')?.addEventListener('click',exportFullExcel);$('#exportTeacherExcel')?.addEventListener('click',exportFullExcel);$('#printFullReport')?.addEventListener('click',()=>{renderReports();window.print()});
const _showViewV38=showView;showView=function(v){_showViewV38(v);if(v==='reports')setTimeout(renderReports,0);if(v==='leadership')setTimeout(renderLeadership,0)};
function renderVisitorPreviewV38(){
  const all=diagnosticScoreRecords(),agg=aggregateRecords(all),ev=loadEvidence().filter(e=>e.privacy==='معتمد للزوار'),ints=loadInterventions().filter(i=>safeArray(i.evidenceIds).some(id=>ev.some(e=>e.id===id)));
  $('#visitorEvidenceCount').textContent=ev.length;$('#visitorInterventions').textContent=ints.length;$('#visitorMastery').textContent=agg.mastery===null?'—':agg.mastery+'%';$('#visitorAvg').textContent=agg.avg===null?'—':agg.avg+'%';
  $('#visitorEvidenceList').innerHTML=ev.length?ev.slice(-8).reverse().map(e=>`<div><b>${e.type||'دليل وشاهد'}</b><small>${e.subject||''} • ${e.className||''} • ${new Date(e.createdAt).toLocaleDateString('ar-AE')}</small></div>`).join(''):'<div>لا توجد أدلة معتمدة للنشر بعد.</div>';
  const subjects=['العلوم','الرياضيات','اللغة العربية','اللغة الإنجليزية','الدراسات الاجتماعية','التربية الإسلامية'],cycles=['cycle1','cycle2','cycle3'];let rows=[];subjects.forEach(s=>cycles.forEach(c=>{const a=aggregateRecords(all.filter(r=>r.subject===s&&r.cycle===c));if(a.count)rows.push({label:`${s} • ${cycleLabel(c)}`,avg:a.avg})}));$('#visitorCompare').innerHTML=rows.length?rows.map(r=>`<div class="visitor-compare-row"><b>${r.label}</b><div class="track"><div class="fill" style="width:${r.avg||0}%"></div></div><strong>${r.avg}%</strong></div>`).join(''):'<div class="leader-empty">ستظهر المقارنات هنا بعد اكتمال النتائج المعتمدة.</div>';
}
$('#visitorPreviewBtn').onclick=()=>{renderVisitorPreviewV38();$('#visitorDialog').showModal()};

// V21 migration: official diagnostic scale is 100 for every subject.
(function migrateAllAssessmentsTo100(){const all=loadAssessments();let changed=false;all.forEach(a=>{if(a.max!==100){a.max=100;changed=true}});if(changed)saveAssessments(all)})();

setTimeout(()=>{syncRosterFromClass();},0);

// V42: delegated fallback so every "اختيار إجراء" button works even after dynamic rendering.
document.addEventListener('click',function(e){
  const btn=e.target.closest && e.target.closest('.choose-action');
  if(btn){e.preventDefault();e.stopPropagation();openIntervention(btn.dataset.level||'all');}
});



// ===== V46: premium certificates + robust delegated actions =====
(function(){
  const $v44=(q)=>document.querySelector(q), $$v44=(q)=>[...document.querySelectorAll(q)];
  function rosterNamesV44(){ try{return rosterForCurrentClass().map(x=>typeof x==='string'?x:(x.name||x.arabic||'')).filter(Boolean)}catch(e){return []} }
  function certificateEligibility(type,name){
    try{
      const pts=studentSeries(name); const base=pts[0]?.pct, last=pts[pts.length-1]?.pct;
      if(type==='تفوق') return (last??base??0)>=90;
      if(type==='تقدم وتميز') return base!==undefined&&last!==undefined&&(last-base)>=15;
      if(type==='إتقان مهارة') return (last??base??0)>=80;
      return true;
    }catch(e){return true}
  }
  function fillCertificateStudents(type){
    const sel=$v44('#certificateStudent'); if(!sel)return;
    const names=rosterNamesV44(); const eligible=names.filter(n=>certificateEligibility(type,n)); const use=eligible.length?eligible:names;
    sel.innerHTML=use.map(n=>`<option>${n}</option>`).join('')||'<option>لا توجد أسماء متاحة</option>';
  }
  function renderCertificatePreview(){
    const type=$v44('#certificateType')?.value||'تفوق', student=$v44('#certificateStudent')?.value||'الطالب/الطالبة';
    const selected=$v44('#certificatePhrase')?.value||'';
    const custom=$v44('#certificateCustomPhrase')?.value?.trim()||'';
    const phrase=custom||selected;
    const box=$v44('#certificatePreview'); if(!box)return;
    const subj=window.subjectFilter?.value||'المادة', cls=window.classFilter?.value||'';
    const theme=type==='تفوق'?'theme-gold':type==='تقدم وتميز'?'theme-star':type==='إتقان مهارة'?'theme-mastery':'theme-growth';
    const icon=type==='تفوق'?'★':type==='تقدم وتميز'?'✦':type==='إتقان مهارة'?'✓':'↗';
    const loggedUser=(typeof currentUser!=='undefined'&&currentUser)?currentUser:window.currentUser; const teacher=(loggedUser?.name||'المعلم/المعلمة').replace(/^أ\.\s*/, '');
    box.className='certificate-preview '+theme;
    box.innerHTML=`<div class="cert-seal">${icon}</div><div class="cert-kicker">مِسبار زايد | ZAYED MISBAR</div><div class="cert-title">شهادة ${type}</div><div class="cert-school">مجمع زايد التعليمي</div><div>يسرنا أن نحتفي بإنجاز</div><div class="student-name">${student}</div><div class="cert-message">${phrase}</div><div class="cert-meta">${subj}${cls?' • '+cls:''} • ${new Date().toLocaleDateString('ar-AE')}</div><div class="cert-credits"><div class="cert-credit"><b>المعلم/المعلمة</b>${teacher}</div><div class="cert-credit"><b>مديرة المدرسة</b>أ. حبيبة المزروعي</div></div>`;
  }
  function openCertificate(type){
    const dlg=$v44('#certificateDialog'); if(!dlg)return;
    const typeSel=$v44('#certificateType'); if(typeSel)typeSel.value=type||'تفوق'; fillCertificateStudents(typeSel?.value||type); renderCertificatePreview();
    if(!dlg.open)dlg.showModal();
  }
  function printCertificate(){
    renderCertificatePreview();
    const preview=$v44('#certificatePreview'); const body=preview?.innerHTML||''; const theme=[...preview?.classList||[]].find(x=>x.startsWith('theme-'))||'theme-star';
    const w=window.open('','_blank','width=1100,height=800'); if(!w)return alert('يرجى السماح بالنوافذ المنبثقة للطباعة.');
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>شهادة مِسبار زايد</title><style>@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{margin:0;font-family:Tahoma,Arial,sans-serif;background:#edf4f8;padding:24px;color:#173653}.sheet{position:relative;overflow:hidden;width:100%;max-width:1080px;min-height:700px;margin:auto;background:linear-gradient(145deg,#fffef9,#f5faff);border:9px double #8bb8d5;border-radius:30px;padding:64px 75px;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;box-shadow:0 20px 60px rgba(33,78,110,.16)}.sheet:before,.sheet:after{content:"";position:absolute;width:300px;height:300px;border:3px solid rgba(198,163,95,.24);border-radius:50%}.sheet:before{right:-145px;top:-165px}.sheet:after{left:-160px;bottom:-180px}.cert-kicker{letter-spacing:.08em;font-size:14px;color:#688397;font-weight:800}.cert-title{font-size:48px;font-weight:950;color:#245f89}.cert-school{font-size:20px;font-weight:800;color:#526f84}.student-name{font-size:38px;font-weight:950;color:#173653;border-bottom:3px solid #d5b45b;padding:0 28px 10px}.cert-message{font-size:21px;line-height:1.9;max-width:820px;color:#405b70}.cert-meta{font-size:15px;color:#71889a}.cert-seal{width:90px;height:90px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#eef8fe,#cfe5f3);border:3px solid #a9cde2;box-shadow:inset 0 0 0 7px #fbfdff;color:#245f89;font-size:30px;font-weight:950}.cert-credits{display:grid;grid-template-columns:1fr 1fr;gap:110px;width:75%;margin-top:34px}.cert-credit{padding-top:10px;color:#557083;font-size:16px}.cert-credit b{display:block;color:#284f6c;margin-bottom:5px}.sheet.theme-gold{border-color:#d4ae4b;background:linear-gradient(145deg,#fffdf4,#fff9e7)}.sheet.theme-gold .cert-title{color:#8c6921}.sheet.theme-mastery{border-color:#85c4b0;background:linear-gradient(145deg,#fdfffe,#eef9f5)}.sheet.theme-mastery .cert-title{color:#2e7a65}.sheet.theme-growth{border-color:#b7c998;background:linear-gradient(145deg,#fffffb,#f4f8ec)}.sheet.theme-growth .cert-title{color:#617846}@media print{body{background:#fff;padding:0}.sheet{box-shadow:none;min-height:185mm;width:277mm;max-width:none}}</style>
<style id="v49-approved-landing-fix">
/* V49 — restore the approved Saif landing image as the sole public home screen.
   Interactive hotspots remain real HTML buttons; the image is never duplicated by live text. */
body:not(.app-mode){background:#eef6fb;overflow-x:hidden}
body:not(.app-mode) .public-auth-entry{display:none!important}
body:not(.app-mode) #publicSite>.hero,
body:not(.app-mode) #publicSite>.section,
body:not(.app-mode) #publicSite>footer{display:none!important}
body:not(.app-mode) .approved-cover{
  position:relative!important;
  width:min(100%,1536px)!important;
  min-height:0!important;
  margin:0 auto!important;
  padding:0!important;
  display:block!important;
  overflow:hidden!important;
  background:#eef6fb!important;
  border:0!important;
}
body:not(.app-mode) .approved-cover img{
  display:block!important;
  width:100%!important;
  height:auto!important;
  max-width:none!important;
  max-height:none!important;
  object-fit:contain!important;
  object-position:center top!important;
  border-radius:0!important;
  box-shadow:none!important;
  filter:contrast(1.07) saturate(1.04) brightness(1.01)!important;
}
body:not(.app-mode) main{padding:0!important;margin:0!important}
body:not(.app-mode) .cover-hotspot{position:absolute!important;z-index:8!important}
/* hotspot positions matched to the approved 1280×853 artwork */
body:not(.app-mode) .cover-signup{top:2.0%!important;left:22.1%!important;width:10.0%!important;height:5.3%!important}
body:not(.app-mode) .cover-login{top:2.0%!important;left:9.0%!important;width:12.8%!important;height:5.3%!important}
body:not(.app-mode) .cover-hero-signup{top:38.0%!important;left:35.2%!important;width:14.5%!important;height:5.4%!important}
body:not(.app-mode) .cover-hero-login{top:38.0%!important;left:50.2%!important;width:15.7%!important;height:5.4%!important}
body:not(.app-mode) .cover-saif{top:40.7%!important;right:18.1%!important;width:10.6%!important;height:6.0%!important}
body:not(.app-mode) .cover-impact{top:2.0%!important;right:35.0%!important;width:8.0%!important;height:5.2%!important}
@media(max-width:760px){
 body:not(.app-mode) .approved-cover{width:100%!important}
 body:not(.app-mode) .approved-cover img{width:100%!important}
}
</style>
</head><body><div class="sheet ${theme}">${body}</div><script>window.onload=()=>{setTimeout(()=>window.print(),250)}<\/script>
<script id="v60-hardening">
(function(){
  try{localStorage.removeItem('misbarZayedSavedPasswordV1')}catch(e){}
  window.addEventListener('DOMContentLoaded',()=>{
    const p=document.getElementById('loginPassword'); if(p) p.value='';
  });
})();
<\/script>



</body></html>`); w.document.close();
  }
  // direct bindings
  $$v44('.certificate-launch').forEach(b=>b.addEventListener('click',()=>openCertificate(b.dataset.certificateType)));
  $v44('#certificateType')?.addEventListener('change',e=>{fillCertificateStudents(e.target.value);renderCertificatePreview()});
  $v44('#certificateStudent')?.addEventListener('change',renderCertificatePreview); $v44('#certificatePhrase')?.addEventListener('change',renderCertificatePreview); $v44('#certificateCustomPhrase')?.addEventListener('input',renderCertificatePreview);
  $v44('#refreshCertificatePreview')?.addEventListener('click',renderCertificatePreview); $v44('#printCertificate')?.addEventListener('click',printCertificate);

  // delegated safety net for dynamically-rendered buttons
  document.addEventListener('click',function(e){
    const action=e.target.closest('.choose-action'); if(action){e.preventDefault(); try{openIntervention(action.dataset.level||'danger')}catch(err){console.error(err)} return;}
    const cert=e.target.closest('.certificate-launch'); if(cert){e.preventDefault();openCertificate(cert.dataset.certificateType);return;}
    const student=e.target.closest('[data-open-student]'); if(student){e.preventDefault(); try{activeStudentName=student.dataset.openStudent;showView('student');renderStudentProfile()}catch(err){console.error(err)} return;}
  });
  window.openCertificate=openCertificate; window.renderCertificatePreview=renderCertificatePreview;
})();
document.getElementById('uploadEvidenceBtn')?.addEventListener('click', function () {
  openEvidenceDialog('');
});
// V93 comprehensive QA marker
window.MISBAR_BUILD='V97-EVIDENCE-RECORD-FIX';

;


/* ===== MISBAR extracted script 2: v47-certificate-button-fix ===== */

// V47: bind certificate preview/print buttons after the certificate dialog exists in the DOM.
(function(){
  function safeRefreshCertificate(){
    try{
      if (typeof window.renderCertificatePreview === 'function') {
        window.renderCertificatePreview();
      }
    } catch (err) {
      console.error('Certificate preview refresh failed', err);
      alert('تعذر تحديث معاينة الشهادة. يرجى إعادة فتح نافذة الشهادة والمحاولة مرة أخرى.');
    }
  }
  function safePrintCertificate(){
    try{
      safeRefreshCertificate();
      const preview=document.querySelector('#certificatePreview');
      if(!preview){ alert('تعذر العثور على معاينة الشهادة.'); return; }
      const body=preview.innerHTML||'';
      const theme=[...preview.classList].find(x=>x.startsWith('theme-'))||'theme-star';
      const w=window.open('','_blank','width=1100,height=800');
      if(!w){ alert('يرجى السماح بالنوافذ المنبثقة للطباعة، ثم المحاولة مرة أخرى.'); return; }
      w.document.open();
      w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>شهادة مِسبار زايد</title><style>@page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}body{margin:0;font-family:Tahoma,Arial,sans-serif;background:#fff;padding:0;color:#173653}.sheet{position:relative;overflow:hidden;width:277mm;min-height:185mm;margin:auto;background:linear-gradient(145deg,#fffef9,#f5faff);border:9px double #8bb8d5;border-radius:30px;padding:20mm 24mm;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px}.sheet:before,.sheet:after{content:"";position:absolute;width:300px;height:300px;border:3px solid rgba(198,163,95,.24);border-radius:50%}.sheet:before{right:-145px;top:-165px}.sheet:after{left:-160px;bottom:-180px}.cert-kicker{letter-spacing:.08em;font-size:14px;color:#688397;font-weight:800}.cert-title{font-size:48px;font-weight:950;color:#245f89}.cert-school{font-size:20px;font-weight:800;color:#526f84}.student-name{font-size:38px;font-weight:950;color:#173653;border-bottom:3px solid #d5b45b;padding:0 28px 10px}.cert-message{font-size:21px;line-height:1.9;max-width:820px;color:#405b70}.cert-meta{font-size:15px;color:#71889a}.cert-seal{width:90px;height:90px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#eef8fe,#cfe5f3);border:3px solid #a9cde2;box-shadow:inset 0 0 0 7px #fbfdff;color:#245f89;font-size:30px;font-weight:950}.cert-credits{display:grid;grid-template-columns:1fr 1fr;gap:110px;width:75%;margin-top:34px}.cert-credit{padding-top:10px;color:#557083;font-size:16px}.cert-credit b{display:block;color:#284f6c;margin-bottom:5px}.sheet.theme-gold{border-color:#d4ae4b;background:linear-gradient(145deg,#fffdf4,#fff9e7)}.sheet.theme-gold .cert-title{color:#8c6921}.sheet.theme-mastery{border-color:#85c4b0;background:linear-gradient(145deg,#fdfffe,#eef9f5)}.sheet.theme-mastery .cert-title{color:#2e7a65}.sheet.theme-growth{border-color:#b7c998;background:linear-gradient(145deg,#fffffb,#f4f8ec)}.sheet.theme-growth .cert-title{color:#617846}@media print{body{background:#fff}.sheet{box-shadow:none}}</style>
<style id="v49-approved-landing-fix">
/* V49 — restore the approved Saif landing image as the sole public home screen.
   Interactive hotspots remain real HTML buttons; the image is never duplicated by live text. */
body:not(.app-mode){background:#eef6fb;overflow-x:hidden}
body:not(.app-mode) .public-auth-entry{display:none!important}
body:not(.app-mode) #publicSite>.hero,
body:not(.app-mode) #publicSite>.section,
body:not(.app-mode) #publicSite>footer{display:none!important}
body:not(.app-mode) .approved-cover{
  position:relative!important;
  width:min(100%,1536px)!important;
  min-height:0!important;
  margin:0 auto!important;
  padding:0!important;
  display:block!important;
  overflow:hidden!important;
  background:#eef6fb!important;
  border:0!important;
}
body:not(.app-mode) .approved-cover img{
  display:block!important;
  width:100%!important;
  height:auto!important;
  max-width:none!important;
  max-height:none!important;
  object-fit:contain!important;
  object-position:center top!important;
  border-radius:0!important;
  box-shadow:none!important;
  filter:contrast(1.07) saturate(1.04) brightness(1.01)!important;
}
body:not(.app-mode) main{padding:0!important;margin:0!important}
body:not(.app-mode) .cover-hotspot{position:absolute!important;z-index:8!important}
/* hotspot positions matched to the approved 1280×853 artwork */
body:not(.app-mode) .cover-signup{top:2.0%!important;left:22.1%!important;width:10.0%!important;height:5.3%!important}
body:not(.app-mode) .cover-login{top:2.0%!important;left:9.0%!important;width:12.8%!important;height:5.3%!important}
body:not(.app-mode) .cover-hero-signup{top:38.0%!important;left:35.2%!important;width:14.5%!important;height:5.4%!important}
body:not(.app-mode) .cover-hero-login{top:38.0%!important;left:50.2%!important;width:15.7%!important;height:5.4%!important}
body:not(.app-mode) .cover-saif{top:40.7%!important;right:18.1%!important;width:10.6%!important;height:6.0%!important}
body:not(.app-mode) .cover-impact{top:2.0%!important;right:35.0%!important;width:8.0%!important;height:5.2%!important}
@media(max-width:760px){
 body:not(.app-mode) .approved-cover{width:100%!important}
 body:not(.app-mode) .approved-cover img{width:100%!important}
}
</style>
</head><body><div class="sheet ${theme}">${body}</div><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));<\/script>
<script id="v60-hardening">
(function(){
  try{localStorage.removeItem('misbarZayedSavedPasswordV1')}catch(e){}
  window.addEventListener('DOMContentLoaded',()=>{
    const p=document.getElementById('loginPassword'); if(p) p.value='';
  });
})();
<\/script>



</body></html>`);
      w.document.close();
    } catch (err) {
      console.error('Certificate print failed', err);
      alert('تعذر فتح نافذة الطباعة. يرجى المحاولة مرة أخرى.');
    }
  }

  const refreshBtn=document.querySelector('#refreshCertificatePreview');
  const printBtn=document.querySelector('#printCertificate');
  if(refreshBtn) refreshBtn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();safeRefreshCertificate();});
  if(printBtn) printBtn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();safePrintCertificate();});

  // Delegated fallback in case the dialog is ever re-rendered dynamically.
  document.addEventListener('click',function(e){
    const refresh=e.target.closest?.('#refreshCertificatePreview');
    if(refresh){e.preventDefault();e.stopPropagation();safeRefreshCertificate();return;}
    const print=e.target.closest?.('#printCertificate');
    if(print){e.preventDefault();e.stopPropagation();safePrintCertificate();return;}
  });
})();

// Keep weekly dashboard synchronized when context filters change.
[subjectFilter,gradeFilter,classFilter].forEach(el=>{
  if(el) el.addEventListener('change',()=>{ if($('#view-weekly')?.classList.contains('active')) setTimeout(renderWeekly,0); });
});

// Production clean-state guard: show no demo statistics when there are no real diagnostic scores.
function enforceCleanOverview(){
  try{
    const assessments=(typeof currentContextAssessments==='function'?currentContextAssessments():[])
      .filter(a=>!a.weekly&&!String(a.type||'').startsWith('اختبار قصير'));
    const allScores=typeof loadAllScores==='function'?loadAllScores():{};
    let realRows=[];
    assessments.forEach(a=>{
      const s=allScores[assessmentKey(a.id)];
      if(s?.rows?.length) realRows.push(...s.rows.filter(r=>Number.isFinite(Number(r.score))));
    });
    if(!realRows.length){
      const vals={diagCount:'0',masteryRate:'—',needIntervention:'0'};
      Object.entries(vals).forEach(([id,val])=>{const el=document.getElementById(id);if(el)el.textContent=val});
      document.querySelectorAll('#view-overview .progress-fill').forEach(el=>el.style.width='0%');
      document.querySelectorAll('#view-overview .progress-row strong').forEach(el=>el.textContent='—');
    }
  }catch(e){console.warn('Clean overview guard',e)}
}
window.addEventListener('load',()=>setTimeout(enforceCleanOverview,150));

;


/* ===== MISBAR extracted script 3: v4-final-functional-patch ===== */

(function(){
  function ensureAboutView(){
    if(document.getElementById('view-about')) return;
    const workspace=document.querySelector('.workspace');
    if(!workspace) return;
    const v=document.createElement('div');
    v.className='view';
    v.id='view-about';
    v.innerHTML=`
      <div class="panel">
        <div class="panel-head"><div><span class="eyebrow">عن المبادرة</span><h3>مِسبار زايد | ZAYED MISBAR</h3></div></div>
        <p>منصة تعليمية لمتابعة رحلة التعلّم من التشخيص إلى تحديد الفجوات، واختيار الإجراء، والمتابعة، وإعادة القياس، وتوثيق الأثر.</p>
        <div class="journey">
          <div class="step"><b>1</b><span>التشخيص</span></div><div class="arrow">←</div>
          <div class="step"><b>2</b><span>فجوات التعلّم</span></div><div class="arrow">←</div>
          <div class="step"><b>3</b><span>الإجراء</span></div><div class="arrow">←</div>
          <div class="step"><b>4</b><span>المتابعة</span></div><div class="arrow">←</div>
          <div class="step"><b>5</b><span>إعادة القياس</span></div><div class="arrow">←</div>
          <div class="step"><b>6</b><span>الأثر</span></div>
        </div>
        <div class="access-banner">المواد المدرجة: العلوم، الرياضيات، اللغة العربية، اللغة الإنجليزية.</div>
      </div>`;
    workspace.appendChild(v);
  }

  ensureAboutView();

  // Fix top navigation while logged in.
  document.querySelectorAll('#publicNav a').forEach(a=>{
    a.addEventListener('click',function(e){
      if(!document.body.classList.contains('app-mode')) return;
      e.preventDefault();
      const href=(this.getAttribute('href')||'').replace('#','');
      if(href==='about'){
        ensureAboutView();
        showView('about');
        const wt=document.getElementById('workspaceTitle'); if(wt)wt.textContent='عن المنصة';
      }else if(href==='subjects'){
        showView('assessments');
      }else if(href==='impact'){
        showView('impact');
      }else if(href==='saif'){
        if(!saifDialog.open)saifDialog.showModal();
      }
    },true);
  });

  // Improve Saif routing and real-data answers.
  window.routeFromSaif=function(raw){
    const t=String(raw||'').toLowerCase();
    const map=[
      [['درجة','درجات','إدخال الدرجات'],'scores'],
      [['فجوة','فجوات'],'gaps'],
      [['إجراء','علاجي','علاج'],'interventions'],
      [['دليل','أدلة','شواهد'],'evidence'],
      [['إعادة القياس'],'remeasure'],
      [['متابعة','كويز','quiz','اختبار قصير'],'weekly'],
      [['سجل الأثر','الأثر'],'impact'],
      [['تقرير','تقارير'],'reports'],
      [['شهادة','شهادات','تميز','تقدير'],'recognition'],
      [['اختبار تشخيصي','الاختبارات التشخيصية','تشخيص'],'assessments'],
      [['ملف الطالب','ملف الطالبة'],'student']
    ];
    for(const [keys,v] of map){
      if(keys.some(k=>t.includes(k))){
        if(saifDialog?.open)saifDialog.close();
        setTimeout(()=>showView(v),40);
        return v;
      }
    }
    return null;
  };

  window.demoSaifAnswer=function(q){
    const t=String(q||'').trim();
    if(!t)return'اكتب أو قل طلبك.';
    const low=t.toLowerCase();

    if(low.includes('حالة')&&(low.includes('شعبة')||low.includes('6g')||low.includes('صف'))){
      const total=(typeof rosterForCurrentClass==='function'?rosterForCurrentClass().length:roster.length)||0;
      const lv=typeof studentLevelsFromLatest==='function'?studentLevelsFromLatest():{all:[],good:[],medium:[],danger:[],assessment:null};
      if(!lv.assessment){
        return `الشعبة الحالية تضم ${total} طالبًا/طالبة. لا توجد نتائج تشخيصية معتمدة بعد، لذلك الإتقان والفجوات ما زالت بانتظار إدخال النتائج.`;
      }
      const entered=lv.all.length, mastery=entered?Math.round(lv.good.length/entered*100):0;
      return `في الشعبة الحالية ${total} طالبًا/طالبة، وتم تشخيص ${entered}. نسبة الإتقان ${mastery}%. يحتاج ${lv.medium.length} إلى دعم و${lv.danger.length} إلى تدخل علاجي مكثف.`;
    }

    const v=routeFromSaif(t);
    const replies={
      scores:'فتحت إدخال الدرجات.',
      gaps:'فتحت فجوات التعلّم.',
      interventions:'فتحت الإجراءات العلاجية.',
      evidence:'فتحت الأدلة والشواهد.',
      remeasure:'فتحت إعادة القياس.',
      weekly:'فتحت الاختبارات القصيرة Quiz.',
      impact:'فتحت سجل الأثر.',
      reports:'فتحت التقارير.',
      recognition:'فتحت التميز والتقدير.',
      assessments:'فتحت الاختبارات التشخيصية.',
      student:'فتحت ملف الطالب/الطالبة.'
    };
    if(v)return replies[v]||'تم تنفيذ طلبك.';
    if(low.includes('اشرح')||low.includes('نبض'))return 'سيظهر تحليل الشعبة اعتمادًا على النتائج الحقيقية المحفوظة في المنصة.';
    return 'يمكنني عرض حالة الشعبة أو فتح الاختبارات والدرجات والفجوات والإجراءات والأدلة وإعادة القياس والمتابعة والتقارير.';
  };

  const send=document.getElementById('sendSaif');
  if(send) send.onclick=()=>{
    const ans=demoSaifAnswer(document.getElementById('saifInput').value);
    document.getElementById('saifResponse').textContent=ans;
    if(typeof speak==='function')speak(ans);
  };

  // Make impact refresh visibly respond.
  const refresh=document.getElementById('refreshImpact');
  if(refresh){
    refresh.addEventListener('click',()=>{
      try{renderImpact()}catch(e){}
      const old=refresh.textContent;
      refresh.textContent='تم التحديث ✓';
      setTimeout(()=>refresh.textContent=old,1200);
    });
  }

  // Close open dialogs when browser Back/Forward is used so the page never remains trapped.
  window.addEventListener('popstate',()=>{
    document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});
  });

  // Remove old empty auto-created diagnostic assessments once, but preserve any assessment with saved scores.
  try{
    const migration='misbarCleanupEmptyAutoDiagnosticV2';
    if(!localStorage.getItem(migration) && typeof loadAssessments==='function' && typeof loadAllScores==='function'){
      const all=loadAssessments(), scores=loadAllScores();
      const kept=all.filter(a=>{
        const saved=scores[(a.context||'')+'|'+a.id];
        return a.weekly || saved?.rows?.length || a.status!=='not_started';
      });
      if(kept.length!==all.length)saveAssessments(kept);
      localStorage.setItem(migration,'1');
      setTimeout(()=>{try{refreshAssessmentUI()}catch(e){}},80);
    }
  }catch(e){}
})();

;


/* ===== MISBAR extracted script 4: v60-hardening ===== */

(function(){
  try{localStorage.removeItem('misbarZayedSavedPasswordV1')}catch(e){}
  window.addEventListener('DOMContentLoaded',()=>{
    const p=document.getElementById('loginPassword'); if(p) p.value='';
  });
})();

;


/* ===== MISBAR extracted script 5: misbar-password-recovery-v63 ===== */

/* V63 — استعادة/تغيير كلمة المرور للحسابات المحلية */
(function(){
  const css=document.createElement('style');
  css.textContent=`
    .misbar-pass-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    .misbar-pass-link{border:0;background:transparent;color:#0d4f78;font-weight:800;cursor:pointer;padding:6px 2px;text-decoration:underline;text-underline-offset:3px}
    .misbar-reset-box{border:1px solid #d8e2e8;border-radius:16px;padding:16px;background:#fff;direction:rtl;text-align:right;max-width:520px}
    .misbar-reset-box label{display:block;font-weight:800;margin:10px 0 5px}.misbar-reset-box input{width:100%;box-sizing:border-box;padding:11px;border:1px solid #bdcbd3;border-radius:10px}
    .misbar-reset-actions{display:flex;gap:8px;justify-content:flex-start;margin-top:14px;flex-wrap:wrap}
  `; document.head.appendChild(css);

  function el(id){return document.getElementById(id)}
  function users(){ try{return typeof loadUsers==='function'?loadUsers():[]}catch(e){return[]} }
  function persist(arr){ if(typeof saveUsers==='function') saveUsers(arr); }
  async function hash(v){ return typeof misbarPasswordHash==='function'?await misbarPasswordHash(v):String(v); }

  const loginFields=el('loginFields');
  if(loginFields && !el('forgotPasswordBtn')){
    const row=document.createElement('div'); row.className='misbar-pass-actions';
    row.innerHTML='<button type="button" class="misbar-pass-link" id="forgotPasswordBtn">نسيت كلمة المرور؟ استعادة / تغيير</button>';
    const submit=el('loginSubmit'); loginFields.insertBefore(row, submit);
  }

  const dlg=document.createElement('dialog'); dlg.id='passwordRecoveryDialog'; dlg.dir='rtl';
  dlg.innerHTML=`<form method="dialog" class="misbar-reset-box" id="passwordRecoveryForm">
    <h3 style="margin-top:0">استعادة / تغيير كلمة المرور</h3>
    <p class="note">لصاحبة المنصة: استخدمي الاسترداد فقط عند التفعيل الأول أو عند الحاجة لإعادة تهيئة الحساب السحابي.</p>
    <label>البريد الإلكتروني</label><input id="recoveryEmail" type="email" autocomplete="username" placeholder="name@school.ae" required>
    <label>كلمة المرور الجديدة</label><input id="recoveryNewPassword" type="password" autocomplete="new-password" placeholder="6 أحرف على الأقل" minlength="6" required>
    <label>تأكيد كلمة المرور الجديدة</label><input id="recoveryConfirmPassword" type="password" autocomplete="new-password" placeholder="أعيدي كتابة كلمة المرور" minlength="6" required>
    <div id="recoveryStatus" class="note" style="margin-top:10px;color:#8a3b12"></div>
    <div class="misbar-reset-actions"><button type="button" class="btn primary" id="doPasswordReset">حفظ كلمة المرور الجديدة</button><button type="button" class="btn ghost" id="cancelPasswordReset">إلغاء</button></div>
  </form>`;
  document.body.appendChild(dlg);

  function openReset(){
    const email=(el('loginEmail')?.value||localStorage.getItem('misbarZayedLastEmailV1')||'').trim().toLowerCase();
    el('recoveryEmail').value=email; el('recoveryNewPassword').value=''; el('recoveryConfirmPassword').value=''; el('recoveryStatus').textContent='';
    dlg.showModal(); setTimeout(()=>el(email?'recoveryNewPassword':'recoveryEmail')?.focus(),50);
  }
  el('forgotPasswordBtn')?.addEventListener('click',openReset);
  el('cancelPasswordReset')?.addEventListener('click',()=>dlg.close());
  el('doPasswordReset')?.addEventListener('click',async()=>{
    const email=el('recoveryEmail').value.trim().toLowerCase(), p1=el('recoveryNewPassword').value, p2=el('recoveryConfirmPassword').value, st=el('recoveryStatus');
    st.style.color='#8a3b12'; st.textContent='';
    if(!email){st.textContent='أدخلي البريد الإلكتروني المسجل.';return}
    if(p1.length<6){st.textContent='كلمة المرور يجب أن تكون 6 أحرف على الأقل.';return}
    if(p1!==p2){st.textContent='كلمتا المرور غير متطابقتين.';return}
    const arr=users(), i=arr.findIndex(u=>String(u.email||'').trim().toLowerCase()===email);
    if(i<0){st.textContent='لا يوجد حساب بهذا البريد على هذا الجهاز. يمكنك إنشاء حساب جديد.';return}
    arr[i]={...arr[i],passwordHash:await hash(p1)}; delete arr[i].password; persist(arr);
    try{localStorage.setItem('misbarZayedLastEmailV1',email);localStorage.removeItem('misbarZayedSavedPasswordV1');localStorage.removeItem('misbarZayedPersistentSessionV1')}catch(e){}
    st.style.color='#176b42'; st.textContent='تم تغيير كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.';
    if(el('loginEmail')) el('loginEmail').value=email;
    setTimeout(()=>{dlg.close(); if(el('loginPassword')){el('loginPassword').value='';el('loginPassword').focus()}},900);
  });

  // تغيير كلمة المرور من داخل الحساب لمن هو مسجل الدخول بالفعل.
  function addInAppButton(){
    const logout=el('logoutBtn'); if(!logout||el('changePasswordInsideBtn')) return;
    const b=document.createElement('button'); b.type='button'; b.id='changePasswordInsideBtn'; b.className='btn ghost'; b.textContent='تغيير كلمة المرور';
    b.addEventListener('click',()=>{try{if(typeof currentUser!=='undefined'&&currentUser?.email){localStorage.setItem('misbarZayedLastEmailV1',currentUser.email)}}catch(e){} openReset()});
    logout.parentNode.insertBefore(b,logout);
  }
  addInAppButton();
  new MutationObserver(addInAppButton).observe(document.body,{childList:true,subtree:true});
})();

;


/* ===== MISBAR extracted script 6: v98-remeasure-script ===== */

(function(){
  const RM_KEY='misbar_remeasure_v98';
  const q=s=>document.querySelector(s), qa=s=>Array.from(document.querySelectorAll(s));
  const esc=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#92;','"':'&quot;'}[m]));
  function ctx(){try{return contextKey()}catch(e){return [subjectFilter?.value,gradeFilter?.value,classFilter?.value].join('|')}}
  function loadRM(){try{return JSON.parse(localStorage.getItem(RM_KEY)||'[]')}catch(e){return []}}
  function saveRM(x){localStorage.setItem(RM_KEY,JSON.stringify(x))}
  function contextRM(){return loadRM().filter(x=>x.context===ctx() && (!window.currentUser?.email || x.owner===window.currentUser.email))}
  function pctLevel(p){return p>=80?['إتقان جيد','mastery']:p>=60?['يحتاج دعماً','support']:['أولوية تدخل','priority']}
  function baselineForStudent(name){
    try{
      const ints=(typeof contextInterventions==='function'?contextInterventions():[]).filter(i=>(i.students||[]).includes(name));
      for(const i of ints){const m=baselineMapForIntervention(i); if(m && Number.isFinite(Number(m[name]))) return Number(m[name]);}
      const all=loadAllScores(); const asses=currentContextAssessments().filter(a=>a.type!=='إعادة القياس' && !a.weekly);
      for(const a of asses){const ss=all[assessmentKey(a.id)]; const r=ss?.rows?.find(x=>x.name===name); if(r&&Number.isFinite(Number(r.score))){return Math.round(Number(r.score)/Number(ss.max||a.max||100)*100)}}
    }catch(e){}
    return null;
  }
  function skillOptions(){
    let set=new Set();
    try{contextInterventions().forEach(i=>{(i.actions||[i.action]).forEach(a=>a&&set.add(a));});}catch(e){}
    try{currentContextAssessments().forEach(a=>(a.skills||[]).forEach(k=>k&&set.add(k)));}catch(e){}
    ['المهارة المستهدفة بعد الإجراء العلاجي','المفهوم الذي تمت معالجته','إتقان المهارة بعد العلاج'].forEach(x=>set.add(x));
    return [...set];
  }
  function populateRM(){
    const stu=q('#rmStudentV98'), skill=q('#rmSkillV98'); if(!stu||!skill)return;
    let names=[]; try{names=rosterForCurrentClass(gradeFilter.value,classFilter.value)}catch(e){try{names=roster||[]}catch(_){}}
    const prev=stu.value; stu.innerHTML='<option value="">اختر الطالب/الطالبة</option>'+names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join(''); if(names.includes(prev))stu.value=prev;
    const prevS=skill.value, skills=skillOptions(); skill.innerHTML='<option value="">اختر المهارة أو المفهوم</option>'+skills.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join(''); if(skills.includes(prevS))skill.value=prevS;
    if(q('#rmDateV98')&&!q('#rmDateV98').value) q('#rmDateV98').value=new Date().toISOString().slice(0,10);
  }
  function updateLevel(){const max=Number(q('#rmMaxV98')?.value),score=Number(q('#rmScoreV98')?.value),out=q('#rmLevelV98'); if(!out)return; if(!Number.isFinite(max)||max<=0||!Number.isFinite(score)){out.value='';return} const p=Math.round(score/max*100); out.value=pctLevel(p)[0]+' • '+p+'%';}
  function renderRMTable(){
    const body=q('#rmTableBodyV98'); if(!body)return; const list=contextRM().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    q('#rmResultCountV98')&&(q('#rmResultCountV98').textContent=list.length);
    let gains=[]; list.forEach(x=>{const b=baselineForStudent(x.student); if(b!==null)gains.push(x.pct-b)}); q('#rmImprovedCountV98')&&(q('#rmImprovedCountV98').textContent=gains.filter(g=>g>0).length); q('#rmAvgGainV98')&&(q('#rmAvgGainV98').textContent=gains.length?((gains.reduce((a,b)=>a+b,0)/gains.length).toFixed(1)+' نقطة'):'—');
    if(!list.length){body.innerHTML='<tr><td colspan="10"><div class="rm-empty-v98"><b>لا توجد نتائج إعادة قياس حالياً.</b><span>أضيفي نتيجة جديدة عند بدء إعادة القياس.</span></div></td></tr>'; renderProgress(); return;}
    body.innerHTML=list.map((x,i)=>{const [lev,cls]=pctLevel(x.pct);return `<tr><td>${i+1}</td><td>${esc(x.student)}</td><td>${esc(x.skill)}</td><td>${esc(x.type)}</td><td>${esc(x.date)}</td><td>${esc(x.score)}</td><td>${esc(x.max)}</td><td><span class="rm-level-chip ${cls}">${lev} • ${x.pct}%</span></td><td>${esc(x.notes||'—')}</td><td><button class="rm-delete-v98" data-rmid="${esc(x.id)}">حذف</button></td></tr>`}).join('');
    qa('.rm-delete-v98').forEach(b=>b.onclick=()=>{if(confirm('هل تريد/تريدين حذف نتيجة إعادة القياس هذه؟')){saveRM(loadRM().filter(x=>x.id!==b.dataset.rmid));renderRMTable();}}); renderProgress();
  }
  function renderProgress(){const box=q('#rmProgressCardsV98'); if(!box)return; const list=contextRM(); if(!list.length){box.innerHTML='<div class="rm-empty-v98">لا توجد بيانات كافية لتقرير التحسن.</div>';return;} box.innerHTML=list.map(x=>{const b=baselineForStudent(x.student);const gain=b===null?null:x.pct-b;return `<article class="rm-progress-card"><h4>${esc(x.student)}</h4><div class="rm-progress-values"><span>قبل: ${b===null?'—':b+'%'}</span><span>بعد: ${x.pct}%</span><strong>${gain===null?'لا توجد نتيجة سابقة للمقارنة':(gain>=0?'+':'')+gain+' نقطة'}</strong></div><small>${esc(x.skill)}</small></article>`}).join('');}
  function saveOne(){
    const student=q('#rmStudentV98').value,skill=q('#rmSkillV98').value,type=q('#rmTypeV98').value,date=q('#rmDateV98').value,max=Number(q('#rmMaxV98').value),score=Number(q('#rmScoreV98').value),notes=q('#rmNotesV98').value.trim();
    if(!student){alert('اختاري الطالب/الطالبة.');return} if(!skill){alert('اختاري المهارة أو المفهوم.');return} if(!date){alert('اختاري تاريخ الاختبار.');return} if(!Number.isFinite(max)||max<=0){alert('أدخلي الدرجة النهائية بشكل صحيح.');return} if(!Number.isFinite(score)||score<0||score>max){alert('أدخلي درجة صحيحة من 0 إلى '+max+'.');return}
    const pct=Math.round(score/max*100), rec={id:'RM'+Date.now(),owner:window.currentUser?.email||'',context:ctx(),subject:subjectFilter.value,grade:gradeFilter.value,className:classFilter.value,student,skill,type,date,max,score,pct,notes,createdAt:new Date().toISOString()}; const all=loadRM(); all.push(rec); saveRM(all);
    // keep existing impact path compatible for any matching intervention, without touching diagnostic score storage
    try{const ints=loadInterventions(); const item=[...ints].reverse().find(i=>i.context===ctx()&&(i.students||[]).includes(student)); if(item){const aid='R'+Date.now(); const allScores=loadAllScores(); allScores[assessmentKey(aid)]={id:aid,type:'إعادة القياس',date:new Date().toISOString(),max,rows:[{name:student,score,max}]}; saveAllScores(allScores); item.remeasureAssessmentId=aid; item.status='done'; saveInterventions(ints);}}catch(e){}
    q('#rmSavedV98').textContent='تم الحفظ ✓'; q('#rmScoreV98').value=''; q('#rmNotesV98').value=''; updateLevel(); renderRMTable(); setTimeout(()=>{if(q('#rmSavedV98'))q('#rmSavedV98').textContent=''},2500);
  }
  function tab(name){qa('.remeasure-tab-v98').forEach(b=>b.classList.toggle('active',b.dataset.rtab===name)); q('#remeasureEntryV98').hidden=name!=='entry'; q('#remeasureResultsV98').hidden=name!=='results'; q('#remeasureProgressV98').hidden=name!=='progress'; if(name!=='entry')renderRMTable();}
  window.renderRemeasure=function(){populateRM();renderRMTable();};
  window.startRemeasure=function(interventionId){showView('remeasure'); populateRM(); try{const item=loadInterventions().find(i=>String(i.id)===String(interventionId));if(item&&item.students?.length){q('#rmStudentV98').value=item.students[0];const a=(item.actions||[item.action]).filter(Boolean)[0]; if(a){if(![...q('#rmSkillV98').options].some(o=>o.value===a)){q('#rmSkillV98').add(new Option(a,a));}q('#rmSkillV98').value=a;}}}catch(e){} tab('entry');};
  function install(){qa('.remeasure-tab-v98').forEach(b=>b.onclick=()=>tab(b.dataset.rtab)); q('#rmSaveV98')&&(q('#rmSaveV98').onclick=saveOne); q('#rmCancelV98')&&(q('#rmCancelV98').onclick=()=>{q('#rmScoreV98').value='';q('#rmNotesV98').value='';updateLevel();}); q('#rmScoreV98')?.addEventListener('input',updateLevel); q('#rmMaxV98')?.addEventListener('input',updateLevel); [q('#gradeFilter'),q('#classFilter'),q('#subjectFilter')].filter(Boolean).forEach(el=>el.addEventListener('change',()=>setTimeout(()=>{populateRM();renderRMTable()},0))); populateRM(); renderRMTable();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.MISBAR_BUILD='V99-WEEKLY-SCORE-LIMIT-FIXED';
})();

;


/* ===== MISBAR extracted script 7: misbar-cloud-sync-v1 ===== */

(function(){
  const nativeSet=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){const r=nativeSet.call(this,k,v);try{if(this===localStorage&&(String(k).startsWith('misbarZayed')||String(k).startsWith('misbar_')))scheduleCloudPush()}catch(e){}return r};
  window.addEventListener('online',()=>{updateCloudBadge('متصل');scheduleCloudPush()});
  window.addEventListener('offline',()=>updateCloudBadge('دون اتصال'));
  setInterval(()=>{try{if(cloudToken())pushCloudNow()}catch(e){}},60000);
  document.addEventListener('DOMContentLoaded',()=>{if(cloudToken())updateCloudBadge(navigator.onLine?'متصل':'دون اتصال')});
})();

;


/* ===== MISBAR extracted script 8: misbar-v14-ui ===== */

document.addEventListener('DOMContentLoaded',()=>{
  const sidebar=document.querySelector('#appShell .sidebar');
  if(sidebar&&!sidebar.querySelector('.v14-appbrand')){
    const d=document.createElement('div');d.className='v14-appbrand';
    d.innerHTML='<div class="v14-logo">م</div><div class="v14-brandtext"><b>مِسبار زايد</b><span>ZAYED MISBAR</span><small>بالميثاق نبلغ الآفاق</small></div>';
    sidebar.insertBefore(d,sidebar.firstChild);
  }
  const workspace=document.querySelector('#appShell .workspace');
  const wh=workspace?.querySelector('.workspace-head');
  if(workspace&&wh&&!workspace.querySelector('.v14-header')){
    const h=document.createElement('div');h.className='v14-header';
    h.innerHTML='<div class="v14-header-title"><h1>مِسبار زايد | منصة رحلة التقدّم الأكاديمي</h1><p>نرصد التقدّم • نعالج الفجوات • نقيس الأثر</p></div><div class="v14-saif"><div><b>مرحبًا بك</b><small>أنا سيف مساعدك الذكي</small></div><div class="bot">🤖</div></div>';
    workspace.insertBefore(h,wh);
    const sync=document.createElement('div');sync.className='v14-syncstrip';sync.innerHTML='<span>☁️ المزامنة السحابية مفعلة</span><span>الدرجات والبيانات تُحفظ في Google Sheets وتُسترجع عند تسجيل الدخول</span>';
    wh.insertAdjacentElement('afterend',sync);
  }
});

;


/* ===== MISBAR extracted script 9: misbar-parent-report-v15 ===== */

(function(){
  function escParent(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function parentLevel(v){return v==null?'بانتظار البيانات':v>=80?'متقن':v>=60?'في طور التقدّم':'يحتاج دعمًا';}
  function parentChartSvg(points){
    if(!points.length) return '<div class="empty">لا توجد نتائج كافية لرسم مستوى الطالبة حتى الآن.</div>';
    const W=760,H=260,pad=52,maxX=Math.max(points.length-1,1),x=i=>pad+i*(W-pad*2)/maxX,y=v=>H-pad-(v/100)*(H-pad*2);
    let grid=''; [0,20,40,60,80,100].forEach(v=>grid+=`<line x1="${pad}" y1="${y(v)}" x2="${W-pad}" y2="${y(v)}" stroke="#dbe7ef"/><text x="${pad-10}" y="${y(v)+4}" text-anchor="end" font-size="12" fill="#61778a">${v}%</text>`);
    const poly=points.map((p,i)=>`${x(i)},${y(p.pct)}`).join(' ');
    const dots=points.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.pct)}" r="6" fill="#176a8a"/><text x="${x(i)}" y="${y(p.pct)-12}" text-anchor="middle" font-size="12" font-weight="700" fill="#174d7e">${p.pct}%</text><text x="${x(i)}" y="${H-18}" text-anchor="middle" font-size="11" fill="#536d80">${escParent(p.label)}</text>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="الرسم البياني لتطور المستوى الأكاديمي">${grid}<line x1="${pad}" y1="${y(80)}" x2="${W-pad}" y2="${y(80)}" stroke="#78a86b" stroke-dasharray="6 6"/><polyline points="${poly}" fill="none" stroke="#176a8a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${dots}</svg>`;
  }
  function openParentReport(){
    const name=(window.activeStudentName||document.getElementById('studentProfileSelect')?.value||'').trim();
    if(!name){alert('اختاري الطالبة أولًا لعرض تقرير ولي الأمر.');return;}
    const pts=studentSeries(name), base=pts[0]?.pct, last=pts[pts.length-1]?.pct;
    const delta=(base!=null&&last!=null)?last-base:null, high=pts.length?Math.max(...pts.map(p=>p.pct)):null;
    const trend=delta==null?'بانتظار متابعة إضافية':delta>0?'تحسّن ملحوظ':delta<0?'يحتاج متابعة ودعم':'مستوى مستقر';
    const ints=studentInterventionsFor(name);
    const actions=ints.length?ints.slice(-4).map(i=>`<li>${escParent(i.action||'إجراء دعم تعليمي')}</li>`).join(''):'<li>لا توجد إجراءات علاجية مسجلة حتى الآن.</li>';
    const results=pts.length?pts.map(p=>`<tr><td>${escParent(p.label)}</td><td>${escParent(p.raw)}</td><td>${p.pct}%</td><td>${parentLevel(p.pct)}</td></tr>`).join(''):'<tr><td colspan="4">لا توجد نتائج محفوظة.</td></tr>';
    const subject=document.getElementById('subjectFilter')?.value||'—', grade=document.getElementById('gradeFilter')?.value||'—', cls=document.getElementById('classFilter')?.value||'—';
    const teacher=(window.currentUser&&currentUser.name)||'المعلم/المعلمة';
    const summary=last==null?'لم تُسجل بيانات كافية بعد لإصدار قراءة للمستوى.':`المستوى الحالي: ${parentLevel(last)} (${last}%). ${delta==null?'تحتاج الطالبة إلى متابعة إضافية لقياس اتجاه النمو.':`التغير منذ أول قياس ${delta>=0?'+':''}${delta} نقطة مئوية، والاتجاه العام: ${trend}.`}`;
    const w=window.open('','_blank'); if(!w){alert('يرجى السماح بالنوافذ المنبثقة لفتح تقرير ولي الأمر.');return;}
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>تقرير ولي الأمر - ${escParent(name)}</title><style>
      @page{size:A4 portrait;margin:12mm}*{box-sizing:border-box}body{margin:0;font-family:Tahoma,Arial,sans-serif;background:#eef5f9;color:#173653}.page{width:100%;max-width:900px;margin:18px auto;background:white;padding:28px;border-radius:22px;border:1px solid #d8e5ed}.head{text-align:center;border-bottom:3px solid #d8b55a;padding-bottom:16px}.head h1{margin:0;color:#174d7e;font-size:26px}.head h2{margin:5px 0 0;font-size:19px}.school{color:#667d8e;margin-top:5px}.info{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin:18px 0}.info div,.kpis div{background:#f4f8fb;border:1px solid #dce8ef;border-radius:12px;padding:10px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:15px 0}.kpis strong{display:block;font-size:22px;color:#174d7e}.kpis span{font-size:12px;color:#657b8d}.card{border:1px solid #dce8ef;border-radius:16px;padding:16px;margin-top:14px}.card h3{margin:0 0 10px;color:#174d7e}.chart svg{width:100%;height:auto}.summary{background:#f6f9ef;border-right:5px solid #91a95e;padding:12px;border-radius:10px;line-height:1.9}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #dce8ef;padding:8px;text-align:center}th{background:#edf5fa}ul{margin:0;padding-right:22px}.footer{margin-top:18px;padding-top:12px;border-top:1px solid #dce8ef;display:flex;justify-content:space-between;color:#667d8e;font-size:12px}.actions{text-align:center;margin:18px}.actions button{border:0;border-radius:10px;padding:10px 18px;background:#174d7e;color:#fff;font-weight:700;cursor:pointer}@media print{body{background:#fff}.page{margin:0;max-width:none;border:0;border-radius:0;padding:0}.actions{display:none}}
    </style></head><body><div class="actions"><button onclick="window.print()">طباعة / حفظ PDF</button></div><main class="page"><header class="head"><h1>مِسبار زايد | منصة رحلة التقدّم الأكاديمي</h1><h2>تقرير رحلة التقدّم الأكاديمي للطالبة</h2><div class="school">مجمع زايد التعليمي – الساف</div></header>
    <section class="info"><div><b>اسم الطالبة:</b> ${escParent(name)}</div><div><b>المادة:</b> ${escParent(subject)}</div><div><b>الصف:</b> ${escParent(grade)}</div><div><b>الشعبة:</b> ${escParent(cls)}</div></section>
    <section class="kpis"><div><strong>${base==null?'—':base+'%'}</strong><span>أول قياس</span></div><div><strong>${last==null?'—':last+'%'}</strong><span>المستوى الحالي</span></div><div><strong>${delta==null?'—':(delta>=0?'+':'')+delta}</strong><span>مقدار التغير</span></div><div><strong>${high==null?'—':high+'%'}</strong><span>أعلى نتيجة</span></div></section>
    <section class="card"><h3>الرسم البياني لتطور المستوى</h3><div class="chart">${parentChartSvg(pts)}</div><div class="summary">${escParent(summary)}</div></section>
    <section class="card"><h3>نتائج التقييمات</h3><table><thead><tr><th>التقييم</th><th>الدرجة</th><th>النسبة</th><th>المستوى</th></tr></thead><tbody>${results}</tbody></table></section>
    <section class="card"><h3>الدعم والإجراءات التعليمية</h3><ul>${actions}</ul></section>
    <footer class="footer"><span>المعلم/المعلمة: ${escParent(teacher)}</span><span>تاريخ التقرير: ${new Date().toLocaleDateString('ar-AE')}</span></footer></main></body></html>`);
    w.document.close();
  }
  document.getElementById('parentReportBtn')?.addEventListener('click',openParentReport);
})();

;
