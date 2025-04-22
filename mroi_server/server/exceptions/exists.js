class ExistsException extends Error {
  constructor(message) {
    super(message);
    this.name = "ExistsException";
  }
}

export default ExistsException;
