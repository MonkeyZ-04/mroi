import { MandatoryException } from "@exceptions";
import OpenAPIRepository from "@repositories/openapi";
import { isEmpty } from "@utils/validation";
import { NotFoundException } from "dist-server/exceptions";

class AdminAPIKeyController {
  constructor() {
    this.OpenAPIRepository = new OpenAPIRepository();

    this.searchAPIKey = this.searchAPIKey.bind(this);
    this.getAPIKey = this.getAPIKey.bind(this);
    this.createAPIKey = this.createAPIKey.bind(this);
    this.reGenerateAPIKey = this.reGenerateAPIKey.bind(this);
    this.updateAPIKey = this.updateAPIKey.bind(this);
    this.deleteAPIKey = this.deleteAPIKey.bind(this);
  }

  async searchAPIKey(req, res, next) {
    const { serverTime, workspaceAlias, query } = req;
    const { limit, offset } = query;
    try {
      const apiKeys = await this.OpenAPIRepository.searchAPIKey({ limit, offset }, workspaceAlias, true);
      return res.json({ status: 200, server_time: serverTime, data: apiKeys });
    } catch (e) {
      next(e);
    }
  }

  async getAPIKey(req, res, next) {
    const { serverTime, workspaceAlias, params } = req;
    const { id } = params;
    try {
      const apiKey = await this.OpenAPIRepository.getAPIKey({ id }, workspaceAlias, true);
      if (!apiKey) {
        throw new NotFoundException("API_KEY_NOT_FOUND");
      }

      return res.json({ status: 200, server_time: serverTime, data: apiKey });
    } catch (e) {
      next(e);
    }
  }

  async createAPIKey(req, res, next) {
    const { serverTime, workspaceAlias, body, profile } = req;
    const { name, scope, active, expire_at } = body;
    try {
      if (isEmpty(name)) {
        throw new MandatoryException("MANDATORY_REQUIRED");
      }

      const apiKey = await this.OpenAPIRepository.createAPIKey(
        { name, scope, active, expire_at, user_id: profile.id },
        workspaceAlias,
        true
      );
      return res.json({ status: 200, server_time: serverTime, data: { id: apiKey.id } });
    } catch (e) {
      next(e);
    }
  }

  async reGenerateAPIKey(req, res, next) {
    const { serverTime, workspaceAlias, params, profile } = req;
    const { id } = params;
    try {
      const apiKey = await this.OpenAPIRepository.revokeAPIKey({ id, user_id: profile.id }, workspaceAlias, true);

      return res.json({ status: 200, server_time: serverTime, data: { id: apiKey.id } });
    } catch (e) {
      next(e);
    }
  }

  async updateAPIKey(req, res, next) {
    const { serverTime, workspaceAlias, body, params, profile } = req;
    const { name, scope, active, expire_at } = body;
    const { id } = params;
    try {
      const apiKey = await this.OpenAPIRepository.updateAPIKey(
        { id, name, scope, active, expire_at, user_id: profile.id },
        workspaceAlias,
        true
      );

      return res.json({ status: 200, server_time: serverTime, data: { id: apiKey.id } });
    } catch (e) {
      next(e);
    }
  }

  async deleteAPIKey(req, res, next) {
    const { serverTime, workspaceAlias, params, profile } = req;
    const { id } = params;
    try {
      await this.OpenAPIRepository.deleteAPIKey({ id, user_id: profile.id }, workspaceAlias);

      return res.json({ status: 200, server_time: serverTime, data: { id } });
    } catch (e) {
      next(e);
    }
  }
}

export default new AdminAPIKeyController();
