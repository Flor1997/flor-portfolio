// ---------- CONFIG ----------
const POSTS_INDEX = 'posts/posts.json';
const POSTS_BASE  = 'posts/';

// ---------- STATE ----------
let POSTS = [];
let TAGS = new Set();
let searchTerm = '';
let activeTag = '';

// ---------- HELPERS ----------
const $ = (sel) => document.querySelector(sel);
const slugify = (s) => s.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/(^-|-$)/g,'');

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
    <div style="margin-top:12px;">
      <button class="btn" data-slug="${p.slug}">Read</button>
      ${p.repo ? `<a class="btn" href="${p.repo}" target="_blank" rel="noopener">Repo</a>` : ''}
      ${p.demo ? `<a class="btn" href="${p.demo}" target="_blank" rel="noopener">Demo</a>` : ''}
    </div>
  `;
  el.querySelector('[data-slug]')?.addEventListener('click', () => openPost(p.slug));
  return el;
}

function renderGrid(){
  const grid = $('#grid'); grid.innerHTML = '';
  const items = filtered();
  items.forEach(p => grid.appendChild(card(p)));
  $('#statPosts').textContent = items.length;
  $('#statTags').textContent = TAGS.size;
}

async function openPost(slug){
  const mdUrl = `${POSTS_BASE}${slug}.md`;
  const res = await fetch(mdUrl);
  const md = await res.text();
  const post = POSTS.find(p=>p.slug===slug);
  if(!post) return;
  $('#postTitle').textContent = post.title;
  $('#postMeta').textContent = `${fmtDate(post.date)} · ${post.reading_time || ''}`;
  $('#postTags').innerHTML = (post.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('');
  $('#postContent').innerHTML = marked.parse(md);
  location.hash = `#/post/${slug}`;
  toggleView('post');
  window.scrollTo({top:0, behavior:'smooth'});
}

function toggleView(which){
  const hero = document.querySelector('.hero');
  if(which === 'post'){
    $('#listView').style.display = 'none';
    $('#postView').classList.add('active');
    if (hero) hero.style.display = 'none';
  } else {
    $('#postView').classList.remove('active');
    $('#listView').style.display = '';
    if (hero) hero.style.display = '';
  }
}

function handleHash(){
  const hash = location.hash.replace('#/','');
  if(hash.startsWith('post/')){
    const slug = hash.split('/')[1];
    openPost(slug);
  } else {
    toggleView('list');
  }
}

// ---------- INIT ----------
async function init(){
  document.getElementById('year').textContent = new Date().getFullYear();
  $('#backBtn').onclick = () => { history.back(); setTimeout(()=>toggleView('list'), 50); };
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
  handleHash();
  window.addEventListener('hashchange', handleHash);
  if (POSTS.length > 0) {
    const latest = POSTS.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    const latestBtn = document.getElementById('latestPostBtn');
    if (latestBtn) {
      latestBtn.href = `#/post/${latest.slug}`;
    }
  }
}

init();
