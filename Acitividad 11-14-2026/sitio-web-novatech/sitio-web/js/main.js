/**
 * main.js — Sitio corporativo (JavaScript puro, sin dependencias)
 *
 * Módulos:
 *  1. Menú lateral (hamburguesa + overlay + teclado)
 *  2. Enlace activo según la página actual
 *  3. Animaciones de aparición con IntersectionObserver
 *  4. Carrusel de testimonios (Clientes)
 *  5. Validación accesible del formulario (Contacto)
 */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
   * 1. MENÚ LATERAL — móvil/tablet
   * ---------------------------------------------------------------------- */
  var navToggle  = document.getElementById('navToggle');
  var sidebar    = document.getElementById('sidebar');
  var overlay    = document.getElementById('navOverlay');
  var navLinks   = document.querySelectorAll('.sidebar__link');

  function openMenu() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
    navToggle.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // bloquea scroll de fondo
  }

  function closeMenu() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navToggle && sidebar && overlay) {
    navToggle.addEventListener('click', function () {
      sidebar.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    // Cerrar al hacer clic fuera (overlay)
    overlay.addEventListener('click', closeMenu);

    // Cerrar con Escape (accesibilidad)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
        closeMenu();
        navToggle.focus();
      }
    });

    // Cerrar al navegar por un enlace del menú (en móvil/tablet)
    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ----------------------------------------------------------------------
   * 2. ENLACE ACTIVO — marca el enlace de la página actual
   * ---------------------------------------------------------------------- */
  var current = location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href === current) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ----------------------------------------------------------------------
   * 3. ANIMACIONES DE APARICIÓN AL HACER SCROLL
   * ---------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // anima solo una vez
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Respaldo: si no hay soporte, mostrar todo
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ----------------------------------------------------------------------
   * 4. CARRUSEL DE TESTIMONIOS — Clientes (JS puro)
   * ---------------------------------------------------------------------- */
  var carousel = document.getElementById('carousel');
  if (carousel) {
    var track = carousel.querySelector('.carousel__track');
    var slides = carousel.querySelectorAll('.carousel__slide');
    var btnPrev = carousel.querySelector('.carousel__btn--prev');
    var btnNext = carousel.querySelector('.carousel__btn--next');
    var dotsWrap = carousel.querySelector('.carousel__dots');
    var index = 0;
    var timer = null;

    // Crear puntos indicadores
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Ir al testimonio ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); restartAuto(); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll('.carousel__dot');

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (d, j) { d.classList.toggle('is-active', j === index); });
    }

    function restartAuto() {
      clearInterval(timer);
      timer = setInterval(function () { goTo(index + 1); }, 5000);
    }

    btnPrev.addEventListener('click', function () { goTo(index - 1); restartAuto(); });
    btnNext.addEventListener('click', function () { goTo(index + 1); restartAuto(); });

    // Pausar autoplay al interactuar con teclado/pantalla táctil
    carousel.addEventListener('mouseenter', function () { clearInterval(timer); });
    carousel.addEventListener('mouseleave', restartAuto);

    restartAuto();
  }

  /* ----------------------------------------------------------------------
   * 5. VALIDACIÓN DE FORMULARIO — Contacto (accesible, sin envío real)
   * ---------------------------------------------------------------------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('formStatus');

    // Reglas por campo: id del input -> { test, mensaje }
    var rules = {
      nombre: {
        test: function (v) { return v.trim().length >= 2; },
        msg: 'Ingresa tu nombre completo (mínimo 2 caracteres).'
      },
      email: {
        test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
        msg: 'Ingresa un correo electrónico válido (ej. nombre@correo.com).'
      },
      asunto: {
        test: function (v) { return v.trim().length >= 4; },
        msg: 'El asunto debe tener al menos 4 caracteres.'
      },
      mensaje: {
        test: function (v) { return v.trim().length >= 10; },
        msg: 'El mensaje debe tener al menos 10 caracteres.'
      }
    };

    function validateField(input) {
      var rule = rules[input.id];
      if (!rule) return true;
      var ok = rule.test(input.value);
      var errorEl = document.getElementById(input.id + 'Error');

      input.classList.toggle('is-invalid', !ok);
      input.classList.toggle('is-valid', ok);
      input.setAttribute('aria-invalid', String(!ok));
      if (errorEl) errorEl.textContent = ok ? '' : rule.msg;
      return ok;
    }

    // Validación en tiempo real al salir del campo
    Object.keys(rules).forEach(function (id) {
      var input = document.getElementById(id);
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        // Si ya tiene error, revalidar mientras escribe
        if (input.classList.contains('is-invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var allOk = true;
      var firstInvalid = null;

      Object.keys(rules).forEach(function (id) {
        var input = document.getElementById(id);
        if (!validateField(input)) {
          allOk = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      status.classList.remove('is-visible', 'form__status--success', 'form__status--error');

      if (allOk) {
        status.textContent = '¡Mensaje enviado correctamente! Te contactaremos pronto.';
        status.classList.add('form__status--success', 'is-visible');
        form.reset();
        Object.keys(rules).forEach(function (id) {
          var input = document.getElementById(id);
          input.classList.remove('is-valid', 'is-invalid');
          input.removeAttribute('aria-invalid');
        });
      } else {
        status.textContent = 'Revisa los campos marcados en rojo antes de enviar.';
        status.classList.add('form__status--error', 'is-visible');
        firstInvalid.focus(); // lleva el foco al primer campo con error
      }
    });
  }
})();
