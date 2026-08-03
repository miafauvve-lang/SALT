/* SALT.ar — interacciones de la portada */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('#site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
  if (header) {
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  const closeMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    nav.classList.remove('open');
    header.classList.remove('menu-active');
    document.body.classList.remove('menu-open');
  };

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    toggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
    nav.classList.toggle('open', !open);
    header.classList.toggle('menu-active', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13 });
    reveals.forEach((element) => observer.observe(element));
  }

  // Duplica los logos para que el carrusel sea continuo sin inventar marcas.
  const logoTrack = document.querySelector('.logo-track');
  [...(logoTrack?.children || [])].forEach((logo) => {
    const clone = logo.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    logoTrack.appendChild(clone);
  });

  document.querySelectorAll('.current-year, #current-year').forEach((year) => { year.textContent = new Date().getFullYear(); });
  document.querySelector('.back-to-top')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  // Filtros del portfolio: sólo se activan en la página de proyectos.
  const filters = document.querySelectorAll('[data-filter]');
  const projects = document.querySelectorAll('[data-category]');
  filters.forEach((filter) => filter.addEventListener('click', () => {
    const selected = filter.dataset.filter;
    filters.forEach((item) => item.classList.remove('active'));
    filter.classList.add('active');
    projects.forEach((project) => {
      project.hidden = selected !== 'todos' && project.dataset.category !== selected;
    });
  }));

  // Validación visual local. El envío real se conecta al proveedor elegido más adelante.
  // Modal de video: se activa únicamente en la página de proyectos.
  const videoModal = document.querySelector('#video-modal');
  const modalVideo = videoModal?.querySelector('video');
  const modalClose = videoModal?.querySelector('.video-modal-close');
  let lastVideoTrigger = null;

  const closeVideoModal = () => {
    if (!videoModal || !modalVideo || videoModal.hidden) return;
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
    videoModal.hidden = true;
    document.body.classList.remove('video-modal-open');
    lastVideoTrigger?.focus();
  };

  document.querySelectorAll('.project-video video').forEach((video) => {
    video.addEventListener('loadedmetadata', () => {
      if (video.currentTime === 0 && Number.isFinite(video.duration) && video.duration > 0.1) video.currentTime = 0.1;
    }, { once: true });
    video.addEventListener('click', () => {
      if (!videoModal || !modalVideo) return;
      video.pause();
      lastVideoTrigger = video;
      modalVideo.src = video.querySelector('source')?.getAttribute('src') || video.currentSrc;
      videoModal.hidden = false;
      document.body.classList.add('video-modal-open');
      modalVideo.play().catch(() => {});
      modalClose?.focus();
    });
  });

  modalClose?.addEventListener('click', closeVideoModal);
  videoModal?.addEventListener('click', (event) => { if (event.target === videoModal) closeVideoModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeVideoModal(); });

  const form = document.querySelector('.contact-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    if (status) status.textContent = 'Gracias. El formulario está listo para conectar con tu servicio de envío.';
    form.reset();
  });
});
