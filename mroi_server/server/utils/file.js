export const binaryToText = (str) => {
  var binString = "";

  str.split(" ").map(function (bin) {
    binString += String.fromCharCode(parseInt(bin, 2));
  });
  return binString;
};
