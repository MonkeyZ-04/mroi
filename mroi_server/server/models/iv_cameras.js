module.exports = (sequelize, DataTypes) => {
    const iv_cameras = sequelize.define(
      'iv_cameras',
      {
        iv_camera_uuid: {
          type: DataTypes.STRING(255),
          allowNull: false,
          primaryKey: true,
        },
        rtsp: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        camera_name: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        camera_name_display: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        camera_type: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        device_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        reference_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        metthier_ai_config: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        camera_site: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
      },
      {
        underscored: true,
        createdAt: 'created_at',
        updatedAt: false,
        tableName: 'iv_cameras',
        schema: null,            
      }
    );
  
    return iv_cameras;
  };
  