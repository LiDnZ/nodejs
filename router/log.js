const express = require('express');
const router = express.Router();
const { User, Server, Log } = require('../database/schema');

router.get('/:id', (req, res) => {
    Log.findById(req.params.id)
        .then((data) => res.send(data).end())
        .catch(err => res.status(500).send(err));
});

router.post('/create', (req, res) => {
    const { server, status } = req.body;
    if (!['UP', 'DOWN'].includes(status)) {
        return res.status(400).send({ error: 'Valeur invalide' });
    }
    
    const newLog = new Log({ server, status });
    newLog.save()
        .then(() => res.end())
        .catch(err => res.status(500).send(err));
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    Log.findByIdAndDelete(id)
        .then(() => res.end())
        .catch(err => res.status(500).send(err));
});

router.put('/:id', (req, res) => {
    const { status } = req.body;
    if (!['UP', 'DOWN'].includes(status)) {
        return res.status(400).send({ error: 'Valeur invalide' });
    }
    
    Log.findByIdAndUpdate(req.params.id, { status }, { new: true })
        .then(updatedLog => res.send(updatedLog))
        .catch(err => res.status(500).send(err));
});

module.exports = router;