exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { project, po, desc, fname, subject, image } = JSON.parse(event.body);

    if (!project || !po || !fname || !image) {
      return { statusCode: 400, body: 'Ontbrekende velden' };
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
      return { statusCode: 500, body: 'Versturen mislukt: ' + err };
    }

    return { statusCode: 200, body: 'OK' };

  } catch(e) {
    console.error('Function fout:', e.message);
    return { statusCode: 500, body: 'Fout: ' + e.message };
  }
};
