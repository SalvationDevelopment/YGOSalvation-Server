function acceptUpdater(error, docs) {
    if (docs[0].waifu.length) {
        return msg.reply(`They are already married to <@${docs[0].waifu}> :cop:`)
    };
    await msg.delete();
    if (docs[0].proposals.includes(msg.author.id)) {
        docs[0].proposals.splice(docs[0].proposals.indexOf(msg.author.id), 1)
    };
    await db.update({ id: msg.target }, docs[0]).then(async () => {
        await db.update({ id: msg.author.id }, { $set: { waifu: msg.target } });
        await db.update({ id: msg.target }, { $set: { waifu: msg.author.id } }).then(async () => {
            docs[0].proposals.splice(docs[0].proposals.indexOf(msg.target), 1);
            msg.channel.send(`**:bride_with_veil: :cake: :ring: <@${msg.author.id}> and <@${msg.target}> just got married! :ring: :cake: :bride_with_veil:**`);
        });
    });
}

function acceptOnFind(error, docs) {
    if (!docs[0].proposals.includes(msg.target)) {
        return msg.reply("They have not proposed to you!");
    }
    if (docs[0].waifu.length) {
        return msg.reply(`You are already married to <@${docs[0].waifu}> :angry:`);
    }
    db.find({ id: msg.target }, acceptUpdater);
}

function accept(msg) {
    if (msg.target === msg.author.id) {
        return msg.reply("Tag another user!");
    }
    db.find({ id: msg.author.id }, acceptOnFind);
}