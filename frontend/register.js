/**
 * Page d'inscription
 * - validation des champs (nom, e-mail, mots de passe, conditions)
 * - affichage et effacement des erreurs
 * - boutons d'affichage des mots de passe
 * - état de chargement pendant la requête
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
   * Éléments du DOM
   * --------------------------------------------------------------------- */

  const form = document.getElementById('register-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const termsInput = document.getElementById('terms');
  const submitButton = form.querySelector('.submit');
  const alertBox = document.getElementById('alert');

  /* ------------------------------------------------------------------------
   * Configuration
   * --------------------------------------------------------------------- */

  const NAME_MIN_LENGTH = 2;
  const PASSWORD_MIN_LENGTH = 8;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const MESSAGES = {
    nameRequired: 'Saisissez votre nom complet.',
    nameTooShort: `Le nom doit contenir au moins ${NAME_MIN_LENGTH} caractères.`,
    emailRequired: 'Saisissez votre adresse e-mail.',
    emailInvalid: 'Cette adresse e-mail n’est pas valide.',
    emailTaken: 'Un compte existe déjà avec cette adresse e-mail.',
    passwordRequired: 'Choisissez un mot de passe.',
    passwordTooShort: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`,
    passwordNeedsLetterAndDigit: 'Le mot de passe doit contenir au moins une lettre et un chiffre.',
    confirmRequired: 'Confirmez votre mot de passe.',
    confirmMismatch: 'Les deux mots de passe ne correspondent pas.',
    termsRequired: 'Acceptez les conditions pour créer votre compte.',
    networkError: 'Inscription impossible. Vérifiez votre réseau et réessayez.',
    success: 'Votre compte est créé. Bienvenue !',
  };

  /* ------------------------------------------------------------------------
   * Règles de validation
   * Chaque règle renvoie un message d'erreur, ou une chaîne vide si valide.
   * --------------------------------------------------------------------- */

  function validateName() {
    const value = nameInput.value.trim();
    if (!value) return MESSAGES.nameRequired;
    if (value.length < NAME_MIN_LENGTH) return MESSAGES.nameTooShort;
    return '';
  }

  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) return MESSAGES.emailRequired;
    if (!EMAIL_PATTERN.test(value)) return MESSAGES.emailInvalid;
    return '';
  }

  function validatePassword() {
    const value = passwordInput.value;
    if (!value) return MESSAGES.passwordRequired;
    if (value.length < PASSWORD_MIN_LENGTH) return MESSAGES.passwordTooShort;
    if (!/\p{L}/u.test(value) || !/\d/.test(value)) return MESSAGES.passwordNeedsLetterAndDigit;
    return '';
  }

  function validateConfirm() {
    const value = confirmInput.value;
    if (!value) return MESSAGES.confirmRequired;
    if (value !== passwordInput.value) return MESSAGES.confirmMismatch;
    return '';
  }

  function validateTerms() {
    return termsInput.checked ? '' : MESSAGES.termsRequired;
  }

  const confirmField = { input: confirmInput, validate: validateConfirm };

  const fields = [
    { input: nameInput, validate: validateName },
    { input: emailInput, validate: validateEmail },
    { input: passwordInput, validate: validatePassword },
    confirmField,
    { input: termsInput, validate: validateTerms },
  ];

  /* ------------------------------------------------------------------------
   * Affichage
   * --------------------------------------------------------------------- */

  function setFieldError(input, message) {
    const errorElement = document.getElementById(`${input.id}-error`);
    errorElement.textContent = message;

    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  // Valide un champ, affiche son erreur et renvoie le message (vide si valide).
  function checkField(field) {
    const message = field.validate();
    setFieldError(field.input, message);
    return message;
  }

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert alert--${type}`;
    alertBox.hidden = false;
  }

  function hideAlert() {
    alertBox.hidden = true;
    alertBox.textContent = '';
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Création du compte…' : 'Créer mon compte';
    form.setAttribute('aria-busy', String(isLoading));
  }

  /* ------------------------------------------------------------------------
   * Requête d'inscription
   *
   * Remplacez le contenu de cette fonction par votre appel au serveur.
   * Exemple :
   *
   *   const response = await fetch('/api/register', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ name, email, password }),
   *   });
   *   if (response.status === 409) {
   *     throw Object.assign(new Error('Email taken'), { code: 'EMAIL_TAKEN' });
   *   }
   *   if (!response.ok) throw new Error('Server error');
   *   return response.json();
   * ------------------------------------------------------------------------ */

  async function requestRegister({ name, email, password }) {
    // Simulation d'un délai réseau, à supprimer avec le vrai appel.
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Démonstration : cette adresse est déjà utilisée.
    if (email === 'deja@exemple.fr') {
      throw Object.assign(new Error('Email taken'), { code: 'EMAIL_TAKEN' });
    }

    return { name, email, password };
  }

  /* ------------------------------------------------------------------------
   * Gestionnaires d'événements
   * --------------------------------------------------------------------- */

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();

    // Valide tous les champs et garde ceux qui sont en erreur.
    const invalidFields = fields.filter((field) => checkField(field) !== '');

    if (invalidFields.length > 0) {
      invalidFields[0].input.focus();
      return;
    }

    setLoading(true);

    try {
      await requestRegister({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
      });

      showAlert(MESSAGES.success, 'success');
      // Redirection après inscription : adaptez l'URL à votre application.
      // window.location.href = '/tableau-de-bord';
    } catch (error) {
      setLoading(false);

      if (error.code === 'EMAIL_TAKEN') {
        setFieldError(emailInput, MESSAGES.emailTaken);
        emailInput.focus();
      } else {
        showAlert(MESSAGES.networkError, 'error');
      }
    }
  });

  // Met à jour l'erreur pendant la saisie, une fois le champ marqué en erreur.
  fields.forEach((field) => {
    const eventName = field.input.type === 'checkbox' ? 'change' : 'input';

    field.input.addEventListener(eventName, () => {
      if (field.input.getAttribute('aria-invalid') === 'true') {
        checkField(field);
      }
    });
  });

  // Si la confirmation est déjà remplie, elle doit suivre les changements du mot de passe.
  passwordInput.addEventListener('input', () => {
    if (confirmInput.value) {
      checkField(confirmField);
    }
  });

  // Affiche ou masque un mot de passe. Le bouton indique le fichier cible via data-target.
  document.querySelectorAll('.toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.target);
      const isHidden = input.type === 'password';

      input.type = isHidden ? 'text' : 'password';
      button.textContent = isHidden ? 'Masquer' : 'Afficher';
    });
  });
})();