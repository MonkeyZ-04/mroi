import { API, SENSETIME } from "../../configs/index.js";
import HTTPCore from "../http.core.js";
import { FACE_COMPARISION } from "./_query.js";

const { BLACKLIST_DB_ID } = SENSETIME;

class KYIAPI extends HTTPCore {
  constructor() {
    super({ baseURL: API.API_KYI_ENDPOINT });
  }

  faceComparision({ image_base64, limit, threshold, bucket_id = BLACKLIST_DB_ID }) {
    return this.postIgnoreProcess("", {
      operationName: null,
      variables: { image_base64, limit, threshold, bucket_id },
      query: FACE_COMPARISION,
    }).then((e) => {
      if (e.data.data.fetchFaceComparisons) {
        return e.data.data.fetchFaceComparisons;
      } else {
        console.log(e.data);
        throw new Error(e.data.errors[0].message);
      }
    });
  }
}

export default new KYIAPI();
