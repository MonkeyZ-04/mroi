class MandatoryException extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = "MandatoryException";
    this.errors = errors;
  }
}

export default MandatoryException;
