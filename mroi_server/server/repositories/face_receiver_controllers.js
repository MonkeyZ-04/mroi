import BaseRepository from "./base.repository";

import models, { sequelize } from "@models";
import _ from "lodash";
import { NotFoundException, MismatchException, ExistsException } from "@exceptions";
import { isEmpty } from "@utils/validation";
import { SENSETIME } from "@configs";


class FaceReceiverControllersRepository extends BaseRepository {
  constructor() {
    super();
    this.createFaceReceiverController = this.createFaceReceiverController.bind(this);

  }

//   findOneByRefID({ camera_owner, reference_id }, schema = DB_SCHEMA, plain = false) {
//     if (_.isEmpty(reference_id)) {
//       throw new NotFoundException("REFERENCE_ID_NOT_FOUND");
//     }
//     return models.iv_cameras.schema(DB_SCHEMA)
//       .findOne({ where: { camera_owner, reference_id }, order: [['created_at', 'DESC']] })
//       .then((res) => res ? res.get({ plain: true }) : null)
//   } // END findOneByRefID()

//   findAllCamera({ camera_owner }, schema = DB_SCHEMA, plain = false) {
//     return models.iv_cameras.schema(DB_SCHEMA)
//       .findAll({ where: { camera_owner }, order: [['created_at', 'DESC']] })
//       .then((e) => this._postFetchData(e, plain));
//   } // END findAllCamera()

  deleteFaceReeciverByCameraUUID({ iv_camera_uuid }, schema = "public") {
    return models.face_receiver_controllers.schema("public")
    .destroy({
      where: {
        iv_camera_uuid: iv_camera_uuid
      },
    });
  }//END deleteFaceReeciverByCameraUUID()

  async createFaceReceiverController(
    {
        id,
        iv_camera_uuid,
        receiver_id,
        active_status,
        schema_name,  
    },
    schema = "public",
    plain = false
  ) {
    try {
      const face_receiver_controllers = await models.face_receiver_controllers.schema(schema).create({
        //created_at,
        id: !isEmpty(id) ? id : null,
        iv_camera_uuid: !isEmpty(iv_camera_uuid) ? iv_camera_uuid : null,
        receiver_id: !isEmpty(receiver_id) ? receiver_id : null,
        active_status: !isEmpty(active_status) ? active_status : null,
        schema_name: !isEmpty(schema_name) ? schema_name : null,
      });
      return this._postFetchData(face_receiver_controllers, plain);
    } catch (e) {
      throw e;
    }
  }//END createFaceReceiverController()

}// END Class FaceReceiverControllersRepository

export default FaceReceiverControllersRepository;
