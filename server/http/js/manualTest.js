$(function () {
    var manual = new Primus("ws://ygopro.us:55542"),
        blockCalls = false;
        logData = [];
    manual.on('open', function () {
        $('.statusField').html('<span class="statusConnected">Manual mode is connected!</span>');
        logData.push('Connected');
        manual.on('data', function (data) {
            if (data.event === "heartBeat") {
                return;
            }
            var dataKeys = Object.keys(data.data),
                dataString = data.data;
            if (dataKeys.length > 0 && typeof data.data === "object") {
                dataString = "";
                dataKeys.forEach(function (key) {
                    dataString += key + " = " + data.data[key];
                });
            }
            blockCalls = false;
            console.log(data);
            logData.push(data);
            $('#output').html('Event: ' + data.event + '; Response Code: ' + data.responseCode + '; Data: ' + (dataString || "{}"));
        });
        setInterval(function () {
            manual.write({
                action: 'heartBeat',
                uid: 'heartBeat'
            });
        }, 36000);
    });
    manual.on('end', function () {
        $('.statusField').html('<span class="statusFailed">Manual mode errored out!</span>');
        logData.push('Disconnect occurred.');
    });
    $('.queryChanger').on('click', function (e) {
        if (blockCalls) {
            alert('Currently executing another call, please wait!');
        }
        var id = $(this).attr('id'),
            data = {
                action: id,
                uid: $('#uid').val(),
                username: $('#username').val()
            },
            rels = $('[data-rel="' + id + '"]');
        rels.each(function () {
            if ($(this).attr('data-prop').indexOf(".") != -1) {
                var o = $(this).attr('data-prop').split(".");
                data[o[0]] = {};
                data[o[0]][o[1]] = $(this).val();
            } else {
                data[$(this).attr('data-prop')] = $(this).val();
            }
        });
        if (data.hasOwnProperty('hostOptions')) {
            data.hostOptions.deckList = parseYDK("#created by ...\r\n#main\r\n13140300\r\n13140300\r\n62514770\r\n88264978\r\n12338068\r\n12338068\r\n12338068\r\n30126992\r\n65192027\r\n30794966\r\n3300267\r\n3300267\r\n3300267\r\n77901552\r\n77901552\r\n77901552\r\n31516413\r\n4022819\r\n61901281\r\n61901281\r\n61901281\r\n78033100\r\n51858306\r\n51858306\r\n65737274\r\n65737274\r\n65737274\r\n25377819\r\n25377819\r\n25377819\r\n28596933\r\n28596933\r\n45950291\r\n45950291\r\n5318639\r\n5318639\r\n5318639\r\n27243130\r\n27243130\r\n27243130\r\n#extra\r\n51543904\r\n58820923\r\n58820923\r\n58820923\r\n39030163\r\n39030163\r\n88177324\r\n88177324\r\n88177324\r\n64332231\r\n1639384\r\n38495396\r\n27337596\r\n84013237\r\n90726340\r\n!side\r\n72989439\r\n4022819\r\n4022819\r\n67300516\r\n78033100\r\n51858306\r\n97268402\r\n28596933\r\n45725480\r\n45725480\r\n53129443\r\n29401950\r\n50078509\r\n50078509\r\n84749824\r\n");
        }
        manual.write(data);
        console.log(data);
        blockCalls = true;
        logData.push('Called event: ' + data.action);
    });
});