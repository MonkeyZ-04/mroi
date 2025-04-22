import axios from "axios";

class HTTPCore {
  api;
  constructor({ baseURL, options = {} }) {
    this.api = axios.create({
      baseURL,
      ...options,
    });
  }

  post(path = "/", data = {}, options = {}) {
    return this.api.post(path, data, options).then(_processData);
  }

  postIgnoreProcess(path = "/", data = {}, options = {}) {
    return this.api.post(path, data, options);
  }

  get(path = "/", options = {}) {
    return this.api.get(path, options).then(_processData);
  }

  getIgnoreProcess(path = "/", options = {}) {
    return this.api.get(path, options);
  }

  put(path = "/", data = {}, options = {}) {
    return this.api.put(path, data, options).then(_processData);
  }

  putIgnoreProcess(path = "/", data = {}, options = {}) {
    return this.api.put(path, data, options);
  }

  patch(path = "/", data = {}, options = {}) {
    return this.api.patch(path, data, options).then(_processData);
  }

  patchIgnoreProcess(path = "/", data = {}, options = {}) {
    return this.api.patch(path, data, options);
  }

  delete(path = "/", options = {}) {
    return this.api.delete(path, options).then(_processData);
  }

  deleteIgnoreProcess(path = "/", options = {}) {
    return this.api.delete(path, options);
  }
}

const _processData = (res) => res.data;

export default HTTPCore;
