(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => reduced.matches ? 'auto' : 'smooth';
  document.querySelectorAll('.ac-tabs').forEach(group => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    function activate(index, focus = false) {
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = i !== index;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); activate(next, true); }
      });
    });
  });
  document.querySelectorAll('.ac-checklist').forEach(box => {
    const checks = [...box.querySelectorAll('input[type="checkbox"]')];
    function update() {
      const done = checks.filter(input => input.checked).length;
      box.querySelector('progress').value = done;
      box.querySelector('output').textContent = `${done} of ${checks.length} ready`;
      box.querySelector('.ac-check-message').textContent = done === checks.length ? 'Your checklist is ready. Bring any remaining questions to your conversation.' : done ? 'Good progress. Focus on the next unchecked task.' : 'Choose one task to start with today.';
    }
    checks.forEach(input => input.addEventListener('change', update));
    box.querySelector('.ac-reset').addEventListener('click', () => { checks.forEach(input => input.checked = false); update(); });
  });
  document.querySelectorAll('.ac-carousel').forEach(carousel => {
    const track = carousel.querySelector('.ac-track');
    const slides = [...track.children];
    const prev = carousel.querySelector('.ac-prev');
    const next = carousel.querySelector('.ac-next');
    let frame;
    function state() {
      const index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / (slides[0].offsetWidth + 24))));
      carousel.querySelector('.ac-carousel-status').textContent = `${index + 1} / ${slides.length}`;
      prev.disabled = track.scrollLeft < 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 3;
    }
    function move(direction) { track.scrollBy({left: direction * (slides[0].offsetWidth + 24), behavior: behavior()}); }
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', event => {
      if (event.target !== track) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);}
      if (event.key === 'Home' || event.key === 'End') {event.preventDefault();track.scrollTo({left:event.key === 'Home' ? 0 : track.scrollWidth,behavior:behavior()});}
    });
    track.addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(state); }, {passive:true});
    new ResizeObserver(state).observe(track);
    state();
  });
  document.querySelectorAll('.ac-budget').forEach(form => {
    function update() {
      const amount = name => Math.max(0, Number(form.elements[name].value) || 0);
      const base = amount('tuition') + amount('living') * 12 + amount('extras');
      const total = base * (1 + Math.min(100, amount('buffer')) / 100);
      const currency = form.elements.currency.value;
      form.querySelector('output').textContent = `${currency} ${new Intl.NumberFormat('en', {maximumFractionDigits:2}).format(total)}`;
    }
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('input', update); form.addEventListener('change', update); update();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('ac-entered'); observer.unobserve(entry.target);}
    }), {threshold:.12});
    document.querySelectorAll('.ac-animate').forEach((element,i) => {element.style.animationDelay = `${i % 3 * 70}ms`; observer.observe(element);});
  }
  const progress = document.createElement('div'); progress.className = 'ac-reading-progress'; progress.setAttribute('aria-hidden','true'); document.body.append(progress);
  const top = document.createElement('button'); top.className = 'ac-to-top'; top.type = 'button'; top.textContent = '↑'; top.setAttribute('aria-label','Back to top'); top.hidden = true; document.body.append(top);
  top.addEventListener('click', () => {window.scrollTo({top:0,behavior:behavior()});document.querySelector('.brand-logo')?.focus({preventScroll:true});});
  let scheduled = false;
  function reading() {const max = document.documentElement.scrollHeight - innerHeight;progress.style.transform = `scaleX(${max > 0 ? Math.min(1,scrollY/max) : 0})`;top.hidden = scrollY < 650;scheduled=false;}
  addEventListener('scroll', () => {if(!scheduled){scheduled=true;requestAnimationFrame(reading);}}, {passive:true});
  addEventListener('resize', reading); reading();
  const expanded = document.querySelector('.ac-expanded');
  if (expanded) {
    const nav = document.createElement('nav');nav.className='ac-quick-nav';nav.setAttribute('aria-label','On this page');
    const wrap=document.createElement('div');wrap.className='container';nav.append(wrap);
    [['.ac-expanded>.ac-section','A closer look'],['.ac-action-section','Your checklist'],['.ac-carousel-section','Explore more'],['.ac-budget-section','Budget planner'],['.ac-faq-section','Common questions']].forEach(([selector,label],i)=>{const section=document.querySelector(selector);if(!section)return;section.id=`ac-section-${i}`;const a=document.createElement('a');a.href=`#${section.id}`;a.textContent=label;a.addEventListener('click',event=>{event.preventDefault();section.scrollIntoView({behavior:behavior(),block:'start'});section.tabIndex=-1;section.focus({preventScroll:true});history.replaceState(null,'',a.href);});wrap.append(a);});
    const hero=document.querySelector('main>section');hero?.after(nav);
  }
})();
