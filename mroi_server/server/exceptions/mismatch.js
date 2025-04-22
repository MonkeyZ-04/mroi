class MismatchException extends Error {
  constructor(message) {
    super(message);
    this.name = "MismatchException";
  }
}

export default MismatchException;
