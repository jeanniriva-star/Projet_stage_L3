import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import prisma from "../../config/prisma.js";

interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone: string;
  adresse: string;
}

interface LoginData {
  email: string;
  password: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET est introuvable dans .env");
  }

  return secret;
}

const expiresIn =
  (process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"];

export async function register(data: RegisterData) {
  const { nom, prenom, email, password, telephone, adresse } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email déjà utilisé");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      nom,
      prenom,
      email,
      password: hashedPassword,
      telephone,
      adresse,
      role: "APPRENANT",
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      adresse: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function login(data: LoginData) {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const passwordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordValid) {
    throw new Error("Email ou mot de passe incorrect");
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn,
    }
  );

  return {
    token,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      adresse: user.adresse,
      role: user.role,
    },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      adresse: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("Utilisateur introuvable");
  }

  return user;
}