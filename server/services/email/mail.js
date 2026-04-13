//import transporter from './aws-ses-transport.js';
//import mjml2html from 'mjml';

/**
 * Attempts to send a raw email through the configured SES transporter.
 * This helper has been deprecated in favor of {@link sendTemplatedEmail} and
 * always throws to prevent accidental use.
 *
 * @param {Object} options - Email payload.
 * @param {string|string[]} options.to - Recipient email address or list.
 * @param {string} options.subject - Email subject line.
 * @param {string} [options.text] - Plain text body content.
 * @param {string} [options.html] - HTML body content.
 * @param {Object} [ses] - Additional SES-specific Nodemailer options.
 * @returns {Promise<never>} Always throws to indicate deprecation.
 * @throws {Error} Always throws to direct callers to the replacement helper.
 */
export async function sendMail({ to, subject, text, html }, ses = {}) {
  throw new Error('sendMail is deprecated. Use sendTemplatedEmail instead.');
  transporter.once('idle', async () => {
    if (transporter.isIdle()) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to,
          subject,
          text,
          html,
          ...ses,
        });
      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
      }
    }
  });
}

/**
 * Sends an SES email using a predefined template.
 * The implementation relies on MJML templates and the deprecated
 * {@link sendMail} helper; once the template pipeline is finalized the
 * rendering logic should be restored.
 *
 * @param {Object} options - Email payload configuration.
 * @param {string|string[]} options.to - Recipient email address or list.
 * @param {string} options.subject - Subject line to apply to the email.
 * @param {string} options.template - MJML template string for rendering HTML.
 * @param {string} [options.text] - Plain text fallback body.
 * @returns {Promise<void>} Resolves once the templated email is sent.
 */
export async function sendTemplatedEmail({ to, subject, template, text }) {
  // const { html } = mjml2html(template);
  // await sendMail({ to, subject, html, text });
}
