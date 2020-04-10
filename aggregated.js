module.exports = {
  aggregateBuffer: function(saved){
    // First, count/sum (list). Then, mean, median, mode (dict).
    // Third, quartiles(3-threshold), skewness, outlier (dict).
    //   i.e., pick an appropriate threshold estimate
    saved.subbuffer = cleanBuffer(saved.subbuffer,saved.exclusions);
    let current = saved.initCurrent;
    let lines = saved.subbuffer.split(/\r?\n/);
    lines.forEach((line, i) => {
      let gg = start_section(line,saved);
      if( gg.iszero && !isemptyD(current) ){
        saved.dictsKW = current;
        current = saved.initCurrent;
      }
      if( gg.ismarker ) return;
      let digest = aggregateCombination(line,saved);
      lines[i] = digest.subline;
      current = mapList(current,saved.sectK,digest.phrases);
    });
    saved.dictsKW = current;
    saved.subbuflines = lines;
    return concatRelatives(saved.dictsKW);
  },
  filterPhrases: function (dS,dT){// ...may be ineffective...
    let filtered = {};
    for (let sect in dS){
      filtered[sect] = {};
      for (let phrase in dS[sect]){
        let par = dT.inertia[sect];
        //if( dS[sect][phrase].length <= dT.inertia[sect].mean-2*Math.sqrt(dT.normality[sect].momentum) ) console.log(sect,phrase,dS[sect][phrase].length,dT.inertia[sect].mean,Math.sqrt(dT.normality[sect].momentum));
        // By Quartiles, picking the Q1, Q2, and Q3
        let upperQ = par.quartiles.ranges.R4[par.quartiles.ranges.R4.length-1];//... ~ scalar
        if( dS[sect][phrase].length <= upperQ ) filtered[sect][phrase] = dS[sect][phrase];
      }
    }
    return filtered;
  }

}

const cleanBuffer = function(m,d){
  let re = [];
  re.push( / i\.?e\.?,?\b|\bi\.?e\.?,? | e\.?g\.?,?\b|\be\.?g\.?,? /gi );
  re.push( / etc\.?\b|\betc\.? | a\.?k\.?a\.?\b|\ba\.?k\.?a\.? /gi );
  re.push( /s['’] /gi , /['’](s|re|ll|ve) /gi );
  // whole word exclusions
  Object.keys(d).forEach((type, i) => {
    let item = constructRegExp(d[type]);
    m = cleanExcluded(item,m);
  });
  return m;
}
const constructRegExp = function(w){
  let rW = []; let sep = ' ';// use 'forEach' or 'map' to combine two lines?
  for (let item of w) rW.push(sep+item+'\\b|\\b'+item+sep);
  return defineRegExp( {regex:rW.join('|'),cs:false} );
}
const defineRegExp = (d) => (d.cs) ? new RegExp(d.regex,'g') : new RegExp(d.regex,'gi');
const cleanExcluded = (re,t) => t.replace(re,' ');
const start_section = function(m,s){
  let g = m.match(/^!(\d+)/);//['!0','0']
  if( g !== null ) s.sectK = g[1];
  return {
     iszero:(g !== null && s.sectK == 0) ? true : false
    ,ismarker:(g !== null) ? true : false
    ,ischanged:(g === null) ? false : true
  };
}
const isemptyD = (d) => {
  for (let sect in d)
    if( Object.keys(d[sect]).length>0 ) return false;
  return true;
}
const aggregateCombination = function(m,k){
  // Need case sensitivity here!!
  let re = []; let current = [];
  //get dashed number range, then percentage
  re.push( /(\d+\-\d+)\b/g, /(\d+\s?\%)\b/g );
  //get combination dashed words
  //capture both uppercase abbrev and combination proper names
  //  except won't likely separate consecutive uppercase vocabs
  re.push( /(\w+(\-\w+)+)\b/g );
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
  // "If the g flag is used, all results matching the complete regular expression will be returned, but capturing groups will not."
  // Is the recurrence specification in curly brackets non-greedy in nodeJS?
  re.push( /(\w\.){3,}\b|\b(\w\.){3,}/g );
  re.push( /([A-Z]+\w*( +[A-Z]+\w*)*)\b/g );
  //get rest of integers
  re.push( /(\d+)\b/g , /(\w+)\b/g );
  re.slice(0,-1).forEach((item, i) => {
    current = current.concat( extractPhrases( m.match(item) ,1) );
    // cleanExcluded on non-trivial phrases
    //   i.e., capialized phrases are not captured twice
    m = cleanExcluded(item,m);
  });
  //get rest of whole words, turn all lowercase
  current = current.concat( extractPhrases( m.match(re.pop()) ,0) );
  return {
     subline:m //STR
    ,phrases:current
  };
}
const extractPhrases = function(l,cs){
  if( l === null ) return [];
  if( cs == 1 ) return l;
  return l.map(function(v) {
    return v.toLowerCase();
  });
}
const mapList = function(d,k,l){
  let w = [1];
  //in case the raw file isn't well structured
  //say, Class declared for 0 through 4, and found '!5'
  if( d[k] === undefined ) d[k] = {};
  for (let item of l)  d[k][item] = (d[k][item] === undefined) ? w : d[k][item].concat(w);
  return d;
}

const concatRelatives = function(d){
  d.forEach((dict, k) => {
    for (let sect in dict) {
      let suggested = suggestRelatives(dict[sect]);
      if( Object.keys(suggested).length==0 ) continue;
      dict[sect] = joinRelatives(dict[sect],suggested.pairs);
    }
  });
  return d;
}
const suggestRelatives = function(d){
  let d2 = {};
  for (let key in d) {
    let kinsman = areRelatives(d,key);
    if( kinsman.areRelatives ) d2[key] = kinsman.Kins;
  }
  return {pairs:d2};
}
const areRelatives = function(d,w){
  if( w.match(/^[\d\.\,\-]+$/) !== null ) return {areRelatives:false,Kins:[]};
  let wALT = ['s','es','d','ed','r','er'].map(v => w+v);
  if( w.match(/e$/) === null ) wALT.push(w+'ing'); else wALT.push(w.slice(0,-1)+'ing');
  if( w.match(/^[A-Z]/       ) === null ) wALT.push( w.charAt(0).toUpperCase()+w.slice(1) );// ...capitalized
  if( w.match(/^[A-Z\d\W]+$/ ) === null ) wALT.push( w.toUpperCase() );
  if( w.match(/^[A-Z](\W)([A-Z]\1)+$/) !== null ) wALT.push( w.replace(/\W/g,'') );
  let yes = false; let kins = [];
  for (let alt of wALT) {
    if( d[alt] === undefined ) continue;
    else yes = true;
    kins.push(alt);
  }
  return {
     areRelatives:yes
    ,Kins:kins
  }
}
const joinRelatives = (d,dAlt) => {
  let tobedeleted = {};
  for (let key in dAlt) {
    for (let kAlt of dAlt[key]){if( d[key]===undefined ) console.log('Fail point: '+key,kAlt);
      d[key] = d[key].concat(d[kAlt]);
      tobedeleted[kAlt] = true;
    }
  }
  for (let del of Object.keys(tobedeleted)) delete d[del];
  return d;
}
