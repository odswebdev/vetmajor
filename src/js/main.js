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

// Функционал для страницы хирургии
document.addEventListener('DOMContentLoaded', function() {
  // Аккордеон FAQ
  const faqQuestions = document.querySelectorAll('.faq-item__question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const faqItem = this.parentElement;
      
      // Закрываем все открытые элементы
      document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('active');
        }
      });
      
      // Переключаем текущий элемент
      faqItem.classList.toggle('active');
    });
  });
  
  // Форма записи на консультацию
  const appointmentForm = document.querySelector('.appointment-form');
  
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Сбор данных формы
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      
      // Валидация
      if (!data.name || !data.phone) {
        showNotification('Пожалуйста, заполните обязательные поля', 'error');
        return;
      }
      
      // Эмуляция отправки
      showNotification('Заявка отправлена! Мы свяжемся с вами в течение часа.', 'success');
      
      // Очистка формы
      this.reset();
      
      // Прокрутка к подтверждению
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Функция показа уведомлений
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification__content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Удаление через 5 секунд
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }
  
  // Стили для уведомлений
  const notificationStyles = document.createElement('style');
  notificationStyles.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      z-index: 1000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
      max-width: 400px;
    }
    
    .notification.show {
      opacity: 1;
      transform: translateX(0);
    }
    
    .notification--success {
      background: #4caf50;
    }
    
    .notification--error {
      background: #f44336;
    }
    
    .notification__content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .notification i {
      font-size: 1.2rem;
    }
  `;
  document.head.appendChild(notificationStyles);
  
  // Анимация появления элементов при скролле
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  // Наблюдаем за всеми карточками
  document.querySelectorAll('.direction-card, .technology-item, .doctor-card').forEach(el => {
    observer.observe(el);
  });
  
  // Добавляем стили для анимации
  const animationStyles = document.createElement('style');
  animationStyles.textContent = `
    .direction-card,
    .technology-item,
    .doctor-card {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease;
    }
    
    .animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    .step {
      opacity: 0;
      transform: translateX(-30px);
      transition: all 0.6s ease;
    }
    
    .step.animate-in {
      opacity: 1;
      transform: translateX(0);
    }
  `;
  document.head.appendChild(animationStyles);
  
  // Наблюдаем за шагами таймлайна
  document.querySelectorAll('.step').forEach((step, index) => {
    observer.observe(step);
  });
  
  // Счетчик статистики
  const statNumbers = document.querySelectorAll('.stat-item__number');
  const surgeryHero = document.querySelector('.surgery-hero');
  
  if (surgeryHero && statNumbers.length > 0) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(surgeryHero);
  }
  
  function animateCounter() {
    statNumbers.forEach(statNumber => {
      const target = parseInt(statNumber.textContent);
      const duration = 2000; // 2 секунды
      const increment = target / (duration / 16); // 60fps
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        statNumber.textContent = Math.floor(current) + (statNumber.textContent.includes('%') ? '%' : '+');
      }, 16);
    });
  }
});


// castration-sterilization.js

document.addEventListener('DOMContentLoaded', function() {
  // Переключение табов в ценах
  const pricingTabs = document.querySelectorAll('.pricing-tab');
  const pricingContents = document.querySelectorAll('.pricing-content');
  
  pricingTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const animal = this.dataset.animal;
      
      pricingTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      pricingContents.forEach(content => {
        content.classList.remove('active');
      });
      
      document.getElementById(animal).classList.add('active');
    });
  });
  
  // Аккордеон FAQ
  const faqQuestions = document.querySelectorAll('.faq-item__question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const faqItem = this.parentElement;
      
      // Закрываем другие открытые элементы в этой же категории
      const parentCategory = faqItem.closest('.faq-category');
      parentCategory.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
          item.classList.remove('active');
        }
      });
      
      faqItem.classList.toggle('active');
    });
  });
  
  // Форма записи
  const appointmentForm = document.querySelector('.appointment-form');
  
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Простая валидация
      const requiredFields = this.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = '#ff6b6b';
        } else {
          field.style.borderColor = '';
        }
      });
      
      if (!isValid) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
      }
      
      // Эмуляция отправки
      showNotification('Заявка отправлена! Мы свяжемся с вами в течение 30 минут.', 'success');
      this.reset();
    });
  }
  
  // Функция уведомлений
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `cs-notification cs-notification--${type}`;
    notification.innerHTML = `
      <div class="cs-notification__content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Стили для уведомления
    const styles = `
      .cs-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 400px;
      }
      
      .cs-notification.show {
        opacity: 1;
        transform: translateX(0);
      }
      
      .cs-notification--success {
        background: #4caf50;
      }
      
      .cs-notification--error {
        background: #f44336;
      }
      
      .cs-notification__content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .cs-notification i {
        font-size: 1.2rem;
      }
    `;
    
    // Добавляем стили, если их еще нет
    if (!document.querySelector('#notification-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'notification-styles';
      styleEl.textContent = styles;
      document.head.appendChild(styleEl);
    }
    
    // Показываем уведомление
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Убираем через 5 секунд
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }
  
  // Анимация появления элементов
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  // Наблюдаем за карточками и блоками
  document.querySelectorAll('.difference-card, .pricing-card, .recovery-card, .process-step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
  
  // Добавляем класс для анимации
  const animationStyles = document.createElement('style');
  animationStyles.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(animationStyles);
  
  // Анимация статистики
  const statsSection = document.querySelector('.cs-hero');
  const statNumbers = document.querySelectorAll('.cs-stat__number');
  
  if (statsSection && statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
  }
  
  function animateStats() {
    statNumbers.forEach(stat => {
      const text = stat.textContent;
      const isPercent = text.includes('%');
      const isPlus = text.includes('+');
      const number = parseFloat(text.replace(/[^0-9.]/g, ''));
      
      let current = 0;
      const increment = number / 100;
      const duration = 2000;
      const interval = duration / 100;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
          current = number;
          clearInterval(timer);
        }
        
        let display = Math.floor(current);
        if (isPercent) display += '%';
        if (isPlus) display += '+';
        
        stat.textContent = display;
      }, interval / 10);
    });
  }
});