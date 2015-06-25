
function filterAttrType(obj, num, at){
  val = (at==1) ? obj['Attribute'] : obj['Type'];
  if (val === num){
  	    return true;
    } else {
  		return false;
	   }
}


function filterSetcode(obj, sc){
  val=obj['setcode'];
  hexA= val.toString(16);
  hexB= sc.toString(16);
  if (val===sc  || hexA.substr(hexA.length-4) === hexB ||  hexA.substr(hexA.length-2) === hexB || (val>>8).toString(16) === hexB){
	  return true;
  } else {
		return false;
	}
 }
 
 function filterLevel(obj, lv, op){
   val=obj['level'].toString(16);
   lv=parseInt(lv.toString(16));
   if (op==0){
	if (parseInt(val.substr(val.length-2)) <= lv){
      return true;
    } else {
		return false;
	  }
	}
	else if (op==1){
	if (parseInt(val.substr(val.length-2)) === lv){
      return true;
    } else {
		return false;
	  }
	}
	else{
	if (parseInt(val.substr(val.length-2)) >= lv){
      return true;
    } else {
		return false;
	  }
	}
}


 function filterScale(obj, sc, op){
   val=obj['level'];
   sc=parseInt(sc.toString(16));
   if(op==0){
     if (parseInt((val>>24).toString(16)) <= sc){
        return true;
      } else {
	   	  return false;
	    }
	}
	else if(op==1){
     if (parseInt((val>>24).toString(16)) === sc){
        return true;
      } else {
	   	  return false;
	    }
	}
	else {
     if (parseInt((val>>24).toString(16)) >= sc){
        return true;
      } else {
	   	  return false;
	    }
	}
}




 function filterType(obj, ty){
   val=obj['type'];
   if (val&ty >0){
      return true;
    } else {
  		return false;
	  }
}

function filterAtkDef(obj, num, ad, op){
  val = (ad==1) ? obj['atk'] : obj['def'];
  if(op==0){
    if(val>=num){
  	    return true;
    } else {
  		return false;
	   }
   }
   else if(op==0){
    if(val===num){
  	    return true;
    } else {
  		return false;
	   }
   }
   else{
    if(val>=num){
  	    return true;
    } else {
  		return false;
	   }
   }
}

function filterNameDesc(obj, txt, nd){
  val = (nd==1) ? obj['name'] : obj['desc'];
  if (val.includes(txt)){
  	    return true;
    } else {
  		return false;
	   }
}

// Attempt to use FilterNameDesc with filter
function filterName (txt) {
    output = cards.filter(function (item) {
        filterNameDesc(item, txt, 1)
    });
    return output;
}
