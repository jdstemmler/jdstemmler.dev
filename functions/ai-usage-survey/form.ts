// Survey handler for /ai-usage-survey/form (Cloudflare Pages Function).
//
// Step 1: POST { code }                 -> that company's questions
// Step 2: POST { code, step=answers, …} -> one row in D1, then redirect to /thanks/
//
// The company list is not in this (public) repo. It lives in the SURVEY_CONFIG
// secret as JSON, keyed by company code:
//
//   { "CODE": { "company": "Name", "intro": "optional",
//               "questions": [{ "id": "short_id", "label": "Question text" }] } }
//
// See .dev.vars.example for a local copy to test with.

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  SURVEY_CONFIG?: string;
}

interface Question {
  id: string;
  label: string;
}

interface Survey {
  company: string;
  intro?: string;
  questions: Question[];
}

const LANDING = '/ai-usage-survey/';
const ACTION = '/ai-usage-survey/form';
const MAX_BODY_BYTES = 64 * 1024;
const MAX_ANSWER_CHARS = 5000;
const MAX_ROLE_CHARS = 200;

const SCHEMA = `CREATE TABLE IF NOT EXISTS survey_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submitted_at TEXT NOT NULL,
  code TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  answers TEXT NOT NULL
)`;

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const normalizeCode = (s: string) => s.trim().toUpperCase();

function loadSurveys(env: Env): Map<string, Survey> {
  const surveys = new Map<string, Survey>();
  if (!env.SURVEY_CONFIG) return surveys;
  const raw = JSON.parse(env.SURVEY_CONFIG) as Record<string, Survey>;
  for (const [code, survey] of Object.entries(raw)) {
    surveys.set(normalizeCode(code), survey);
  }
  return surveys;
}

const field = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
};

/** Fill the statically built shell page so the response wears the site layout. */
async function page(context: EventContext<Env, string, unknown>, body: string, status = 200) {
  const shell = await context.env.ASSETS.fetch(
    new URL('/ai-usage-survey/shell/', context.request.url)
  );
  const filled = new HTMLRewriter()
    // The shell's canonical/og:url point at the template, not this response.
    .on('link[rel="canonical"], meta[property="og:url"]', {
      element(el) {
        el.remove();
      },
    })
    .on('#survey-slot', {
      element(el) {
        el.setInnerContent(body, { html: true });
      },
    })
    .transform(shell);
  return new Response(filled.body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

function codeForm(error: string) {
  return `
    <p class="label">Survey</p>
    <h1 class="page-title">AI usage survey</h1>
    <form class="survey" method="post" action="${ACTION}">
      <p class="error" role="alert">${esc(error)}</p>
      <div class="field">
        <label class="label" for="code">Company code</label>
        <input id="code" name="code" type="text" required maxlength="64"
          autocomplete="off" autocapitalize="characters" spellcheck="false" />
      </div>
      <button type="submit">Continue</button>
    </form>`;
}

function questionForm(
  code: string,
  survey: Survey,
  values: Record<string, string> = {},
  role = '',
  error = ''
) {
  const questions = survey.questions
    .map(
      (q) => `
      <div class="field">
        <label class="question" for="q-${esc(q.id)}">${esc(q.label)}</label>
        <textarea id="q-${esc(q.id)}" name="q-${esc(q.id)}"
          maxlength="${MAX_ANSWER_CHARS}">${esc(values[q.id] ?? '')}</textarea>
      </div>`
    )
    .join('');
  return `
    <p class="label">Survey · ${esc(survey.company)}</p>
    <h1 class="page-title">AI usage survey</h1>
    <div class="prose">
      <p>${esc(
        survey.intro ??
          'Answer as much or as little as you like. Responses are anonymous: no name, email, or IP address is stored.'
      )}</p>
    </div>
    <form class="survey" method="post" action="${ACTION}">
      ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}
      <input type="hidden" name="code" value="${esc(code)}" />
      <input type="hidden" name="step" value="answers" />
      <div class="hp" aria-hidden="true">
        <label for="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabindex="-1" autocomplete="off" />
      </div>
      ${questions}
      <div class="field">
        <label class="label" for="role">Role or team (optional)</label>
        <input id="role" name="role" type="text" maxlength="${MAX_ROLE_CHARS}"
          autocomplete="off" value="${esc(role)}" />
      </div>
      <button type="submit">Submit</button>
    </form>`;
}

export const onRequestGet: PagesFunction<Env> = ({ request }) =>
  Response.redirect(new URL(LANDING, request.url).toString(), 303);

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return new Response('Payload too large', { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const code = normalizeCode(field(form, 'code'));
  const survey = loadSurveys(env).get(code);
  if (!survey) {
    return page(context, codeForm("That code isn't recognized. Check it and try again."), 422);
  }

  if (field(form, 'step') !== 'answers') {
    return page(context, questionForm(code, survey));
  }

  const thanks = Response.redirect(new URL(`${LANDING}thanks/`, request.url).toString(), 303);

  // Honeypot: real browsers leave it empty. Accept silently, store nothing.
  if (field(form, 'website')) return thanks;

  const values: Record<string, string> = {};
  for (const q of survey.questions) {
    values[q.id] = field(form, `q-${q.id}`).slice(0, MAX_ANSWER_CHARS);
  }
  const role = field(form, 'role').slice(0, MAX_ROLE_CHARS);

  if (!Object.values(values).some(Boolean)) {
    return page(
      context,
      questionForm(code, survey, values, role, 'Answer at least one question before submitting.'),
      422
    );
  }

  // Labels are stored with the answers so rows stay readable if questions change.
  const answers = survey.questions.map((q) => ({
    id: q.id,
    label: q.label,
    answer: values[q.id],
  }));

  await env.DB.batch([
    env.DB.prepare(SCHEMA),
    env.DB.prepare(
      'INSERT INTO survey_responses (submitted_at, code, company, role, answers) VALUES (?, ?, ?, ?, ?)'
    ).bind(new Date().toISOString(), code, survey.company, role || null, JSON.stringify(answers)),
  ]);

  return thanks;
};
