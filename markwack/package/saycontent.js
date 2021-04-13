var minInputWords=3;
var sentMinLen=4;
var sentTargetLen=8;
var sentMaxLen=12;

// Options
var paraMinCnt=1;
var paraMaxCnt=6;
var mwOptions={};

restoreOptions();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if ( request.op == "output" )          { doOutput(request.data); }
    else if( request.op == "create" )      { doCreate(request.data); }
    else if( request.op == "areyoualive" ) { doImAlive(request.data); }
  }
);

function doOutput(content) {
  alert(content);
}

function doCreate(foo) {
  let content = buildAndGenerateOutput();
  chrome.runtime.sendMessage( {op: "content_done", data: content} );
}

function doImAlive(foo) {
  chrome.runtime.sendMessage( {op: "sink_ready", data: "" } );
}


function buildAndGenerateOutput(){
  let paragraphs=rndIntBetween(mwOptions.paraMinCnt, mwOptions.paraMaxCnt);
  let risultato=
    (outputWack
      (makeDicts
        (asSentences
          (cleanText
            (fetchSourceText()
            // was (document.body.innerText
    ))), paragraphs ));
 return risultato;
}

/*
 * makeDicts: builds a dictionary collection
 *
 * t -- An array of strings, one per sentence in the input
 *
 * Returns: a dictionary collection object
 */

function makeDicts(t) {
  var w, n, word3, words;
  var blob = {
    firstWords: [],
    lastWords: [],
    wordPairs: {},
    wordTriples: {}
  }
  for( var s0 of t ) {
    s=s0.trim(); //srsly
    if( s.length < mwOptions.minParseLen ) continue;
    words=s.split(/[ ]+/);
    if (words.length>2) {
      // --- Add first and last sentence words to respective lists ---
      blob.firstWords.push(words[0]);
      blob.lastWords.push(words[words.length-1]);
      // --- Populate dictionary of w1->w2 and w1->w2->w3 transitions ---
      for( wx=0; wx < words.length-1; wx++) {
	w=words[wx];
	n=words[wx+1];
        if( !(w in blob.wordPairs) ) {
          blob.wordPairs[w]=[];
        }
        blob.wordPairs[w].push(n);
        if(wx < words.length-2) {
          word3=words[wx+2];
          w1_w2=tuple(w,n); // e.g. "when|they"
	  if( !(w1_w2 in blob.wordTriples) ) {
	    blob.wordTriples[w1_w2]=[];
	  }
	  blob.wordTriples[w1_w2].push(word3);
        }
      }
    }
  }
  return blob;
}


/*
 * outputWack: create n paragraphs of wacky ouput
 *
 * dicts -- a dictionary collection object
 * numParas -- how many paragraphs to generate
 *
 * Returns: a string containing the generated text
 */
 
function outputWack(dicts, numParas) {
  const watchdoglimit=10000;
  var numSentences, watchdog;
  var output, theOutput="";

  for( para=0; para<numParas; para++ ) {
    watchdog=0;
    numSentences=rndIntBetween(mwOptions.minParaLen, mwOptions.maxParaLen);

    for (i=0; i<numSentences; i++) {
      output=oneRandomSentence(dicts);
      if( output == "" ) { i--; }         // if sentence aborted, fiddle the counter
      else { theOutput += output; }
      if(watchdog++>watchdoglimit) break; // but stop runaway condition
    }
    theOutput += "\n\n";
  }
  return theOutput;
}


/*
 * oneRandomSentence: make a single sentence
 *
 * dicts -- a dictionary collection object
 *
 * Returns: a string containing the generated sentence (on success)
 *          OR "" on failure (chain reached dead end or max length exceeded)
 */

