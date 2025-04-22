class AuthorizationException extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthorizationException";
  }
}

export default AuthorizationException;
