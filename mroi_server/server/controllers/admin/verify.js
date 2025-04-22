import { customAlphabet } from "nanoid";
import _ from "lodash";

import VerificationRepository from "@repositories/verification";
import { GENERAL } from "@configs";
import { now } from "@utils/date";

const { QR_EXPIRE_MINS } = GENERAL.default;

class AdminVerifyController {
  code;
  constructor() {
    this.VerificationRepository = new VerificationRepository();

    this.code = customAlphabet("1234567890ABCBEFGHIJKLMNOPQRSTUVWXYZ", 128);

    this.generateQR = this.generateQR.bind(this);
  }

  async generateQR(req, res, next) {
    const { serverTime, workspaceAlias, profile } = req;
    try {
      const qrCode = await this.code();
      const expireAt = now().add(QR_EXPIRE_MINS, "minute");

      await this.VerificationRepository.createVerification(
        { code: qrCode, expire_at: expireAt, user_id: profile.id },
        workspaceAlias,
        true
      );

      return res.json({ status: 200, server_time: serverTime, data: { code: qrCode, expire_at: expireAt.valueOf() } });
    } catch (e) {
      next(e);
    }
  }
}

export default new AdminVerifyController();
