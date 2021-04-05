// URL of the RSS feed to parse
var K8_RSS_FEED_URL = "https://kubernetes.io/feed.xml";

// Webhook URL of the Hangouts Chat room
var WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAAA8f2JKd8/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=ikd1r4qpXzPWCy7vNo7JS0DWuYIagK0QpWki_5w0TuA%3D";

// When DEBUG is set to true, the topic is not actually posted to the room
var DEBUG = false;

function k8sfetchNews() {
  
  var lastUpdate = new Date(parseFloat(PropertiesService.getScriptProperties().getProperty("lastUpdate")) || 0);

  Logger.log("Last update: " + lastUpdate);
  
  Logger.log("Fetching '" + K8_RSS_FEED_URL + "'...");
  
  var xml = UrlFetchApp.fetch(K8_RSS_FEED_URL).getContentText();
  var document = XmlService.parse(xml);
    
  var items = document.getRootElement().getChild('channel').getChildren('item').reverse();
  
  Logger.log(items.length + " entrie(s) found");
  
  var count = 0;
  
  for (var i = 0; i < items.length; i++) {
    
    var pubDate = new Date(items[i].getChild('pubDate').getText());
    
    // var og = items[i].getChild('og');
    var title = items[i].getChild("title").getText();
    var description = items[i].getChild("description").getText();
    var link = items[i].getChild("link").getText();
    
    if(DEBUG){
      Logger.log("------ " + (i+1) + "/" + items.length + " ------");
      Logger.log(pubDate);
      Logger.log(title);
      Logger.log(link);
      // Logger.log(description);
      Logger.log("--------------------");
    }

    if(pubDate.getTime() > lastUpdate.getTime()) {
      Logger.log("Posting topic '"+ title +"'...");
      if(!DEBUG){
        postTopic_(title, description, link);
      }
      PropertiesService.getScriptProperties().setProperty("lastUpdate", pubDate.getTime());
      count++;
    }
  }
  
  Logger.log("> " + count + " new(s) posted");
}

function postTopic_(title, description, link) {
  
  var text = "*" + title + "*" + "\n";
  
  if (description){
    text += description + "\n";
  }
  
  text += link;
  
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify({
      "text": text 
    })
  };
  
  UrlFetchApp.fetch(WEBHOOK_URL, options);
}