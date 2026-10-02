import type { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";
import * as exerciceService from "./exercice.service.js";

function supprimerFichierLocal(url: string) {
  if (!url.startsWith("/uploads/exercices/")) return;
  const filename = path.basename(url);
  const filePath = path.resolve(process.cwd(), "uploads", "exercices", filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export async function ajouterExercice(req: Request, res: Response) {
  try {
    if (!req.user) {
      if (req.file) supprimerFichierLocal(`/uploads/exercices/${req.file.filename}`);
      return res.status(401).json({ message: "Non authentifié" });
    }

    const { coursId } = req.params;

    if (typeof coursId !== "string") {
      if (req.file) supprimerFichierLocal(`/uploads/exercices/${req.file.filename}`);
      return res.status(400).json({ message: "Identifiant du cours invalide" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier PDF reçu" });
    }

    const titre =
      typeof req.body.titre === "string" && req.body.titre.trim() !== ""
        ? req.body.titre.trim()
        : req.file.originalname;

    const url = `/uploads/exercices/${req.file.filename}`;

    try {
      const exercice = await exerciceService.creerExercice(
        coursId,
        { titre, description: req.body.description, type: "PDF", url },
        req.user.id,
        req.user.role
      );

      return res.status(201).json({ message: "Exercice ajouté avec succès", exercice });
    } catch (error) {
      supprimerFichierLocal(url);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne du serveur";
    const status = message === "Cours introuvable" ? 404 : 403;
    return res.status(status).json({ message });
  }
}

export async function listerExercicesParCours(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Non authentifié" });

    const { coursId } = req.params;
    if (typeof coursId !== "string") {
      return res.status(400).json({ message: "Identifiant du cours invalide" });
    }

    const exercices = await exerciceService.getExercicesParCours(
      coursId,
      req.user.id,
      req.user.role
    );

    return res.json(exercices);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne du serveur";
    const status = message === "Cours introuvable" ? 404 : 403;
    return res.status(status).json({ message });
  }
}

export async function telechargerExercice(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Non authentifié" });

    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(400).json({ message: "Identifiant de l'exercice invalide" });
    }

    const exercice = await exerciceService.getExerciceForDownload(
      id,
      req.user.id,
      req.user.role
    );

    const filename = path.basename(exercice.url);
    const filePath = path.resolve(process.cwd(), "uploads", "exercices", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Le fichier physique est introuvable" });
    }

    const nomTelechargement = exercice.titre.endsWith(".pdf")
      ? exercice.titre
      : `${exercice.titre}.pdf`;

    return res.download(filePath, nomTelechargement);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne du serveur";
    const status = message === "Exercice introuvable" ? 404 : 403;
    return res.status(status).json({ message });
  }
}

export async function supprimerUnExercice(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Non authentifié" });

    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(400).json({ message: "Identifiant de l'exercice invalide" });
    }

    const exercice = await exerciceService.supprimerExercice(id, req.user.id, req.user.role);

    try {
      supprimerFichierLocal(exercice.url);
    } catch (fileError) {
      console.error("Impossible de supprimer le fichier physique :", fileError);
    }

    return res.json({ message: "Exercice supprimé avec succès" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne du serveur";
    const status = message === "Exercice introuvable" ? 404 : 403;
    return res.status(status).json({ message });
  }
}