var fs = require('fs');
class Keywords {
  constructor(r){
    this.rawJobDesc = '../j04.raw';
    this.dictTrivial = './trivial.json';
    if( r===undefined ){  console.log("Error in new constructor. Specify the numerical range of columns or the list of column names."); exit;}
    this._buffer = ''; this._subbuf = ''; this._sublines = [];
    this._r = r; this._sectNum = 0;
    this._exceptions = JSON.parse( fs.readFileSync(this.dictTrivial) );
    // Probably unneeded, but clarifying
    this.listAllKeyW = [];//list of words/phrases
    this.dictsAllKeyW = [];//list of _current (typeof dict)
    this.focusDictsAllKeyW = [];//list
    this.focusOneOnOne = {};//dict
  }
  // Static variables
  // Call for raw input path, not changing dynamically
  get  rawJD(){ return this.rawJobDesc;}
  // Call for trivial vocab list, not changing dynamically
  get exclusions(){  return this._exceptions;}
  // Dynamically changing
  // The original buffer here.
  set savedRaw(s){  this._buffer = s; this._subbuf = s;}
  get   subbuffer( ){  return   this._subbuf;}
  get subbuflines( ){  return this._sublines;}
  set   subbuffer(m){    this._subbuf = m;}
  set subbuflines(l){  this._sublines = l;}

  set  initKWlist(w){  this.listAllKeyW = w;}
  set initKWDicts(d){  this.dictsAllKeyW = d;}
  get dictsKW(){  return this.dictsAllKeyW;}
  set dictsKW(d){  this.dictsAllKeyW.push(d);}//list of 'dict's (i.e., _current)
  get sectK(){  return this._sectNum;}
  set sectK(k){  this._sectNum = k;}

  get focusKW(){  return this.focusDictsAllKeyW;}
  get focusCompared(){  return this.focusOneOnOne;}
  set focusKW(d){  this.focusDictsAllKeyW.push(d);}
  set focusCompared(d){
    this.focusOneOnOne.push(d);}
  get initCurrent(){//_current is a dict of dict structure
    let fresh = {};
    for (let item of this._r) fresh[item] = {};
    return fresh;
  }
}
class Quantifiable {
  constructor(){
    this._inertia = [];
    this._ubiquity = [];
  }
  // Dynamically changing
  set modList(w){  this._ubiquity = w;}// use this at rusk
  set modDicts(d){  this._inertia = d;}// use this at rusk
  set listUbiq(w){//w is passed as list
    this._ubiquity = this._ubiquity.concat(w);}
  get listUbiq(){  return this._ubiquity;}
  set dictsStats(d){//list of 'dict's (i.e., _current)
    this._inertia.push(d);}
  get dictsStats(){  return this._inertia;}
}


var keyphrases = require('./aggregated');
var typo = require('./sequencing');
var stat = require('./statistics');
const soundbites = new Keywords([0,1,2,3]);
const quantified = new Quantifiable();

var raw = process.argv[2]; if(!raw) raw = soundbites.rawJD;
fs.readFile(raw, function(err,buffer) {//Asynchronous
  if(err){ throw err; exit;}
  soundbites.savedRaw = buffer.toString();
  let nontrivial = keyphrases.aggregateBuffer(soundbites);// console.log(nontrivial);
  let thresholds = stat.thresholdEachItem(soundbites.dictsKW,quantified);// console.log(nontrivial);
  nontrivial.forEach((item, n) => {
    soundbites.focusKW = keyphrases.filterPhrases( nontrivial[n],thresholds[n] );
  });// console.log(soundbites.focusKW);
  let focusOneOnOne = soundbites.initCurrent;
  let total = (soundbites.focusKW.length)*(soundbites.focusKW.length-1)/2;
  soundbites.focusKW.forEach((item, i) => {
    if( soundbites.focusKW[i+1]==undefined ) return;
    //if( keyphrases.isemptyD(item) ) return;
    let cmp = matchingFocusPhrases(focusOneOnOne,item,soundbites.focusKW.slice(i+1));
    focusOneOnOne = cmp.inbinary;
  });// console.log(focusOneOnOne,total);// common Keywords, theoretical max comparisons
  for (let sect in focusOneOnOne)
    for (let key in focusOneOnOne[sect])
      if( focusOneOnOne[sect][key].length>1 ) console.log(sect+"\t"+key+"\t"+focusOneOnOne[sect][key].length);
});
// Use 'awk' to format, that's fine.

const matchingFocusPhrases = (D,d,L) => {
  return {
    inbinary:compareBinaryRet(D,d,L)
  }
}
const compareBinaryRet = (D,d,L) => {
  for (let sect in d)
    for (let item of L) D = cumulativeBinary(D,sect,d[sect],item[sect]);
  return D;
}
const cumulativeBinary = (D,k,d1,d2) => {
  if( D[k]===undefined ) D[k] = {};
  // Cumulate only the matching occurrences;
  // 1) avoid doubling 'true'
  // 2) can't properly check back,
  //    i.e., w E w1 can't be checked during w2 <=> [w3..wN] without 1)
  // Just record common occurrences, account 'false' afterwards.
  let Dk = D[k]; let w = [true];
  for (let key1 in d1)
    if( d2[key1]===undefined ) Dk[key1] = [];
    else Dk[key1] = (Dk[key1]===undefined) ? w : Dk[key1].concat(w);
  return D;
}

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
