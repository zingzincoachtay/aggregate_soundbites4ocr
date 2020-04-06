class Keywords {
  constructor(r){
    this.rawJobDesc = '../j02.raw';
    this.dictTrivial = './trivial.json';
    if( r===undefined ){  console.log("Error in new constructor. Specify the numerical range of columns or the list of column names."); exit;}
    this._buffer = ''; this._subbuf = ''; this._sublines = [];
    this._r = r; this._exeptions = {};
    this._current = {}; this._sectNum = 0;
    // Probably unneeded, but clarifying
    this.listAllKeyW = [];//list of words/phrases
    this.dictsAllKeyW = [];//list of _current (typeof dict)
    this.focusDictsAllKeyW = [];//list of _current (typeof dict)
  }
  // Static variables
  // Call for raw input path, not changing dynamically
  get  rawJD(){ return this.rawJobDesc;}
  // Call for trivial vocab list path, not changing dynamically
  get dictTR(){ return this.dictTrivial;}
  // Dynamically changing
  // The original buffer here.
  set savedRaw(s){  this._buffer = s; this._subbuf = s;}
  get subbuffer(){  return this._subbuf;}
  get subbuflines(){  return this._sublines;}
  get exclusions(){  return this._exeptions;}
  set subbuffer(m){  this._subbuf = m;}
  set subbuflines(l){  this._sublines = l;}
  set exclusions(d){  this._exeptions = d;}

  set initKWlist(w){  this.listAllKeyW = w;}
  set initKWDicts(d){  this.dictsAllKeyW = d;}
  get dictsKW(){  return this.dictsAllKeyW;}
  set dictsKW(d){  this.dictsAllKeyW.push(d);}//list of 'dict's (i.e., _current)®
  get sectK(){  return this._sectNum;}
  set sectK(k){  this._sectNum = k;}

  set focusKW(d){  this.focusDictsAllKeyW.push(d);}
  get focusKW(){  return this.focusDictsAllKeyW;}
  get initCurrent(){//_current is a dict of dict structure
    this._current = {};
    for (let item of this._r) this._current[item] = {};
    return this._current;
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


var fs = require('fs');
var keyphrases = require('./aggregated');
var typo = require('./sequencing');
var stat = require('./statistics');
const soundbites = new Keywords([0,1,2,3]);
const quantified = new Quantifiable();

var raw = process.argv[2]; if(!raw) raw = soundbites.rawJD;
fs.readFile(raw, function(err,buffer) {//Asynchronous
  if(err){ throw err; exit;}
  soundbites.exclusions = JSON.parse( fs.readFileSync(soundbites.dictTR) );
  soundbites.savedRaw = buffer.toString();
  let nontrivial = keyphrases.aggregateBuffer(soundbites);// console.log(nontrivial);
  let thresholds = stat.thresholdEachItem(soundbites.dictsKW,quantified);// console.log(nontrivial);
  nontrivial.forEach((item, n) => {
    soundbites.focusKW = keyphrases.filterPhrases( nontrivial[n],thresholds[n] );
  }); console.log(soundbites.focusKW);
  soundbites.focusKW.forEach((item, i) => {

  });

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
