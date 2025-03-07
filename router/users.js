const express = require('express')
const bcrypt = require('bcryptjs');
const router = express.Router()
const { User, Server, Log } = require('../database/schema');

router.get('/:id', (req, res) => {
    User.findById(req.params.id)
        .then((data) => res.send(data).end())
        .catch(err => res.status(500).send(err));
});

router.post('/create',async (req, res) => {
    const {  email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newuser = new User({  email, password: hashedPassword, role });
    newuser.save()
        .then(() => res.end())
        .catch(err => res.status(500).send(err));
});
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    User.findByIdAndDelete(id)
        .then(() => res.end())
        .catch(err => res.status(500).send(err));
});
router.put('/users/:id', (req, res) => {
    res.send('ok').end();
});

module.exports = router
