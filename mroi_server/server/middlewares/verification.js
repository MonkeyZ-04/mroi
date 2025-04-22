import { GENERAL } from "@configs";
import { base64Encode, base64Decode } from "@utils/crpyto";
import { verifyJWT } from "@utils/jwt";
import _ from "lodash";
import { now } from "@utils/date";
import models from "@models";

import { MismatchException, NotFoundException, ValidationException, AuthorizationException } from "@exceptions";

const { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } = GENERAL.default;

class VerificationMiddleware {
  constructor() {
    // this.UserRepository = new UserRepository();
    // this.OpenAPIRepository = new OpenAPIRepository();

    this.basicVerification = this.basicVerification.bind(this);
    // this.bearerOAVerification = this.bearerOAVerification.bind(this);
    // this.bearerAdminVerification = this.bearerAdminVerification.bind(this);
  }

  basicVerification(req, res, next) {
    if (_.isEmpty(req.headers.authorization)) {
      throw new AuthorizationException("NOT_AUTHORIZED");
    }
    try {
      if (req.headers.authorization.split(" ")[0] !== "Basic") {
        throw new AuthorizationException("INVALID_TOKEN");
      }
      const [, token] = req.headers.authorization.split(" ");
      const [username, password] = base64Decode(token).split(":");

      if (username === BASIC_AUTH_USERNAME && password === BASIC_AUTH_PASSWORD) {
        next();
      } else {
        throw new MismatchException("BASIC_AUTHORIZATION_INVALID");
      }
    } catch (e) {
      next(e);
    }
  }

  // async bearerOAVerification(req, res, next) {
  //   if (_.isEmpty(req.headers.authorization)) {
  //     throw new AuthorizationException("NOT_AUTHORIZED");
  //   }

  //   try {
  //     if (req.headers.authorization.split(" ")[0] !== "Bearer") {
  //       throw new AuthorizationException("INVALID_TOKEN");
  //     }

  //     const [, token] = req.headers.authorization.split(" ");
  //     const profile = await verifyJWT(token);

  //     if (_.isEmpty(profile)) {
  //       throw new AuthorizationException("JWT_INVALID");
  //     }

  //     let user = await this.UserRepository.getUserWithLine({ id: profile.id }, req.workspaceAlias, true);
  //     if (!user) {
  //       throw new NotFoundException("USER_NOT_FOUND");
  //     }
  //     if (!user.active) {
  //       throw new ValidationException("USER_IS_INACTIVATED");
  //     }
  //     req.profile = {
  //       ...user,
  //       iat: profile.iat,
  //     };

  //     next();
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async bearerAdminVerification(req, res, next) {
  //   if (_.isEmpty(req.headers.authorization)) {
  //     throw new AuthorizationException("NOT_AUTHORIZED");
  //   }

  //   try {
  //     if (req.headers.authorization.split(" ")[0] !== "Bearer") {
  //       throw new AuthorizationException("INVALID_TOKEN");
  //     }

  //     const [, token] = req.headers.authorization.split(" ");
  //     const profile = await verifyJWT(token);

  //     if (_.isEmpty(profile)) {
  //       throw new AuthorizationException("JWT_INVALID");
  //     }

  //     if (now() >= profile.exp) {
  //       throw new AuthorizationException("TOKEN_EXPIRED");
  //     }

  //     let user = await this.UserRepository.getUser({ id: profile.id }, req.workspaceAlias, true);

  //     if (!user) {
  //       throw new NotFoundException("USER_NOT_FOUND");
  //     }
  //     if (!user.active) {
  //       throw new ValidationException("USER_IS_INACTIVATED");
  //     }

  //     req.profile = {
  //       ...user,
  //       iat: profile.iat,
  //       exp: profile.exp,
  //     };

  //     next();
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  async XAPIKeyVerification(req, res, next) {
    const { workspaceAlias } = req;
    if (_.isEmpty(req.headers["x-api-key"])) {
      throw new AuthorizationException("NOT_AUTHORIZED");
    }

    try {
      const apiKey = await this.OpenAPIRepository.getActiveAPIKey({ api_key }, workspaceAlias, true);

      if (!apiKey) {
        throw new AuthorizationException("API_KEY_NOT_FOUND_OR_INVALID");
      }

      req.apiKey = apiKey;

      next();
    } catch (e) {
      next(e);
    }
  }

  async XAPIKeyScopeVerification(req, res, next) {
    const { apiKey } = req;
    return (scope) => {
      try {
        if (!apiKey.scope.includes(scope)) {
          throw new AuthorizationException("API_KEY_NOT_PERMITTED");
        }

        next();
      } catch (e) {
        next(e);
      }
    };
  }
}

export default new VerificationMiddleware();
