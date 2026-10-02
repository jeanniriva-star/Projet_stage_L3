import type { Request, Response } from "express";
import * as dashboardService from "./dashboard.service.js";

export async function getDashboardAdmin(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const dashboard =
      await dashboardService.getDashboardAdmin();

    return res.status(200).json({
      dashboard,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(500).json({
      message,
    });
  }
}

export async function getDashboardFormateur(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const dashboard =
      await dashboardService.getDashboardFormateur(
        req.user.id
      );

    return res.status(200).json({
      dashboard,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(500).json({
      message,
    });
  }
}

export async function getDashboardApprenant(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const dashboard =
      await dashboardService.getDashboardApprenant(
        req.user.id
      );

    return res.status(200).json({
      dashboard,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(500).json({
      message,
    });
  }
}
export async function getFormateurDashboard(
  req: Request,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Non authentifié",
      });
    }

    const dashboard =
      await dashboardService.getFormateurDashboard(
        req.user.id
      );

    return res.status(200).json(dashboard);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur interne du serveur";

    return res.status(500).json({
      message,
    });
  }
}