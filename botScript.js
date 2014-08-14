var irc = require("irc");
var config = {
	channels: ["#lobby"],
	server: "salvationdevelopment.com",
	botName: "SalvationBot"
};
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});
bot.addListener('join', function(channel, joinedUser){
	bot.say(channel,"Hello " + joinedUser + ", nice to see you.");
});