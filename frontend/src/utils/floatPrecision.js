
function floatPrecision(value) {
  return parseFloat(value).toFixed(2);
}

function e8sToFloat(value) {
  return parseFloat(value.e8s) / 100000000;
}

function floatToE8s(value) {
  return {
    e8s: BigInt(Math.round(value * 100000000)),
  };
}

export { floatPrecision, e8sToFloat, floatToE8s };
