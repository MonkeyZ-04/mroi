import IdentiyRepository from "@repositories/identity";
import { NotFoundException } from "@exceptions";

class IdentityController {
  constructor() {
    this.IdentityRepository = new IdentiyRepository();

    this.viewIdentity = this.viewIdentity.bind(this);
    this.searchAudio = this.searchAudio.bind(this);
    this.viewAudio = this.viewAudio.bind(this);
  }

  async viewIdentity(req, res, next) {
    const { workspaceAlias, params } = req;
    const { table, type, id } = params;
    try {
      const identity = await this.IdentityRepository.getIdentity({ table, type, id }, workspaceAlias, true);
      if (!identity) {
        throw new NotFoundException("IDENTITY_NOT_FOUND");
      }

      const {
        data,
        metadata: { file_extension, mimetype },
      } = identity;
      const img = Buffer.from(data.toString(), "base64");
      res.writeHead(200, {
        "Content-Type": mimetype,
        "Content-Length": img.length,
      });
      res.end(img);
    } catch (e) {
      next(e);
    }
  }

  async searchAudio(req, res, next) {
    const { workspaceAlias, serverTime, params } = req;
    const { table, id } = params;
    try {
      const audios = await this.IdentityRepository.searchAudio({ table, id }, workspaceAlias, true);
      return res.json({ status: 200, server_time: serverTime, data: audios });
    } catch (e) {
      next(e);
    }
  }

  async viewAudio(req, res, next) {
    const { workspaceAlias, params } = req;
    const { table, id } = params;
    try {
      const audio = await this.IdentityRepository.getAudio({ table, id }, workspaceAlias, true);
      if (!audio) {
        throw new NotFoundException("AUDIO_NOT_FOUND");
      }

      const {
        data,
        metadata: { file_extension, mimetype },
      } = audio;
      const aud = Buffer.from(data.toString(), "base64");
      res.writeHead(200, {
        "Content-Type": mimetype,
        "Content-Length": aud.length,
      });
      res.end(aud);
    } catch (e) {
      next(e);
    }
  }
}

export default new IdentityController();
