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
        ret.inertia[i][sect] = inertiaEachCount(cnt);// console.log(ret.inertia[i][sect]);
        ret.normality[i][sect] = normalityEachCount(cnt);// console.log(ret.normality[i][sect]);
      }
    });
    return ret.inertia;
  }


}
const sortNum = (r,ASC) => (ASC.ascending) ? r.sort((a,b) => a-b) : r.sort((b,a) => a-b);
const inertiaEachCount = (l) => {
  //escape empty list, single-element list --built in in respective functions
  let medianResults = medianRange( sortNum(l,{ascending:true}) );
  return {
     mean:avg(l)
    ,median:avg(medianResults.range)
    ,mode:modeList( sortNum(l,{ascending:false}),{rank:1} )// ..list, may have multiple modes
  };
}
const avg = (r) => (r.length == 0) ? 0 : (r.length == 1) ? r[0] : expected(r);
const expected = (r) => {
  let bigSigma = 0; r.forEach((v, i) => { bigSigma += v;});
  return bigSigma/r.length;
}
const medianRange = (r) => {
  if( r.length == 0 ) return {pos:[],isrange:false,range:[]};
  if( r.length == 1 ) return {pos:[0,0],isrange:false,range:[r.pop(),r.pop()]};
  let c = Math.floor(r.length * 0.5);
  // https://stackoverflow.com/questions/1063007/how-to-sort-an-array-of-integers-correctly
  return (r.length % 2) ? {pos:[c,c],isrange:false,range:[r[c],r[c]]} : {pos:[c-1,c+1],isrange:true,range:r.slice(c-1,c+1)};
  // ..slice upperlimit is not inclusive
}
const modeList = (r,ofInterest) => {
  let ff = {};// frequency of frequency of occurrences
  // iterate through list, of
  for (let v of r) ff[v] = ( ff[v] === undefined ) ? [1] : ff[v].concat([1]);
  let ffK = sortNum(Object.keys(ff),{ascending:false});// ..descending, frequencies
  if( ffK.length == 0 ) return [];//
  if( ffK.length == 1 ) return [ffK.pop()];// return the only key, i.e., occurrences of every phrase is the SAME
  let uniqueFreq = {};
  // iterate through list, of
  for (let e of ffK) uniqueFreq[ ff[e].length ] = 0;// ..common frequencies
  let rankFreq = sortNum(Object.keys(uniqueFreq),{ascending:false});
  let freqOfInterest = rankFreq.slice(0,ofInterest.rank).pop();// ..in effect, pop rank of interest
  let rankOfInterest = [];
  // iterate through dict, in
  for (let k in ff) if(ff[k].length == freqOfInterest) rankOfInterest.push(k);
  return rankOfInterest;
}
const normalityEachCount = (l) => {
  // escape empty list --built in in respective functions
  return {
     quartiles:quartileMarkers( sortNum(l,{ascending:true}) )
    //,skewness:avg(medianRange( sortNum(l,{ascending:true}) ))
    //,outliers:modeList( sortNum(l,{ascending:false}),{rank:1} )// ..list, may have multiple modes
  };
}
const quartileMarkers = (r) => {
  if( r.length == 1 ) return true;// ..escape single-element list
  if( r.length == 2 ) return true;// ..escape twin-element list
  if( r.length == 3 ) return true;// ..escape triple-element list
  // only makes sense beyong the set of 4
  // Further: https://en.wikipedia.org/wiki/Quartile#Discrete_Distributions
  let bisect = medianRange( sortNum(r,{ascending:true}) );
  let halves = twohalves(r, bisect.pos[0],bisect.pos[1] );
  let bisectHs = {
     H1:medianRange( sortNum( halves[1],{ascending:true}) )
    ,H2:medianRange( sortNum( halves[2],{ascending:true}) )
  };
  let L = twohalves( r.slice(0,bisect.pos[0]), bisectHs.H1.pos[0],bisectHs.H1.pos[1]);
  let U = twohalves( r.slice(  bisect.pos[1]), bisectHs.H2.pos[0],bisectHs.H2.pos[1]);
  let Q = [[0],L[1],L[2],U[1],U[2]]; console.log(r,Q[1],Q[2],Q[3],Q[4]);
  return {quartiles:Q, markers:[bisect,bisectHs.H1,bisectHs.H2]};
}
const twohalves = (l,midL,midU) => {
  let h = [l];
  h[1] = []; for (let h1=0; h1<=midL ;h1++) h[1].push( l[h1] );
  h[2] = l.slice( midU );
  return h;
}
