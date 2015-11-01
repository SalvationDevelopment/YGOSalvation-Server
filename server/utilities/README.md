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

CheckMissing
usage:

    flag.String("db", "cards.cdb", "ygopro database")
    
# Translate DB

Tool to translate Ygopro database

Parameters:

	-h      view usage
	-db     database to translate
	-lang   output language
	-using  wikia database (JSON file)

Known languages:

	en English
	fr French (Français)
	de German (Deutsch)
	el Greek (Ελληνικά)
	it Italian (Italiano)
	pt Portuguese (Português)
	es Spanish (Español)
	ja Japanese (日本語)
	zh Chinese (中文)
	ko Korean (한국어)

# Junk Deleter

Utility to delete unused images and scripts from Ygopro.

Invoke with `-h` for help