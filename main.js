class Keywords {
  constructor(r){
    this.rawJobDesc = '../j02.raw';
    this.dictTrivial = './trivial.json';
    if( r===null ){  console.log("Error in Class. Specify the numerical range of columns or the list of column names."); exit;}
    //if( r!==undefined ){  console.log("Error in new constructor. Specify the numerical range of columns or the list of column names."); exit;}
    this._r = r;
    this._buffer = ''; this._subbuf = '';
    this._current = {}; this._groupNum = 0;
    // Probably unneeded, but clarifying
    this.listAllKeyW = [];//list of words/phrases
    this.dictsKeyW = [];//list of _current (typeof dict)
  }
  // Static variables
  // Call for raw input path, not changing dynamically
  get rawJD(){ return this.rawJobDesc;}
  // Call for trivial vocab list path, not changing dynamically
  get dictTR(){  return this.dictTrivial;}
  // Dynamically changing
  // The original buffer here.
  set savedRaw(s){
    this._buffer = s; this._subbuf = s;}
  get savedRaw(){  return this._buffer;}
  // The subsequently processed buffer here.
  set subbuffer(m){
    this._subbuf = m;}
  get subbuffer(){  return this._subbuf;}
  set modList(w){  this.listAllKeyW = w;}
  set listKW(w){//w is passed as list
    this.listAllKeyW = this.listAllKeyW.concat(w);}
  get listKW(){  return this.listAllKeyW;}
  set modDicts(d){  this.dictsKeyW = d;}
  set dictsKW(d){//list of 'dict's (i.e., _current)
    this.dictsKeyW.push(d);}
  get dictsKW(){  return this.dictsKeyW;}
  set groupK(k){
    this._groupNum = k;}
  get groupK(){  return this._groupNum;}
  get initCurrent(){
    this._r.forEach((item, i) => {//_current is a dict of dict structure
      this._current[item] = {};
    });
    return this._current;
  }
}
const constructRegExp = function(w){
  let rW = '';
  let sep = ' '; let union = '';
  w.forEach((item, i) => {
    rW += union+sep+item+'\\b|\\b'+item+sep;
    union = '|';
  });
  return defineRegExp(rW);
}
const defineRegExp = (r) => new RegExp(r,'gi');
const cleanExcluded = (re,t) => t.replace(re,' ');
const cleanBuffer = function(s){
  let m = soundbites.subbuffer; let re = [];
  let d = JSON.parse( fs.readFileSync(s.dictTR) );
  re.push( / i\.?e\.?,?\b|\bi\.?e\.?,? | e\.?g\.?,?\b|\be\.?g\.?,? /gi );
  re.push( / etc\.?\b|\betc\.? | a\.?k\.?a\.?\b|\ba\.?k\.?a\.? /gi );
  re.push( /s['’] /gi , /['’](s|re|ll|ve) /gi );
  // whole word exclusions
  re.push( constructRegExp(d.Articles) );
  re.push( constructRegExp(d.BasicResponse) );
  re.push( constructRegExp(d.BeingVerbs) );
  re.push( constructRegExp(d.AuxiliaryVerbs) );
  re.push( constructRegExp(d.Pronouns) );
  re.push( constructRegExp(d.Conjunctions) );
  re.push( constructRegExp(d.Prepositions) );
  re.push( constructRegExp(d.WsHs) );
  re.push( constructRegExp(d.IndefiniteFrequency) );

  re.forEach((item, i) => {
    m = cleanExcluded(item,m);
  });
  //console.log(m);
  soundbites.subbuffer = m;
  return true;
}
const start_group = function(m){//continue;
  let g = m.match(/^!(\d)/);//['!0','0']
  if( g !== null ){  soundbites.groupK = g[1];}
  //else{  soundbites.groupK = currentK;}
  let zero = (g !== null && soundbites.groupK == 0) ? true : false;
  let marker = (g !== null) ? true : false;
  return {
     "iszero":zero
    ,"ismarker":marker
  };
}
const mapList = function(d,k,l){
  let w = [1];
  //in case the raw file isn't well structured
  //say, Class declared for 0 through 4, and found '!5'
  if( d[k] === undefined ){  d[k] = {};}
  l.forEach((item, i) => {
    d[k][item] = (d[k][item] === undefined) ? w : d[k][item].concat(w);});
  return d;
}
const aggregateBuffer = function(s){
  let current = soundbites.initCurrent;
  let lines = soundbites.subbuffer.split(/\r?\n/);
  lines.forEach((line, i) => {
    let gg = start_group(line);
    if( gg.iszero ){
      soundbites.dictsKW = current;
      current = soundbites.initCurrent;
      return;}
    if( gg.ismarker ){  return;}
    let digest = aggregateCombination(line);
    lines[i] = digest.subline;
    //current[k[1]] = mapList(current[k[1]],digest.phrases);
    current = mapList(current,soundbites.groupK,soundbites.listKW);
  });
  //soundbites.dictsKW = current;
  //console.log( lines.join("\n") );
  return true;
}
const aggregateCombination = function(l){
  // Need case sensitivity here!!
  let re = []; soundbites.modList = [];
  //get dashed number range
  //get percentage
  re.push( /(\d+\-\d+)\b/g, /(\d+\s?\%)\b/g );
  //get combination dashed words
  //capture both uppercase abbrev and combination proper names
  //  except won't likely separate consecutive uppercase vocabs
  re.push( /(\w+(\-\w+)+)\b/g );
  re.push( /([A-Z]+\w*( +[A-Z]+\w*)*)\b/g );
  //get rest of integers
  re.push( /(\d+)\b/g , /(\w+)\b/g );
  re.slice(0,-1).forEach((item, i) => {
    soundbites.listKW = extractPhrases( l.match(item) ,1);
    // cleanExcluded on non-trivial phrases
    //   i.e., capialized phrases are not captured twice
    l = cleanExcluded(item,l);
  });
  //get rest of whole words, turn all lowercase
  soundbites.listKW = extractPhrases( l.match(re.pop()) ,0);
  return {
    subline:l //STR
  };
}
const extractPhrases = function(r,cs){
  if( r === null ){  return [];}
  if( cs == 1 ){  return r;}
  return r.map(function(v) {
    return v.toLowerCase();
  });
}
const concatRelatives = function(){
  let d = soundbites.dictsKW;
  d.forEach((dict, k) => {
    for (let group in dict) {
      let suggested = suggestRelatives(dict[group]);
      for (let key in suggested.pairs) {
        let dd = d[k][group];
        let alt = suggested.pairs[key];
        dd[key] = dd[key].concat(dd[alt]);
        delete dd[alt];
        //console.log('2: key='+key+'; ar='+dd[key]);
        //console.log('2: alt='+alt+'; ar='+dd[alt]);
      }
    }
  });
  soundbites.modDicts = d;
  return true;
}
const suggestRelatives = function(d){
  let d2 = {};
  for (let key in d) {
    let kinsman = areRelatives(d,key);
    if( kinsman.areRelatives ){
      kinsman.Kins.forEach((alt, i) => {
        if( key.match(/[A-Z]/) !== null ){  console.log("Notice: make the decision. Pick the shortest phrase, maybe?");}
        else{  d2[key] = alt;}
      });
    }
  }
  return {pairs:d2};
}
const areRelatives = function(d,w){
  // 's' 'es' 'd' 'ed' 'r' 'er'
  // 'ing'
  let suffices = [
     's','es','d','ed','r','er'
    ,'ing'
  ];
  let yes = false; let kins = [];
  suffices.forEach((suffix, i) => {
    let alt = w.toLowerCase()+suffix;
    if( d[alt] !== undefined ){
      yes = true;// console.log('0:'+w+' === '+alt); console.log('1:'+d[w]+' === '+d[alt]);
      kins.push(alt);
    }
  });
  return {
     areRelatives:yes
    ,Kins:kins
  }
}

