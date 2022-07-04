function isDate(x: any): boolean {
  return (Object.prototype.toString.call(x) === "[object Date]");
}

export default isDate;
