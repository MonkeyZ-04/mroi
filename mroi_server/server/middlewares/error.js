import {
  ExistsException,
  MandatoryException,
  MismatchException,
  NotFoundException,
  ValidationException,
  AuthorizationException,
  RepeatException,
} from "@exceptions";

export default (err, req, res, next) => {
  const { serverTime } = req;

  let status = 500;
  if (err instanceof AuthorizationException) {
    status = 401;
  } else if (err instanceof NotFoundException) {
    status = 404;
  } else if (
    err instanceof ExistsException ||
    err instanceof MismatchException ||
    err instanceof ValidationException ||
    err instanceof MandatoryException ||
    err instanceof RepeatException
  ) {
    status = 400;
  }

  if (err instanceof MandatoryException || err instanceof RepeatException) {
    return res
      .status(status)
      .json({ status, server_time: serverTime, code: res.sentry, message: err.message, errors: err.errors });
  } else {
    return res.status(status).json({ status, server_time: serverTime, code: res.sentry, message: err.message });
  }
};
