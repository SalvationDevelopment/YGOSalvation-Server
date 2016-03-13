var fs = require('fs');
var files;
var content= "";
var path="C:\\Users\\Owner\\Documents\\GitHub\\YGOPro-Support-System\\YGOPro-Support-System\\client\\ygopro\\script";

	fs.readdir(path, function stuff(err, list){
		files=list;
		 for(i=0;i<files.length;i++){
		 if(trans(files[i]).length>0){
			content+= trans(files[i]) +"\n" ;
			}
		} 
		fs.writeFile("scripts.rtf", content, function (err) {
			if (err) throw err;
			console.log('It\'s saved!');
			});
		})
	
function trans(str){
	if (str.substr(str.length-3) === "lua" &&  !isNaN(str.substr(1,1)) ){
		return str.substr(1, str.length-5);
		}
	else {return "";}
}