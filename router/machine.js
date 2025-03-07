const express = require('express')
const router = express.Router()
const { User, Server, Log } = require('../database/schema');

router.get('/:id', (req, res) => {
    Server.findById(req.params.id)
        .then((data) => res.send(data).end())
        .catch(err => res.status(500).send(err));
});

router.post('/create', (req, res) => {
    const { nom, url, ping, value, user } = req.body;
    const newmachine = new Server({ nom, url, ping, value, user });
    newmachine.save()
        .then(() => res.end())
        .catch(err => res.status(500).send(err));
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    Server.findByIdAndDelete(id)
        .then(() => res.end())
        .catch(err => res.status(500).send(err));
});

router.put('/:id', (req, res) => {
    const { value } = req.body;
    if (!['UP', 'DOWN'].includes(value)) {
        return res.status(400).send({ error: 'Valeur invalide' });
    }
    
    Server.findByIdAndUpdate(req.params.id, { value }, { new: true })
        .then(updatedServer => res.send(updatedServer))
        .catch(err => res.status(500).send(err));
});

module.exports = router
