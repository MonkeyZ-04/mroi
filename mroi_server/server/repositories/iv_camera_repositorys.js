const { iv_cameras, sequelize } = require("../models");

class CameraRepository {
  async get_schemas_name() {
    try {
      const [results] = await sequelize.query(
        `SELECT schemaname FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') GROUP BY schemaname ORDER BY schemaname ASC`
      );
      return results.map((r) => r.schemaname);
    } catch (error) {
      console.error("Error in getSchema :", error);
      throw error;
    }
  }

  async get_all_cameras_from_all_schemas() {
    try {
      const schemas = await this.get_schemas_name();
      let allCameras = [];

      for (const schema of schemas) {
        try {
          const tableCheckQuery = `
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = '${schema}' AND table_name = 'iv_cameras'
            );
          `;
          const [tableExistsResult] = await sequelize.query(tableCheckQuery);
          if (!tableExistsResult[0].exists) {
            console.log(`Schema "${schema}" does not have an "iv_cameras" table, skipping.`);
            continue;
          }
          
          const camerasInSchema = await this.get_cameras_data(schema);
          
          const camerasWithSchema = camerasInSchema.map(cam => ({ ...cam, workspace: schema }));
          allCameras = allCameras.concat(camerasWithSchema);

        } catch (innerError) {
          console.error(`Could not fetch or process cameras from schema "${schema}":`, innerError.message);
        }
      }
      
      return allCameras;
    } catch (error) {
      console.error("Error in get_all_cameras_from_all_schemas: ", error);
      throw error;
    }
  }

  async get_roi_data(schema, key) {
    try {
      await sequelize.query(`SET search_path TO ${schema}`);
      const result = await iv_cameras.findOne({
        attributes: ["metthier_ai_config"],
        where: { iv_camera_uuid: key },
      });
      return result ? result.metthier_ai_config : null;
    } catch (error) {
      console.error("Error in get_roi_data :", error);
      throw error;
    }
  }

  async get_cameras_data(schemaName) {
    const safeSchemaName = String(schemaName).replace(/[^a-zA-Z0-9_]/g, '');
    try {
      const query = `
        SELECT "iv_camera_uuid", "camera_name", "camera_name_display", "camera_site",
               "rtsp", "metthier_ai_config", "device_id", "camera_type"
        FROM "${safeSchemaName}"."iv_cameras"
        ORDER BY "camera_site" ASC;
      `;
      const [results] = await sequelize.query(query);
      return results;
    } catch (error) {
      console.error(`Error in get_cameras_data for schema "${schemaName}": `, error.message);
      return [];
    }
  }

  async update_metthier_ai_config(schemaName, cameraId, newConfig) {
    try {
      await sequelize.query(`SET search_path TO :schema`, {
        replacements: { schema: schemaName },
      });

      const camera = await iv_cameras.findOne({
        where: { iv_camera_uuid: cameraId }
      });

      if (!camera) {
        return 0;
      }

      const existingConfig = camera.metthier_ai_config || {};
      let finalConfig;

      // **ตรวจสอบเงื่อนไข:** ถ้าข้อมูลเดิมเป็นแค่ {"rule": []} ให้เขียนทับด้วยข้อมูลใหม่
      // โดยการเช็คว่ามี key 'rule' และ array ว่าง และมี key แค่ 1 ตัว
      if (existingConfig && Array.isArray(existingConfig.rule) && existingConfig.rule.length === 0 && Object.keys(existingConfig).length === 1) {
        finalConfig = newConfig;
        console.log("Overwrite logic applied.");
      } else {
        // (Merge)
        finalConfig = {
          ...existingConfig,
          ...newConfig
        };
        console.log("Merge logic applied.");
      }
      
      const [affectedRows] = await iv_cameras.update(
        { metthier_ai_config: finalConfig },
        { where: { iv_camera_uuid: cameraId } }
      );

      return affectedRows;
    } catch (error) {
      console.error("Error in update_metthier_ai_config : ", error);
      throw error;
    }
  }
}

module.exports = new CameraRepository();