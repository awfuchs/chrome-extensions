sentMinLen=4;
sentTargetLen=8;
sentMaxLen=12;
paraMinLen=2;
paraMaxLen=6;
paraMinCnt=1;
paraMaxCnt=6;
options=restoreOptions();


function sayContent() {
  chrome.storage.sync.get({
    minimumParagraphs: '2',
    maximumParagraphs: '4'
    }, function(items) {
    paraMinCnt=items.minimumParagraphs;
    paraMaxCnt=items.maximumParagraphs;
    buildAndGenerateOutput();
  });
}

function buildAndGenerateOutput(){
  paragraphs=rndIntBetween(paraMinCnt, paraMaxCnt);
  risultato=
    (outputWack
      (makeDicts
        (asSentences
          (cleanText
            (document.body.innerText
    ))), paragraphs ));
  alert(risultato);
}

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
    words=t[s].split(/[ ,]+/);
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

function outputWack(dicts, numParas) {
  var wcount=0;
  var theOutput="";
  var nextword, p, w1, w2, i, j;
  var numSentences=rndIntBetween(paraMinLen, paraMaxLen);

  function emit(s){
    theOutput += s;
  }

  for( p=0; p<numParas; p++ ){
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
	if(w1_w2 in dicts.wordTriples) {
	  nextword = rndSelectFrom(dicts.wordTriples[w1_w2]);
	} else {
	  // Trusting that if there's no triple then this must exist...
	  nextword = rndSelectFrom(dicts.wordPairs[w2]);
	}

	// --- Should we end the sentence at this word? ---
	// TODO: This logic can be improved. As sentence length exceeds ideal, should
	// look ahead and pick Triples that have lastWords in them, or then Pairs that do.

	let stopnow = false;
	if (nextword in dicts.lastWords) {stopnow=true;} // Stop if it's sound to do so
	if (wcount<sentMinLen) {stopnow=false;}          // Except never before reaching min size
	if (!(nextword in dicts.wordTriples)
	   && !(nextword in dicts.wordPairs)){stopnow=true;} // But DO stop if there is no next key
	if (wcount>sentMaxLen) {
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

function cleanText(t) {
  return t.replace("Dr.", "Dr")
          .replace("e.g.", "for example")
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
  var o = {
    minParas: "1",
    maxParas: "6"
  }
  function seto(i,j) {
    o.minParas=i;
    o.maxParas=j;
  }

  chrome.storage.sync.get({
    minimumParagraphs: '2',
    maximumParagraphs: '4'
    }, function(items) {
    console.log(items);
    seto(items.minimumParagraphs, items.maximumParagraphs);
    //paraMinCnt=items.minimumParagraphs;
    //paraMaxCnt=items.maximumParagraphs;
  });
  return o;
}

sayContent();

