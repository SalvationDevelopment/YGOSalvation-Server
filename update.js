/* jslint node: true */
var fs = require('fs');
var walk = require('fs-walk');



function update(location, file) {
    var files = [];
    walk.walkSync(location, function (basedir, filename, stat, next) {
        files.push({
            "filename": filename,
            "modified": stat.mtime.getTime() || false
        });


    });
    var output = JSON.stringify(files, null, 4);
    fs.writeFile(file, output, function (error) {


        console.log(file);
    });
}


update(__dirname + "\\public\\ygopro\\", __dirname + '\\manifest\\ygopro.json');
update(__dirname + "\\public\\ygopro\\script\\", __dirname + '\\manifest\\ygopro.script.json');
update(__dirname + "\\public\\ygopro\\pics\\", __dirname + '\\manifest\\ygopro.pics.json');
update(__dirname + "\\public\\ygopro\\fonts\\", __dirname + '\\manifest\\ygopro.fonts.json');
update(__dirname + "\\public\\ygopro\\sound\\", __dirname + '\\manifest\\ygopro.sound.json');
update(__dirname + "\\public\\ygopro\\texture\\", __dirname + '\\manifest\\ygopro.texture.json');
update(__dirname + "\\public\\application\\js\\vendor", __dirname + '\\update\\public.application.js.ventter.json');
//update(__dirname + "\\private\\tcg\\scripts", __dirname + '\\public\\tcg.json');
//update(__dirname + "\\private\\ocg\\scripts", __dirname + '\\public\\ocg.json');
console.log('done');
       
        