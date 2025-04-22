import BaseRepository from "./base.repository";

import models, { sequelize } from "@models";
import _ from "lodash";
import { NotFoundException, MismatchException, ExistsException } from "@exceptions";
import { isEmpty } from "@utils/validation";
import { SENSETIME } from "@configs";
const { DB_SCHEMA } = SENSETIME.default;

class IVCamerasRepository extends BaseRepository {
  constructor() {
    super();
    this.createCamera = this.createCamera.bind(this);
    this.deleteCameraByRefID = this.deleteCameraByRefID.bind(this);
    this.findOneByRefID = this.findOneByRefID.bind(this);
    this.findOnebyCameraName = this.findOnebyCameraName.bind(this);
    this.findAllCamera = this.findAllCamera.bind(this);
    this.updateCamera = this.updateCamera.bind(this);
  }
  findOneByRefID({ camera_owner, reference_id }, schema = DB_SCHEMA, plain = false) {
    if (_.isEmpty(reference_id)) {
      throw new NotFoundException("REFERENCE_ID_NOT_FOUND");
    }
    return models.iv_cameras.schema(schema)
      .findOne({ where: { camera_owner, reference_id }, order: [['created_at', 'DESC']] })
      .then((res) => res ? res.get({ plain: true }) : null)
  } // END findOneByRefID()

  findOneByRTSP({ camera_owner, rtsp }, schema = DB_SCHEMA, plain = false) {

    return models.iv_cameras.schema(schema)
      .findOne({ where: { camera_owner, rtsp }, order: [['created_at', 'DESC']] })
      .then((res) => res ? res.get({ plain: true }) : null)
  } // END findOneByRTSP()

  findOnebyCameraName({ camera_owner }, schema = DB_SCHEMA, plain = false) {
    return models.iv_cameras.schema(schema)
      .findOne({ where: { camera_owner }, order: [['created_at', 'DESC']] })
      .then((res) => res ? res.get({ plain: true }) : null)
  } // END findLatestCamera()

  findAllCamera({ camera_owner }, schema = DB_SCHEMA, plain = false) {
    return models.iv_cameras.schema(schema)
      .findAll({ where: { camera_owner }, order: [['created_at', 'DESC']] })
      .then((e) => this._postFetchData(e, plain));
  } // END findAllCamera()

  deleteCameraByRefID({ reference_id }, schema = DB_SCHEMA) {
    return models.iv_cameras.schema(schema)
    .destroy({
      where: {
        reference_id: reference_id
      },
    });
  }//END deleteCameraByRefID()

  async updateCamera(
    {
        iv_camera_uuid,
        rtsp,
        camera_name,
        camera_name_display,
        latitude,
        longitude,
        camera_place,
        camera_floor,
        camera_zone,
        camera_owner,
        nvr,
        camera_type,
        device_id,
        reference_id,
        aicloud_config,
        camera_site   
    },
    schema = DB_SCHEMA,
    plain = false
  ) {
    try {
      const iv_cameras = await models.iv_cameras.schema(schema).update({
        //created_at,
        iv_camera_uuid: !isEmpty(iv_camera_uuid) ? iv_camera_uuid : null,
        rtsp: !isEmpty(rtsp) ? rtsp : null,
        camera_name: !isEmpty(camera_name) ? camera_name : null,
        camera_name_display: !isEmpty(camera_name_display) ? camera_name_display : null,
        latitude: !isEmpty(latitude) ? latitude : null,
        longitude: !isEmpty(longitude) ? longitude : null,
        camera_place: !isEmpty(camera_place) ? camera_place : null,
        camera_floor: !isEmpty(camera_floor) ? camera_floor : null,
        camera_zone: !isEmpty(camera_zone) ? camera_zone : null,
        camera_owner: !isEmpty(camera_owner) ? camera_owner : null,
        nvr: !isEmpty(nvr) ? nvr : null,
        camera_type: !isEmpty(camera_type) ? camera_type : null,
        device_id: !isEmpty(device_id) ? device_id : null,
        reference_id: !isEmpty(reference_id) ? reference_id : null,
        aicloud_config: !isEmpty(aicloud_config) ? aicloud_config : null,
        camera_site: !isEmpty(camera_site) ? camera_site : null,
      
      });
      
      return this._postFetchData(iv_cameras, plain);
    } catch (e) {
      throw e;
    }
  }//END updateCamera()

  async createCamera(
    {
        iv_camera_uuid,
        rtsp,
        camera_name,
        camera_name_display,
        latitude,
        longitude,
        camera_place,
        camera_floor,
        camera_zone,
        camera_owner,
        nvr,
        camera_type,
        device_id,
        reference_id,
        aicloud_config,
        camera_site   
    },
    schema = DB_SCHEMA,
    plain = false
  ) {
    try {
      const iv_cameras = await models.iv_cameras.schema(schema).create({
        //created_at,
        iv_camera_uuid: !isEmpty(iv_camera_uuid) ? iv_camera_uuid : null,
        rtsp: !isEmpty(rtsp) ? rtsp : null,
        camera_name: !isEmpty(camera_name) ? camera_name : null,
        camera_name_display: !isEmpty(camera_name_display) ? camera_name_display : null,
        latitude: !isEmpty(latitude) ? latitude : null,
        longitude: !isEmpty(longitude) ? longitude : null,
        camera_place: !isEmpty(camera_place) ? camera_place : null,
        camera_floor: !isEmpty(camera_floor) ? camera_floor : null,
        camera_zone: !isEmpty(camera_zone) ? camera_zone : null,
        camera_owner: !isEmpty(camera_owner) ? camera_owner : null,
        nvr: !isEmpty(nvr) ? nvr : null,
        camera_type: !isEmpty(camera_type) ? camera_type : null,
        device_id: !isEmpty(device_id) ? device_id : null,
        reference_id: !isEmpty(reference_id) ? reference_id : null,
        aicloud_config: !isEmpty(aicloud_config) ? aicloud_config : null,
        camera_site: !isEmpty(camera_site) ? camera_site : null,
      
      });
      
      return this._postFetchData(iv_cameras, plain);
    } catch (e) {
      throw e;
    }
  }//END createCamera()

}// END Class IVCamerasRepository

export default IVCamerasRepository;
