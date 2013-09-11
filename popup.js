//to update the local storage
var trial=0;

// called by the event listener
function init()
{
  // Loop over all windows and their tabs
  var tabs = [];
  //%match in url. s1 is the result of comparing url and s2 is a result of comparing titles
  var url,s1,s2;
  
   var titleDiv = document.getElementById("title");
   titleDiv.innerHTML+= "<b>Grouped according to url, title and metadata :</b><hr><hr>";
   
	var URLgroupDiv=document.getElementById('URLgroup');
	URLgroupDiv.innerHTML+="<br><br><hr><b>Grouped according to URL :<b><br><hr>"
  chrome.windows.getAll({ populate: true }, function(windowList) {
    for (var i = 0; i < windowList.length; i++) {
      for (var j = 0; j < windowList[i].tabs.length; j++) {
        var tab = windowList[i].tabs[j];
			if((tab.url!="chrome://extensions/")&&(getHost(tab.url)!="https://mail.google.com")&&tab.title!="Popup")
				tabs.push(tab);
      }
    }
	var fin=[];
var temp=[];	
var iter=0;
	   tabs.forEach(function(tabout) 
	   { 
	   var scoreDiv = document.getElementById("score");
	   scoreDiv.innerHTML+="<br>*****************************************************************<br>TAB "+tabout.title+"<br><br>";
	   tabs.forEach(function(tabin)
	   {
	   var a=compareUrl(tabout,tabin);
	   var b=compareTitle(tabout,tabin);
	   compareMetadata(tabout,tabin);
	   //getting metadata
	   var d=localStorage[iter];
	   iter++;
	   var c=parseInt(a,10)+parseInt(b,10)+parseInt(d,10);
	   //scoreDiv.innerHTML+=d+", ";
	   if(tabout.id!=tabin.id)
		{if((c>63)||(tabin.openerTabId==tabout.id))
			scoreDiv.innerHTML+="<li>"+tabin.title+"</li>"+"score : "+c;
		 		
			compareMetadata(tabout,tabin);
		}
//group based only on URL
	var URLgroupDiv=document.getElementById('URLgroup');
	if((fin.indexOf(tabout) > -1 ? true : false)==false)
	{
	groupTabsByUrl(tabout,URLgroupDiv);
	//for(var i=0;i<temp.length;i++)
	fin.push(tabout);
	}
	 });
	   
	   });


	   
	});



chrome.tabs.create({'url': chrome.extension.getURL('popup.html')}, function(tab) {
  
});
}
    
function getHost(url) {

          var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im'),
              m;

          if (url != null) {
              m = url.match(re);
              if (m != null) {
                  return m[0];
              }
          }

          return url;
      }

function getTabs(host, successHandler) {

          chrome.windows.getCurrent( function (win) {
              chrome.tabs.getAllInWindow(win.id, function (tabs) {

                  var result = tabs.filter( function (tab, index, array) {

                     var tabhost = getHost(tab.url);
                     return tabhost == host;
                  });

                  successHandler(result);
              });
          });

      }

function groupTabsByUrl(selectedTab,group1Div) 
	  {
			
          var tabhost,
              host;
          
				  host = getHost(selectedTab.url);
              
              getTabs(host, function (tabs) {
				
				group1Div.innerHTML+="<br>Group :<br>";

				for(var i=0;i<tabs.length;i++)
				{
				group1Div.innerHTML+="<li>"+tabs[i].title+"</li>";
				}
              });
			//  return tabs;
		}



//computes the similarity of 2 urls
function compareUrl(tabout,tabin){
			var score=-1;
			
			
			var url1=tabout.url;
			var str1=[];
			str1=url1.split("/");
			
			var url2=tabin.url;
			var str2=[];
			str2=url2.split("/");
			
			for(var i=0;i<str1.length;i++)
			{
			if(str1[i]==str2[i])
			{score++;}
			}
			
			score=score/(str1.length);
			score*=100;
			
			return score;
		  }

//compares the similarity between 2 titles
function compareTitle(tabout,tabin){
			var score=0;
			
			
			var url1=tabout.title;
			var str1=[];
			str1=url1.split("a");
			
			var url2=tabin.title;
			var str2=[];
			str2=url2.split("a");
			
			for(var i=0;i<str1.length;i++)
			{
			if(str1[i]==str2[i])
			{score++;}
			}
			
			score=score/(str1.length);
			score*=100;
			
			return score;
		  }
		  
		  
//get pages source to compute meta data

chrome.extension.onMessage.addListener(function(request, sender) {
  //localStorage.clear();
  if (request.action == "getSource") {
	localStorage["value1"]=request.source;
  }
  else if(request.action=="getSource2")
  {
  localStorage["value2"]=request.source;
  compareStorage();
  }
  
});
	
	
	function compareStorage()
	{
		var score=0;
		var htmlsrc1=localStorage['value1'];
		var htmlsrc2=localStorage['value2'];
	
			var str1=[];
			str1=htmlsrc1.split(">");
			
			var str2=[];
			str2=htmlsrc2.split(">");
			
			for(var i=0;i<str1.length;i++)
			{
			if(str1[i]==str2[i])
			{score++;}
			}
			
			score=score/(str1.length);
			score*=100;
			var checkDiv=document.getElementById("check");
	//checkDiv.innerHTML+="<br> "+score+ " length "+str1.length+"<br>";
	//trial.push(score);
		localStorage[trial]= score;
		trial++;
	}
	
	
function compareMetadata(tabout,tabin)
{
	var string1,string2;

	
    localStorage.setItem('localKey', tabout.id);
  	var message = document.querySelector('#message');
	chrome.tabs.executeScript(tabout.id, {
    file: "getPagesSource.js"
	
	  }, function() {
	// If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.extension.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.extension.lastError.message;
    }
  	});
 
  	chrome.tabs.executeScript(tabin.id, {
    file: "getPagesSource2.js"
  	}, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.extension.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.extension.lastError.message;
    }
  	});
}

document.addEventListener('DOMContentLoaded', init);
