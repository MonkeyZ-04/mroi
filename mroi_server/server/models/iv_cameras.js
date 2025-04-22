export default (sequelize, DataTypes) => {
    const iv_cameras = sequelize.define(
      "iv_cameras",
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
        latitude: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        longitude: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        camera_place: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        camera_floor: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        camera_zone: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        camera_owner: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        nvr: {
          type: DataTypes.JSON,
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
        aicloud_config: {
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
        createdAt: "created_at",
        updatedAt: false
      }
    );
  
    return iv_cameras;
  };
  