function floatPrecision(value) {
  return parseFloat(value).toFixed(2);
}

function e8sToFloat(value) {
  // Handle both object with e8s property and direct BigInt value
  const e8sValue = typeof value === "object" ? value.e8s : value;
  return Number(e8sValue) / 100000000;
}

function floatToE8s(value) {
  return {
    e8s: BigInt(Math.round(value * 100000000)),
  };
}

export { floatPrecision, e8sToFloat, floatToE8s };
