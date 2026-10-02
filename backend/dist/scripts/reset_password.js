import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
const email = "mickael.apprenant@test.com";
const nouveauMotDePasse = "12345678";
async function main() {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        console.log("Utilisateur introuvable");
        return;
    }
    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);
    await prisma.user.update({
        where: { email },
        data: {
            password: hashedPassword,
        },
    });
    console.log("Mot de passe modifié avec succès");
}
main()
    .catch((error) => {
    console.error(error);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=reset_password.js.map