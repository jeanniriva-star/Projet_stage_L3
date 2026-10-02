import * as dashboardService from "./dashboard.service.js";
export async function getDashboardAdmin(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const dashboard = await dashboardService.getDashboardAdmin();
        return res.status(200).json({
            dashboard,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(500).json({
            message,
        });
    }
}
export async function getDashboardFormateur(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const dashboard = await dashboardService.getDashboardFormateur(req.user.id);
        return res.status(200).json({
            dashboard,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(500).json({
            message,
        });
    }
}
export async function getDashboardApprenant(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const dashboard = await dashboardService.getDashboardApprenant(req.user.id);
        return res.status(200).json({
            dashboard,
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(500).json({
            message,
        });
    }
}
export async function getFormateurDashboard(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Non authentifié",
            });
        }
        const dashboard = await dashboardService.getFormateurDashboard(req.user.id);
        return res.status(200).json(dashboard);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Erreur interne du serveur";
        return res.status(500).json({
            message,
        });
    }
}
//# sourceMappingURL=dashboard.controller.js.map