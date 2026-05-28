import express from 'express';
import nunjucks from 'nunjucks';
import bodyParser from 'body-parser';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

import apiRouter from './routes/api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const app = express();

// Behind the kepas.co.ke nginx proxy this becomes `/tools/cv-builder`. For
// standalone runs the page sits at `/cv-builder` and the API at `/api/cv`.
// Templates pick up the values through Nunjucks so the front-end fetch()
// calls resolve correctly in both modes.
const BASE_PATH = process.env.BASE_PATH || '';
const API_PATH  = process.env.API_PATH  || '/api/cv';

nunjucks.configure(join(ROOT, 'templates'), { autoescape: false, express: app });
app.set('view engine', 'html');

app.use('/api/cv', bodyParser.json({ limit: '15mb' }), bodyParser.urlencoded({ extended: true, limit: '15mb' }), apiRouter);

const renderCV = (req, res) => {
  res.render('cv-builder.html', {
    pageTitle: 'Free CV Builder',
    metaDescription: 'Create a professional CV for free. Fill in your details, save online, share via link, and download as PDF.',
    canonicalPath: `${BASE_PATH || '/cv-builder'}`,
    apiBase: API_PATH,
    shareCode: req.params.shareCode || null,
  });
};

app.get('/cv-builder',              renderCV);
app.get('/cv-builder/:shareCode',   renderCV);
app.get('/',                        (req, res) => res.redirect('/cv-builder'));

app.get('/healthz', (req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 4100;
app.listen(PORT, () => {
  console.log(`kepas-cv-builder listening on :${PORT}`);
});
