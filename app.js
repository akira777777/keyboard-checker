const codeFor = label => ({'`':'Backquote','-':'Minus','=':'Equal','[':'BracketLeft',']':'BracketRight','\\':'Backslash',';':'Semicolon',"'":'Quote',',':'Comma','.':'Period','/':'Slash'}[label] || `Key${label}`);
const rows = [
  [{label:'Esc',code:'Escape',hint:'esc'},...['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'].map(label=>({label,code:label})),{label:'PrtSc',code:'PrintScreen'},{label:'Del',code:'Delete'}],
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace'].map(label=>({label,code:label==='Backspace'?'Backspace':(label.length===1&&/\d/.test(label)?`Digit${label}`:codeFor(label))})),
  [{label:'Tab',code:'Tab',className:'w-125'},...['Q','W','E','R','T','Y','U','I','O','P','[',']'].map(label=>({label,code:`Key${label}`})),{label:'\\',code:'Backslash'}],
  [{label:'Caps Lock',code:'CapsLock',className:'w-150'},...['A','S','D','F','G','H','J','K','L',';','\''].map(label=>({label,code:codeFor(label)})),{label:'Enter',code:'Enter',className:'w-150'}],
  [{label:'Shift',code:'ShiftLeft',className:'w-175'},...['Z','X','C','V','B','N','M',',','.','/'].map(label=>({label,code:codeFor(label)})),{label:'Shift',code:'ShiftRight',className:'w-225'}],
  [{label:'Ctrl',code:'ControlLeft'}, {label:'Win',code:'MetaLeft'}, {label:'Alt',code:'AltLeft'}, {label:'Space',code:'Space',className:'w-650'}, {label:'Alt',code:'AltRight'}, {label:'Fn',code:'Fn'}, {label:'Ctrl',code:'ControlRight'}, {label:'←',code:'ArrowLeft'}, {label:'↓',code:'ArrowDown'}, {label:'→',code:'ArrowRight'}]
];
const nav = [[{label:'Ins',code:'Insert'},{label:'Home',code:'Home'},{label:'PgUp',code:'PageUp'}],[{label:'Del',code:'Delete'},{label:'End',code:'End'},{label:'PgDn',code:'PageDown'}]];
const numpad = [[{label:'Num',code:'NumLock'},{label:'/',code:'NumpadDivide'},{label:'*',code:'NumpadMultiply'},{label:'−',code:'NumpadSubtract'}],[{label:'7',code:'Numpad7'},{label:'8',code:'Numpad8'},{label:'9',code:'Numpad9'},{label:'+',code:'NumpadAdd',className:'tall'}],[{label:'4',code:'Numpad4'},{label:'5',code:'Numpad5'},{label:'6',code:'Numpad6'}],[{label:'1',code:'Numpad1'},{label:'2',code:'Numpad2'},{label:'3',code:'Numpad3'},{label:'Enter',code:'NumpadEnter',className:'tall'}],[{label:'0',code:'Numpad0',className:'wide'},{label:'.',code:'NumpadDecimal'}]];
const keyboard = document.querySelector('#keyboard');
const pressedCount = document.querySelector('#pressedCount');
const uniqueCount = document.querySelector('#uniqueCount');
const progressPercent = document.querySelector('#progressPercent');
const progressFill = document.querySelector('#progressFill');
const progressNote = document.querySelector('#progressNote');
const lastKey = document.querySelector('#lastKey');
const activityList = document.querySelector('#activityList');
const seen = new Set();
let totalPresses = 0;

