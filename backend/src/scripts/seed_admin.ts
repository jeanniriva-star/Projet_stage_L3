import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

async function main() {
  const nom = process.env.SEED_ADMIN_NOM;
  const prenom = process.env.SEED_ADMIN_PRENOM;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const telephone = process.env.SEED_ADMIN_TELEPHONE;
  const adresse = process.env.SEED_ADMIN_ADRESSE;

  if (
    !nom ||
    !prenom ||
    !email ||
    !password ||
    !telephone ||
    !adresse
  ) {
    throw new Error(
      "Les variables SEED_ADMIN_* sont incomplètes dans le fichier .env"
    );
  }

  if (password.length < 8) {
    throw new Error(
      "SEED_ADMIN_PASSWORD doit contenir au moins 8 caractères"
    );
  }

  const utilisateurExistant = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (utilisateurExistant) {
    if (utilisateurExistant.role !== "ADMIN") {
      throw new Error(
        "Un utilisateur avec cet email existe déjà mais n'est pas ADMIN"
      );
    }

    console.log(
      ` Le compte ADMIN ${email} existe déjà. Aucun changement effectué.`
    );

    return;
  }

  const passwordHash = await bcrypt.hash(
    password,
    10
  );

  const admin = await prisma.user.create({
    data: {
      nom,
      prenom,
      email,
      password: passwordHash,
      telephone,
      adresse,
      role: "ADMIN",
    },

    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
    },
  });

  console.log("Premier ADMIN créé avec succès :");
  console.log(admin);
}

main()
  .catch((error) => {
    console.error("Erreur Seed ADMIN :");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });