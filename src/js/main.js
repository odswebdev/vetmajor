import "./_components.js";
import "./_functions.js";
import Swiper from "swiper";
import { Pagination, Navigation, Mousewheel } from "swiper/modules";

document.addEventListener("DOMContentLoaded", () => {
  const swiper = new Swiper(".center__swiper", {
    loop: false,
    slidesPerView: 1,
    spaceBetween: 50,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    modules: [Pagination, Navigation],
  });

  const swiper2 = new Swiper(".experts__swiper", {
    loop: false,
    slidesPerView: "auto",
    spaceBetween: 30,
    mousewheel: {
      forceToAxis: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    modules: [Pagination, Navigation, Mousewheel],
  });

  const slider = document.querySelector(".history__slider");
  if (!slider) return;

  const slidesWrapper = slider.querySelector(".history__slides");
  const slides = Array.from(slidesWrapper.querySelectorAll(".history__slide"));

  const allDots = Array.from(slider.querySelectorAll("[data-slide]"));
  const dotsMap = new Map();
  allDots.forEach((dot) => {
    const idx = Number(dot.dataset.slide);
    if (Number.isNaN(idx)) return;
    if (!dotsMap.has(idx)) dotsMap.set(idx, []);
    dotsMap.get(idx).push(dot);
  });

  const slideCount = slides.length;
  let currentIndex = 0;
  let isPointerDown = false;
  let startX = 0;
  let prevTranslate = 0;
  let currentTranslate = 0;
  let lastWheelTime = 0;

  function updateLayout() {
    goToSlide(currentIndex, true);
  }

  function setTranslate(px, withTransition = true) {
    slidesWrapper.style.transition = withTransition
      ? "transform 0.32s ease"
      : "none";
    slidesWrapper.style.transform = `translateX(${px}px)`;
  }

  function clampIndex(i) {
    return Math.max(0, Math.min(slideCount - 1, i));
  }

  function updateActiveClasses() {
    slides.forEach((s, i) => s.classList.toggle("active", i === currentIndex));

    const allKeys = Array.from(dotsMap.keys());
    allKeys.forEach((key) => {
      const nodes = dotsMap.get(key) || [];
      nodes.forEach((n) =>
        n.classList.toggle("active", Number(key) === currentIndex)
      );
    });
  }

  function goToSlide(index, instant = false) {
    index = clampIndex(index);
    currentIndex = index;
    const width = slider.offsetWidth;
    prevTranslate = -index * width;
    currentTranslate = prevTranslate;
    setTranslate(prevTranslate, !instant);
    updateActiveClasses();
  }

  function onPointerDown(e) {
    isPointerDown = true;
    startX = e.clientX || e.touches?.[0]?.clientX;
    prevTranslate = currentTranslate; 
    slidesWrapper.style.transition = "none";
    slider.classList.add("grabbing");
  }

  function onPointerMove(e) {
    if (!isPointerDown) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const dx = clientX - startX;
    currentTranslate = prevTranslate + dx;
    const maxTranslate = 0;
    const minTranslate = -(slideCount - 1) * slider.offsetWidth;
    if (currentTranslate > maxTranslate + 100)
      currentTranslate = maxTranslate + 100;
    if (currentTranslate < minTranslate - 100)
      currentTranslate = minTranslate - 100;
    setTranslate(currentTranslate, false);
  }

  function onPointerUp() {
    if (!isPointerDown) return;
    isPointerDown = false;
    slider.classList.remove("grabbing");

    const moved = currentTranslate - prevTranslate;
    const threshold = slider.offsetWidth * 0.2;
    if (moved < -threshold && currentIndex < slideCount - 1) {
      currentIndex++;
    } else if (moved > threshold && currentIndex > 0) {
      currentIndex--;
    }
    goToSlide(currentIndex);
  }

  function onWheel(e) {
    e.preventDefault();
    const now = Date.now();
    if (now - lastWheelTime < 150) return; // throttle
    lastWheelTime = now;

    if (e.deltaY > 0 || e.deltaX > 0) {
      if (currentIndex < slideCount - 1) goToSlide(currentIndex + 1);
    } else {
      if (currentIndex > 0) goToSlide(currentIndex - 1);
    }
  }

  dotsMap.forEach((nodes, idx) => {
    nodes.forEach((node) => {
      node.addEventListener("click", (ev) => {
        ev.preventDefault();
        goToSlide(Number(idx));
      });
    });
  });

  if (window.PointerEvent) {
    slidesWrapper.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    slidesWrapper.addEventListener("pointercancel", onPointerUp);
  } else {
    // fallback для touch/mouse
    slidesWrapper.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    slidesWrapper.addEventListener("touchstart", onPointerDown, {
      passive: true,
    });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
  }

  slider.addEventListener("wheel", onWheel, { passive: false });

  window.addEventListener("resize", () => {
    goToSlide(currentIndex, true);
  });

  setTranslate(0, true);
  goToSlide(0, true);
});


document.addEventListener('DOMContentLoaded', function() {
  const faqQuestions = document.querySelectorAll('.faq-item__question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const faqItem = this.closest('.faq-item');
      const answer = faqItem.querySelector('.faq-item__answer');
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      document.querySelectorAll('.faq-item__question[aria-expanded="true"]').forEach(openQuestion => {
        if (openQuestion !== this) {
          openQuestion.setAttribute('aria-expanded', 'false');
          openQuestion.closest('.faq-item').classList.remove('active');
        }
      });
      
      this.setAttribute('aria-expanded', !isExpanded);
      faqItem.classList.toggle('active');
      
      if (!isExpanded) {
        answer.style.display = 'block';
        answer.style.height = 'auto';
        const height = answer.offsetHeight;
        answer.style.height = '0';
        answer.offsetHeight;
        answer.style.height = height + 'px';
        
        setTimeout(() => {
          answer.style.height = 'auto';
        }, 300);
      } else {
        answer.style.height = answer.offsetHeight + 'px';
        answer.offsetHeight;
        answer.style.height = '0';
        
        setTimeout(() => {
          answer.style.display = 'none';
        }, 300);
      }
    });
  });
});