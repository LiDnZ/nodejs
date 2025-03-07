const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const path = require('path');
const { User, Server, Log } = require('./database/schema');
const userRoute = require('./router/users');
const machineRoute = require('./router/machine');
const logRoute = require('./router/log');
const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/users', userRoute);
app.use('/machine', machineRoute);
app.use('/log', logRoute);
app.use((req, res, next) => {
    console.log(`Requête reçue à ${req.url} - Time: ${new Date().toISOString()}`);
    next();
});
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));
app.get('/login', async (req, res) => {
    if (req.session.token) {
        return res.redirect('/dashboard');
    }
    res.render('login', { title: 'Page d\'accueil' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Identifiants incorrects');
    }
    const token = jwt.sign({ userId: user._id }, 'secret_jwt', { expiresIn: '1h' });
    req.session.token = token;
    console.log('user connecté: ',email);
    res.redirect('/dashboard');
});

app.get('/dashboard', async (req, res) => {
    try {
        if (!req.session.token) {
            return res.redirect('/login'); 
        }
        const decoded = jwt.verify(req.session.token, 'secret_jwt');
        const user = await User.findById(decoded.userId).exec(); 
        if (!user) {
            console.log("Utilisateur introuvable");
            return res.redirect('/login');
        }
        const machines = await Server.find({ user: user._id }).exec();
        res.render('dashboard', { user, machines });
    } catch (err) {
        console.error("Erreur de vérification du token:", err);
        return res.redirect('/login');
    }
});
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});


async function checkWebsite(url) {
    try {
      const response = await axios.get(url);
      const status = response.status === 200 ? 'UP' : 'DOWN';
      
      // Générer un log pour chaque vérification
      await axios.post('http://localhost:3000/log/create', {
        server: "67cafd664e7cfde8dc658590",
        status: status
      });
      
      return status;
    } catch (error) {
      await axios.post('http://localhost:3000/log/create', {
        server: "67cafd664e7cfde8dc658590",
        status: 'DOWN'
      });
      return 'DOWN';
    }
  }