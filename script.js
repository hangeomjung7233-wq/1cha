const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const K='ssuk';let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
S=Object.assign({name:'○○',meds:[],hospitals:[],appts:[],guardians:['아들 000님','딸 000님'],taken:[],start:'',done:0,cele:0,off:0,alerts:[],log:[]},S||{});
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){toast('저장 공간이 부족해요')}};
const pad=n=>String(n).padStart(2,'0'),esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
const ymd=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>new Date(Date.now()+S.off*864e5);
const add=(s,n)=>ymd(new Date(new Date(s+'T00:00').getTime()+n*864e5));
let tt;function toast(m){const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),2600)}

/* 복약 주기: 7일 단위 달성률은 리셋, 식물 단계(S.done)는 누적 */
function sync(){const t=ymd(today());if(!S.start)S.start=t;const d=Math.round((new Date(t+'T00:00')-new Date(S.start+'T00:00'))/864e5);if(d>6)S.start=add(S.start,Math.floor(d/7)*7);save()}
const n7=()=>S.taken.filter(d=>d>=S.start&&d<=add(S.start,6)).length,stage=()=>Math.min(S.done,3);
function markTaken(){sync();const t=ymd(today());if(!S.taken.includes(t))S.taken.push(t);if(n7()>=7){S.done++;S.cele=1;S.start=add(t,1)}save()}

