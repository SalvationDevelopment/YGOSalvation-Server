FROM debian:buster as ocgcore
RUN apt update && \
        apt -y install wget git build-essential libsqlite3-dev libevent-dev && \
        rm -rf /var/lib/apt/lists/*
WORKDIR /
RUN git clone --branch=server --recursive --depth=1 https://github.com/purerosefallen/ygopro && \
        cd ygopro && \
        git submodule foreach git checkout master && \
        wget -O - https://www.lua.org/ftp/lua-5.3.5.tar.gz | tar zfx - && \
        mv lua-5.3.5/src lua && \
        cp premake/lua/premake4.lua lua/ && \
        sed -i 's/StaticLib/SharedLib/g ; /configuration "macosx"/d' ./ocgcore/premake4.lua && \
        sed -i 's/lua5.3-c++/lua/g' ./gframe/premake4.lua && \ 
        echo 'include("lua")' >> premake5.lua && \
        wget -O - https://github.com/premake/premake-core/releases/download/v5.0.0-alpha14/premake-5.0.0-alpha14-linux.tar.gz | tar zfx - && \
        ./premake5 gmake && \
        cd build && \
        make config=release -j$(nproc)

FROM node:10-buster-slim
RUN apt update && apt -y install python3 build-essential git && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /usr/src/app
COPY ./package*.json /usr/src/app/
WORKDIR /usr/src/app
RUN npm ci && \
        mkdir -p ./src/core/bin/linux/x64
COPY . /usr/src/app
COPY --from=ocgcore /ygopro/script /usr/src/app/ygopro-scripts
COPY --from=ocgcore /ygopro/bin/release/libocgcore.so ./src/core/bin/linux/x64/ocgcore.so

EXPOSE 80 443

#ENV ADMIN_SERVER_LOCAL false
#ENV DATABASE_SERVER_LOCAL false

CMD ["bash", "-c", "npm run banlist && npm run start"]`