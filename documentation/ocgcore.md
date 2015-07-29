1.) download Fh / ygopro
2.) download premake4.exe, put it in c:\windows
3.) download soarquin/ygopro or sub (like our own salv)
4.) copy dependency folders into fh /ygopro
5.) at command prompt do :
` premake4 /help `
` premake4 vs2013 `
6.) in explore open fh/ ygopro/build open vs project
7.) build lua
8.) build SQLite
9.) build ocgcore

proves system can compile.

10.) in properities for ocgcore set to be a dll.
11.) it wont build now.
12.) in settigns for properities have to "include libraries" that lua and SQLite built in the bin folder
13.) build ocgcore.dll should output fine.

----