/* 쑥쑥이 화분 (0 씨앗, 1 새싹, 2 꽃봉오리, 3 꽃) */
function plant(s){let p='';const h=[0,42,66,78][s];
 if(s==0)p='<ellipse cx="100" cy="120" rx="10" ry="7" fill="#8a5a2b"/>';
 else{const y=124-h;p=`<path d="M100 126V${y}" stroke="#4E9A1F" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  [-1,1].forEach(k=>{const ly=124-h*.5;p+=`<ellipse cx="${100+k*20}" cy="${ly}" rx="19" ry="9" fill="#7BC043" transform="rotate(${k*25} ${100+k*20} ${ly})"/>`});
  if(s==2)p+=`<ellipse cx="100" cy="${y-8}" rx="10" ry="15" fill="#F28C1B"/>`;
  if(s==3)p+=[0,60,120,180,240,300].map(a=>`<circle cx="${100+16*Math.cos(a*Math.PI/180)}" cy="${y-6+16*Math.sin(a*Math.PI/180)}" r="11" fill="#F28C1B"/>`).join('')+`<circle cx="100" cy="${y-6}" r="11" fill="#FFD54A"/>`}
 return `<svg viewBox="0 0 200 230" role="img" aria-label="쑥쑥이 화분">${p}<rect x="46" y="124" width="108" height="18" rx="9" fill="#D9822B"/><path d="M56 140h88l-12 62q-2 10-12 10H80q-10 0-12-10z" fill="#EDA25A"/><circle cx="82" cy="168" r="6" fill="#2a2a22"/><circle cx="118" cy="168" r="6" fill="#2a2a22"/><circle cx="72" cy="182" r="7" fill="#F7B38C"/><circle cx="128" cy="182" r="7" fill="#F7B38C"/><path d="M89 179q11 12 22 0" stroke="#2a2a22" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`}

/* 화면 이동 */
const R={1:home,3:()=>{$('#q').value='';selH=null;showH()},4:cal,5:link,6:()=>{const c=$('#c6');if(!c.children.length)bot(c,`안녕하세요? 저는 ${esc(S.name)}님의 건강 길잡이 쑥쑥이라고 해요!`)},7:chat7,8:()=>{$('#own').value=''},9:scale,10:grow};
function go(n){sync();$$('section').forEach(s=>s.classList.toggle('on',s.id=='s'+n));scrollTo(0,0);R[n]&&R[n]()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(+b.dataset.go)});
document.addEventListener('click',e=>{const b=e.target.closest('.chips button');if(!b)return;const c=b.parentNode;if(c.classList.contains('multi'))b.classList.toggle('sel');else{c.querySelectorAll('button').forEach(x=>x.classList.remove('sel'));b.classList.add('sel')}});

/* 1 홈 */
function home(){$('#homePlant').innerHTML=plant(stage());const n=S.meds.length;
 $('#hello').innerHTML=`안녕하세요, ${esc(S.name)}님<br>`+(n?`오늘 복용할 약이 <span style="color:var(--o)">${n}개</span> 있어요`:'먼저 복용할 약을 등록해 주세요');
 const a=S.appts.find(x=>x.d==add(ymd(today()),1)),r=$('#remind');r.hidden=!a;if(a)r.textContent=`내일 ${a.h} 진료가 있어요`}

/* 2 약물 등록 */
const PH='<i>📷</i>약물 사진을 등록해주세요<small>눌러서 촬영하거나 사진 고르기</small>';let img='';$('#photoTxt').innerHTML=PH;
$('#pic').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=200/Math.max(i.width,i.height),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);img=c.toDataURL('image/jpeg',.7);$('#photoTxt').innerHTML=`<img src="${img}" alt="약물 사진">`};i.src=r.result};r.readAsDataURL(f)};
$('#rx').onclick=()=>$('#rxf').click();$('#rxf').onchange=e=>{if(e.target.files[0])toast('처방전을 받았어요. 약 이름을 확인해서 적어주세요')};
$('#saveMed').onclick=()=>{const name=$('#mname').value.trim();if(!name)return toast('약 이름을 입력해주세요');const g=k=>$$(`[data-k=${k}] .sel`).map(b=>b.textContent);
 S.meds.push({name,img,dose:g('dose')[0]||'1정',freq:g('freq')[0]||'1회',when:g('when'),time:$('#mtime').value});save();
 $('#mname').value='';$('#mtime').value='';img='';$('#photoTxt').innerHTML=PH;toast(`${name} 약이 등록되었어요`);go(1)};

/* 3 병원 등록 (예시 데이터) */
const HOSP=[['서울튼튼내과의원','내과','서울시 종로구 대학로 12','02-123-4567'],['햇살정형외과','정형외과','서울시 마포구 월드컵로 34','02-234-5678'],['푸른안과의원','안과','서울시 송파구 올림픽로 56','02-345-6789'],['온누리가정의학과','가정의학과','경기도 성남시 분당구 정자로 78','031-456-7890'],['한마음대학병원','종합병원','서울시 강남구 테헤란로 90','02-567-8901'],['다정이비인후과','이비인후과','부산시 해운대구 해운대로 21','051-678-9012']];
let selH=null;
function showH(){const q=$('#q').value.trim();$('#hres').innerHTML=HOSP.map((h,i)=>({h,i})).filter(o=>o.h[0].includes(q)).map(({h,i})=>`<div class="card ${selH==i?'sel':''}" data-h="${i}">${selH==i?'<span class="ck">✔</span>':''}<b>${h[0]}</b>${h[1]}<br><b style="font-weight:600;font-size:20px">${h[2]}</b>📞 ${h[3]}</div>`).join('')||'<p class="small">검색 결과가 없어요</p>'}
$('#q').oninput=showH;$('#hres').onclick=e=>{const c=e.target.closest('[data-h]');if(c){selH=+c.dataset.h;showH()}};
$('#regH').onclick=()=>{if(selH==null)return toast('병원을 먼저 눌러서 선택해주세요');const n=HOSP[selH][0];if(!S.hospitals.includes(n))S.hospitals.push(n);save();toast(`${n}이(가) 등록되었습니다.`);setTimeout(()=>go(1),1600)};

/* 4 외래 일정 */
let cm=new Date(today().getFullYear(),today().getMonth(),1),eid=null;
const fd=a=>{const d=new Date(a.d+'T00:00'),h=+a.t.slice(0,2);return `${d.getMonth()+1}월 ${d.getDate()}일 ${'일월화수목금토'[d.getDay()]}요일 ${h<12?'오전':'오후'} ${h%12||12}:${a.t.slice(3)}`};
const acard=(a,big)=>`<div class="card ${big?'big':''}"><button class="ed" data-e="${a.id}">수정</button>${fd(a)}<b>${esc(a.h)}</b>${esc(a.p||'진료')}</div>`;
function cal(){const y=cm.getFullYear(),m=cm.getMonth(),t=ymd(today());let h=[...'일월화수목금토'].map(x=>`<i>${x}</i>`).join('')+'<b></b>'.repeat(cm.getDay());
 for(let d=1;d<=new Date(y,m+1,0).getDate();d++){const s=`${y}-${pad(m+1)}-${pad(d)}`;h+=`<b class="${s==t?'today':''}">${d}${S.appts.some(a=>a.d==s)?'<u>🏥</u>':''}</b>`}
 $('#cal').innerHTML=h;$('#mon').textContent=`${y}년 ${m+1}월`;
 const up=S.appts.filter(a=>a.d>=t).sort((a,b)=>(a.d+a.t).localeCompare(b.d+b.t));
 $('#near').innerHTML=up[0]?acard(up[0],1):'<p class="small">예정된 진료가 없어요</p>';$('#rest').innerHTML=up.slice(1).map(a=>acard(a)).join('')}
$('#pm').onclick=()=>{cm.setMonth(cm.getMonth()-1);cal()};$('#nm').onclick=()=>{cm.setMonth(cm.getMonth()+1);cal()};
function openD(a){eid=a?a.id:null;$('#dh').value=a?a.h:(S.hospitals[0]||'');$('#dd').value=a?a.d:ymd(today());$('#dt').value=a?a.t:'';$('#dp').value=a?a.p:'';$('#dlg').showModal()}
$('#addA').onclick=()=>openD();$('#dno').onclick=()=>$('#dlg').close();
$('#s4').onclick=e=>{const b=e.target.closest('[data-e]');if(b)openD(S.appts.find(a=>a.id==b.dataset.e))};
$('#dsave').onclick=()=>{const a={id:eid||Date.now(),h:$('#dh').value.trim(),d:$('#dd').value,t:$('#dt').value,p:$('#dp').value.trim()};if(!a.h||!a.d||!a.t)return toast('병원, 날짜, 시간을 입력해주세요');
 const i=S.appts.findIndex(x=>x.id==a.id);i<0?S.appts.push(a):S.appts[i]=a;save();$('#dlg').close();cal();toast('진료 일정이 저장되었어요')};

/* 5 보호자·의료진 연계 */
function link(){$('#gl').innerHTML=S.guardians.map(g=>`<div class="card"><b>${esc(g)}</b><button class="cta s" data-c="${esc(g)}">연락하기</button></div>`).join('');
 $('#hl').innerHTML=(S.hospitals.length?S.hospitals:['00병원','■■병원']).map(h=>`<div class="card"><b>${esc(h)}</b><button class="cta s" data-i="${esc(h)}">문의하기</button></div>`).join('')}
$('#s5').onclick=e=>{const c=e.target.closest('[data-c]'),i=e.target.closest('[data-i]');if(c)toast(`${c.dataset.c}에게 연락해요`);if(i)toast(`${i.dataset.i}에 문의해요`)};
$('#addG').onclick=()=>{let n=(prompt('보호자 이름을 적어주세요 (예: 아들 홍길동)')||'').trim();if(!n)return;if(!n.endsWith('님'))n+='님';S.guardians.push(n);save();link()};

/* 6~8 챗봇 */
function bot(c,h){c.insertAdjacentHTML('beforeend',`<div class="bot"><span class="av">🪴</span><div class="b">${h}</div></div>`);c.lastChild.scrollIntoView({block:'end'})}
function me(c,t){c.insertAdjacentHTML('beforeend',`<div class="b u">${t}</div>`);c.lastChild.scrollIntoView({block:'end'})}
function chat7(){const c=$('#c7'),m=S.meds[0]||{name:'혈압약'};c.innerHTML='';bot(c,'아침약 드셨나요?');
 bot(c,`${m.img?`<img class="mp" src="${m.img}" alt="">`:'<div class="mp">💊</div>'}<b>${esc(m.name)}</b><div class="yn"><button class="cta" data-y="1">예</button><button class="cta no" data-y="0">아니요</button></div>`)}
$('#c7').onclick=e=>{const b=e.target.closest('[data-y],[data-z]'),c=$('#c7');if(!b)return;b.parentNode.remove();
 if(b.dataset.y=='1'){me(c,'예');markTaken();bot(c,'잘하셨어요! 30분 뒤에 몸이 어떤지 여쭤볼게요.<button class="cta s" data-go="8">30분 뒤로 이동 (시연)</button>')}
 else if(b.dataset.y=='0'){me(c,'아니요');bot(c,'혹시 식사를 안 하셨나요?<div class="yn"><button class="cta" data-z="1">예</button><button class="cta no" data-z="0">아니요</button></div>')}
 else{me(c,b.dataset.z=='1'?'예':'아니요');bot(c,'식사 후에 약을 꼭 챙겨 드세요. 쑥쑥이가 다시 알려드릴게요.<button class="cta s" data-go="1">홈으로</button>')}};
let sym='없음';
function done(v){S.log.push({d:ymd(today()),sym,v});
 /* 5점 이상: 보호자 자동 알림 / 하루 3회 이상: 의료진 자동 연계 (사용자에게는 표시하지 않음) */
 if(v>=5){const t=ymd(today());S.alerts.push({to:'보호자',d:t,sym,v});if(S.log.filter(x=>x.d==t&&x.v>=5).length>=3)S.alerts.push({to:'의료진',d:t,name:S.name,sym,v,meds:S.meds.map(m=>m.name)})}
 save();toast('알려주셔서 고마워요. 푹 쉬세요.');go(1)}
$('#s8').onclick=e=>{const b=e.target.closest('[data-sy]');if(!b)return;sym=b.dataset.sy;sym=='없음'?done(0):go(9)};
$('#ownOk').onclick=()=>{const v=$('#own').value.trim();if(!v)return toast('증상을 적어주세요');sym=v;go(9)};

/* 9 부작용 척도 (0~10, 한 줄) */
const FACE=['😄','🙂','🙂','😐','😐','😟','😟','😣','😣','😭','😭'],LB=['괜찮아요','조금 불편해요','조금 불편해요','불편해요','불편해요','꽤 힘들어요','꽤 힘들어요','많이 힘들어요','많이 힘들어요','너무 힘들어요','너무 힘들어요'];let sc=-1;
function scale(){sc=-1;$('#bf').textContent='👆';$('#lbl').textContent='아래 숫자를 눌러주세요';$('#scale').innerHTML=FACE.map((f,i)=>`<button data-v="${i}" style="background:hsl(${120-i*12} 70% 82%)" aria-label="${i}점 ${LB[i]}"><span>${f}</span>${i}</button>`).join('')}
$('#scale').onclick=e=>{const b=e.target.closest('[data-v]');if(!b)return;sc=+b.dataset.v;$$('#scale button').forEach(x=>x.classList.toggle('sel',x==b));$('#bf').textContent=FACE[sc];$('#lbl').textContent=`${sc}점 · ${LB[sc]}`};
$('#scOk').onclick=()=>sc<0?toast('숫자를 눌러서 골라주세요'):done(sc);

/* 10 식물 성장 */
function grow(){const n=n7(),st=stage(),N=['씨앗','새싹','꽃봉오리','활짝 핀 꽃'],E=['🌰','🌱','🌷','🌸'];
 $('#g').innerHTML=`<p>이번 주 복약 달성률</p><p class="big">${n}/7일</p><p class="pct">${Math.round(n/7*100)}%</p><div class="dots">${[...Array(7)].map((_,i)=>`<span class="${i<n?'f':''}"></span>`).join('')}</div>
 <div class="stage ${S.cele?'pop':''}">${plant(st)}</div><p>현재 단계: <b>${N[st]}</b> ${E[st]}</p><p><b>${st<3?`다음 성장까지 ${7-n}일 남았어요!`:'꽃이 활짝 피었어요. 계속 잘 돌봐주세요!'}</b></p>
 <div class="flow">${E.map((e,i)=>`<span class="${i==st?'cur':''}">${e}</span>`).join('<em>→</em>')}</div>`;$('#cele').hidden=!S.cele}
$('#ok').onclick=()=>{S.cele=0;save();grow()};$('#skip').onclick=()=>{S.off++;sync();grow()};

sync();home();
