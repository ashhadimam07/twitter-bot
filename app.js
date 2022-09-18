const twitter = require("twit");
const fs = require("fs");

const TIME_INTERVAL = 1 * 60 * 60 * 1000; // 1 hour
const DB_FILE = "db.txt";

const TWITTER_SEARCH_QUERY = "Virat Kohli";
const TWITTER_SEARCH_QUERY_COUNT = 10;

const TWITTER_REPLY_TO_TWEETS = ["Greatest of all time."];

const twitterBot = new twitter({
  consumer_key: "0dvTilGmlsILo8jReO3fVB85o",
  consumer_secret: "WR0WZTHyMaR5qUMRO7TygnThs2v2IJYkCC6U32llv7zxiUR4gj",
  access_token: "1571532827497467909-5bIjiQCbyPrvFV2OBr9yWcdnykVOPr",
  access_token_secret: "Z146PxqG6HW59d7cYJL7dECHkGVBYsRIeCah2c6fEfxs4",
});

function TwitterBotSearchQueryResults(error, data, _response) {
  if (error) {
    console.log("Bot could not find tweets matching the query: " + error);
  } else {
    let db = [];

    if (!fs.existsSync(DB_FILE)) {
      fs.closeSync(fs.openSync(DB_FILE, "w"));
    }

    fs.readFile(DB_FILE, "utf8", (err, fileData) => {
      if (!err) {
        fileData = fileData.trim();
        if (fileData != "") {
          db = fileData.split("\n");
        }

        const processed_tweets = [];

        for (let i = 0; i < data.statuses.length; i++) {
          const id = data.statuses[i].id_str;
          const userHandle = data.statuses[i].user.screen_name;

          if (db.indexOf(id) == -1) {
            processed_tweets.push(id);

            fs.appendFile(DB_FILE, id + "\n", (err) => {
              if (err) {
                console.log("Error on save to '" + DB_FILE + "' file.");
              }
            });

            // Reply on fetched tweets
            let textToReply =
              TWITTER_REPLY_TO_TWEETS[
                Math.floor(Math.random() * TWITTER_REPLY_TO_TWEETS.length)
              ];
            textToReply = "Hey @" + userHandle + ". " + textToReply;

            twitterBot.post(
              "statuses/update",
              { status: textToReply, in_reply_to_status_id: id },
              (err, _response) => {
                if (err) {
                  console.log("> Error: Status could not be updated. " + err);
                }
              }
            );
          }
        }

        // Logs of fetched tweets
        if (processed_tweets.length > 0) {
          console.log("> Tweets processed: " + processed_tweets);
        } else {
          console.log("> No tweets processed.");
        }
      }
    });
  }
}

function TwitterBotApplication() {
  const query = {
    q: TWITTER_SEARCH_QUERY,
    result_type: "recent",
    lang: "en",
    count: TWITTER_SEARCH_QUERY_COUNT,
  };

  twitterBot.get("search/tweets", query, TwitterBotSearchQueryResults);
}

TwitterBotApplication();
setInterval(TwitterBotApplication, TIME_INTERVAL);
