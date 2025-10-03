import { Token } from "../lib-api/model/table/Token";

export async function verifyToken(authorization: string) {
    
    if (!authorization) {
        throw new Error("authorization header missing");
    }
    
    const rawToken = authorization.replace("Bearer", " ");

    const userToken = await Token.findOne({
        where: { token: rawToken },
        relations: ["otm_id_user"],
    });

    if (!userToken) {
        throw new Error("invalid token");
    }

    if (new Date() > userToken.expired_at) {
        throw new Error("token expired");
    }

    return userToken.id_user;
}