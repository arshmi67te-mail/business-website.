// Basic client-side cart + product listing + search (static-hosting friendly)
const productsUrl = 'data/products.json';
let PRODUCTS = [];

function $(s){return document.querySelector(s)}
function $all(s){return document.querySelectorAll(s)}

function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]') }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); updateCartCount(); }
function updateCartCount(){ const c = getCart(); document.querySelectorAll('#cart-count, #cart-count-top').forEach(el=>el.textContent=c.length); }

async function loadProducts(){
  try{
    const r = await fetch(productsUrl);
    PRODUCTS = await r.json();
    renderProducts(PRODUCTS);
    renderFeatured(PRODUCTS.slice(0,3));
  }catch(e){ console.error('Failed to load products', e); }
}

function renderProducts(items){
  const grid = $('#productsGrid'); if(!grid) return;
  grid.innerHTML='';
  items.forEach(p=>{
    const col = document.createElement('div'); col.className='col-sm-6 col-md-4 col-lg-3';
    col.innerHTML=`
      <div class="product-card p-3 h-100">
        <img src="${p.img}" alt="${p.title}" class="product-img mb-2">
        <h5 class="mb-1">${p.title}</h5>
        <p class="text-muted small mb-2">${p.desc}</p>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <strong>₹ ${Number(p.price).toLocaleString('en-IN')}</strong>
          <button class="btn btn-sm btn-outline-light add-btn" data-id="${p.id}">Add</button>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
  attachAddButtons();
}

function renderFeatured(items){ const f = $('#featuredGrid'); if(!f) return; f.innerHTML=''; items.forEach(p=>{ const col=document.createElement('div'); col.className='col-md-4'; col.innerHTML=`<div class="card p-3"><img src="${p.img}" class="img-fluid rounded mb-2"><h6>${p.title}</h6><div class="text-muted small">₹ ${Number(p.price).toLocaleString('en-IN')}</div></div>`; f.appendChild(col); }); }

function attachAddButtons(){ document.querySelectorAll('.add-btn').forEach(btn=>{ btn.onclick = ()=>{ const id = Number(btn.dataset.id); const prod = PRODUCTS.find(p=>p.id===id); if(!prod) return; const cart = getCart(); cart.push(prod); saveCart(cart); flashAdded(btn); } }) }

function flashAdded(btn){ btn.textContent='Added'; setTimeout(()=>btn.textContent='Add',800); }

function setupSearchSort(){ const search = $('#searchInput'); if(search){ search.addEventListener('input', e=>{ const q = e.target.value.toLowerCase(); renderProducts(PRODUCTS.filter(p=>p.title.toLowerCase().includes(q)||p.desc.toLowerCase().includes(q))); }); }
  const sort = $('#sortSelect'); if(sort){ sort.addEventListener('change', ()=>{ const v = sort.value; let arr = [...PRODUCTS]; if(v==='price-asc') arr.sort((a,b)=>a.price-b.price); if(v==='price-desc') arr.sort((a,b)=>b.price-a.price); renderProducts(arr); }) }
}

function openCartModal(){ const cart = getCart(); const body = $('#cart-modal-body'); if(!body) return; if(cart.length===0){ body.innerHTML='<p>Your cart is empty.</p>'; } else { let sum=0; let html='<div class="list-group">'; cart.forEach((c,i)=>{ sum+=c.price; html+=`<div class="list-group-item bg-transparent d-flex justify-content-between align-items-center"><div><strong>${c.title}</strong><div class="small text-muted">₹ ${Number(c.price).toLocaleString('en-IN')}</div></div><div><button class="btn btn-sm btn-danger remove-btn" data-i="${i}">Remove</button></div></div>` }); html += `</div><div class="mt-3 text-end">Total: <strong>₹ ${Number(sum).toLocaleString('en-IN')}</strong></div>`; body.innerHTML=html; document.querySelectorAll('.remove-btn').forEach(b=>b.onclick=()=>{ const i=Number(b.dataset.i); const c=getCart(); c.splice(i,1); saveCart(c); openCartModal(); }); } const modalEl=document.getElementById('cartModal'); const modal = bootstrap.Modal.getOrCreateInstance(modalEl); modal.show(); }

function checkoutDemo(){ alert('Demo checkout — no payment integrated.'); localStorage.removeItem('cart'); updateCartCount(); const modal = bootstrap.Modal.getInstance(document.getElementById('cartModal')); if(modal) modal.hide(); }

function setupForms(){ const contact = $('#contactForm'); if(contact) contact.addEventListener('submit', e=>{ e.preventDefault(); alert('Thanks — we will reply to your email (demo).'); contact.reset(); }); const fb = $('#feedbackForm'); if(fb) fb.addEventListener('submit', e=>{ e.preventDefault(); const data = new FormData(fb); const entry = {name:data.get('name'), rating:data.get('rating'), msg:data.get('message'), date:new Date().toISOString()}; const arr = JSON.parse(localStorage.getItem('feedback')||'[]'); arr.unshift(entry); localStorage.setItem('feedback', JSON.stringify(arr)); alert('Thanks for your feedback!'); fb.reset(); renderFeedbackList(); }); renderFeedbackList(); }

function renderFeedbackList(){ const list = document.getElementById('feedbackList'); if(!list) return; const arr = JSON.parse(localStorage.getItem('feedback')||'[]'); if(arr.length===0){ list.innerHTML='<p class="text-muted">No feedback yet.</p>' } else { list.innerHTML = arr.slice(0,10).map(f=>`<div class="card p-3 mb-2"><strong>${escapeHtml(f.name)}</strong> <span class="text-muted small">• ${new Date(f.date).toLocaleString()}</span><div class="text-warning">Rating: ${escapeHtml(f.rating)}</div><p class="mb-0">${escapeHtml(f.msg)}</p></div>`).join(''); } }

function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

function setupNavCartButtons(){ document.querySelectorAll('#cartBtn, #cartBtnTop').forEach(b=>b&&b.addEventListener('click', openCartModal)); document.getElementById('checkoutBtn')?.addEventListener('click', checkoutDemo); }

function setYears(){ const y = new Date().getFullYear(); document.getElementById('year')?.textContent=y; document.getElementById('year-about')?.textContent=y; document.getElementById('year-services')?.textContent=y; document.getElementById('year-gallery')?.textContent=y; document.getElementById('year-feedback')?.textContent=y; document.getElementById('year-contact')?.textContent=y; }

window.addEventListener('DOMContentLoaded', ()=>{ updateCartCount(); loadProducts().then(()=>{ setupSearchSort(); }); setupForms(); setupNavCartButtons(); setYears(); });
