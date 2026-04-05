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
      fadeObserver.unobserve(entry.target);
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
let carouselInterval = setInterval(() => {
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

// ===== LIGHTBOX / PHOTO VIEWER =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxPrevBtn = document.getElementById('lightboxPrev');
const lightboxNextBtn = document.getElementById('lightboxNext');

// Gather all carousel images
const carouselImages = [];
if (track) {
  track.querySelectorAll('.carousel-slide img').forEach(img => {
    carouselImages.push({ src: img.src, alt: img.alt });
  });
}

let lightboxIndex = 0;
let lightboxOpen = false;

function openLightbox(index) {
  lightboxIndex = index;
  lightboxOpen = true;
  updateLightboxImage();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Pause carousel auto-advance
  clearInterval(carouselInterval);
}

function closeLightbox() {
  lightboxOpen = false;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  // Resume carousel auto-advance
  carouselInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }, 5000);
}

function updateLightboxImage() {
  if (carouselImages.length === 0) return;
  const img = carouselImages[lightboxIndex];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = img.alt;
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${carouselImages.length}`;
}

function lightboxPrev() {
  lightboxIndex = (lightboxIndex - 1 + carouselImages.length) % carouselImages.length;
  updateLightboxImage();
}

function lightboxNext() {
  lightboxIndex = (lightboxIndex + 1) % carouselImages.length;
  updateLightboxImage();
}

// Click on carousel slides to open lightbox
if (track) {
  track.querySelectorAll('.carousel-slide').forEach((slide, i) => {
    slide.addEventListener('click', () => openLightbox(i));
  });
}

// Lightbox controls
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', lightboxPrev);
if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', lightboxNext);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightboxOpen) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev();
  if (e.key === 'ArrowRight') lightboxNext();
});

// ===== STUDIO SETS GALLERY =====
(function() {
  const studioCard = document.getElementById('studioSetsCard');
  const studioGallery = document.getElementById('studioGallery');
  const studioBackdrop = document.getElementById('studioGalleryBackdrop');
  const studioClose = document.getElementById('studioGalleryClose');
  const studioMainImg = document.getElementById('studioMainImg');
  const studioThumbs = document.getElementById('studioThumbs');

  if (!studioCard || !studioGallery) return;

  // Studio media — images and videos
  const studioMedia = [
    { type: 'image', src: 'images/DSC02636.JPG', name: 'Studio Set 1' },
    { type: 'image', src: 'images/DSC02642.JPG', name: 'Studio Set 2' },
    { type: 'image', src: 'images/DSC02645.JPG', name: 'Studio Set 3', portrait: true },
    { type: 'image', src: 'images/DSC02647.JPG', name: 'Studio Set 4', portrait: true },
    { type: 'image', src: 'images/DSC02656.JPG', name: 'Studio Set 5', portrait: true },
    { type: 'image', src: 'images/DSC02690.JPG', name: 'Studio Set 6', portrait: true },
    { type: 'image', src: 'images/DSC02734.JPG', name: 'Studio Set 7', portrait: true },
    { type: 'image', src: 'images/DSC02803.JPG', name: 'Studio Set 8', portrait: true },
    { type: 'image', src: 'images/DSC02815.JPG', name: 'Studio Set 9' },
    { type: 'video', src: 'videos/o1780-web.mp4', name: 'Behind the Scenes 1' },
    { type: 'video', src: 'videos/o1781-web.mp4', name: 'Behind the Scenes 2' },
    { type: 'video', src: 'videos/o1782-web.mp4', name: 'Behind the Scenes 3' },
    { type: 'video', src: 'videos/o1783-web.mp4', name: 'Behind the Scenes 4' }
  ];

  const studioShowcase = document.getElementById('studioShowcase');
  let currentVideoEl = null;

  let studioGalleryOpen = false;
  let currentStudioIndex = 0;
  let zoomTimeout = null;

  // Build thumbnails
  function buildThumbs() {
    studioThumbs.innerHTML = '';
    studioMedia.forEach((item, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'studio-gallery-thumb' + (i === 0 ? ' active' : '');
      if (item.type === 'video') {
        thumb.classList.add('video-thumb');
        thumb.innerHTML = `<video src="${item.src}" muted preload="metadata"></video>
          <div class="thumb-play-icon">▶</div>`;
      } else {
        thumb.innerHTML = `<img src="${item.src}" alt="${item.name}" loading="lazy">`;
      }
      thumb.addEventListener('click', () => selectStudioMedia(i));
      studioThumbs.appendChild(thumb);
    });
  }

  let autoAdvanceTimer = null;
  const IMAGE_DISPLAY_TIME = 5000; // 5 seconds per image

  function clearAutoAdvance() {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }

  function advanceToNext() {
    if (!studioGalleryOpen) return;
    const nextIndex = (currentStudioIndex + 1) % studioMedia.length;
    selectStudioMedia(nextIndex, true);
  }

  function selectStudioMedia(index, isAuto) {
    currentStudioIndex = index;
    const item = studioMedia[index];

    // Clear previous auto-advance
    clearAutoAdvance();

    // Cleanup previous video if any
    if (currentVideoEl) {
      currentVideoEl.removeEventListener('ended', advanceToNext);
      currentVideoEl.pause();
      currentVideoEl.remove();
      currentVideoEl = null;
    }

    // Fade out
    studioMainImg.style.opacity = '0';
    studioMainImg.classList.remove('zooming');
    clearTimeout(zoomTimeout);

    // Toggle portrait/landscape mode
    if (item.portrait) {
      studioShowcase.classList.add('portrait');
    } else {
      studioShowcase.classList.remove('portrait');
    }

    setTimeout(() => {
      if (item.type === 'video') {
        // Hide the img, show a video element
        studioMainImg.style.display = 'none';
        const video = document.createElement('video');
        video.src = item.src;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.className = 'studio-gallery-main-video';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        video.style.borderRadius = '8px';
        studioShowcase.appendChild(video);
        currentVideoEl = video;
        // Advance when video ends
        video.addEventListener('ended', advanceToNext);
      } else {
        // Show image
        studioMainImg.style.display = '';
        studioMainImg.src = item.src;
        studioMainImg.alt = item.name;
        studioMainImg.style.objectFit = item.portrait ? 'contain' : 'cover';
        studioMainImg.style.opacity = '1';
        // Ken Burns slow zoom
        zoomTimeout = setTimeout(() => {
          studioMainImg.classList.add('zooming');
        }, 100);
        // Auto-advance after display time
        autoAdvanceTimer = setTimeout(advanceToNext, IMAGE_DISPLAY_TIME);
      }
    }, 300);

    // Update active thumb & scroll into view
    studioThumbs.querySelectorAll('.studio-gallery-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === index);
      if (i === index) {
        t.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }

  // Preload all images into browser cache
  function preloadMedia() {
    studioMedia.forEach(item => {
      if (item.type === 'image') {
        const preload = new Image();
        preload.src = item.src;
      }
    });
  }

  function openStudioGallery() {
    studioGalleryOpen = true;
    preloadMedia();
    buildThumbs();
    selectStudioMedia(0);
    studioGallery.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeStudioGallery() {
    studioGalleryOpen = false;
    clearAutoAdvance();
    studioGallery.classList.remove('active');
    document.body.style.overflow = '';
    studioMainImg.classList.remove('zooming');
    clearTimeout(zoomTimeout);
    // Cleanup video
    if (currentVideoEl) {
      currentVideoEl.removeEventListener('ended', advanceToNext);
      currentVideoEl.pause();
      currentVideoEl.remove();
      currentVideoEl = null;
    }
    studioMainImg.style.display = '';
  }

  // Event listeners
  studioCard.addEventListener('click', openStudioGallery);
  studioCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openStudioGallery();
    }
  });

  studioClose.addEventListener('click', closeStudioGallery);
  studioBackdrop.addEventListener('click', closeStudioGallery);

  document.addEventListener('keydown', (e) => {
    if (!studioGalleryOpen) return;
    if (e.key === 'Escape') closeStudioGallery();
    if (e.key === 'ArrowRight') {
      selectStudioMedia((currentStudioIndex + 1) % studioMedia.length);
    }
    if (e.key === 'ArrowLeft') {
      selectStudioMedia((currentStudioIndex - 1 + studioMedia.length) % studioMedia.length);
    }
  });
})();
