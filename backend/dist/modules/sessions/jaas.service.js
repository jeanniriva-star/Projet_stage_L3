import fs from "node:fs";
import path from "node:path";
import jwt from "jsonwebtoken";
function getJaasConfig() {
    const appId = process.env.JAAS_APP_ID;
    const keyId = process.env.JAAS_KEY_ID;
    const privateKeyPath = process.env.JAAS_PRIVATE_KEY_PATH;
    if (!appId) {
        throw new Error("JAAS_APP_ID manquant dans le fichier .env");
    }
    if (!keyId) {
        throw new Error("JAAS_KEY_ID manquant dans le fichier .env");
    }
    if (!privateKeyPath) {
        throw new Error("JAAS_PRIVATE_KEY_PATH manquant dans le fichier .env");
    }
    const cheminAbsolu = path.resolve(process.cwd(), privateKeyPath);
    if (!fs.existsSync(cheminAbsolu)) {
        throw new Error(`Clé privée JaaS introuvable : ${cheminAbsolu}`);
    }
    const privateKey = fs.readFileSync(cheminAbsolu, "utf8");
    return {
        appId,
        keyId,
        privateKey,
    };
}
export function getJaasDomain() {
    return "8x8.vc";
}
export function getJaasRoomName(roomName) {
    const { appId } = getJaasConfig();
    return `${appId}/${roomName}`;
}
export function createJaasToken(params) {
    const { appId, keyId, privateKey, } = getJaasConfig();
    const maintenant = Math.floor(Date.now() / 1000);
    const expiration = maintenant + 60 * 60 * 2;
    const nomComplet = `${params.prenom} ${params.nom}`.trim();
    const payload = {
        aud: "jitsi",
        iss: "chat",
        sub: appId,
        room: params.roomName,
        nbf: maintenant - 10,
        exp: expiration,
        context: {
            user: {
                id: params.userId,
                name: nomComplet ||
                    params.email,
                email: params.email,
                moderator: params.moderator
                    ? "true"
                    : "false",
            },
            features: {
                livestreaming: false,
                recording: false,
                transcription: false,
                "outbound-call": false,
            },
            room: {
                regex: false,
            },
        },
    };
    return jwt.sign(payload, privateKey, {
        algorithm: "RS256",
        header: {
            alg: "RS256",
            kid: keyId,
            typ: "JWT",
        },
    });
}
//# sourceMappingURL=jaas.service.js.map