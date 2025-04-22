export default (obj, fields) => {
  let newObj = Object.assign({}, obj);
  for (let i in fields) {
    delete newObj[fields[i]];
  }
  return newObj;
};
