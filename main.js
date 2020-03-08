function cleanBuffer(d,strg){
  var m = strg;
  let re = /\ba\b|\ban\b|\bthe\b/gi;
    m = cleanExclude(re,m);
  re = /\b,|'s|s'|’s|s’|\bi\.?e\.?\b|\be\.?g\.?\b|\betc\.?\b|\ba\.?k\.?a\.?\b/gi;
    m = cleanExclude(re,m);
  re = /\.|\(|\)|\-\s|\s\-|\/\s|\s\//gi;
    m = cleanExclude(re,m);
  re = new RegExp( constructRegExp(d.BeingVerbs) ,'gi');
    m = cleanExclude(re,m);
  re = new RegExp( constructRegExp(d.AuxiliaryVerbs) ,'gi');
    m = cleanExclude(re,m);
  re = new RegExp( constructRegExp(d.Pronouns) ,'gi');
    m = cleanExclude(re,m);
    // US as in United States redacted
  re = new RegExp( constructRegExp(d.Conjunctions) ,'gi');
    m = cleanExclude(re,m);

  re = new RegExp( constructRegExp(d.Prepositions) ,'gi');
    m = cleanExclude(re,m);
  re = new RegExp( constructRegExp(d.WsHs) ,'gi');
    m = cleanExclude(re,m);
  re = new RegExp( constructRegExp(d.IndefiniteFrequency) ,'gi');
    m = cleanExclude(re,m);

  //re = new RegExp( constructRegExp(d.Prepositions) ,'gi');
    //m = cleanExclude(re,m);
  //re = new RegExp( constructRegExp(d.WsHs) ,'gi');
    //m = cleanExclude(re,m);
  //re = new RegExp( constructRegExp(d.IndefiniteFrequency) ,'gi');
    //m = cleanExclude(re,m);
console.log(m);
}
function constructRegExp(w){
  var rW = ''; var sep = '';
  w.forEach((item, i) => {
    //rW += sep+'\\b'+item+'\\b';
    rW += sep+'\\s'+item+'\\s';
    sep = '|';
  });
  //console.log(rW);
  return rW;
}
function cleanExclude(re,s){
  return s.replace(re,' ');
}

var fs = require('fs');
var jsonContent = fs.readFileSync('./trivial.json');
var dictTrivial = JSON.parse(jsonContent);
var raw = process.argv[2]; if(!raw){ raw = '../j01.raw';}


fs.readFile(raw , function(err,buffer) {
  if(err){ throw err;}
  cleanBuffer(dictTrivial,buffer.toString());
  //console.log(buffer.toString());
});

// To exclude:
//   articles: //   being verbs: //   auxiliary verbs: //   pronouns:
//   conjunction: //   prepositions:
//   WsHs: //   frequency: always
//   possessive apostrophe: "'s" and "s'"
//   abbreviation: e.g., i.e., a.k.a., etc.
//   end of sentence period:
//   enumerative comma: one, two, three
//   parentheses, if > 1 word: (Business Degree preferred)
// To include:
//   range dash: 3-5
//   words-in-one dash: ad-hoc
//   parentheses, if = 1 word: (BI)
//   slash: ?
// Algorithm Questions:
//    How to capture "Business Intelligence
//    Levenshtein to gather words similar (L=1)
