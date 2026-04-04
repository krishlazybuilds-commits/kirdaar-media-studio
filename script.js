// ===== CURTAIN REVEAL ANIMATION =====
window.addEventListener('load', () => {
  const curtainOverlay = document.getElementById('curtainOverlay');
  const curtainLogo = document.getElementById('curtainLogo');
  
  // Wait a moment for the logo to display, then reveal
  setTimeout(() => {
    // Start curtain opening
    curtainOverlay.classList.add('revealed');
    curtainLogo.classList.add('hidden');
    
    // Remove curtain from DOM after animation completes
    setTimeout(() => {
      document.body.classList.remove('curtain-active');
      curtainOverlay.style.display = 'none';
      curtainLogo.style.display = 'none';
    }, 1800);
  }, 1800);
});

// ===== MOBILE MENU TOGGLE =====
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

mobileToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  const spans = mobileToggle.querySelectorAll('span');
  if (navMenu.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close menu when clicking a nav link
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    const spans = mobileToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  });
});

// ===== SCROLL ANIMATIONS (Intersection Observer) =====
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -60px 0px',
  threshold: 0.1
};

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
  fadeObserver.observe(el);
});

// ===== CAROUSEL =====
const track = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');
let currentSlide = 0;
const totalSlides = track ? track.children.length : 0;

function updateCarousel() {
  if (track) {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
}

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  });
}

// Auto-advance carousel
setInterval(() => {
  currentSlide = (currentSlide + 1) % totalSlides;
  updateCarousel();
}, 5000);

// ===== HEADER SCROLL EFFECT + ACTIVE NAV TRACKING =====
const header = document.getElementById('header');
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
const sections = [];

// Build section map for scroll-spy
navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href && href !== '#') {
    const section = document.querySelector(href);
    if (section) {
      sections.push({ el: section, link: link, id: href });
    }
  }
});

function setActiveNav(activeLink) {
  navLinks.forEach(l => l.classList.remove('active'));
  if (activeLink) activeLink.classList.add('active');
}

let lastScroll = 0;
let ticking = false;

function onScroll() {
  const currentScroll = window.pageYOffset;
  const headerHeight = header.offsetHeight;
  const offset = headerHeight + 40; // offset for comfortable detection
  
  // Header background change
  if (currentScroll > 50) {
    header.style.background = 'rgba(10, 10, 10, 0.98)';
    header.style.borderBottomColor = 'rgba(193, 154, 91, 0.12)';
  } else {
    header.style.background = 'rgba(10, 10, 10, 0.92)';
    header.style.borderBottomColor = 'rgba(193, 154, 91, 0.08)';
  }
  
  // Scroll-spy: find which section is currently in view
  let currentSection = null;
  
  // If user scrolled near the bottom, activate the last section (contact)
  const distanceFromBottom = document.documentElement.scrollHeight - (window.innerHeight + currentScroll);
  
  if (distanceFromBottom < 150 && sections.length > 0) {
    currentSection = sections[sections.length - 1];
  } else {
    for (let i = sections.length - 1; i >= 0; i--) {
      const rect = sections[i].el.getBoundingClientRect();
      if (rect.top <= offset) {
        currentSection = sections[i];
        break;
      }
    }
  }
  
  // If at the very top (no scrolling), clear all active states
  if (currentScroll < 50) {
    setActiveNav(null);
  } else if (currentSection) {
    setActiveNav(currentSection.link);
  } else if (sections.length > 0) {
    // Scrolled but no section reached threshold yet — highlight first section
    setActiveNav(sections[0].link);
  }
  
  lastScroll = currentScroll;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
});

// Initial call to set active on load
setTimeout(onScroll, 100);

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveNav(null);
      return;
    }
    
    e.preventDefault();
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      // Set active immediately on click for instant feedback
      setActiveNav(this);
      targetEl.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