function keyButton(data) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = `key ${data.className || ''}`; button.dataset.code = data.code; button.dataset.label = data.label;
  button.innerHTML = data.hint ? `<small>${data.hint}</small>${data.label}` : data.label;
  button.setAttribute('aria-label', `${data.label}, ${seen.has(data.code) ? 'проверена' : 'не проверена'}`);
  button.addEventListener('click', () => registerPress(data.code, data.label, button));
  return button;
}
function renderRow(items, parent = keyboard) { const row = document.createElement('div'); row.className = 'key-row'; items.forEach(item => row.appendChild(keyButton(item))); parent.appendChild(row); }
rows.forEach(row => renderRow(row));
const specialRow = document.createElement('div'); specialRow.className = 'key-row';
const navGroup = document.createElement('div'); navGroup.className = 'nav-cluster'; nav.forEach(row => { const col = document.createElement('div'); col.className='key-row'; row.forEach(item=>col.appendChild(keyButton(item))); navGroup.appendChild(col); }); specialRow.appendChild(navGroup);
const numGroup = document.createElement('div'); numGroup.className='nav-cluster'; numpad.forEach(row=>{ const col=document.createElement('div'); col.className='key-row'; row.forEach(item=>col.appendChild(keyButton(item))); numGroup.appendChild(col); }); specialRow.appendChild(numGroup); keyboard.appendChild(specialRow);
const totalKeyCount = new Set([...document.querySelectorAll('.key')].map(key => key.dataset.code)).size;

function registerPress(code, label, button) {
  totalPresses += 1; seen.add(code);
  document.querySelectorAll('.key.last').forEach(key => key.classList.remove('last'));
  document.querySelectorAll(`.key[data-code="${CSS.escape(code)}"]`).forEach(key => { key.classList.add('active','last'); key.setAttribute('aria-label', `${label}, проверена`); });
  if (button) button.classList.add('active');
  pressedCount.textContent = totalPresses; uniqueCount.innerHTML = `${seen.size}<span class="stat-unit"> / ${totalKeyCount}</span>`;
  const percent = Math.min(100, Math.round(seen.size / totalKeyCount * 100)); progressPercent.textContent = `${percent}%`; progressFill.style.width = `${percent}%`; document.querySelector('.progress-track').setAttribute('aria-valuenow', percent); progressNote.textContent = percent === 100 ? 'Все клавиши проверены' : `${seen.size} из ${totalKeyCount} клавиш проверено`; lastKey.textContent = label;
  document.querySelector('.empty-activity')?.remove();
  const item = document.createElement('li'); item.className='new-activity'; item.innerHTML = `<b class="activity-key">${label}</b><span>${new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>`; activityList.prepend(item);
  while (activityList.children.length > 6) activityList.lastElementChild.remove();
}
document.addEventListener('keydown', event => { if (event.repeat || event.target.closest('button')) return; const button = document.querySelector(`.key[data-code="${CSS.escape(event.code)}"]`); registerPress(event.code, event.key === ' ' ? 'Space' : (button?.dataset.label || event.key), button); });
document.addEventListener('keyup', event => document.querySelectorAll(`.key[data-code="${CSS.escape(event.code)}"]`).forEach(key => key.classList.remove('active')));
document.querySelector('#resetButton').addEventListener('click', () => { totalPresses=0; seen.clear(); lastKey.textContent='—'; pressedCount.textContent='0'; uniqueCount.innerHTML=`0<span class="stat-unit"> / ${totalKeyCount}</span>`; progressPercent.textContent='0%'; progressFill.style.width='0%'; document.querySelector('.progress-track').setAttribute('aria-valuenow', '0'); progressNote.textContent='Начни нажимать клавиши'; document.querySelectorAll('.key').forEach(key=>{key.classList.remove('active','last'); key.setAttribute('aria-label', `${key.dataset.label}, не проверена`)}); activityList.innerHTML='<li class="empty-activity">Здесь появятся твои нажатия</li>'; });
const fullscreenToggle = document.querySelector('#fullscreenToggle');
function syncFullscreenState() { const active = Boolean(document.fullscreenElement); fullscreenToggle.setAttribute('aria-pressed', active); fullscreenToggle.setAttribute('aria-label', active ? 'Выйти из полноэкранного режима' : 'Включить полноэкранный режим'); fullscreenToggle.title = active ? 'Выйти из полноэкранного режима' : 'Включить полноэкранный режим'; fullscreenToggle.querySelector('.fullscreen-label').textContent = active ? 'Выйти из полноэкранного' : 'На весь экран'; }
fullscreenToggle.addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { syncFullscreenState(); } });
document.addEventListener('fullscreenchange', syncFullscreenState);
document.querySelector('#themeToggle').addEventListener('click', event => { const dark = document.body.classList.toggle('dark'); event.currentTarget.setAttribute('aria-pressed', dark); });
