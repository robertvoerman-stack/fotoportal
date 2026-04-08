export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { project, po, desc, fname, subject, image } = await req.json();

  if (!project || !po || !fname || !image) {
    return new Response('Ontbrekende velden', { status: 400 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL,
      to: [process.env.TO_EMAIL],
      subject: subject,
      text: `Projectnummer: ${project}\nPO-nummer: ${po}\nOmschrijving: ${desc}\nBestandsnaam: ${fname}\n\nAutomatisch verstuurd via Foto Portal.`,
      attachments: [{
        content: image,
        filename: fname
      }]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend fout:', err);
    return new Response('Versturen mislukt', { status: 500 });
  }

  return new Response('OK', { status: 200 });
};

export const config = { path: '/netlify/functions/send' };
