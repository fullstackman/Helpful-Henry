//APPID: henrythehelpfulfromhackru
//APP_SECRET: a3a4852f54e740b7a298d983cdcba503
//https://helpfulhenrybot.azurewebsites.net/api/messages

//Make sure the following two modules are installed through npm!
var restify = require('restify');
var builder = require('botbuilder');

// Create bot and add dialogs
/*var bot = new builder.BotConnectorBot({ appId: 'YourAppId', appSecret: 'YourAppSecret' });
bot.add('/', function (session) {
    session.send('Hello World');
});*/

var campuses = ['college ave', 'cac', 'busch','bush','livingston','livi',
    'douglass','douglas','dougie','cook']
var start = -1;
var end = -1;
var theDate = new Date();
var today = theDate.getDay(); //randomize this for testing/showcase

var builder = require('botbuilder');

var helloBot = new builder.BotConnectorBot({
    appId: 'henrythehelpfulfromhackru',
    appSecret: 'a3a4852f54e740b7a298d983cdcba503' });

helloBot.add('/', new builder.CommandDialog()
    .matches(['fuc','bitch','dick','shit','wtf','stupid','pussy','damn','freaki','wank','piss','nigg'
        ], function (session){
        session.endDialog('I will not tolerate your vulgarity!');
    })
    .matches(['hi','hello','what','hola','good ','i ','howdy'],
        builder.DialogAction.beginDialog('/help'))
    .matches(['can','why','you','me'], function (session){
        session.send('I can only help you with traveling. Nothing more.');
        builder.DialogAction.beginDialog('/help');
    })
    .matches(['travel','hurry','bus','when','yes'], builder.DialogAction.beginDialog('/travel'))
    .matches(['no','quit','bye','leave'], function (session) {
        session.send('Good day...');
        session.endDialog();
    })
    .onDefault(function (session) {
        if(today == 0 || today==6)
            session.send('Must you bother me on the weekend as well?');
        else
            session.send('I\'m here if you need me...');
    }));

