export default class validationErrorClass extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataValidationError";
  }
}