function oneRandomSentence(dicts) {
  var nextword, w1, w2, stopnow;
  var wcount=0;
  var theSentence="";

  function emit(s){ theSentence += s; }
  function wordContinues(w) { emit(w+" "); }
  function wordEnds(w) { emit(w+". "); }

  wcount=1;
  w1=rndSelectFrom(dicts.firstWords);
  w2=rndSelectFrom(dicts.wordPairs[w1]);
  emit( w1+" "+w2+" " );
  for(;;) {
    wcount++;
    nextword=pickNextWord( w1, w2, dicts );
    if( nextword == "" ) { return ""; }              // !! no next word available, abort sentence

    // --- Should we end the sentence at this word? ---
    stopnow = false;
    if( dicts.lastWords.includes(nextword) ) {stopnow=true;}  // Stop if it's sound to do so
    if( wcount<mwOptions.minSentenceLen )    {stopnow=false;} // Except never before reaching min size
    if( wcount>mwOptions.maxSentenceLen )    { return ""; }   // !! past max length, abort sentence

    if (stopnow) { wordEnds(nextword); return theSentence; }  // <--- exit with result
    else         { wordContinues(nextword); }
    w1=w2;
    w2=nextword;
  }
}


/*
 * pickNextWord: generate a valid next word based on preceding word(s)
 *
 * dicts -- a dictionary collection object
 * w2 -- the last word that was output in the sentence
 * w1 -- the word that was output in the sentence before w2
 *
 * Returns: a randomly selected and valid next word
 *          OR "" on failure (no next word available)
 */

function pickNextWord(w1, w2, dicts) {
  let w1_w2=tuple(w1,w2);
  if(w1_w2 in dicts.wordTriples
     && mwOptions.tupleType=="triples") {
    nextword = rndSelectFrom(dicts.wordTriples[w1_w2]); // grab a triple if you can
  }
  else if(w2 in dicts.wordPairs) {
    nextword = rndSelectFrom(dicts.wordPairs[w2]);      // or grab a double if you can
  }
  else {
    nextword = "";                                      // "" means no next word available
  }
  return nextword;
}


/*
 * ===== All the utility functions =====
 */
 
function fetchSourceText() {
  var r = "";
  var elems=[];
  elems=document.querySelectorAll(mwOptions.elemType);
  for( e of elems) {
    r += " "+e.innerText;
  }
  return r;
}

function cleanText(t) {
  return t.replace("Dr.", "Dr")
          .replace("e.g.", "for example")
          .replace("e.g.", "in other words")
          .replace(/[^\u00C0-\u024F\u0300-\u04FFA-Za-z'’\d .?,!;/-]/g, " ")
}

function asSentences(t) {
  return t.replace(/([.?!])\s*(?=[A-Z])/g, "|").split("|");
}

function rndSelectFrom(a) {
  var l=a.length;
  var i=Math.floor(Math.random() * l);
  return a[i];
}

function rndIntUnder(r) {
  return Math.floor(Math.random() * r);
}

function rndIntBetween(lo,hi) {
  scal=(hi-lo);
  r = Math.floor(Math.random()*scal);
  return r+lo;
}

function tuple( w1, w2 ) {
  return w1+"|"+w2;
}




function restoreOptions() {
  function seto(items) {
    var o={
      minParaLen: items.minimumParagraphLength, 
      maxParaLen: items.maximumParagraphLength,
      paraMinCnt: items.minimumParagraphNumber,
      paraMaxCnt: items.maximumParagraphNumber,
      elemType:   items.htmlElementType,
      minParseLen: items.minimumParseLength,
      tupletype: items.tupleSize,
      outChannel: items.outputChannel,
      minSentenceLen: items.minimumSentenceLength,
      maxSentenceLen: items.maximumSentenceLength
    };
    mwOptions=o;
  }
  chrome.storage.sync.get(
    {
    minimumSentenceLength: '4',
    maximumSentenceLength: '20',
    minimumParagraphLength: '2',
    maximumParagraphLength: '4',
    minimumParagraphNumber: 1,
    maximumParagraphNumber: 6,
    htmlElementType: "p",
    minimumParseLength: 1,
    tupleSize: 'pairs',
    outputChannel: 'alert'
    },
    items => seto(items)
  )
}



