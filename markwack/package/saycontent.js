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
  paragraphs=rndIntBetween(mwOptions.paraMinCnt, mwOptions.paraMaxCnt);
  let risultato=
    (outputWack
      (makeDicts
        (asSentences
          (cleanText
            (fetchSourceText()
            // was (document.body.innerText
    ))), paragraphs ));
  console.log(risultato);
 return risultato;
}

/*
 * The makeDicts function: build a dictionary collection
 *
 * t -- An array of strings, one per sentence in the input
 *
 * Returns: a dictionary collection
 */

function makeDicts(t) {
  var w;
  var n;
  var blob = {
    firstWords: [],
    lastWords: [],
    wordPairs: {},
    wordTriples: {}
  }
  for( s in t ) {
    if( t[s].length < mwOptions.minParseLen ) break;
    //***was stripping commas*** words=t[s].split(/[ ,]+/);
    words=t[s].split(/[ ]+/);
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
 * The outputWack function: create n paragraphs of wacky ouput
 *
 * dicts -- a dictionary collection object
 * numParas -- how many paragraphs to generate
 *
 * Returns: a string containing the generated text
 */
 
function outputWack(dicts, numParas) {
  var wcount=0;
  var theOutput="";
  var nextword, p, w1, w2, i, j;
  var numSentences;

  function emit(s){
    theOutput += s;
  }

  for( p=0; p<numParas; p++ ){
    numSentences=rndIntBetween(mwOptions.minParaLen, mwOptions.maxParaLen);
    for (i=0; i<numSentences; i++) {
      wcount=1;
      w1=rndSelectFrom(dicts.firstWords);
      w2=rndSelectFrom(dicts.wordPairs[w1]);
      emit( w1 );
      emit( " " );
      emit( w2 );
      emit( " " );
      while( true ) {
	wcount++;
	w1_w2=tuple(w1,w2);
	if(w1_w2 in dicts.wordTriples && mwOptions.tupleType=="triples") {
	  nextword = rndSelectFrom(dicts.wordTriples[w1_w2]);
	} else if(w2 in dicts.wordPairs) {
	  // No triple? Then here's hoping that it does exist...
	  nextword = rndSelectFrom(dicts.wordPairs[w2]);
	} else if(w2 in dicts.wordPairs) {
	  // Oh well, just grab some last word.
	  nextword = rndSelectFrom(dicts.lastWords);
	}

	// --- Should we end the sentence at this word? ---
	// TODO: This logic can be improved. As sentence length exceeds ideal, should
	// look ahead and pick Triples that have lastWords in them, or then Pairs that do.

	let stopnow = false;
	if (nextword in dicts.lastWords) {stopnow=true;} // Stop if it's sound to do so
	if (wcount<mwOptions.minSentenceLen) {stopnow=false;}    // Except never before reaching min size
	if (!(nextword in dicts.wordTriples)
	   && !(nextword in dicts.wordPairs)){stopnow=true;} // But DO stop if there is no next key
	if (wcount>mwOptions.maxSentenceLen) {
	  nextword=rndSelectFrom(dicts.lastWords);       // Hard stop, force last word if > max size
	  stopnow=true;
	}

	if (stopnow) {
	  emit( nextword+". " );
	  break;
	} else {
	  emit( nextword+" " );
	  w1=w2;
	  w2=nextword;
	}
      }
    }
  emit("\n\n");
  }
  return theOutput;
}


/*
 * === All the utility functions ===
 */
 
function fetchSourceText() {
  var r = "";
  var elems=[];
  elems=document.querySelectorAll(mwOptions.elemType);
  for( e of elems) {
    r += e.innerText;
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


