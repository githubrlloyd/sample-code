//
// <h3>Slack API Trigger to Post a Message to a Channel</h3>
//
// <b>Integrity Rule Trigger</b>
// <p>
// This script will post the message to the configured Channel in Slack
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
//Specify the field containing the name of the channel found on the related Sprint Item
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
	var url = "<http://" + eb.getDefaultAPIHostname() + ":" + eb.getDefaultAPIPort() + "/im/viewissue?selection=" + delta.getID() + "|" + delta.getID() + ">";
	var text = "User " + delta.getNewFieldValue("Story Owner") + " completed Story " + url + "\n" + delta.getNewFieldValue("Summary");
	var post = new Packages.org.apache.commons.httpclient.methods.PostMethod("https://slack.com/api/chat.postMessage");
	post.addParameter("token", apiToken);
	post.addParameter("channel", channelName);
	post.addParameter("username","PTC Integrity");
	post.addParameter("icon_url", "https://pbs.twimg.com/profile_images/459685592750514176/f-sJDqlh_bigger.jpeg");
	post.addParameter("text",text);
	
	var client = new Packages.org.apache.commons.httpclient.HttpClient();
	
	// Invoke the slack API call...
	var result = 0;
	try 
	{
		var status = client.executeMethod(post);
		print("HTTP POST Return Code: " + result);
		var response = post.getResponseBodyAsString();
		print("Result Message: " + response);
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

var sb = bsf.lookupBean("imServerBean");
var eb = bsf.lookupBean("siEnvironmentBean");
var delta = bsf.lookupBean("imIssueDeltaBean");

//Set the Message Category to enable print messages
eb.setMessageCategory("SLACK-INTEGRATION");

var params = bsf.lookupBean("parametersBean");
print("User Story: " + delta.toString());
var relatedIssue = delta.getNewRelatedIssues("Implemented In");
print ("Sprint: " + relatedIssue[0]);
var relatedSprint = sb.getIssueBean(relatedIssue[0]);
print("Sprint Summary: " + relatedSprint.getFieldValue("Summary"));
print(relatedSprint.toString());
var channelName = relatedSprint.getFieldValue(params.getStringParameter("Channel Name"));

print(channelName);
var apiToken = params.getStringParameter("API Token", "");
if (isBlank(channelName)) { abort("No Channel Name specified"); }
if (isBlank(apiToken)) { abort("No API Token specified"); }

main();