import nodemailer from 'nodemailer';

const MAX_LENGTHS = { name: 120, email: 200, message: 5000 };

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function validate({ name, email, message }) {
  if (!name?.trim()) return 'Please add your name.';
  if (!email?.trim()) return 'Please add your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'That email address looks off.';
  if (!message?.trim()) return 'Please write a message.';
  if (name.length > MAX_LENGTHS.name) return 'That name is too long.';
  if (email.length > MAX_LENGTHS.email) return 'That email address is too long.';
  if (message.length > MAX_LENGTHS.message) return 'That message is too long.';
  return null;
}

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );

export function createContactHandler(env = {}) {
  const recipient = env.CONTACT_RECIPIENT;
  const host = env.SMTP_HOST;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  const port = Number(env.SMTP_PORT || 587);
  const secure = env.SMTP_SECURE === 'true' || port === 465;
  const senderName = env.SENDER_NAME || 'Portfolio contact form';
  const senderEmail = env.SENDER_EMAIL || user;

  const configured = Boolean(host && user && pass && recipient);
  let transporter = null;

  return async function contactHandler(req, res, next) {
    if (req.url?.split('?')[0] !== '/api/contact') return next();
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

    let body;
    try {
      body = await readBody(req);
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }

    // Bots fill every field they find; humans never see this one
    if (body.company) return sendJson(res, 200, { ok: true });

    const problem = validate(body);
    if (problem) return sendJson(res, 400, { error: problem });

    const name = body.name.trim();
    const email = body.email.trim();
    const message = body.message.trim();

    if (!configured) {
      console.log('\n[contact] SMTP not configured. Submission received:');
      console.log(`  from: ${name} <${email}>`);
      console.log(`  message: ${message}\n`);
      return sendJson(res, 503, {
        error: 'Email is not configured on this server yet. Please email me directly.',
      });
    }

    try {
      transporter ??= nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

      await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: recipient,
        replyTo: `"${name}" <${email}>`,
        subject: `Portfolio enquiry from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `
          <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #111;">
            <h2 style="margin: 0 0 16px;">New portfolio enquiry</h2>
            <p style="margin: 0 0 4px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p style="margin: 0 0 16px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
            <div style="padding: 16px; background: #f5f5f2; white-space: pre-wrap;">${escapeHtml(message)}</div>
          </div>
        `,
      });

      return sendJson(res, 200, { ok: true });
    } catch (error) {
      console.error(`[contact] send failed: ${error.message}`);
      return sendJson(res, 500, {
        error: 'Something went wrong sending that. Please email me directly.',
      });
    }
  };
}

export function contactApiPlugin(env = {}) {
  const handler = createContactHandler(env);
  const configured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.CONTACT_RECIPIENT);

  function attach(server) {
    if (!configured) {
      console.warn(
        '[contact] SMTP not configured — /api/contact will log submissions instead of emailing. See .env.example',
      );
    }
    server.middlewares.use(handler);
  }

  return {
    name: 'contact-api',
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
