const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((error) => console.log('MongoDB connection error:', error));
app.get('/', (req, res) => {
    res.send('Server is running!');
});
const PORT = process.env.PORT || 4000;
app.get('/api/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne' });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // À remplacer par votre base de données. Ne stockez jamais le mot de passe en clair.
  const user = await findUserByEmail(email);
  if (!user || !(await checkPassword(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect.' });
  }

  res.json({ message: 'Connexion réussie', token: 'votre-token' });
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  // À remplacer par votre base de données : vérifiez si l'e-mail existe déjà.
  const exists = await findUserByEmail(email);
  if (exists) {
    return res.status(409).json({ message: 'Un compte existe déjà avec cette adresse e-mail.' });
  }

  // Enregistrez l'utilisateur avec un mot de passe haché (par exemple avec bcrypt).
  res.status(201).json({ message: 'Compte créé' });
});

app.listen(3000, () => console.log('Serveur sur http://localhost:3000'));
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Register route
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;

    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);

    res.status(201).json({
        message: "Registration successful!"
    });
});
