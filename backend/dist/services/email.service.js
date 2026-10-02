import nodemailer from "nodemailer";
const emailUser = process.env.EMAIL_USER;
const emailAppPassword = process.env.EMAIL_APP_PASSWORD;
if (!emailUser) {
    throw new Error("EMAIL_USER est manquant dans le fichier .env");
}
if (!emailAppPassword) {
    throw new Error("EMAIL_APP_PASSWORD est manquant dans le fichier .env");
}
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailAppPassword,
    },
});
export async function sendEmail(options) {
    return transporter.sendMail({
        from: {
            name: "Spray_info",
            address: emailUser,
        },
        to: options.to,
        subject: options.subject,
        text: options.text,
        ...(options.html && {
            html: options.html,
        }),
    });
}
// ======================================================
// INSCRIPTION VALIDÉE
// ======================================================
export async function sendInscriptionValideeEmail(email, prenom, formationTitre) {
    return sendEmail({
        to: email,
        subject: "Votre inscription a été validée",
        text: `
Bonjour ${prenom},

Votre inscription à la formation "${formationTitre}" a été validée.

Vous pouvez maintenant accéder à cette formation depuis votre espace apprenant.

Cordialement,
Spray_info
    `.trim(),
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0891b2;">
          Inscription validée
        </h2>

        <p>
          Bonjour <strong>${prenom}</strong>,
        </p>

        <p>
          Votre inscription à la formation
          <strong>${formationTitre}</strong>
          a été validée.
        </p>

        <p>
          Vous pouvez maintenant accéder à cette formation
          depuis votre espace apprenant.
        </p>

        <p>
          Cordialement,<br />
          <strong>Spray_info</strong>
        </p>
      </div>
    `,
    });
}
// ======================================================
// INSCRIPTION REFUSÉE
// ======================================================
export async function sendInscriptionRefuseeEmail(email, prenom, formationTitre) {
    return sendEmail({
        to: email,
        subject: "Votre demande d'inscription",
        text: `
Bonjour ${prenom},

Votre demande d'inscription à la formation "${formationTitre}" n'a pas été validée.

Vous pouvez contacter l'administration pour obtenir davantage d'informations.

Cordialement,
Spray_info
    `.trim(),
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <h2>
          Demande d'inscription
        </h2>

        <p>
          Bonjour <strong>${prenom}</strong>,
        </p>

        <p>
          Votre demande d'inscription à la formation
          <strong>${formationTitre}</strong>
          n'a pas été validée.
        </p>

        <p>
          Vous pouvez contacter l'administration
          pour obtenir davantage d'informations.
        </p>

        <p>
          Cordialement,<br />
          <strong>Spray_info</strong>
        </p>
      </div>
    `,
    });
}
// ======================================================
// AFFECTATION FORMATEUR
// ======================================================
export async function sendAffectationFormateurEmail(email, prenom, formationTitre) {
    return sendEmail({
        to: email,
        subject: "Nouvelle affectation à une formation",
        text: `
Bonjour ${prenom},

Vous avez été affecté à la formation "${formationTitre}".

Vous pouvez désormais accéder à cette formation depuis votre espace formateur.

Cordialement,
Spray_info
    `.trim(),
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0891b2;">
          Nouvelle affectation
        </h2>

        <p>
          Bonjour <strong>${prenom}</strong>,
        </p>

        <p>
          Vous avez été affecté à la formation
          <strong>${formationTitre}</strong>.
        </p>

        <p>
          Vous pouvez désormais accéder à cette formation
          depuis votre espace formateur.
        </p>

        <p>
          Cordialement,<br />
          <strong>Spray_info</strong>
        </p>
      </div>
    `,
    });
}
//# sourceMappingURL=email.service.js.map