helloBot.add('/travel',  [
    function (session) {
        /*if(today == 0 || today == 6)
            session.endDialog(
                'Excuse me, but this is the weekend! Even a bot needs some rest days.')
        else*/
            builder.Prompts.text(session,
            'What campus will you be starting from? (only enter the name!)');
    },
    function (session, results) {
        var answer = results.response.toLowerCase();
        var location = campuses.indexOf(answer);
        var moveOn = false;
        switch(location){
            case -1:
            default:
                break;
            case 0:
            case 1:
                start = 0;
                moveOn=true;
                break;
            case 2:
            case 3:
                start = 1;
                moveOn=true;
                break;
            case 4:
            case 5:
                start = 4;
                moveOn=true;
                break;
            case 6:
            case 7:
            case 8:
                start = 2;
                moveOn=true;
                break;
            case 9:
                start = 5;
                moveOn=true;
                break;
        }
        if(moveOn)
            builder.Prompts.text(session, 'What campus are you going to?');
        else
            session.endDialog(
                'I don\'t recognize that campus. Did you really want to go anywhere?');
    },
    function (session, results) {
        var answer = results.response.toLowerCase();
        var location = campuses.indexOf(answer);
        var moveOn = false;
        switch(location){
            case -1:
            default:
                break;
            case 0:
            case 1:
                end = 0;
                moveOn=true;
                break;
            case 2:
            case 3:
                end = 1;
                moveOn=true;
                break;
            case 4:
            case 5:
                end = 4;
                moveOn=true;
                break;
            case 6:
            case 7:
            case 8:
                end = 2;
                moveOn=true;
                break;
            case 9:
                end = 5;
                moveOn=true;
                break;
        }
        if(moveOn){
            var distance = Math.abs(start - end);
            if(distance == 0){
                session.endDialog('I recommend you walk there whenever you\'re ready.')
                return;
            }
            //fun for later
            /*if( (start == 1 || start == 4) && (end == 2 || end == 5) )
                session.send("You have quite a journey ahead of you, eh?");*/
            builder.Prompts.number(session, 'And you need to be there how many hours from now?'
                +' (less than 1 hour means right now!)');
        }
        else
            session.endDialog(
                'I don\'t recognize that campus. Did you really want to go anywhere?');
    },
    function (session, results){
        var soon=Number(results.response);
        if(soon == NaN){
            session.endDialog(
                'Why don\'t we try this again when you\'re ready to stop playing games');
        }
        else
            soon = Math.round(soon);
        var now = new Date();
        var target = new Date(now);
        target.setTime((target.getTime() + (3600000 * soon) ) );
        //session.send("Look at my trimmings!"+target.toString().substring(0,21));
        //would still need to convert away from military time!
        if(target.getHours() > 20 || target.getHours() < 10){
            if(soon < 1){
                session.endDialog("There won't be too much traffic during those wee hours.  "
                    +"But you still don't have much time left. I recommend you get moving.");
                return;
            }
            else{
                target.setTime((target - 1800000));
                session.endDialog("There won't be too much traffic during those wee hours.  "
                    +"Leave no later than "+target+" and you should arrive on time.");
                return;
            }
        }

        var temp = new Date(now);
        temp.setHours(10);
        temp.setMinutes(0);
        var timeTable = [];
        timeTable.push(new Date(temp));
        //I have a wondrous proof of this...
        for(var i=1; i<19; ++i){
            if((i % 3) == (1 % 3) )
                temp.setTime(temp.getTime() + 1800000);
            else
                temp.setTime(temp.getTime() + 2100000);
            var moreTemp = new Date(temp.getTime());
            timeTable.push(moreTemp);
        }

        //now loop through the timetable and stop at the first entry that
        //is larger than our query. Go back one and if it is not the campus
        //we are on, then recommend you leave BY that time. If it is the
        //campus we are one, recommend you leave BEFORE that time.

        var b = 0;
        for(b; b<timeTable.length; ++b){
            if( target.getTime() < timeTable[b].getTime()){
                break;
            }
        }
        if(soon<1){
            session.send('Okay. I understand that you need to get there ASAP.');
            //is this person on a high-traffic campus?
            var isCrowded = ( (start % 3)==( (b-1) % 3) );

            if(isCrowded){
                session.send(
                    "If you have more than 30 minutes left, I would recommend you wrap up what"
                    +"you're doing and start catching a bus to avoid traffic.")
                session.endDialog("If you have even less time left, then hurry up and go!"
                    +"And remember to take off your backpack so more people can squeeze"
                    +"onto the bus.")
                return;
            }
            else{
                session.send(
                    "If you have more than 30 minutes left, you can definitely wait around a little"
                    +"longer. Maybe grab a snack at a particular diner...")
                session.endDialog("If you have even less time left, then get to the bus, posthaste!"
                    +"There should be plenty of wiggle room on the bus.")
                return;
            }
        }
        else{
            //they entered a time between 10 and 10:30
            if(b == 1){
                if((start % 3)==(0 % 3)){ //college ave
                var early = new Date(timeTable[0]);
                early.setTime((early.getTime() - (3600000) ) );
                session.endDialog("It will be quite busy on your campus near that time. "
                    +"I recommend you leave somewhere between"+"\n"
                    +early.toString()+"\n"+"and"+"\n"+timeTable[0].toString());
                return;
            }
            //the first recommendable timeslot is NOT a busy one for their current campus
            else{
                session.endDialog("The buses in your area should be somewhat spacious near then. "
                    +"You'll find most success by leaving between"+"\n"
                    +timeTable[b-1]+"\n"+"and"+"\n"+timeTable[b]);
                return;
            }
            }
            //between 10:30 and 8:00
            //the first recommendable timeslot is a busy one for their current campus
            if((start % 3)==((b-1) % 3)){
                session.endDialog("It's gonna be pretty busy on your campus near that time."
                    +"I recommend you leave somewhere between"+"\n"
                    +timeTable[b-2].toString()+"\n"+"and"+"\n"+timeTable[b-1].toString());
                return;
            }
            //the first recommendable timeslot is NOT a busy one for their current campus
            else{
                session.endDialog("The buses in your area should be somewhat spacious near then. "
                    +"You'll find most success by leaving between"+"\n"
                    +timeTable[b-1]+"\n"+"and"+"\n"+timeTable[b]);
                return;
            }
            //maybe set an alarm?
            return;
        }
    }
]);

helloBot.add('/help',  [
    function (session) {
        session.endDialog('How\'s it going?'
            +'\n'+'I recognize the following commands:'
            +'\n'+'travel'
            +'\n'+'quit');
}]);

//helloBot.listenStdin();

// Setup Restify Server
var server = restify.createServer();

//Handle messages
server.post('/api/messages', helloBot.verifyBotFramework(), helloBot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
    'directory': '.',
    'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});