import IVCamerasRepository from "@repositories/iv_cameras";
import FaceReceiverControllersRepository from "@repositories/face_receiver_controllers";
import _, { reject } from "lodash";
import { MandatoryException, NotFoundException } from "@exceptions";
import SenseFoundryAPI from "@apis/sensefoundry";


import { SENSETIME } from "@configs";
const { 
  SENSEFOUNDRY_CAMERA_OBJECT_FACE_LIMIT_LICENSE,
  SENSEFOUNDRY_CAMERA_OBJECT_TYPE,
  CAMERA_OWNER,
  SENSEFOUNDRY_CAMERA_ZONE_UUID,
  SENSEFOUNDRY_IMAGE_PATH,
  CAMERA_SCHEMA_NAME,
  RECEIVER_CONTROLLER_ID
 } = SENSETIME.default;

class IVCameraController {
  constructor() {
    
    this.FaceReceiverControllersRepository = new FaceReceiverControllersRepository();
    this.IVCamerasRepository = new IVCamerasRepository();
    this.addCamera = this.addCamera.bind(this);
    this.deleteCamera = this.deleteCamera.bind(this);
    this.getFaceLicense = this.getFaceLicense.bind(this);
    this.getCameraStatus = this.getCameraStatus.bind(this);
    this.updateCamera = this.updateCamera.bind(this);

  }
  //==================================================================================================
  async getFaceLicense(req, res, next) 
  {
    try {
      const IVCamerasModels = await this.IVCamerasRepository.findAllCamera({ camera_owner : CAMERA_OWNER });
      console.log("IVCamerasModels.length : ", IVCamerasModels.length);
      if(IVCamerasModels.length >= SENSEFOUNDRY_CAMERA_OBJECT_FACE_LIMIT){
        let errMessage = "License Exceeded: You have reached the maximum number of allowed licenses for this service. Please contact your administrator or support for assistance.";
        throw new NotFoundException(errMessage);
      }
      let output = {};
      output.current_face_license = IVCamerasModels.length;
      output.limit_face_license = parseInt(SENSEFOUNDRY_CAMERA_OBJECT_FACE_LIMIT);
      console.log("output: ", output);
      return res.json({ status: 200, server_time: req.serverTime, data: output});
    } catch (e) {
      console.error("getFaceLicense() ERROR: ", e);
      next(e);
    }finally{
      console.log("#######################################################################");
    }
  }//END getFaceLicense()
  //==================================================================================================
  async getCameraStatus(req, res, next) 
  {
    try {
      if (!req.body.reference_id) {
        throw new NotFoundException("Reference ID not found.");
      }
      const referenceID = req.body.reference_id;
      console.log("referenceID: ", referenceID);

      const IVCamerasModel = await this.IVCamerasRepository.findOneByRefID({ camera_owner: CAMERA_OWNER, reference_id: referenceID });
      console.log("IVCamerasModel : ", IVCamerasModel);
      if(IVCamerasModel == null){
        throw new NotFoundException("Reference ID not found.");
      }

      const SenseFoundryToken = await SenseFoundryAPI.getToken();
      const rsGetCameraStatus = await SenseFoundryAPI.getCameraStatus({ zone_uuid: SENSEFOUNDRY_CAMERA_ZONE_UUID, 
        camera_uuid: IVCamerasModel.iv_camera_uuid}, { 
        token: SenseFoundryToken.token
      });

      console.log("rsGetCameraStatus: ", JSON.stringify(rsGetCameraStatus, null, 4));

      let output = {};
      output.reference_id = referenceID;
      output.object_type = rsGetCameraStatus.tasks[0].object_type;
      output.camera_uuid = rsGetCameraStatus.tasks[0].camera_uuid;
      output.camera_task_id = rsGetCameraStatus.tasks[0].id;
      output.camera_task_status = rsGetCameraStatus.tasks[0].task_status.status;
      output.error_message = rsGetCameraStatus.tasks[0].task_status.error_message;
      

      console.log("output: ", output);
      return res.json({ status: 200, server_time: req.serverTime, data: output});
    } catch (e) {
      console.error("getCameraStatus() ERROR: ", e);
      next(e);
    }finally{
      console.log("#######################################################################");
    }
  }//END getCameraStatus()
  //==================================================================================================
  async addCamera(req, res, next) 
  {
    try {

      if (!req.body.rtsp) {
        throw new NotFoundException("RTSP not found.");
      }
      if (!req.body.camera_name) {
        throw new NotFoundException("Camera name not found.");
      }
      const uuid = require("uuid");
      const cameraObject = {};
      cameraObject.ivCameraUUID = uuid.v4();
      cameraObject.referenceID = req.body.reference_id;
      cameraObject.rtsp = req.body.rtsp;
      cameraObject.cameraName = req.body.camera_name;
      cameraObject.cameraNameDisplay = req.body.camera_name;
      cameraObject.latitude = req.body.latitude;
      cameraObject.longitude = req.body.longitude;
      cameraObject.cameraPlace = req.body.camera_place;
      cameraObject.cameraFloor = req.body.camera_floor;
      cameraObject.cameraZone = req.body.camera_zone;
      cameraObject.cameraOwner = CAMERA_OWNER;
      cameraObject.nvr = "";
      cameraObject.cameraType = "face";
      cameraObject.cameraDescription = "Patrol Robot Camera";
      cameraObject.aicloudConfig = {
        object_type: SENSEFOUNDRY_CAMERA_OBJECT_TYPE,
        zone_uuid: SENSEFOUNDRY_CAMERA_ZONE_UUID,
        image_path: SENSEFOUNDRY_IMAGE_PATH,
        rtsp: req.body.aicloud_rtsp

      };
      console.log("INPUT cameraObject: ", JSON.stringify(cameraObject, null, 4));

      const IVCamerasModels = await this.IVCamerasRepository.findAllCamera({ camera_owner : cameraObject.cameraOwner });
      console.log("Check Face License !");
      console.log("IVCamerasModels.length : ", IVCamerasModels.length, " | SENSEFOUNDRY_CAMERA_OBJECT_FACE_LIMIT_LICENSE : ", SENSEFOUNDRY_CAMERA_OBJECT_FACE_LIMIT_LICENSE);
      if(IVCamerasModels.length >= SENSEFOUNDRY_CAMERA_OBJECT_FACE_LIMIT_LICENSE){
        let errMessage = "License Exceeded: You have reached the maximum number of allowed licenses for this service. Please contact your administrator or support for assistance.";
        throw new NotFoundException(errMessage);
      }

      const IVCamerasModelByRTSP = await this.IVCamerasRepository.findOneByRTSP({ camera_owner: cameraObject.cameraOwner, rtsp : req.body.aicloud_rtsp });
      console.log("IVCamerasModelByRTSP: ", JSON.stringify(IVCamerasModelByRTSP, null, 4));
      if(IVCamerasModelByRTSP != null){
        throw new NotFoundException("RTSP '" + cameraObject.rtsp + "' already exists in Database.");
      }
      
      const SenseFoundryToken = await SenseFoundryAPI.getToken();
      //##### Create camera in specific area (zone)
      const rsAddCameraInSpecificArea = await SenseFoundryAPI.addCameraInSpecificArea({ cameraObject: cameraObject }, { 
        token: SenseFoundryToken.token
      });
      console.log("rsAddCameraInSpecificArea: ", JSON.stringify(rsAddCameraInSpecificArea, null, 4));
      //##### Create video task
      const rsCreateVideoTask = await SenseFoundryAPI.createVideoTask({ cameraObject: cameraObject }, { 
        token: SenseFoundryToken.token
      });
      console.log("rsCreateVideoTask: ", JSON.stringify(rsCreateVideoTask, null, 4));
      
      let rsAddCameraInDB = await this.IVCamerasRepository.createCamera({
        iv_camera_uuid: cameraObject.ivCameraUUID,
        rtsp: cameraObject.rtsp,
        camera_name: cameraObject.cameraName,
        camera_name_display: cameraObject.cameraNameDisplay,
        latitude: cameraObject.latitude,
        longitude: cameraObject.longitude,
        camera_place: cameraObject.cameraPlace,
        camera_floor: cameraObject.cameraFloor,
        camera_zone: cameraObject.cameraZone,
        camera_owner: cameraObject.cameraOwner,
        nvr: cameraObject.nvr,
        camera_type: cameraObject.cameraType.toString(),
        device_id: "",
        reference_id: cameraObject.referenceID,
        aicloud_config: cameraObject.aicloudConfig,  
        camera_site: cameraObject.cameraPlace
      });
      console.log("rsAddCameraInDB: ", JSON.stringify(rsAddCameraInDB, null, 4));

      let rsCreateFaceReceiverController = await this.FaceReceiverControllersRepository.createFaceReceiverController({
        id: uuid.v4(),
        iv_camera_uuid: cameraObject.ivCameraUUID,
        receiver_id: RECEIVER_CONTROLLER_ID,
        active_status: true,
        schema_name:CAMERA_SCHEMA_NAME,  
      });
      console.log("rsCreateFaceReceiverController: ", JSON.stringify(rsCreateFaceReceiverController, null, 4));

      let output = {};
      output.reference_id = cameraObject.referenceID;
      console.log("output: ", output);
      return res.json({ status: 200, server_time: req.serverTime, data: output});
    } catch (e) {
      console.error("addCamera() ERROR: ", e);
      next(e);
    }finally{
      console.log("#######################################################################");
    }
  }//END addCamera()
  //=============================================================================================================
  async updateCamera(req, res, next) 
  {
    try {

      if (!req.body.aicloud_rtsp) {
        throw new NotFoundException("AI Cloud RTSP not found.");
      }
      if (!req.body.camera_name) {
        throw new NotFoundException("Camera name not found.");
      }
      const uuid = require("uuid");
      const cameraObject = {};
      cameraObject.ivCameraUUID = req.body.iv_camera_uuid;
      cameraObject.cameraName = req.body.camera_name;
      cameraObject.cameraNameDisplay = req.body.camera_name;
      cameraObject.latitude = req.body.latitude;
      cameraObject.longitude = req.body.longitude;
      cameraObject.cameraPlace = req.body.camera_place;
      cameraObject.cameraFloor = req.body.camera_floor;
      cameraObject.cameraZone = req.body.camera_zone;
      cameraObject.cameraOwner = CAMERA_OWNER;
      cameraObject.nvr = "";
      cameraObject.cameraType = "face";
      cameraObject.cameraDescription = "Patrol Robot Camera";
      cameraObject.aicloudConfig = {
        object_type: SENSEFOUNDRY_CAMERA_OBJECT_TYPE,
        zone_uuid: SENSEFOUNDRY_CAMERA_ZONE_UUID,
        image_path: SENSEFOUNDRY_IMAGE_PATH,
        rtsp: req.body.aicloud_rtsp

      };
      console.log("updateCamera() INPUT cameraObject: ", JSON.stringify(cameraObject, null, 4));

      console.log("Check Face License !");
      const IVCamerasModels = await this.IVCamerasRepository.findAllCamera({ camera_owner : cameraObject.cameraOwner });
      console.log("IVCamerasModels.length : ", IVCamerasModels.length, " | SENSEFOUNDRY_CAMERA_OBJECT_FACE_LIMIT_LICENSE : ", SENSEFOUNDRY_CAMERA_OBJECT_FACE_LIMIT_LICENSE);
      if(IVCamerasModels.length >= SENSEFOUNDRY_CAMERA_OBJECT_FACE_LIMIT_LICENSE){
        let errMessage = "License Exceeded: You have reached the maximum number of allowed licenses for this service. Please contact your administrator or support for assistance.";
        throw new NotFoundException(errMessage);
      }
      console.log("Check Face License !: PASSED");
      
      const SenseFoundryToken = await SenseFoundryAPI.getToken();
      //##### Create camera in specific area (zone)
      const rsAddCameraInSpecificArea = await SenseFoundryAPI.addCameraInSpecificArea({ cameraObject: cameraObject }, { 
        token: SenseFoundryToken.token
      });
      console.log("rsAddCameraInSpecificArea: ", JSON.stringify(rsAddCameraInSpecificArea, null, 4));
      //##### Create video task
      const rsCreateVideoTask = await SenseFoundryAPI.createVideoTask({ cameraObject: cameraObject }, { 
        token: SenseFoundryToken.token
      });
      console.log("rsCreateVideoTask: ", JSON.stringify(rsCreateVideoTask, null, 4));
      
      // let rsUpdateCameraInDB = await this.IVCamerasRepository.updateCamera({
      //   iv_camera_uuid: cameraObject.ivCameraUUID,
      //   rtsp: cameraObject.rtsp,
      //   camera_name: cameraObject.cameraName,
      //   camera_name_display: cameraObject.cameraNameDisplay,
      //   latitude: cameraObject.latitude,
      //   longitude: cameraObject.longitude,
      //   camera_place: cameraObject.cameraPlace,
      //   camera_floor: cameraObject.cameraFloor,
      //   camera_zone: cameraObject.cameraZone,
      //   camera_owner: cameraObject.cameraOwner,
      //   nvr: cameraObject.nvr,
      //   camera_type: cameraObject.cameraType.toString(),
      //   device_id: "",
      //   reference_id: cameraObject.referenceID,
      //   aicloud_config: cameraObject.aicloudConfig,
      //   camera_site: cameraObject.cameraPlace 
      // });
      // console.log("rsUpdateCameraInDB: ", JSON.stringify(rsUpdateCameraInDB, null, 4));

      let rsCreateFaceReceiverController = await this.FaceReceiverControllersRepository.createFaceReceiverController({
        id: uuid.v4(),
        iv_camera_uuid: cameraObject.ivCameraUUID,
        receiver_id: RECEIVER_CONTROLLER_ID,
        active_status: true,
        schema_name:CAMERA_SCHEMA_NAME,  
      });
      console.log("rsCreateFaceReceiverController: ", JSON.stringify(rsCreateFaceReceiverController, null, 4));

      let output = {};
      output.reference_id = cameraObject.referenceID;
      console.log("output: ", output);
      return res.json({ status: 200, server_time: req.serverTime, data: output});
    } catch (e) {
      console.error("addCameraWithROI() ERROR: ", e);
      next(e);
    }finally{
      console.log("#######################################################################");
    }
    
  }//END updateCamera()
  //=============================================================================================================
  async deleteCamera(req, res, next) 
  {
    try {
      if (!req.body.reference_id) {
        throw new NotFoundException("Reference ID not found.");
      }
      const cameraObject = {};
      cameraObject.referenceID = req.body.reference_id;
      console.log("cameraObject: ", JSON.stringify(cameraObject, null, 4));

      const IVCamerasModelByRefID = await this.IVCamerasRepository.findOneByRefID({ camera_owner: CAMERA_OWNER, reference_id : cameraObject.referenceID });
      console.log("IVCamerasModelByRefID: ", JSON.stringify(IVCamerasModelByRefID, null, 4));
      if(IVCamerasModelByRefID == null){
        throw new NotFoundException("Camera Reference ID '" + cameraObject.referenceID + "' not found.");
      }

      const SenseFoundryToken = await SenseFoundryAPI.getToken();

      const rsGetCameraStatus = await SenseFoundryAPI.getCameraStatus({ 
        zone_uuid: SENSEFOUNDRY_CAMERA_ZONE_UUID, 
        camera_uuid: IVCamerasModelByRefID.iv_camera_uuid
      }, { 
        token: SenseFoundryToken.token
      });
      console.log("rsGetCameraStatus: ", JSON.stringify(rsGetCameraStatus, null, 4));
      console.log("rsGetCameraStatus Tasks Length: ", rsGetCameraStatus.tasks.length);

      if(rsGetCameraStatus.tasks.length != 0){
        console.log("Start to remove video task and camera in SenseFoundry.");
        let task_uuid = rsGetCameraStatus.tasks[0].id;

        const rsDeleteVideoTask = await SenseFoundryAPI.deleteVideoTask({ 
          zone_uuid: SENSEFOUNDRY_CAMERA_ZONE_UUID, 
          camera_uuid: IVCamerasModelByRefID.iv_camera_uuid, 
          task_uuid: task_uuid 
        }, { 
          token: SenseFoundryToken.token
        });
        console.log("SenseFoundry - rsDeleteVideoTask: ", JSON.stringify(rsDeleteVideoTask, null, 4));

        const rsDeleteCamera = await SenseFoundryAPI.deleteCamera({ 
          zone_uuid: SENSEFOUNDRY_CAMERA_ZONE_UUID, 
          camera_uuid: IVCamerasModelByRefID.iv_camera_uuid 
        }, { 
          token: SenseFoundryToken.token
        });
        console.log("SenseFoundry - rsDeleteCamera: ", JSON.stringify(rsDeleteCamera, null, 4));

      }
      
      const rsDeleteCameraByRefID = await this.IVCamerasRepository.deleteCameraByRefID({ camera_owner: CAMERA_OWNER, reference_id : cameraObject.referenceID });
      console.log("Table - iv_cameras: ", JSON.stringify(rsDeleteCameraByRefID, null, 4));

      const rsDeleteFaceReeciverByCameraUUID = await this.FaceReceiverControllersRepository.deleteFaceReeciverByCameraUUID({ iv_camera_uuid: IVCamerasModelByRefID.iv_camera_uuid });
      console.log("Table - face_receiver_controllers: ", JSON.stringify(rsDeleteFaceReeciverByCameraUUID, null, 4));

      let output = {};
      output.reference_id = cameraObject.referenceID;
      

      return res.json({ status: 200, server_time: req.serverTime, data: output});
    } catch (e) {
      console.error("deleteCamera() ERROR: ", e);
      next(e);
    }finally{
      console.log("#######################################################################");
    }
  }//END deleteCamera()

  

  

  

  
}
export default new IVCameraController();
