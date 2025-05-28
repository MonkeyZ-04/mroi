const { iv_cameras, sequelize } = require("../models");
const { Op } = require("sequelize");

class CameraRepository {
  async get_schemas_name() {
    try {
      const [results] = await sequelize.query(
        `select DISTINCT(schemaname) from pg_stat_user_tables ORDER BY schemaname ASC`
      );
      return results.map((r) => r.schemaname);
    } catch (error) {
      console.error("Error in getSchema :", error);
      throw error;
    }
  } // END get schema name 

  async get_roi_data(schema, key) {
    try {
      await sequelize.query(`SET search_path TO ${schema}`);

      const result = await iv_cameras.findOne({
        attributes: ["metthier_ai_config"],
        where: { iv_camera_uuid: key },
      });
      
      return result.metthier_ai_config;
    } catch (error) {
      console.error("Error in get_roi_data :", error);
      throw error;
    }
  }

  async get_cameras_data(schemaName) {
    try {
      await sequelize.query(`SET search_path TO :schema`, {
        replacements: { schema: schemaName },
      });

      return await iv_cameras.findAll({
        attributes: [
          "iv_camera_uuid",
          "camera_name",
          "camera_site",
          "rtsp",
          "metthier_ai_config",
          "device_id",
          "camera_type",
        ],
        where: {
          camera_site: {
            [Op.and]: [{ [Op.not]: null }, { [Op.not]: "" }],
          },
        },
        order: [["camera_site", "ASC"]],
      });
    } catch (error) {
      console.error("Error in get data in iv_cameras : ", error);
      throw error;
    }
  } // END get each rows data in schema

  async update_metthier_ai_config(schemaName, site, cameraName, config) {
    try {
      await sequelize.query(`SET search_path TO :schema`, {
        replacements: { schema: schemaName },
      });

      return await iv_cameras.update(
        { metthier_ai_config: config },
        {
          where: {
            camera_site: site,
            camera_name: cameraName,
          },
        }
      );
    } catch (error) {
      console.error("Error in update_metthier_ai_config : ", error);
      throw error;
    }
  } //END update data in metthier_ai_config 
}

module.exports = new CameraRepository();
