module.exports = {
  /**
     https://raw.githubusercontent.com/trekhleb/javascript-algorithms/master/src/algorithms/string/levenshtein-distance/levenshteinDistance.js
   * @param {string} a
   * @param {string} b
   * @return {number}
   */
  levenshteinDistance: function(a,b){
    // Create empty edit distance matrix for all possible modifications of
    // substrings of a to substrings of b.
    const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    // Fill the first row of the matrix.
    // If this is first row then we're transforming empty string to a.
    // In this case the number of transformations equals to size of a substring.
    for (let i = 0; i <= a.length; i += 1) {
      distanceMatrix[0][i] = i;
    }

    // Fill the first column of the matrix.
    // If this is first column then we're transforming empty string to b.
    // In this case the number of transformations equals to size of b substring.
    for (let j = 0; j <= b.length; j += 1) {
      distanceMatrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        distanceMatrix[j][i] = Math.min(
          distanceMatrix[j][i - 1] + 1, // deletion
          distanceMatrix[j - 1][i] + 1, // insertion
          distanceMatrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    return distanceMatrix[b.length][a.length];
  },
  /**
   * Pseudocode here: https://en.wikipedia.org/wiki/Longest_common_substring_problem#Pseudocode

  */
  commonSubstring: function (a,b){
    let L = Array(b.length + 1).fill(0).map(() => Array(a.length + 1).fill(0));
    let S = b.split(''); let T = a.split('');
    let z = 0; let ret = [];

    for (const i of Array(b.length+1).keys()) {
      for (const j of Array(a.length+1).keys()) {
        if( S[i] != T[j] ){ continue;}
        // fix this line, need this line L[i][j] = ( i == 1 || j == 1 ) ? 1 : L[i − 1][j − 1] + 1;
        // array.slice(n,m) selects from index n to index m, but exclude m
        let slicing = [i - z + 1 , i + 1];
        if( L[i][j] > z ){
            z = L[i][j];
            ret = []; ret.push( S.slice(slicing[0],slicing[1]) );
        } else if( L[i][j] == z ) {
            ret.push( S.slice(slicing[0],slicing[1]) );
        }
      }
    }
    return ret;
  }
}

// Go through all the non-trivial vocabs for similar/typo,
//   i.e., L(w1,w2)=1
//   exceptions, such as:
//   then,than; form,from; etc. will indicate not worth the time
const similarPhrases = (w,l) => {
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
}
