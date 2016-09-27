const bluebird = require('bluebird');
const bcrypt = bluebird.promisifyAll(require('bcrypt'));
const User = require('../models/user');
const config = require('../../env/config.json');

module.exports.signin = (req, res) => {
  const session = req.session;
  let sessionUser = {};

  Promise.resolve().then(() =>
      User.findOne({ where: { email: req.body.email } }))

    .then((user) =>
      user || Promise.reject(config.messages.incorrect_cred))

    .then((user) =>
      (sessionUser = bcrypt.compareAsync(req.body.password, user.hash)))

    .then((same) => {
      if (same) {
        session.user = sessionUser;
        res.json({ error: null });

        return Promise.resolve();
      }

      return Promise.reject(config.messages.incorrect_cred);

    }).catch((err) => {
      if (typeof err === 'string') {
        res.status(400).json({ error: err });
      } else {
        res.status(500).json({ error: config.messages.server_error });
      }
    });
};

module.exports.signup = (req, res) => {
  const session = req.session;

  Promise.resolve().then(() => {
    if (!req.body.email || !req.body.password) {
      return Promise.reject(config.messages.missing_cred);
    }

    return Promise.resolve();

  }).then(() =>
      bcrypt.hashAsync(req.body.password, config.salt_rounds))

    .then((hash) =>
      User.create({ email: req.body.email, hash }))

    .then((user) => {
      session.user = user;
      res.json({ error: null });

    }).catch((err) => {
      if (typeof err === 'string') {
        res.status(400).json({ error: err });
      } else if (err.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ error: config.messages.unique_email });
      } else {
        res.status(500).json({ error: config.messages.server_error });
      }
    });
};

module.exports.signout = (req, res) => {
  req.session.destroy(() => res.end());
};

module.exports.info = (req, res) => {
  if (req.session.user) {
    res.json({ github_authenticated: false });
  } else {
    res.status(400).json({ error: config.messages.not_logged_in });
  }
};
