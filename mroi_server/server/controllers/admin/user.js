import UserRepository from "@repositories/user";
import _ from "lodash";
import { MandatoryException, MismatchException, NotFoundException } from "@exceptions";
class AdminUserController {
  constructor() {
    this.UserRepository = new UserRepository();

    this.searchUser = this.searchUser.bind(this);
    this.getUser = this.getUser.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  async searchUser(req, res, next) {
    const { serverTime, workspaceAlias, query } = req;
    const { limit, offset } = query;
    try {
      const users = await this.UserRepository.searchUser({ limit, offset }, workspaceAlias, true);
      return res.json({ status: 200, server_time: serverTime, data: users });
    } catch (e) {
      next(e);
    }
  }

  async getUser(req, res, next) {
    const { serverTime, workspaceAlias, params } = req;
    const { id } = params;
    try {
      const user = await this.UserRepository.getUser({ id }, workspaceAlias, true);

      if (!user) {
        throw new NotFoundException("USER_NOT_FOUND");
      }
      return res.json({ status: 200, server_time: serverTime, data: user });
    } catch (e) {
      next(e);
    }
  }

  async createUser(req, res, next) {
    const { serverTime, workspaceAlias, body, profile } = req;
    const { username, password, confirm_password, avatar, email_address, user_roles } = body;
    try {
      if (_.isEmpty(username) || _.isEmpty(password) || _.isEmpty(confirm_password)) {
        throw new MandatoryException("MANDATORY_REQUIRED");
      }
      const user = await this.UserRepository.createUser(
        {
          username,
          password,
          avatar,
          email_address,
          user_roles,
          active: true,
          verified: false,
          user_id: profile.id,
        },
        workspaceAlias,
        true
      );

      return res.json({ status: 200, server_time: serverTime, data: { id: user.id } });
    } catch (e) {
      next(e);
    }
  }

  async updateUser(req, res, next) {
    const { serverTime, workspaceAlias, body, profile, params } = req;
    const { username, password, confirm_password, avatar, email_address, user_roles, active, verified } = body;
    const { id } = params;
    try {
      if (!_.isEmpty(password) && password !== confirm_password) {
        throw new MismatchException("PASSWORD_NOT_MATCH");
      }

      const user = await this.UserRepository.updateUser(
        {
          id,
          username,
          password,
          avatar,
          email_address,
          user_roles,
          active,
          verified,
          user_id: profile.id,
        },
        workspaceAlias,
        true
      );

      return res.json({ status: 200, server_time: serverTime, data: { id: user.id } });
    } catch (e) {
      next(e);
    }
  }

  async deleteUser(req, res, next) {
    const { serverTime, workspaceAlias, profile, params } = req;
    const { id } = params;
    try {
      await this.UserRepository.deleteUser({ id, user_id: profile.id }, workspaceAlias);
      return res.json({ status: 200, server_time: serverTime, data: { id } });
    } catch (e) {
      next(e);
    }
  }
}

export default new AdminUserController();
