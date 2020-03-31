module.exports = {
  countItems: function(s){
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


}
