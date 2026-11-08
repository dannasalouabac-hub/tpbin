/**
 * Page de connexion
 * - validation des champs
 * - affichage et effacement des erreurs
 * - bouton d'affichage du mot de passe
 * - état de chargement pendant la requête
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
   * Éléments du DOM
   * --------------------------------------------------------------------- */

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const toggleButton = document.getElementById('toggle-password');
  const submitButton = form.querySelector('.submit');
  const alertBox = document.getElementById('alert');

  /* ------------------------------------------------------------------------
   * Configuration
   * --------------------------------------------------------------------- */

  const MIN_PASSWORD_LENGTH = 8;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const MESSAGES = {
    serverError: 'Le serveur a rencontré un problème. Réessayez plus tard.',
    emailRequired: 'Saisissez votre adresse e-mail.',
    emailInvalid: "Cette adresse e-mail n'est pas valide.",
    passwordRequired: 'Saisissez votre mot de passe.',
    passwordTooShort: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
    invalidCredentials: 'Adresse e-mail ou mot de passe incorrect.',
    networkError: 'Connexion impossible. Vérifiez votre réseau et réessayez.',
    success: 'Connexion réussie. Redirection en cours…',
  };

  /* ------------------------------------------------------------------------
   * Règles de validation
   * Chaque champ renvoie un message d'erreur, ou une chaîne vide si valide.
   * --------------------------------------------------------------------- */

  const fields = [
    {
      input: emailInput,
      validate() {
        const value = emailInput.value.trim();
        if (!value) return MESSAGES.emailRequired;
        if (!EMAIL_PATTERN.test(value)) return MESSAGES.emailInvalid;
        return '';
      },
    },
    {
      input: passwordInput,
      validate() {
        const value = passwordInput.value;
        if (!value) return MESSAGES.passwordRequired;
        if (value.length < MIN_PASSWORD_LENGTH) return MESSAGES.passwordTooShort;
        return '';
      },
    },
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
    submitButton.textContent = isLoading ? 'Connexion en cours…' : 'Se connecter';
    form.setAttribute('aria-busy', String(isLoading));
  }

  /* ------------------------------------------------------------------------
   * Requête de connexion
   *
   * Remplacez le contenu de cette fonction par votre appel au serveur.
   * Exemple :
   *
   *   const response = await fetch('/api/login', {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({ email, password, remember }),
   *   });
   *   if (response.status === 401) {
   *     throw Object.assign(new Error('Invalid credentials'), { code: 'INVALID_CREDENTIALS' });
   *   }
   *   if (!response.ok) throw new Error('Server error');
   *   return response.json();
   * ------------------------------------------------------------------------ */

 async function requestLogin({ email, password, remember }) {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, remember })
    });

    const data = await response.json();

    if (!response.ok) {
        throw Object.assign(new Error(data.message), {
            code: response.status === 401
                ? 'INVALID_CREDENTIALS'
                : 'SERVER_ERROR'
        });
    }

    return data;
}
  /* ------------------------------------------------------------------------
   * Gestionnaires d'événements
   * --------------------------------------------------------------------- */

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAlert();

    // Valide tous les champs et garde ceux qui sont en erreur.
    const invalidInputs = fields
      .map(({ input, validate }) => {
        const message = validate();
        setFieldError(input, message);
        return message ? input : null;
      })
      .filter(Boolean);

    if (invalidInputs.length > 0) {
      invalidInputs[0].focus();
      return;
    }

    setLoading(true);

    try {
  const data = await requestLogin({
    email: emailInput.value.trim(),
    password: passwordInput.value,
    remember: form.elements.remember.checked,
  });

  showAlert(MESSAGES.success, 'success');

  // Si le serveur renvoie un token, vous pouvez le garder pour les requêtes suivantes.
  // localStorage.setItem('token', data.token);

  // Redirection après connexion : créez la page cible ou gardez cette ligne commentée.
  // window.location.href = '/tableau-de-bord.html';
} catch (error) {
  const messages = {
    INVALID_CREDENTIALS: MESSAGES.invalidCredentials,
    SERVER_ERROR: MESSAGES.serverError,
  };

  showAlert(messages[error.code] || MESSAGES.networkError, 'error');
  setLoading(false);
  passwordInput.focus();
}
  });

  // Met à jour le message d'erreur pendant la saisie, une fois le champ marqué en erreur.
  fields.forEach(({ input, validate }) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        setFieldError(input, validate());
      }
    });
  });

  // Affiche ou masque le mot de passe.
  toggleButton.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';

    passwordInput.type = isHidden ? 'text' : 'password';
    toggleButton.textContent = isHidden ? 'Masquer' : 'Afficher';
  });
})();
