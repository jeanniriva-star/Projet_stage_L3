import "dotenv/config";
console.log(process.env.EMAIL_USER);
import { sendEmail, } from "../services/email.service.js";
async function testEmail() {
    try {
        await sendEmail({
            to: "herveandrianomena@gmail.com",
            subject: "Test email Spray_info",
            text: "Bonjour, ceci est un test d'envoi depuis le backend Spray_info.",
            html: `
        <h2>Test Spray_info</h2>
        <p>
          Si tu reçois ce message,
          l'envoi d'email fonctionne correctement.
        </p>
      `,
        });
        console.log("Email envoyé avec succès");
    }
    catch (error) {
        console.error("Erreur envoi email :", error);
    }
}
testEmail();
//# sourceMappingURL=test-email.js.map