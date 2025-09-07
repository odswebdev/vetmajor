import "./_components.js";
import "./_functions.js";
import Swiper from "swiper";
import { Pagination, Navigation, Mousewheel } from "swiper/modules";

document.addEventListener("DOMContentLoaded", () => {
  // Инициализация Swiper (если нужен)
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
      forceToAxis: true, // прокрутка только по горизонтали
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

  // собираем все точки (любое место в слайдере, где есть data-slide)
  const allDots = Array.from(slider.querySelectorAll("[data-slide]"));
  // группируем точки по индексу (поддерживает несколько одинаковых точек)
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
  let prevTranslate = 0; // translate в px до начала драга
  let currentTranslate = 0; // текущий translate во время драга
  let lastWheelTime = 0;

  // ensure slides layout: each slide = width контейнера
  function updateLayout() {
    // при ресайзе возвращаемся на текущий слайд
    goToSlide(currentIndex, true);
  }

  // применить transform: переводим контейнер на нужную позицию
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

    // убираем и ставим класс active для всех точек
    const allKeys = Array.from(dotsMap.keys());
    allKeys.forEach((key) => {
      const nodes = dotsMap.get(key) || [];
      nodes.forEach((n) =>
        n.classList.toggle("active", Number(key) === currentIndex)
      );
    });
  }

  // основной переход к слайду
  function goToSlide(index, instant = false) {
    index = clampIndex(index);
    currentIndex = index;
    const width = slider.offsetWidth;
    prevTranslate = -index * width;
    currentTranslate = prevTranslate;
    setTranslate(prevTranslate, !instant);
    updateActiveClasses();
  }

  // --- POINTER (mouse/touch unified) ---
  function onPointerDown(e) {
    isPointerDown = true;
    startX = e.clientX || e.touches?.[0]?.clientX;
    prevTranslate = currentTranslate; // текущая позиция перед началом
    slidesWrapper.style.transition = "none";
    slider.classList.add("grabbing");
  }

  function onPointerMove(e) {
    if (!isPointerDown) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const dx = clientX - startX;
    currentTranslate = prevTranslate + dx;
    // ограничим смещение, чтобы нельзя было сильно тянуть в пустоту
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
    const threshold = slider.offsetWidth * 0.2; // порог перелистывания
    if (moved < -threshold && currentIndex < slideCount - 1) {
      currentIndex++;
    } else if (moved > threshold && currentIndex > 0) {
      currentIndex--;
    }
    goToSlide(currentIndex);
  }

  // --- WHEEL (with small throttle) ---
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

  // --- dots click handlers (support many nodes per index) ---
  dotsMap.forEach((nodes, idx) => {
    nodes.forEach((node) => {
      node.addEventListener("click", (ev) => {
        ev.preventDefault();
        goToSlide(Number(idx));
      });
    });
  });

  // --- слушатели pointer / touch / mouse ---
  // pointer events (лучше) если поддерживаются:
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

  // wheel
  slider.addEventListener("wheel", onWheel, { passive: false });

  // ресайз: пересчитать позицию
  window.addEventListener("resize", () => {
    goToSlide(currentIndex, true);
  });

  // инициализация: убедимся, что style выставлен
  // Убедись что в SCSS .history__slide имеет flex: 0 0 100%
  setTranslate(0, true);
  goToSlide(0, true);
});
