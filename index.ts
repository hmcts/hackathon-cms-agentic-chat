import express, { Request, Response, NextFunction } from 'express';
import nunjucks from 'nunjucks';
import caseRoutes from './routes/Case.routes';
import chatRoutes from './routes/Chat.routes';
import path from 'path';
import { CaseService } from './services/Case.service';
import { NoteService } from './services/Note.service';

const app = express();
console.log('PORT ENV:', process.env.PORT);
const PORT = process.env.PORT || 3000;

const nunjucksEnv = nunjucks.configure('views', {
  autoescape: true,
  express: app
});

// Add a 'date' filter to Nunjucks for formatting dates
nunjucksEnv.addFilter('date', function(dateStr: string, format?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  // UK format: 'd MMM yyyy, HH:mm'
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  return new Intl.DateTimeFormat('en-GB', options).format(date);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- Add this line to support form submissions
app.use(express.static('public'));

// In-memory authentication flag
let isAuthenticated = false;
const PASSKEY_ENV_VAR = 'CMS_PASSKEY';
const HARDCODED_PASSKEY = process.env[PASSKEY_ENV_VAR];

if (!HARDCODED_PASSKEY) {
  console.error(`\nERROR: Environment variable ${PASSKEY_ENV_VAR} is not set.\nPlease set it before starting the server.\n`);
  process.exit(1);
}

// Passkey page
app.get('/passkey', (req, res) => {
  res.render('passkey.njk', { error: null });
});

app.post('/passkey', (req, res) => {
  const { passkey } = req.body;
  if (passkey === HARDCODED_PASSKEY) {
    isAuthenticated = true;
    return res.redirect('/welcome');
  } else {
    return res.render('passkey.njk', { error: 'Invalid pass key' });
  }
});

// Middleware to protect routes
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (isAuthenticated) {
    return next();
  }
  res.redirect('/passkey');
}

// Landing page (protected)
app.get('/', requireAuth, (req, res) => {
  res.render('landing.njk');
});

// Welcome page (protected)
app.get('/welcome', requireAuth, (req, res) => {
  res.render('landing.njk');
});

// Chat page (protected)
app.get('/chat', requireAuth, (req, res) => {
  res.render('chat.njk');
});

// Cases page (protected)
app.get('/cases', requireAuth, (req, res) => {
  const cases = CaseService.findAll();
  res.render('cases.njk', { cases });
});

// Notes screen for a case (view + add) (protected)
app.get('/cases/:caseId/notes', requireAuth, (req, res) => {
  const caseId = Number(req.params.caseId);
  const foundCase = CaseService.findById(caseId);
  if (!foundCase) return res.status(404).send('Case not found');
  const notes = NoteService.getNotesByCase(caseId);
  res.render('notes.njk', { caseId, notes, caseName: foundCase.name });
});

app.post('/cases/:caseId/notes', requireAuth, (req, res) => {
  const caseId = Number(req.params.caseId);
  const foundCase = CaseService.findById(caseId);
  if (!foundCase) return res.status(404).send('Case not found');
  const { content } = req.body;
  if (!content) {
    const notes = NoteService.getNotesByCase(caseId);
    return res.status(400).render('notes.njk', {
      caseId,
      notes,
      error: 'Note content is required.',
      caseName: foundCase.name
    });
  }
  NoteService.addNote(caseId, content);
  res.redirect(`/cases/${caseId}/notes`);
});

// API routes
app.use('/api/cases', caseRoutes);
app.use('/api/chat', chatRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
