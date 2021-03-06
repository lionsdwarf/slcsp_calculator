// build data structure: {
//   <state>: {
//      <rate_area>: [silver rates list]
//   }
// }
const mapAreasToSilverRates = function(plans) {
  const areasToSilverRates = {};
  plans.forEach(row => {
    if (row.metal_level.toLowerCase() === `silver`) {
      const stateExists = areasToSilverRates[row.state];
      const ratesListExists = stateExists && areasToSilverRates[row.state][row.rate_area];
      if (!ratesListExists) {
        if (!stateExists) {
          areasToSilverRates[row.state] = {};
        }
        areasToSilverRates[row.state][row.rate_area] = [];
      }
      areasToSilverRates[row.state][row.rate_area].push(row.rate);
    }
  });
  return areasToSilverRates;
}

// build rate area tuple
const getRateArea = (zip) => `${zip.state} ${zip.rate_area}`;

// we are concerned with zipcodes with multiple rate areas
// build data structure: {
//    <zipcode>: [rate area tuples list]
// }
const mapZipsToAreas = function(zips) {
  const zipsToAreas = {};
  zips.forEach((zip) => {
    if (!zipsToAreas[zip.zipcode]) {
      zipsToAreas[zip.zipcode] = [getRateArea(zip)];
    } else {
      if (zipsToAreas[zip.zipcode].indexOf(getRateArea(zip)) === -1) {
        zipsToAreas[zip.zipcode].push(getRateArea(zip));
      }
    }
  });
  return zipsToAreas;
}

// build data structure: {
//   <zipcode>: [silver rates arr]
// }
const mapZipsToRates = function(areasToSilverRates, zips) {
  const zipsToRates = {};
  //get zips in multiple rate areas
  const zipsToAreas = mapZipsToAreas(zips);
  zips.forEach(row => {
    const stateExists = areasToSilverRates[row.state];
    const ratesListExists = stateExists && areasToSilverRates[row.state][row.rate_area];
    //ignore zips in multiple rate areas
    if (ratesListExists && zipsToAreas[row.zipcode].length === 1) {
      zipsToRates[row.zipcode] = areasToSilverRates[row.state][row.rate_area];
    }
  });
  return zipsToRates;
}

// build data structure: {
//   <zipcode>: <slcsp>
// }
const mapZipsToSLCSPs = function(zipsToRates, zips) {
  zips.forEach(row => {
    const slcsp = zipsToRates[row.zipcode] && calcSLCSPFromRates(zipsToRates[row.zipcode]);
    if (slcsp && zipsToRates[row.zipcode]) {
      row.rate = slcsp;
    }
  });
  return zips;
}

//retrieve second lowest value from rates list
const calcSLCSPFromRates = function(rates) {
  let lowest, secondLowest;
  rates.forEach(rate => {
    rate = parseFloat(rate);
    if (lowest === undefined) {
      lowest = rate;
    } else if (rate < lowest) {
      secondLowest = lowest;      
      lowest = rate;
    } else if (secondLowest === undefined || (rate < secondLowest && rate !== lowest)) {
      secondLowest = rate;
    }
  });
  return secondLowest;
}

const generateCSVString = function(zipsToSLCSPs) {
  let csvString = ``;
  zipsToSLCSPs.forEach(row => {
    if (csvString === ``) {
      csvString += `zipcode,rate\n`;
    }
    csvString += `${row.zipcode},${row.rate}\n`;
  });
  return csvString;
}


exports.mapAreasToSilverRates = mapAreasToSilverRates;
exports.mapZipsToAreas = mapZipsToAreas;
exports.mapZipsToRates = mapZipsToRates;
exports.calcSLCSPFromRates = calcSLCSPFromRates;
exports.generateCSVString = generateCSVString;
exports.mapZipsToSLCSPs = mapZipsToSLCSPs;