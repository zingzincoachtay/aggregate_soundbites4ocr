module.exports = {
  thresholdEachItem: function(d){
    let ret = {count:{},inertia:{},normality:{}};
    // First, count/sum (list). Then, mean, median, mode (dict).
    // Third, quartiles(3-threshold), skewness, outlier (dict).
    //   i.e., pick an appropriate threshold estimate
    d.forEach((item, i) => {
      // define the deeper structures
      ret.count[i] = {};
      ret.inertia[i] = {};
      ret.normality[i] = {};
      for (let sect in item){
        let cnt = [];// ..count number of occurrences of each keyword
        for (let key in item[sect]) cnt.push( item[sect][key].length );
        ret.count[i][sect] = cnt;
        ret.inertia[i][sect] = inertiaEachCount(cnt);
        ret.normality[i][sect] = normalityEachCount(cnt);
      }
    });
    return ret.inertia;
  }


}
const inertiaEachCount = (l) => {
  let c = Math.floor(l.length * 0.5); let isodd = l.length % 2;
  if( c == 0 ) return true;//escape one-element list
  // https://stackoverflow.com/questions/1063007/how-to-sort-an-array-of-integers-correctly
  let sortedASC = l.sort( (a,b) => a-b );
  let medianRange = (isodd) ? sortedASC.slice(c) : sortedASC.slice(c-1,c);
  let modeStack = {};
  l.forEach((v, i) => {
    modeStack[v] = ( modeStack[v] === undefined ) ? [1] : modeStack[v].concat([1]);
  });
  return {
     mean:avg(l)
    ,median:avg(medianRange)
    ,mode:rankFreq(modeStack,1)// ..may have multiple modes
  }
}
const avg = (r) => (r.length == 0) ? 0 : (r.length == 1) ? r[0] : expected(r);
const expected = (r) => {
  let bigSigma = 0; r.forEach((v, i) => { bigSigma += v;});
  return bigSigma/r.length;
}
const rankFreq = (d,ofInterest) => {
  let uniqueFreq = {};
  for (let key in d) { let val = d[key].length;
    uniqueFreq[val] = 0;
  }
  let rankFreq = Object.keys(uniqueFreq).sort( (a,b) => b-a );// ..descending
  let freqOfInterest = rankFreq[ofInterest-1];// ..shift one to the left
  let rankOfInterest = [];
  for (let key in d) { let val = d[key].length;
    if(val == freqOfInterest) rankOfInterest.push(key);
  }
  return rankOfInterest;
}
