const POSTS_INDEX = 'posts/posts.json';
const POSTS_BASE  = 'posts/';
let POSTS = [];
let TAGS = new Set();
let searchTerm = '';
let activeTag = '';

const $ = (sel) => document.querySelector(sel);
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

function fmtDate(iso){
  try { const d = new Date(iso); return d.toLocaleDateString('en-GB', { year:'numeric', month:'short', day:'numeric' }); } catch(e){ return iso; }
}

function filtered(){
  const q = searchTerm.trim().toLowerCase();
  return POSTS.filter(p => {
    const matchesTag = !activeTag || p.tags.includes(activeTag);
    const haystack = (p.title + ' ' + p.summary + ' ' + (p.tags||[]).join(' ')).toLowerCase();
    const matchesSearch = q === '' || haystack.includes(q);
    return matchesTag && matchesSearch;
  }).sort((a,b)=> new Date(b.date) - new Date(a.date));
}

function card(p){
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="meta">${fmtDate(p.date)} · ${p.reading_time || '— min'}</div>
    <h4>${p.title}</h4>
    <p class="meta">${p.summary || ''}</p>
  `;
  return el;
}

function renderGrid(){
  const grid = $('#grid'); grid.innerHTML = '';
  const items = filtered();
  items.forEach(p => grid.appendChild(card(p)));
  $('#statPosts').textContent = items.length;
  $('#statTags').textContent = TAGS.size;

  // Update latest post
  if (items.length > 0) {
    const latest = items[0];
    $('#latestPostLink').textContent = latest.title;
    $('#latestPostLink').href = `#/${latest.slug}`;
    $('#latestPostMeta').textContent = `${fmtDate(latest.date)} · ${latest.reading_time || '— min'}`;
  }
}

// ---------- INIT ----------
async function init(){
  document.getElementById('year').textContent = new Date().getFullYear();
  $('#search').addEventListener('input', (e)=>{ searchTerm = e.target.value; renderGrid();});
  $('#tagFilter').addEventListener('change', (e)=>{ activeTag = e.target.value; renderGrid(); });

  const res = await fetch(POSTS_INDEX);
  POSTS = await res.json();
  POSTS.forEach(p=>{ 
    p.slug = p.slug || slugify(p.title); 
    (p.tags||[]).forEach(t=>TAGS.add(t)); 
  });

  TAGS.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    $('#tagFilter').appendChild(opt);
  });

  renderGrid();
}

init();
