// main.js — mobile‑optimized interactions, beach spray, progressive parallax

/* Helpers */
const isMobile = () => window.matchMedia('(max-width: 768px)').matches || /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const throttle = (fn, limit)=>{let t=0;return (...a)=>{const now=Date.now();if(now-t>=limit){t=now;fn(...a);}};};
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Mobile nav */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  const bars = hamburger.querySelectorAll('span');
  const close = ()=>{ navLinks.classList.remove('active'); if(bars[0]){bars[0].style.transform='none';bars[1].style.opacity='1';bars[2].style.transform='none';} document.body.style.overflow=''; };
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const open = navLinks.classList.contains('active');
    hamburger.setAttribute('aria-expanded', String(open));
    if (open) { bars[0].style.transform='rotate(45deg) translate(5px,5px)'; bars[1].style.opacity='0'; bars[2].style.transform='rotate(-45deg) translate(7px,-6px)'; if (isMobile()) document.body.style.overflow='hidden'; }
    else close();
  }, { passive: true });
  document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click', close, { passive: true }));
}

/* Smooth anchors */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    const top = el.offsetTop - 64;
    window.scrollTo({ top, behavior: 'smooth' });
  }, { passive: false });
});

/* Navbar shadow on scroll */
const navbar = document.querySelector('.navbar');
if (navbar) {
  const onScroll = throttle(()=>{
    navbar.style.boxShadow = window.pageYOffset>100 ? '0 5px 20px rgba(0,102,204,.2)' : '0 2px 10px rgba(0,0,0,.1)';
  }, 120);
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* Canvas sea spray in hero (auto‑scaled for phones) */
(function(){
  if (prefersReduced.matches) return;
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('.spray-canvas');
  if (!hero || !canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function size(){ canvas.width = hero.clientWidth*DPR; canvas.height = hero.clientHeight*DPR; canvas.style.width='100%'; canvas.style.height='100%'; }
  size();
  const count = isMobile() ? 18 : 42;
  const dots = Array.from({length:count},()=>({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height, r:(Math.random()*2+1)*DPR,
    vx: (Math.random()-.5)*0.8*DPR, vy:(Math.random()-.5)*0.8*DPR, o: Math.random()*0.5+0.25
  }));
  function tick(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    dots.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>canvas.width||p.y<0||p.y>canvas.height){ p.x=Math.random()*canvas.width; p.y=Math.random()*canvas.height; }
      ctx.fillStyle=`rgba(255,255,255,${p.o})`;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  window.addEventListener('resize', throttle(size, 200), { passive: true });
})();

/* Progressive parallax for hero/waves (desktop only) */
(function(){
  if (isMobile() || prefersReduced.matches) return;
  const waves = document.querySelectorAll('.wave');
  const heroContent = document.querySelector('.hero-content');
  const onScroll = throttle(()=>{
    const y = window.pageYOffset;
    if (heroContent) {
      heroContent.style.transform = `translateY(${Math.min(y*0.45, 140)}px)`;
      heroContent.style.opacity = String(1 - Math.min(y / window.innerHeight, 0.85));
    }
    waves.forEach((w,i)=> w.style.transform = `translateX(${y*(0.05+i*0.02)}px)`);
  }, 16);
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* Intersection fade‑ins */
const io = new IntersectionObserver((entries, obs)=>{
  entries.forEach(e=>{
    if (e.isIntersecting) {
      e.target.style.opacity='1';
      e.target.style.transform='translateY(0)';
      obs.unobserve(e.target);
    }
  });
},{ threshold: isMobile()?0.05:0.12, rootMargin: isMobile()? '0px 0px -50px 0px' : '0px 0px -120px 0px' });

document.querySelectorAll('.service-card,.portfolio-item').forEach((el,i)=>{
  el.style.opacity='0'; el.style.transform='translateY(30px)'; el.style.transition=`all .6s cubic-bezier(.4,0,.2,1) ${i*0.08}s`; io.observe(el);
});

/* Stats auto counter when About enters view */
(function(){
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  const co = new IntersectionObserver((es,obs)=>{
    es.forEach(ent=>{
      if(ent.isIntersecting){
        counters.forEach(c=>{
          const target = parseInt(c.dataset.target,10);
          let cur = 0; const step = Math.max(1, Math.round(target/60));
          const timer = setInterval(()=>{ cur+=step; if(cur>=target){cur=target; clearInterval(timer);} c.textContent = String(cur); }, 30);
        });
        obs.disconnect();
      }
    });
  }, { threshold: .5 });
  co.observe(document.querySelector('#about'));
})();

/* Touch ripple on mobile for feedback */
if (isMobile() && !prefersReduced.matches) {
  const ripple = e=>{
    const t = e.currentTarget, rect = t.getBoundingClientRect();
    const s = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = (e.touches?e.touches[0].clientX:e.clientX) - rect.left - size/2;
    const y = (e.touches?e.touches[0].clientY:e.clientY) - rect.top - size/2;
    Object.assign(s.style,{position:'absolute',left:`${x}px`,top:`${y}px`,width:`${size}px`,height:`${size}px`,borderRadius:'50%',background:'rgba(255,255,255,.45)',transform:'scale(0)',animation:'ripple .6s ease-out',pointerEvents:'none'});
    t.style.position='relative'; t.style.overflow='hidden';
    t.appendChild(s); setTimeout(()=>s.remove(), 650);
  };
  const addRippleTo = sel => document.querySelectorAll(sel).forEach(el => el.addEventListener('touchstart', ripple, { passive: true }));
  addRippleTo('.cta-button'); addRippleTo('.submit-button'); addRippleTo('.service-card');
  const style = document.createElement('style'); style.textContent='@keyframes ripple{to{transform:scale(4);opacity:0}}'; document.head.appendChild(style);
}

// Mobile viewport fallback (sets --vh for browsers without dvh)
const setVHFallback = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
};
setVHFallback();
window.addEventListener('resize', () => requestAnimationFrame(setVHFallback), { passive: true });

// Feature gating for phones / reduced motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const smallScreen = () => window.matchMedia('(max-width: 768px)').matches;
const effectsOn = () => !prefersReduced.matches && !smallScreen();

// Example: disable parallax/canvas when not enabled
if (!effectsOn()) {
  document.querySelectorAll('.wave').forEach(w => w.style.transform = '');
  const spray = document.querySelector('.spray-canvas');
  if (spray) { const ctx = spray.getContext?.('2d'); if (ctx) ctx.clearRect(0,0,spray.width,spray.height); }
}


/* Scroll-to-top button */
(function(){
  const btn = document.querySelector('.to-top');
  if (!btn) return;
  const toggle = throttle(()=>{ if (window.pageYOffset>320) btn.classList.add('show'); else btn.classList.remove('show'); }, 150);
  window.addEventListener('scroll', toggle, { passive: true });
  btn.addEventListener('click', ()=> window.scrollTo({ top:0, behavior:'smooth' }));
})();

/* Contact form feedback */
const form = document.getElementById('contactForm');
const ok = document.getElementById('successMessage');
if (form && ok) {
  form.addEventListener('submit', e=>{
    e.preventDefault();
    // Simple HTML5 validation; show feedback
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('Form submitted:', data);
    ok.classList.add('show');
    form.reset();
    setTimeout(()=> ok.classList.remove('show'), 4500);
  });
}
