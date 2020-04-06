module.exports = {
  thresholdEachItem: function(d,saved){
    // First, count/sum (list). Then, mean, median, mode (dict).
    // Third, quartiles(3-threshold), skewness, outlier (dict).
    //   i.e., pick an appropriate threshold estimate
    d.forEach((item, i) => {
      let ret = {count:{},inertia:{},normality:{}};
      for (let sect in item){
        let cnt = [];// ..count number of occurrences of each keyword
        for (let key in item[sect]) cnt.push( item[sect][key].length );
        ret.count[sect] = cnt;
        ret.inertia[sect] = inertiaEachCount(cnt);
        ret.normality[sect] = normalityEachCount(cnt,ret.inertia[sect]);
      }
      saved.dictsStats = ret;// console.log(ret);
    });
    return saved.dictsStats;
  }

}

const sortNum = (r,ASC) => (ASC.ascending) ? r.sort((a,b) => a-b) : r.sort((b,a) => a-b);
const inertiaEachCount = (l) => {
  //escape empty list, single-element list --built in in respective functions
  let medianResults = medianRange( sortNum(l,{ascending:true}) );
  return {
     mean:avg(l)//scalar
    ,median:avg([medianResults.L,medianResults.U])//scalar
    ,mode:modeList( sortNum(l,{ascending:false}),{rank:1} )// ..list, may have multiple modes
    ,quartiles:quartileMarkers( sortNum(l,{ascending:true}) )// ..dict, each Qs and markers
  };
}
const avg = (r) => (r.length == 0) ? 0 : (r.length == 1) ? r[0] : expected(r);
const expected = (r) => {
  let bigSigma = 0; for (let v of r) bigSigma += v;
  return bigSigma/r.length;
}
const medianRange = (r) => {
  if( r.length == 0 ) return {pos:[],isrange:false,range:[]};
  if( r.length == 1 ) return {pos:[0,0],isrange:false,range:[r.pop(),r.pop()]};
  let c = Math.floor(r.length * 0.5);
  // https://stackoverflow.com/questions/1063007/how-to-sort-an-array-of-integers-correctly
  return (r.length % 2) ? {posL:c,posU:c,isrange:false,L:r[c],U:r[c]} : {posL:c-1,posU:c,isrange:true,L:r[c-1],U:r[c]};
  // ..slice upperlimit is NOT inclusive
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
const quartileMarkers = (r) => {
  if( r.length == 1 ) return true;// ..escape single-element list
  if( r.length == 2 ) return true;// ..escape twin-element list
  if( r.length == 3 ) return true;// ..escape triple-element list
  // only makes sense beyong the set of 4
  // Further: https://en.wikipedia.org/wiki/Quartile#Discrete_Distributions
  let bisect = medianRange( sortNum(r,{ascending:true}) );
  let halves = twohalves(r, bisect.posL,bisect.posU );
  let bisectHs = {
     H1:medianRange( sortNum( halves.L,{ascending:true}) )
    ,H2:medianRange( sortNum( halves.U,{ascending:true}) )
  };
  let L = twohalves( halves.L, bisectHs.H1.posL,bisectHs.H1.posU);
  let U = twohalves( halves.U, bisectHs.H2.posL,bisectHs.H2.posU);
  return {
     ranges:{
      R1:L.L,R2:L.U,R3:U.L,R4:U.U
    },indices:{
      Q1:[bisectHs.H1.posL,bisectHs.H1.posU]
     ,Q2:[bisect.posL,bisect.posU]
     ,Q3:[bisectHs.H2.posL,bisectHs.H2.posU]
    },markers:{
      Q1:avg([bisectHs.H1.L,bisectHs.H1.U])
     ,Q2:avg([bisect.L,bisect.U])
     ,Q3:avg([bisectHs.H2.L,bisectHs.H2.U])
    }
  };//posL:,posU:,isrange:,L:,U:}
}
const twohalves = (l,midL,midU) => {
  let h = {};
  h.L = []; for (let h1=0;h1<=midL;h1++) h.L.push( l[h1] );
  h.U = l.slice( midU );
  return h;
}
// -- //
const normalityEachCount = (l,d) => {
  // refer to the dict structure in function inertiaEachCount().
  let threeInertia = {mean:d.mean,median:d.median,mode:d.mode};
  let infoQuartiles = d.quartiles;
  return {
     skewness:skewedQ(infoQuartiles)// B<0, median>mean?
    ,outliers:outlierThreshold(  )//
    ,momentum:sampleCentralMoment(l,threeInertia.mean)
  };
}
const skewedQ = (d) => {
  // Methods taken: https://en.wikipedia.org/wiki/Skewness#Other_measures_of_skewness
  let markers = {
    Q2:d.markers[0],Q1:d.markers[1],Q3:d.markers[2]
  };
  return (markers.Q3+markers.Q1-2*markers.Q2)/(markers.Q3-markers.Q1);
}
const outlierThreshold = (d) => {
  return true;
}
const sampleCentralMoment = (l,mean) => {
  let littleSigma2 = 0; for (let n of l) littleSigma2 += (n-mean)*(n-mean);
  return littleSigma2/(l.length-1);
  //return {samplevariance:littleSigma2/(l.length-1)};
}
