import HTTPCore from "./http.core";
import https from "node:https";
import { API, SENSETIME } from "@configs";

const { SENSEFOUNDRY_API_ENDPOINT } = API.default;
const { SENSEFOUNDRY_ACCESS_KEY, 
  SENSEFOUNDRY_SECRET_KEY, 
  SENSEFOUNDRY_ALERT_DB_ID, 
  SENSEFOUNDRY_STATIC_DB_ID,
  SENSEFOUNDRY_FACE_MODEL_VERSION } = SENSETIME.default;

class SenseFoundryAPI extends HTTPCore {
  constructor() {
    console.log(SENSEFOUNDRY_API_ENDPOINT)
    super({
      baseURL: SENSEFOUNDRY_API_ENDPOINT,
      options: { httpsAgent: new https.Agent({ rejectUnauthorized: false }) },
    });
  }

  getToken() {
    return this.post("/components/user_manager/v1/users/sign_token", {
      access_key: SENSEFOUNDRY_ACCESS_KEY,
      secret_key: SENSEFOUNDRY_SECRET_KEY,
    });
  }

/* 
  **********************************************************************
  ******   CAMERA   ****************************************************
  **********************************************************************
  */
  getCameraInSpecificArea({ cameraObject }, { token }) {
    return this.get(
      "/engine/camera-manager/v1/zones/" + cameraObject.aicloudCameraZoneUUID  + "/cameras/" + cameraObject.aicloudCameraUUID ,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END getCameraInSpecificArea

  getZone({ cameraObject }, { token }) {
    return this.get(
      "/engine/camera-manager/v1/zones?page.limit=1" ,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END getZone
  getCameraStatus({ zone_uuid, camera_uuid }, { token }) {
    return this.get(
      "/engine/camera-manager/v1/zones/" + zone_uuid + "/cameras/" + camera_uuid + "/tasks?page.limit=10",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END getCameraStatus

  deleteVideoTask({ zone_uuid, camera_uuid, task_uuid }, { token }) {
    return this.delete(
      "/engine/camera-manager/v1/zones/" + zone_uuid + "/cameras/" + camera_uuid + "/tasks/" + task_uuid + "?force=1",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END deleteVideoTask

  deleteCamera({ zone_uuid, camera_uuid }, { token }) {
    return this.delete(
      "/engine/camera-manager/v1/zones/" + zone_uuid + "/cameras/" + camera_uuid + "?force=1",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END deleteCamera


  addCameraZone({ cameraObject }, { token }) {
    return this.post(
      "/engine/camera-manager/v1/zones/" + zone_id,
      {
        zone_request: {
          uuid: cameraObject.aicloudZoneUUID,
          display_name: cameraObject.displayName,
          description: cameraObject.cameraDescription,
          extra_info: ""
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END addCameraZone

  

  addCameraInSpecificArea({ cameraObject }, { token }) {
    return this.post(
      "/engine/camera-manager/v1/zones/" + cameraObject.aicloudConfig.zone_uuid + "/cameras/" + cameraObject.ivCameraUUID,
      {
        camera_request: {
          uuid: cameraObject.ivCameraUUID,
          display_name: cameraObject.cameraNameDisplay,
          description: cameraObject.cameraDescription,
          zone_uuid: cameraObject.aicloudConfig.zone_uuid,
          geo_point: {
            latitude: cameraObject.latitude, 
            longitude: cameraObject.longitude
          },
          camera_parameter: {
            type: "VN_RTSP",
            rtsp: {
              url: cameraObject.aicloudConfig.rtsp,
              protocol_type: "TCP"
            }
          }
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
  }//END addCameraInSpecificArea()

  addCameraInSpecificAreaWithRTMP({ cameraObject }, { token }) {
    return this.post(
      "/engine/camera-manager/v1/zones/" + cameraObject.aicloudConfig.zone_uuid + "/cameras/" + cameraObject.ivCameraUUID,
      {
        camera_request: {
          uuid: cameraObject.ivCameraUUID,
          display_name: cameraObject.cameraNameDisplay,
          description: cameraObject.cameraDescription,
          zone_uuid: cameraObject.aicloudConfig.zone_uuid,
          geo_point: {
            latitude: cameraObject.latitude, 
            longitude: cameraObject.longitude
          },
          camera_parameter: {
            type: "VN_RTMP",
            tmp: {
              auth_disable: true,
              rtmp_mode: "RTMP_MODE_PUBLISH",
              rtmp_url: cameraObject.aicloudConfig.rtsp,
            }
          }
        },
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
  }//END addCameraInSpecificAreaWithRTMP()

  createVideoTask({ cameraObject }, { token }) {
    return this.post(
      "/engine/camera-manager/v1/zones/" + cameraObject.aicloudConfig.zone_uuid + "/cameras/" + cameraObject.ivCameraUUID + "/tasks",
      {
        zone_uuid: cameraObject.aicloudConfig.zone_uuid,
        camera_uuid: cameraObject.ivCameraUUID,
        object_type: cameraObject.aicloudConfig.object_type, 
        feature_version: SENSEFOUNDRY_FACE_MODEL_VERSION
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END createVideoTask()

  createVideoTaskWithROI({ cameraObject }, { token }) {
    return this.post(
      "/engine/camera-manager/v1/zones/" + cameraObject.aicloudZoneUUID + "/cameras/" + cameraObject.aicloudCameraUUID + "/tasks",
      {
        zone_uuid: cameraObject.aicloudZoneUUID,
        camera_uuid: cameraObject.aicloudCameraUUID,
        object_type: cameraObject.aicloudObjectType, 
        feature_version: SENSEFOUNDRY_FACE_MODEL_VERSION,
        task_object_config:{
          face_config:{
            roi_filter_config:{
              rois: cameraObject.rois
            }
          }
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END createVideoTaskWithROI()

  /* 
  **********************************************************************
  ******   ALERT FEATURE   *********************************************
  **********************************************************************
  */
  extractFaceFeatures({ faceBase64 }, { token }) {
    return this.post(
      "/engine/image-process/face_" + SENSEFOUNDRY_FACE_MODEL_VERSION + "/v1/batch_detect_and_extract_all_2",
      {
        requests: [
          {
            image: {
              data: faceBase64
            },
            face_selection: "LargestFace"
          },
        ],
        detect_mode: "Default",
        face_type: "Large"
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END extractFaceFeatures

  batchSearchMultiAlertDB({ blob, top_k, min_score }, { token }) {
    return this.post(
      "/engine/alert-feature/v1/batch_search_multi",
      {
        configs: [
          {
            col_id: SENSEFOUNDRY_ALERT_DB_ID,
            top_k: top_k,
            min_score: min_score,
          },
        ],
        features: [
          {
            type: "face",
            version: SENSEFOUNDRY_FACE_MODEL_VERSION,
            blob: blob,
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END batchSearchMultiAlertDB

  batchAddImageToAlertDB({ faceObject, faceBase64 }, { token }) {    
    return this.post(
      "/engine/api-wrapper/v1/face/batch_add_image_to_db",
      {
        db_id: faceObject.dbID,
        images:[{
          image: {
            image:{
              data: faceBase64,
            },
          },
          extra_info: faceObject.referenceID + "|" + faceObject.imageName,
          key: faceObject.faceID,
        }],
        save_images: true,
        type: "ALERT_FEATURE_DB",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END batchAddImageToAlertDB

  batchDeleteImageFromAlertDB({ db_id, feature_id }, { token }) {
    return this.post(
      "/engine/api-wrapper/v1/face/delete_image_from_db",
      {
        db_id: db_id,
        feature_id: feature_id,
        delete_image: true, 
        type: "ALERT_FEATURE_DB"
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END batchDeleteImageFromAlertDB

  createAlertDBs({ db_name, db_size }, { token }) {
    return this.post(
      "/engine/api-wrapper/v1/face/new_db",
      {
        name: db_name,
        feature_version: SENSEFOUNDRY_FACE_MODEL_VERSION,
        description: description,
        db_size: db_size,
        create_bucket: true,
        type: "ALERT_FEATURE_DB"

      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END searchImageInAlertDBs

  /* 
  ================================================================================================================
  **********************************************************************
  ******   STATIC FEATURE   *********************************************
  **********************************************************************
  */
  searchImageInStaticDB({ blob, top_k, min_score }, { token }) {
    return this.post(
      "/engine/static-feature/v1/batch_search_multi",
      {
        configs: [
          {
            col_id: SENSEFOUNDRY_STATIC_DB_ID,
            top_k: top_k,
            min_score: min_score,
          },
        ],
        features: [
          {
            type: "face",
            version: SENSEFOUNDRY_FACE_MODEL_VERSION,
            blob: blob,
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END searchImageInStaticDB

  batchSearchMultiStaticDB({ blob, top_k, min_score }, { token }) {
    return this.post(
      "/engine/static-feature/v1/batch_search_multi",
      {
        configs: [
          {
            col_id: SENSEFOUNDRY_STATIC_DB_ID,
            top_k: top_k,
            min_score: min_score,
          },
        ],
        features: [
          {
            type: "face",
            version: SENSEFOUNDRY_FACE_MODEL_VERSION,
            blob: blob,
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END batchSearchMultiStaticDB

  batchAddImagetoStaticDB({ faceObject, faceBase64 }, { token }) {    
    return this.post(
      "/engine/api-wrapper/v1/face/batch_add_image_to_db",
      {
        db_id: faceObject.dbID,
        images:[{
          image: {
            image:{
              data: faceBase64,
            },
          },
          extra_info: faceObject.referenceID + "|" + faceObject.imageName,
          key: faceObject.faceID,
        }],
        save_images: true,
        type: "STATIC_FEATURE_DB",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END batchAddImagetoStaticDB
  batchDeleteImageFromStaticDB({ db_id, feature_id }, { token }) {
    return this.post(
      "/engine/api-wrapper/v1/face/delete_image_from_db",
      {
        db_id: db_id,
        feature_id: feature_id,
        delete_image: true, 
        type: "STATIC_FEATURE_DB",
        extra_db_type: "",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END batchDeleteImageFromStaticDB

  /* 
  **********************************************************************
  ******   TIMESPACE   *************************************************
  **********************************************************************
  */
  batchSearchTimespace({ blob, top_k, min_score }, { token }) {
    return this.post(
      "/engine/timespace-feature/face_" + SENSEFOUNDRY_FACE_MODEL_VERSION+ "/v2/search",
      {
        configs: [
          {
            top_k: top_k,
            min_score: min_score,
          },
        ],
        features: [
          {
            type: "face",
            version: SENSEFOUNDRY_FACE_MODEL_VERSION,
            blob: blob,
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }//END batchSearchTimespace


}// END SenseFoundryAPI()

export default new SenseFoundryAPI();
