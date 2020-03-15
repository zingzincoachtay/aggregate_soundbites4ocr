class Keywords {
  constructor(r){
    this.rawJobDesc = '../j01.raw';
    this.dictTrivial = './trivial.json';
    this.dictKeyWord = {};
    r.forEach((item, i) => {
      this.dictKW[i] = {};
    });
    // Probably unneeded, but clarifying
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
  set listKW(d){
    this.listKeyWord = d;}
  get listKW(){  return this.listKeyWord;}
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
      let digest = aggregateCombination(line);
      lines[i] = digest.subline;
      let list = digest.phrases;
      current[k[1]] = mapList(current[k[1]],list);
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
  // Need case sensitivity here!!
  let wo = []; let re = [];
  //get dashed number range
  //get percentage
  re.push( /(\d+\-\d+)\b/g, /(\d+\s?\%)\b/g );
  //get combination dashed words
  //capture both uppercase abbrev and combination proper names
  //  except won't likely separate consecutive uppercase vocabs
  re.push( /(\w+(\-\w+)+)\b/g );
  re.push( /([A-Z]+\w*( +[A-Z]+\w*)*)\b/g );
  //get rest of integers
  re.push( /(\d+)\b/g );
  re.forEach((item, i) => {
    let csList = l.match(item);
    if( csList !== null ){
      wo = wo.concat(csList);
      l = cleanExclude(item,l);
    }
  });
  //get rest of whole words, turn all lowercase
  let cisre = /(\w+)\b/g;
  let cisList = l.match(cisre);
  if(cisList !== null){
    cisList.forEach((item, i) => {
      if(item.match(/[A-Z]/)){console.log(item);}
      cisList[i] = item.toLowerCase();
    });
    wo = wo.concat(cisList);
    l = cleanExclude(cisre,l);
  }
  return {
    subline:l, //STR
    phrases:wo //LIST
  };
}
const countItems = function(s){
  let d = s.dictKW; let hash = {};
  let keys = Object.keys(d);
  // First, go through all the non-trivial vocabs for conjugation patterns
  //   e.g., plural (s/es), past (d/ed), comparative (r/er/or), OR capitalization
  keys.forEach((n, i) => {
    //gather all words regardless of grouping
    let vDict = d[n];
    let conj = ['s','es','d','ed','r','er','or']; let conjYN = [];
    vDict.forEach((value, i) => {
      conj.forEach((item, i) => {
        conjYN.push( ((d[value+item]!==null) ? 1 : 0) );
      });
      conjYN.forEach((item, i) => {
        if(item==1){
          let Kj = value+conj[i]; console.log(d[n]);
          d[n] = d[n].concat( d[Kj] );
          d[Kj] = [];
        }
      });
    });
  });
  // Second, go through all the non-trivial vocabs for similar/typo
  //   except then,than; form,from; etc. will indicate not worth the time
  //   i.e., L(w1,w2)=1
  keys.forEach((item, i) => {
    var value = d[item];
    var uniqueWords = Object.keys(value);
    uniqueWords.forEach((w1, i) => {
      uniqueWords.forEach((w2, i) => {
        let q = typo.levenshteinDistance(w1,w2);
      });
    });
    console.log(uniqueWords.sort());
  });
  // Counts of similar/typo words combine, simplify the Dict


  // Rank by counts
  //keys.forEach((item, i) => {
    //var value = d[item];
    //var uniqueWords = Object.keys(value);
    //uniqueWords.forEach((w, i) => {
    //});
  //}
  return hash;
}

var soundbites = new Keywords([0,1,2,3]);
var typo = require('./sequencing');
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
