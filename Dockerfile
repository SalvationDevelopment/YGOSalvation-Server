FROM --platform=linux/amd64 node:16-bullseye as ocgcore

RUN apt update; apt -y install git wget tar git unzip curl libgl1-mesa-dev libglu-dev libxxf86vm-dev

RUN git clone --recursive --depth=1 https://github.com/purerosefallen/ygopro.git

WORKDIR ygopro

RUN wget -O - https://www.lua.org/ftp/lua-5.3.6.tar.gz | tar zfx -
RUN mv lua-5.3.6 lua

RUN wget -O - https://www.sqlite.org/2022/sqlite-autoconf-3390200.tar.gz | tar zfx -
RUN mv sqlite-autoconf-3390200 sqlite3
RUN cp -r sqlite3/sqlite3.h gframe/spmemvfs/

RUN wget -O - https://download.savannah.gnu.org/releases/freetype/freetype-2.11.1.tar.gz | tar zfx -
RUN mv freetype-2.11.1 freetype

RUN ls
RUN cp -r freetype/include/ft2build.h gframe/

RUN curl --retry 5 --location --remote-header-name --remote-name http://downloads.sourceforge.net/irrlicht/irrlicht-1.8.5.zip
RUN unzip -q irrlicht-1.8.5.zip
RUN mv irrlicht-1.8.5 irrlicht

RUN curl --retry 5 --connect-timeout 30 --location --remote-header-name --remote-name https://www.ambiera.at/downloads/irrKlang-64bit-1.6.0.zip
RUN unzip -q irrKlang-64bit-1.6.0.zip
RUN mv irrKlang-64bit-1.6.0 irrklang

RUN curl --retry 5 --connect-timeout 30 --location https://github.com/premake/premake-core/releases/download/v5.0.0-beta1/premake-5.0.0-beta1-linux.tar.gz | tar zfx -

RUN sed -i 's/StaticLib/SharedLib/g' ./premake/lua/premake5.lua

RUN cp -rf premake/* .;

RUN mkdir lib

RUN cp -rf irrklang/bin/linux-gcc-64/libIrrKlang.so ./lib/

ENV EVENT_INCLUDE_DIR=/ygopro/libevent-stable/include
ENV EVENT_LIB_DIR=/ygopro/libevent-stable/lib

RUN sed -i 's/StaticLib/SharedLib/g' ./ocgcore/premake5.lua

RUN sed -i 's/STATIC/SHARED/g' ./ocgcore/CMakeLists.txt

RUN sed -i 's/include "gframe"//g' ./premake5.lua

RUN ./premake5 gmake --no-build-freetype --no-build-sqlite --no-build-irrlicht --no-irrklang-pro

WORKDIR build

RUN make config=release

FROM node:10-buster-slim
RUN apt update && apt -y install python3 build-essential git && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /usr/src/app
COPY ./package*.json /usr/src/app/
WORKDIR /usr/src/app
RUN npm ci && \
        mkdir -p ./src/core/bin/linux/x64
COPY . /usr/src/app
COPY --from=ocgcore /ygopro/script /usr/src/ygopro-scripts
COPY --from=ocgcore /ygopro/bin/release/libocgcore.so ./src/core/bin/linux/x64/ocgcore.so

EXPOSE 80 443

#ENV ADMIN_SERVER_LOCAL false
#ENV DATABASE_SERVER_LOCAL false

RUN npm install nodemon

CMD ["bash", "-c", "npm run banlist && npm run dev"]