const soundbites = new Keywords([0,1,2,3]);
var typo = require('./sequencing');
var stat = require('./statistics');
var fs = require('fs');
var raw = process.argv[2]; if(!raw){ raw = soundbites.rawJD;}

fs.readFile(raw, function(err,buffer) {
  if(err){ throw err; exit;}
  soundbites.savedRaw = buffer.toString();
  cleanBuffer(soundbites);// console.log(soundbites.subbuffer);
  aggregateBuffer(soundbites);
  concatRelatives();// console.log(soundbites.dictsKW);
  for (let d in soundbites.dictsKW[0]) {
    for (let k in soundbites.dictsKW[0][d]) {
      //console.log(k+': '+soundbites.dictsKW[0][d][k].length);
    }
  }
  let d = stat.thresholdEachItem(soundbites.dictsKW);
  //console.log(d);
  for (let k in d[0]) {
    //console.log(d[0][k].mode);
  }
});


// To exclude: whole words
//   articles: //   being verbs: //   auxiliary verbs: //   pronouns:
//   conjunction: //   prepositions:
//   WsHs: //   frequency: always
//   possessive apostrophe: "'s" and "s'"
//   abbreviation: e.g., i.e., a.k.a., etc.
// To exclude: symbols characters
//   end of sentence period:
//   enumerative comma: one, two, three
//   parentheses, if > 1 word: (Business Degree preferred)
// To include:
//   range dash: 3-5
//   alternative slash: A/B
//   words-in-one dash: ad-hoc
//   parentheses, if = 1 word: (BI)
// Algorithm Questions:
//    How to capture "Business Intelligence
//    Levenshtein to gather words similar (L=1)
