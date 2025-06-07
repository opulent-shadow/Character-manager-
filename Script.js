let storage = window.localStorage;
let folders = JSON.parse(storage.getItem('folders')||'[]');
let currentFolder = storage.getItem('currentFolder') || null;
let chars = {};

function saveAll(){
  storage.setItem('folders', JSON.stringify(folders));
  storage.setItem('chars', JSON.stringify(chars));
  storage.setItem('currentFolder', currentFolder);
}

function showFolders(){
  let sel = document.getElementById('folder-select');
  sel.innerHTML = folders.map(f => `<option ${f===currentFolder?'selected':''}>${f}</option>`).join('');
  onFolderChange();
}

function createFolder(){
  let name = prompt('Folder name?'); if(!name) return;
  if(folders.includes(name)) return alert('Exists!');
  folders.push(name); currentFolder = name;
  chars[name] = [];
  saveAll(); showFolders();
}

function deleteFolder(){
  if(!currentFolder) return;
  if(!confirm('Delete folder '+currentFolder+'?')) return;
  let idx = folders.indexOf(currentFolder);
  folders.splice(idx,1);
  delete chars[currentFolder];
  currentFolder = folders[0]||null;
  saveAll(); showFolders();
}

document.getElementById('folder-select').addEventListener('change',e=>{
  currentFolder = e.target.value; saveAll(); onFolderChange();
});

function onFolderChange(){
  let sel = document.getElementById('char-select');
  let list = chars[currentFolder]||[];
  sel.innerHTML = list.map(c=>`<option>${c.name}</option>`).join('');
  document.getElementById('char-edit').innerHTML = '';
}

function createChar(){
  if(!currentFolder) return alert('Select folder first');
  let name = prompt('Char name?'); if(!name) return;
  let c = {name, race:'Human', age:18, stats:{str:10,dex:10,int:10,agi:10,spd:10}, items:[], buffs:[]};
  chars[currentFolder].push(c);
  saveAll(); onFolderChange();
  document.getElementById('char-select').value = name;
  editChar(name);
}

function deleteChar(){
  let sel = document.getElementById('char-select');
  let name = sel.value;
  if(!name) return;
  let arr = chars[currentFolder];
  let idx = arr.findIndex(c=>c.name===name);
  arr.splice(idx,1);
  saveAll(); onFolderChange();
}

function editChar(name){
  let ch = chars[currentFolder].find(c=>c.name===name);
  renderEditor(ch);
}

document.getElementById('char-select').addEventListener('change',e=>{
  editChar(e.target.value);
});

function renderEditor(ch){
  let div = document.getElementById('char-edit');
  div.innerHTML = `
    <h3>${ch.name} (folder: ${currentFolder})</h3>
    Name: <input id="nm" value="${ch.name}"/><br/>
    Race: <input id="race" value="${ch.race}"/><br/>
    Age: <input id="age" type="number" value="${ch.age}"/><br/>
    <h4>Stats</h4>
    ${Object.keys(ch.stats).map(s=>`${s.toUpperCase()}: <input id="st_${s}" type="number" value="${ch.stats[s]}"/><br/>`).join('')}
    <hr>
    <button onclick="apply()">Save</button>
  `;
}

function apply(){
  let ch = chars[currentFolder].find(c=>c.name===document.getElementById('nm').value);
  if(!ch) ch = chars[currentFolder].find(c=>c.name===document.getElementById('char-select').value);
  ch.name = document.getElementById('nm').value;
  ch.race = document.getElementById('race').value;
  ch.age = +document.getElementById('age').value;
  for(let k in ch.stats){
    ch.stats[k] = +document.getElementById('st_'+k).value;
  }
  saveAll(); showFolders();
}

document.getElementById('theme-toggle').onclick = ()=>{
  document.body.setAttribute('data-theme', document.body.getAttribute('data-theme')==='dark'? '':'dark');
};

(() => {
  chars = JSON.parse(storage.getItem('chars')||'{}');
  if(folders.length===0){
    folders=['Default'];
    chars['Default'] = [];
    currentFolder='Default';
    saveAll();
  }
  showFolders();
})();
