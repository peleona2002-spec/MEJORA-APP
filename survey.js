/**
 * =====================================================================
 * Heladería y Frutería Arcoíris - survey.js
 * Lógica interactiva para la Encuesta de Satisfacción y Opinión
 * Conecta con el módulo SurveyDB (IndexedDB / LocalStorage / API)
 * =====================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const surveyForm        = document.getElementById('surveyForm');
  const surveySuccessCard = document.getElementById('surveySuccessCard');
  const surveySubmitBtn   = document.getElementById('surveySubmitBtn');
  const btnSurveyNew      = document.getElementById('btnSurveyNew');

  if (!surveyForm) return;

  /* -------------------------------------------------------------
   * 1. ESTRELLAS INTERACTIVAS (Calificación 1 a 5)
   * ------------------------------------------------------------- */
  const starRatings = document.querySelectorAll('.star-rating');

  const ratingFeedbackTexts = {
    calificacionCalidad: {
      1: '1/5 · Necesita mejorar bastante',
      2: '2/5 · Regular, esperábamos más',
      3: '3/5 · Bueno / Aceptable',
      4: '4/5 · ¡Muy rico y delicioso!',
      5: '5/5 · ¡Excelente calidad y sabor supremo! 🍦'
    },
    calificacionPresentacion: {
      1: '1/5 · Presentación deficiente',
      2: '2/5 · Presentación regular',
      3: '3/5 · Buena presentación',
      4: '4/5 · ¡Muy fresca y apetitosa!',
      5: '5/5 · ¡Impecable, hermosa y fresca! 🍓'
    },
    calificacionWeb: {
      1: '1/5 · Experiencia difícil o lenta',
      2: '2/5 · Navegación confusa',
      3: '3/5 · Funciona bien',
      4: '4/5 · ¡Muy bonita y rápida!',
      5: '5/5 · ¡Excelente experiencia web y diseño arcoíris! 🌈'
    }
  };

  starRatings.forEach(container => {
    const targetInputId = container.dataset.target;
    const hiddenInput = document.getElementById(targetInputId);
    const feedbackEl = document.getElementById(
      targetInputId === 'calificacionCalidad' ? 'feedback-calidad' :
      targetInputId === 'calificacionPresentacion' ? 'feedback-presentacion' : 'feedback-web'
    );
    const starBtns = container.querySelectorAll('.star-btn');

    function updateStars(val) {
      starBtns.forEach(btn => {
        const btnVal = Number(btn.dataset.value);
        btn.classList.toggle('active', btnVal <= val);
      });
      if (hiddenInput) hiddenInput.value = val;
      if (feedbackEl && ratingFeedbackTexts[targetInputId]) {
        feedbackEl.textContent = ratingFeedbackTexts[targetInputId][val] || `${val}/5`;
      }
    }

    starBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const val = Number(btn.dataset.value);
        updateStars(val);
      });

      // Efecto hover
      btn.addEventListener('mouseenter', () => {
        const val = Number(btn.dataset.value);
        starBtns.forEach(b => {
          b.classList.toggle('hovered', Number(b.dataset.value) <= val);
        });
      });

      btn.addEventListener('mouseleave', () => {
        starBtns.forEach(b => b.classList.remove('hovered'));
      });
    });
  });

  /* -------------------------------------------------------------
   * 2. ESCALA NPS (Recomendación del 1 al 10)
   * ------------------------------------------------------------- */
  const npsButtons   = document.querySelectorAll('.nps-btn');
  const npsInput     = document.getElementById('recomendacionNPS');
  const npsBadge     = document.getElementById('npsSelectedBadge');

  npsButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const score = Number(btn.dataset.score);
      npsButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (npsInput) npsInput.value = score;

      if (npsBadge) {
        npsBadge.className = '';
        if (score >= 9) {
          npsBadge.className = 'nps-badge-promotor';
          npsBadge.textContent = `Puntaje: ${score} / 10 · ⭐ ¡Promotor entusiasta!`;
        } else if (score >= 7) {
          npsBadge.className = 'nps-badge-pasivo';
          npsBadge.textContent = `Puntaje: ${score} / 10 · 👍 Cliente satisfecho`;
        } else {
          npsBadge.className = 'nps-badge-detractor';
          npsBadge.textContent = `Puntaje: ${score} / 10 · 💡 Tomaremos nota para mejorar`;
        }
      }
    });
  });

  /* -------------------------------------------------------------
   * 3. VALIDACIÓN Y ENVÍO DEL FORMULARIO A LA BASE DE DATOS
   * ------------------------------------------------------------- */
  surveyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreInput = document.getElementById('surveyNombre');
    const emailInput  = document.getElementById('surveyEmail');
    const errNombre   = document.getElementById('err-surveyNombre');
    const errEmail    = document.getElementById('err-surveyEmail');

    let isValid = true;

    // Validación Nombre
    if (!nombreInput.value.trim()) {
      isValid = false;
      errNombre.textContent = 'Por favor escribe tu nombre completo.';
      nombreInput.classList.add('input-invalid');
    } else {
      errNombre.textContent = '';
      nombreInput.classList.remove('input-invalid');
    }

    // Validación Correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      isValid = false;
      errEmail.textContent = 'Por favor ingresa un correo electrónico válido.';
      emailInput.classList.add('input-invalid');
    } else {
      errEmail.textContent = '';
      emailInput.classList.remove('input-invalid');
    }

    if (!isValid) {
      surveyForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Recopilar datos seleccionados
    const formData = new FormData(surveyForm);
    const productosProbados = [];
    surveyForm.querySelectorAll('input[name="productosProbados"]:checked').forEach(cb => {
      productosProbados.push(cb.value);
    });

    const payload = {
      nombreCompleto:           nombreInput.value.trim(),
      correoElectronico:        emailInput.value.trim(),
      telefono:                 formData.get('telefono') || '',
      ciudad:                   formData.get('ciudad') || 'Tocaima',
      rangoEdad:                formData.get('rangoEdad') || '18-25',
      tipoCliente:              formData.get('tipoCliente') || 'Primera vez',
      productosProbados:        productosProbados,
      productoFavorito:         formData.get('productoFavorito') || 'No especificado',
      percepcionPrecio:         formData.get('percepcionPrecio') || 'Justos y adecuados',
      calificacionCalidad:      Number(document.getElementById('calificacionCalidad')?.value || 5),
      calificacionPresentacion: Number(document.getElementById('calificacionPresentacion')?.value || 5),
      sugerenciaProducto:       formData.get('sugerenciaProducto') || '',
      calificacionWeb:          Number(document.getElementById('calificacionWeb')?.value || 5),
      facilidadNavegacion:      formData.get('facilidadNavegacion') || 'Muy fácil',
      percepcionDiseno:         formData.get('percepcionDiseno') || 'Me encanta el estilo arcoíris',
      utilidadWhatsapp:         formData.get('utilidadWhatsapp') || 'Excelente y muy práctica',
      recomendacionNPS:         Number(document.getElementById('recomendacionNPS')?.value || 10),
      comentarios:              formData.get('comentarios') || ''
    };

    // Estado visual de carga en el botón
    surveySubmitBtn.disabled = true;
    surveySubmitBtn.classList.add('loading');
    const originalBtnText = surveySubmitBtn.querySelector('.btn-text').innerHTML;
    surveySubmitBtn.querySelector('.btn-text').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando en base de datos...';

    try {
      // Guardar en Base de Datos vía SurveyDB (IndexedDB + localStorage + API)
      const result = await window.SurveyDB.saveSurvey(payload);

      // Mostrar pantalla de éxito
      document.getElementById('successUserName').textContent = payload.nombreCompleto;
      document.getElementById('successUserCode').textContent = result.id;
      document.getElementById('successUserDate').textContent = result.record.fechaFormateada;

      surveyForm.style.display = 'none';
      surveySuccessCard.style.display = 'block';
      surveySuccessCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Redirección opcional automática al enlace oficial pqr3.html
      const instBtn = document.getElementById('btnGoToInstitution');
      if (instBtn) {
        let count = 4;
        instBtn.innerHTML = `<i class="fas fa-external-link-alt"></i> Redirigiendo a pqr3.html en ${count}s... (o haz clic aquí)`;
        const redirectTimer = setInterval(() => {
          count--;
          if (count > 0) {
            instBtn.innerHTML = `<i class="fas fa-external-link-alt"></i> Redirigiendo a pqr3.html en ${count}s... (o haz clic aquí)`;
          } else {
            clearInterval(redirectTimer);
            window.location.href = 'https://iedhernanvenegascarrillo.edu.co/bases2026/proyecto3/pqr3.html';
          }
        }, 1000);

        if (btnSurveyNew) {
          btnSurveyNew.addEventListener('click', () => clearInterval(redirectTimer), { once: true });
        }
      }

    } catch (err) {
      console.error('Error al guardar la encuesta:', err);
      alert('Hubo un inconveniente al registrar la encuesta. Por favor inténtalo nuevamente.');
    } finally {
      surveySubmitBtn.disabled = false;
      surveySubmitBtn.classList.remove('loading');
      surveySubmitBtn.querySelector('.btn-text').innerHTML = originalBtnText;
    }
  });

  /* -------------------------------------------------------------
   * 4. BOTÓN "LLENAR OTRA ENCUESTA"
   * ------------------------------------------------------------- */
  if (btnSurveyNew) {
    btnSurveyNew.addEventListener('click', () => {
      surveyForm.reset();

      // Restaurar estrellas a 5
      document.querySelectorAll('.star-rating').forEach(c => {
        c.querySelectorAll('.star-btn').forEach(b => b.classList.add('active'));
      });
      const c1 = document.getElementById('calificacionCalidad');
      const c2 = document.getElementById('calificacionPresentacion');
      const c3 = document.getElementById('calificacionWeb');
      if (c1) c1.value = 5;
      if (c2) c2.value = 5;
      if (c3) c3.value = 5;

      // Restaurar NPS a 10
      npsButtons.forEach(b => b.classList.remove('selected'));
      document.querySelector('.nps-btn[data-score="10"]')?.classList.add('selected');
      if (npsInput) npsInput.value = 10;
      if (npsBadge) {
        npsBadge.className = 'nps-badge-promotor';
        npsBadge.textContent = 'Puntaje: 10 / 10 · ⭐ ¡Promotor entusiasta!';
      }

      surveySuccessCard.style.display = 'none';
      surveyForm.style.display = 'block';
      surveyForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});
