const mongoose = require('mongoose');

mongoose.connect('mongodb://root:example@localhost:27017/app?authSource=admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB réussie'))
.catch(err => console.error('Erreur de connexion à MongoDB', err));

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
});
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  });
  
const serverSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    url: { type: String, required: true },
    ping: { type: Number, required: true, default: 60 },
    value: { type: String, enum: ['UP', 'DOWN'], default: 'UP' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const logSchema = new mongoose.Schema({
    server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
    status: { type: String, enum: ['UP', 'DOWN'], required: true },
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Server = mongoose.model('Server', serverSchema);
const Log = mongoose.model('Log', logSchema);

module.exports = { User, Server, Log };
