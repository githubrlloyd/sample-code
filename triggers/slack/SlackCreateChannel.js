//
// <h3>Slack API Trigger to Create a Channel</h3>
//
// <b>Integrity Rule Trigger</b>
// <p>
// This script will create a channel in Slack using the specified Team Nameinvoke a build job on a Hudson/Jenkins server
// <p>
// This script takes 2 parameters.  Following is a description:
// <ol>
//   <li>Channel Name - Mandatory Parameter - Specify the Field to use for the Slack Channel Name</li>
//   <li>API Token - Mandatory Parameter - Specify the Slack API Token to authenticate with</li>
// </ol>
// <p>
//
//
//@param Field Channel Name
//Specify the field containing the name of the channel
//
//@param String API Token
//Specify the API Token for the user
//


function print(s)
{
	eb.print(s);
}

function abort(txt) {   
	eb.abortScript("Trigger configuration error, please contact your system administrator.\n\n" +
    txt + "\n\n[Script: " + eb.getScriptName() + " | Trigger: " + eb.getTriggerName() + "]", true);
}

function isBlank(txt) {
  if (txt == null) {
    return true;
  } else {
    try {
      var testString = new java.lang.String(txt);
      return txt.equals("");
    } catch (e) {
      return true;    
    }
  }
}

function main()
{
	var post = new Packages.org.apache.commons.httpclient.methods.PostMethod("https://slack.com/api/channels.create");
	post.addParameter("token", apiToken);
	post.addParameter("name", channelName);
	
	var client = new Packages.org.apache.commons.httpclient.HttpClient();
	
	// Invoke the slack API call...
	var result = 0;
	try 
	{
		var status = client.executeMethod(post);
		print("HTTP POST Return Code: " + result);
		var response = post.getResponseBodyAsString();
		print("Result Message: " + response);
		var jsonResponse = new Packages.org.json.JSONObject(response).getJSONObject("channel");
		var channelID = jsonResponse.getString("name");
		
		print("Channel Created: " + channelID);
		delta.setFieldValue(params.getStringParameter("Channel Name", ""), "#"+channelID);
	}
	catch(e) 
	{
		print(e);
	}
	finally 
	{
		post.releaseConnection();
	}
	
	// Check the result of API call
	if( result != 0)
	{
		eb.abortScript("Failed to execute the command!  Return code was " + result + ".", true);
	}
}


var eb = bsf.lookupBean("siEnvironmentBean");
var delta = bsf.lookupBean("imIssueDeltaBean");

//Set the Message Category to enable print messages
eb.setMessageCategory("SLACK-INTEGRATION");

var params = bsf.lookupBean("parametersBean");
var channelName = delta.getNewFieldValue(params.getStringParameter("Channel Name", ""));
print(channelName);
var apiToken = params.getStringParameter("API Token", "");
if (isBlank(channelName)) { abort("No Channel Name specified"); }
if (isBlank(apiToken)) { abort("No API Token specified"); }

main();
