import _ from "lodash";

class BaseRepository {
  _postFetchData(data, plain = false) {
    if (_.isEmpty(data)) {
      return data;
    }

    if (plain) {
      if (_.isArray(data)) {
        return data.map((e) => e.get({ plain: true }));
      } else if (typeof data === "object") {
        return data.get({ plain: true });
      } else {
        return data;
      }
    } else {
      return data;
    }
  }

  _postFetchPaginationData(data, key = "rows", plain = false) {
    const { count, rows } = data;
    if (count < 1 && _.isEmpty(rows)) {
      return { count, [key]: rows };
    }

    if (plain) {
      if (_.isArray(rows)) {
        return { count, [key]: rows.map((e) => e.get({ plain: true })) };
      } else if (typeof rows === "object") {
        return { count, [key]: rows.get({ plain: true }) };
      } else {
        return { count, [key]: rows };
      }
    } else {
      return { count, [key]: rows };
    }
  }
}

export default BaseRepository;
