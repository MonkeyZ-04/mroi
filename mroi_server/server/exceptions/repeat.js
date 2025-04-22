class RepeatException extends Error {
  constructor(message, errors) {
    super(message);

    this.name = "RepeatException";
    this.message = message;
    this.errors = errors;
  }
}

export default RepeatException;
