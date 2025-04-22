import BaseRepository from "./base.repository";

import models, { sequelize } from "@models";
import _ from "lodash";
import { NotFoundException, MismatchException, ExistsException } from "@exceptions";
import { isEmpty } from "@utils/validation";
import { SENSETIME } from "@configs";
const { DB_SCHEMA } = SENSETIME.default;

class StaticDatabasesRepository extends BaseRepository {
  constructor() {
    super();
    this.findAllByRefID = this.findAllByRefID.bind(this);
    this.findAllByImageName = this.findAllByImageName.bind(this);
    this.createStaticDB = this.createStaticDB.bind(this);
    this.deleteByRefID = this.deleteByRefID.bind(this);
    this.countAllRows = this.countAllRows.bind(this);
  }

  countAllRows({  }, schema=DB_SCHEMA, plain = false) {
    return models.face_static_dbs.schema(schema)
      .count({ where: {} });     
  }// END countAllRows()

  findAllByRefID({ reference_id }, schema = DB_SCHEMA, plain = false) {
    if (_.isEmpty(reference_id)) {
      throw new NotFoundException("Reference ID not found.");
    }
    //console.log({ reference_id })
    return models.face_static_dbs.schema(schema)
      .findAll({ where: { reference_id }, order: [['created_at', 'DESC']] })
      .then((e) => this._postFetchData(e, plain));
  } // END findAllByRefID()

  findAllByImageName({ image_name }, schema = DB_SCHEMA, plain = false) {
    if (_.isEmpty(image_name)) {
      throw new NotFoundException("Image name not found.");
    }
    //console.log({ reference_id })
    return models.face_static_dbs.schema(schema)
      .findAll({ where: { image_name }, order: [['created_at', 'DESC']] })
      .then((e) => this._postFetchData(e, plain));
  } // END findAllByImageName()

  deleteByRefID({ reference_id }, schema = DB_SCHEMA) {
    return models.face_static_dbs.schema(schema)
    .destroy({
      where: {
        reference_id: reference_id
      },
    });
  }//END deleteByRefID()

  async createStaticDB(
    {
      face_id,
      feature_id,
      db_id,
      group_name,
      company,
      reference_id,
      image_name,
      image_name_display,
      face_image_internal,
      face_image_external,
      face_quality_score
    },
    schema = DB_SCHEMA,
    plain = false
  ) {
    try {
      const face_static_dbs = await models.face_static_dbs.schema(schema).create({
        face_id: !isEmpty(face_id) ? face_id : null,
        feature_id: !isEmpty(feature_id) ? feature_id : null,
        db_id: !isEmpty(db_id) ? db_id : null,
        group_name: !isEmpty(group_name) ? group_name : null,
        company: !isEmpty(company) ? company : null,
        reference_id: !isEmpty(reference_id) ? reference_id : null,
        image_name: !isEmpty(image_name) ? image_name : null,
        image_name_display: !isEmpty(image_name_display) ? image_name_display : null,
        face_image_internal: !isEmpty(face_image_internal) ? face_image_internal : null,
        face_image_external: !isEmpty(face_image_external) ? face_image_external : null,
        face_quality_score: !isEmpty(face_quality_score) ? face_quality_score : null,
      });
      
      return this._postFetchData(face_static_dbs, plain);
    } catch (e) {
      throw e;
    }
  }//END createStaticDB()

 

}// END Class StaticDatabasesRepository

export default StaticDatabasesRepository;
