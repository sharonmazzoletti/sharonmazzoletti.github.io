document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.site-header__hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('is-open');
      hamburger.classList.toggle('is-active', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
  }

  // Mobile sub-menus
  document.querySelectorAll('.mobile-nav__folder-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.mobile-nav__item').classList.toggle('is-open');
    });
  });

  // Desktop dropdowns: keyboard Escape closes them
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.site-nav__item.is-open').forEach(el => el.classList.remove('is-open'));
      if (mobileNav) {
        mobileNav.classList.remove('is-open');
        hamburger?.classList.remove('is-active');
        hamburger?.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Desktop folder buttons: navigate if data-href present, otherwise toggle dropdown
  document.querySelectorAll('.site-nav__folder-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (btn.dataset.href) {
        window.location.href = btn.dataset.href;
        return;
      }
      const item = btn.closest('.site-nav__item');
      const wasOpen = item.classList.contains('is-open');
      document.querySelectorAll('.site-nav__item.is-open').forEach(el => el.classList.remove('is-open'));
      if (!wasOpen) item.classList.add('is-open');
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.site-nav__item')) {
      document.querySelectorAll('.site-nav__item.is-open').forEach(el => el.classList.remove('is-open'));
    }
  });
});
