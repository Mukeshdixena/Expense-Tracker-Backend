const user = require('../models/user');

exports.getUser = (req, res, next) => {
    user.findAll()
        .then(user => {
            res.status(200).json(user);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Something went wrong!' });
        });
};

exports.postUser = (req, res, next) => {
    const { username, email, password } = req.body;
    user.create({
        username: username,
        email: email,
        password: password
    })
        .then(result => {
            res.status(201).json(result);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Something went wrong!' });
        });
};

exports.deleteUser = (req, res, next) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    console.log('Received userId:', userId);

    user.findByPk(userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'user not found' });
            }
            return user.destroy();
        })
        .then(() => {
            res.status(200).json({ message: 'user deleted successfully' });
        })
        .catch(err => {
            console.error('Error deleting user:', err);
            res.status(500).json({ message: 'Error deleting user', error: err });
        });
};

exports.editUser = (req, res, next) => {
    const { editId } = req.params;
    const { description, amount } = req.body;

    if (!editId) {
        return res.status(400).json({ message: 'editId is required' });
    }

    user.findByPk(editId)
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'user not found' });
            }
            return user.update({ description, amount });
        })
        .then(updatedUser => {
            res.status(200).json({ message: 'user updated successfully', user: updatedUser });
        })
        .catch(err => {
            console.error('Error updating user:', err);
            res.status(500).json({ message: 'Error updating user', error: err });
        });
};
