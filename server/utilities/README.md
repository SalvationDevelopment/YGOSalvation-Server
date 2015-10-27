# YGO Wikia

Tool to translate Ygopro database

Parameters:

	-h      view usage
	-lang   output language (default: English)
	-config configuration file (default: config.json)

Modes:

	-update     update the wikia database
	-translate  translate Ygopro database

Known languages:

	en English
	de German (Deutsch)
	es Spanish (Español)
	fr French (Français)
	it Italian (Italiano)
	ja Japanese (日本語)
	ko Korean (한국어)
	pt Portuguese (Português)
	zh Chinese (中文)
    
#DumpSQL
usage:

	dumpsql -db cards.cdb input.txt output.sql
    
#CheckDB
usage:

	checkdb -db cards.cdb -file errors.txt folder
