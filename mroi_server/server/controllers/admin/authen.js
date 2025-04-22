import UserRepository from "@repositories/user";
import {
  NotFoundException,
  ExistsException,
  MismatchException,
  ValidationException,
  MandatoryException,
} from "@exceptions";
import { saltCompare } from "@utils/crpyto";
import { signJWT } from "@utils/jwt";
import _ from "lodash";

class AdminAuthenController {
  constructor() {
    this.UserRepository = new UserRepository();

    this.userLogin = this.userLogin.bind(this);
    this.userRegister = this.userRegister.bind(this);
  }

  async userLogin(req, res, next) {
    const { serverTime, workspaceAlias, body } = req;
    const { username, password } = body;
    try {
      if (_.isEmpty(username) || _.isEmpty(password)) {
        throw new MandatoryException("USERNAME_OR_PASSWORD_IS_EMPTY");
      }

      const user = await this.UserRepository.getUserByUsername({ username }, workspaceAlias, true);
      if (!user) {
        throw new NotFoundException("USER_NOT_FOUND");
      }

      if (!user.active) {
        throw new ValidationException("USER_IS_INACTIVATED");
      }

      if (!(await saltCompare(user.password, password))) {
        throw new MismatchException("PASSWORD_IS_MISMATCH");
      }

      const token = signJWT({ id: user.id, username: user.username, email_address: user.email_address }, 1440);
      return res.json({ status: 200, server_time: serverTime, data: { token } });
    } catch (e) {
      next(e);
    }
  }

  async userRegister(req, res, next) {
    const { serverTime, workspaceAlias, body } = req;
    const { username, password, confirm_password } = body;
    try {
      let user = await this.UserRepository.getUserByUsername({ username }, workspaceAlias, true);
      if (user) {
        throw new ExistsException("USER_IS_EXISTS");
      }

      if (password !== confirm_password) {
        throw new MismatchException("PASSWORD_IS_MISMATCH");
      }

      user = await this.UserRepository.createUser(
        { username, password, user_roles: [], active: true, verified: true },
        workspaceAlias,
        true
      );

      return res.json({ status: 200, server_time: serverTime, data: { id: user.id } });
    } catch (e) {
      next(e);
    }
  }

  async userProfile(req, res, next) {
    const { serverTime, profile } = req;
    try {
      delete profile.password;
      delete profile.deleted_by;
      delete profile.deleted_at;

      return res.json({ status: 200, server_time: serverTime, data: profile });
    } catch (e) {
      next(e);
    }
  }
}

export default new AdminAuthenController();
