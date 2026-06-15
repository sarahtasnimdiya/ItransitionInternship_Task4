const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.EMAIL_PASS
);


async function sendVerificationEmail(toEmail, token) {
  const link = `${process.env.SERVER_URL}/api/auth/verify/${token}`;

    try {
    await apiInstance.sendTransacEmail({
      sender: {
        email: 'sarahtasnim99@gmail.com',
        name: 'The App: User Manager'
      },
    to: [{ email: toEmail }],
    subject: 'Verify your e-mail',
    html: `
      <h2>Welcome!</h2>
      <p>Click the link below to verify your e-mail address:</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you did not register, ignore this message.</p>
    `,
  });
  console.log('Verification email sent to:', toEmail, '| ID:', info.messageId);
}
 catch (err) {
    console.error('Failed to send verification email to:', toEmail);
    console.error('Error:', err.message);
  }

}

module.exports = { sendVerificationEmail };


