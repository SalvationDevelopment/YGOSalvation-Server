project "ocgcore"
    kind "SharedLib"

    files { "**.cc", "**.cpp", "**.c", "**.h", "../lua/**.cc", "../lua/**.cpp", "../lua/**.c", "../lua/**.h" }
    excludes { "../lua/lua.c", "../lua/luac.c" }
    includedirs { "../lua" }
    buildoptions { "-std=c++14" }
    buildoptions { "-x c++" }