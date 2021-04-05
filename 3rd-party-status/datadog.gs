// URL of the RSS feed to parse
var DD_RSS_FEED_URL = "https://status.datadoghq.com/history.rss";

// Webhook URL of the Hangouts Chat room
var DD_WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAAAkHvNzzg/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=9U2QAKxSFBLD4v_HO8tqQDG3nLrVs5hLRMUP39gudRk%3D";

// When DEBUG is set to true, the topic is not actually posted to the room
var DEBUG = true;

function DatadogfetchStatus() {
  
  var lastUpdate = new Date(parseFloat(PropertiesService.getScriptProperties().getProperty("lastUpdate")) || 0);

  Logger.log("Last update: " + lastUpdate);
  
  Logger.log("Fetching '" + DD_RSS_FEED_URL + "'...");
  
  var xml = UrlFetchApp.fetch(DD_RSS_FEED_URL).getContentText();
  var document = XmlService.parse(xml);
    
  var items = document.getRootElement().getChild('channel').getChildren('item').reverse();
  
  Logger.log(items.length + " entrie(s) found");
  
  var count = 0;
  
  for (var i = 0; i < items.length; i++) {
    
    var pubDate = new Date(items[i].getChild('pubDate').getText());
    // Logger.log("Publish date: " + pubDate);

    var lastEventTitle = new PropertiesService.getScriptProperties().getProperty("lastEventTitle") || 0;
    Logger.log("Last event title: " + lastEventTitle);

    // var og = items[i].getChild('og');
    var title = items[i].getChild("title").getText();
    // var description = items[i].getChild("description").getText();
    var link = items[i].getChild("link").getText();
    
    var encoded_title = Utilities.base64Encode(title);
    Logger.log("Encoded title:"+ encoded_title);

    if(DEBUG){
      Logger.log("------ " + (i+1) + "/" + items.length + " ------");
      Logger.log(pubDate);
      Logger.log(title);
      Logger.log(link);
      // Logger.log(description);
      Logger.log("--------------------");
    }

    if(pubDate.getTime() > lastUpdate.getTime() && title != lastEventTitle) {
      Logger.log("Posting topic '"+ title +"'...");
      // if(!DEBUG){
      //   postTopic_(title, link);
      // }
      PropertiesService.getScriptProperties().setProperty("lastUpdate", pubDate.getTime());
      PropertiesService.getScriptProperties().setProperty("lastEventTitle", title);

      var lastEventTitle = new PropertiesService.getScriptProperties().getProperty("lastEventTitle") || 0;
      Logger.log("Very Last event title: " + lastEventTitle);
      
      count++;
    }
  }
  
  Logger.log("> " + count + " new(s) posted");
}

function postTopic_(title, link) {
  
  var text = "*" + title + "*" + "\n";
  
  // if (description){
  //   text += description + "\n";
  // }
  
  text += link;
  
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify({
      "text": text 
    })
  };
  
  UrlFetchApp.fetch(DD_WEBHOOK_URL, options);
}