class Keywords {
  constructor(r){
    this.rawJobDesc = '../j01.raw';
    this.dictTrivial = './trivial.json';
    this.dictKeyWord = {};
    r.forEach((item, i) => {
      this.dictKW[i] = {};
    });
    // Unneeded, but clarifying
    this._buffer = ''; this._subbuffer = '';
  }
  // Static variables
  // Call for raw input path, not changing dynamically
  get rawJD(){ return this.rawJobDesc;}
  // Call for trivial vocab list path, not changing dynamically
  get dictTR(){  return this.dictTrivial;}
  // Dynamically changing
  // The original buffer here.
  set buffer(s){
    this._buffer = s; this._subbuffer = s;}
  get buffer(){  return this._buffer;}
  // The subsequently processed buffer here.
  set subbuffer(m){
    this._subbuffer = m;}
  get subbuffer(){  return this._subbuffer;}
  set dictKW(d){
    this.dictKeyWord = d;}
  get dictKW(){  return this.dictKeyWord;}

}
const constructRegExp = function(w){
  var rW = '';
  var sep = ' '; var union = '';
  w.forEach((item, i) => {
    rW += union+sep+item+'\\b|\\b'+item+sep;
    union = '|';
  });
  //console.log(rW);
  return defineRegExp(rW);
}
const defineRegExp = (r) => new RegExp(r,'gi');
const cleanBuffer = function(s){
  var m = s.subbuffer; let re = [];
  var d = JSON.parse( fs.readFileSync(s.dictTR) );
  re.push( / i\.?e\.?\b|\bi\.?e\.? | e\.?g\.?\b|\be\.?g\.? | etc\.?\b|\betc\.? | a\.?k\.?a\.?\b|\ba\.?k\.?a\.? /gi );
  re.push( /s['’] /gi , /['’](s|re|ll|ve) |n['’]t /gi );
  //re.push( /,|\.|;|[\(\{\[\)\}\]]|\– | \–|\/ | \/|\* /gi );
  // whole word exclusions
  re.push( constructRegExp(d.Articles) );
  re.push( constructRegExp(d.BasicResponse) );
  re.push( constructRegExp(d.BeingVerbs) );
  re.push( constructRegExp(d.AuxiliaryVerbs) );
  re.push( constructRegExp(d.Pronouns) );
    // US as in United States redacted
  re.push( constructRegExp(d.Conjunctions) );
  re.push( constructRegExp(d.Prepositions) );
  re.push( constructRegExp(d.WsHs) );
  re.push( constructRegExp(d.IndefiniteFrequency) );

  re.forEach((item, i) => {
    m = cleanExclude(item,m);
  });
  //console.log(m);
  return m;
}
const cleanExclude = (re,t) => t.replace(re,' ');
const aggregateBuffer = function(s){
  var m = s.subbuffer; let current = {};
  let lines = m.split(/\r?\n/); let k = ['!0',0];
  lines.forEach((line, i) => {
    let g = line.match(/^!(\d)/);
    if( g !== null ){
      k = g;
      current = createDictPair(current,k[1],{});
    } else {
      //get combination proper names
      //get combination dashed words
      //get rest of whole words
      let digest = aggregateCombination(line);
      lines[i] = digest.subline;
      let list = digest.phrases;
      current[k[1]] = mapList(current[k[1]],list);
      //if( current[k[1]] === undefined){
        //current[k[1]] = digest.phrases;
      //} else {
        //current[k[1]] = current[k[1]].concat(digest.phrases);
      //}
    }
  });
  //console.log( lines.join("\n") );
  return current;
}
//const createDictPair = (d,i,r) => (d[i] === undefined) ? append(d,i,r) : d;
const createDictPair = function(d,i,init){
  if(d[i] === undefined){
    d[i] = init;
  }
  return d;
};
const mapList = function(d,l){
  l.forEach((item, i) => {
    d = createDictPair(d,item,[1]);
    // Assured that d[item] exists
    d[item] = d[item].concat([1]);
  });
  return d;
}
const aggregateCombination = function(l){
  // Need character sensitivity here!!
  let wo = []; let re = [];
  // whole words
  // dashed words, second
  re.push( /([A-z]+(\-[A-z]+)+)\b/g );  //console.log( m.match(re[0]) );
  re.push( /(\d+\-\d+)\b/g );
  re.push( /(\d+\s*\%)/g );
  // proper nouns, first
  re.push( /([A-Z]+\w*( +[A-Z]+\w*)*)\b/g );  //console.log( m.match(re[1]) );
  re.forEach((item, i) => {
    let lList = l.match(item);
    if( lList !== null ){
      wo = wo.concat(lList);
      l = cleanExclude(item,l);
    }
  });
  let reV = /(\w+)\b/g;
  let v = l.match(reV);
  if( v !== null ){
    wo = wo.concat(v);
    l = cleanExclude(reV,l);
  }
  return {
    subline:l, //STR
    phrases:wo //LIST
  };
}
const countItems = function(s){
  let d = s.dictKW; let hash = {};
  // First, go through all the non-trivial vocabs for similar/typo words
  //   i.e., L(w1,w2)=1
  var keys = Object.keys(d);
  keys.forEach((item, i) => {
    var value = d[item];
    var uniqueWords = Object.keys(value);
    uniqueWords.forEach((w1, i) => {
      uniqueWords.forEach((w2, i) => {
        //let q = typo.levenshteinDistance(w1,w2);
      });
    });
    //console.log(uniqueWords.sort());
  });
  // Counts of similar/typo words combine, simplify the Dict


  // Rank by counts
  keys.forEach((item, i) => {
    var value = d[item];
    var uniqueWords = Object.keys(value);
    uniqueWords.forEach((w, i) => {
    });
  }
  return hash;
}

var soundbites = new Keywords([0,1,2,3]);
var typo = require('./levenshtein');
var fs = require('fs');
var raw = process.argv[2]; if(!raw){ raw = soundbites.rawJD;}

fs.readFile(raw , function(err,buffer) {
  if(err){ throw err;}
  //console.log(buffer.toString());
  soundbites.buffer = buffer.toString();
  soundbites.subbuffer = cleanBuffer(soundbites);//uses subbuffer
  //console.log(soundbites.subbuffer);
  soundbites.dictKW = aggregateBuffer(soundbites);//uses dictKW
  console.log(soundbites.dictKW);
  //countItems(soundbites);
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
