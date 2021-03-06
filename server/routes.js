const express = require('express');
const path = require('path');

const user = require('./controllers/user');
const annotate = require('./controllers/annotate');
const script = require('./controllers/script');
const key = require('./controllers/key');
const githubIntegration = require('./integrations/github');
const urlIntegration = require('./integrations/url');

const router = express.Router();

//deprecate this at some point...
//DEPRECATED
router.post('/api/signup', user.signup);
router.post('/api/signin', user.signin);
router.get('/api/signout', user.signout);
router.get('/api/me', user.info);

//user routes
router.post('/api/users/signup', user.signup);
router.post('/api/users/signin', user.signin);
router.get('/api/users/signout', user.signout);
router.get('/api/users/signedin', user.signedin);
router.get('/api/users/hasgithub', user.hasGithub);

//integrations

router.get('/api/integrations/github', githubIntegration.redirectTo);
router.get('/api/github/repos', githubIntegration.repoList);
router.get('/api/integrations/github/auth', githubIntegration.register);

router.get('/api/urls', urlIntegration.urlList);
router.post('/api/urls', urlIntegration.urlSelect);

//keys
router.get('/api/keys', key.getAll);
router.post('/api/keys', key.createKey);

//annotations
router.options('/api/annotate', annotate.allowCORS);
router.post('/api/annotate', annotate.create);

//special script serving
router.get('/script.js', script.get);

router.use(express.static('./client/public'));
router.get('*', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../client/public/index.html`));
});

module.exports = router;
