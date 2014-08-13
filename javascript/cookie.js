Visit = {};



Visit.Cookie =  function(project)
{
var self = this;

this.project = project;



// gets screen resolution
this.screenResolution = function()
{
var w = screen.width;
var h = screen.height;
return w + "x" + h;		
}


// reads browser information
this.getBrowserInformation = function()
{
  var N= navigator.appName, ua= navigator.userAgent, tem;
  var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
  if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
  M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
  return M;
}



// check if the cooke is already there
this.getCookie = function(name)
{
var i,x,y,ARRcookies=document.cookie.split(";");

	
for (i=0;i<ARRcookies.length;i++)
	{
	  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	  x=x.replace(/^\s+|\s+$/g,"");

	  
	  if (x==name)
	    {	  	
	    return unescape(y);
	    }
	   else console.log("NICHT " + x + " NAME " + name);
	  }
}


// Schreiben des Cookies auf die Festplatte
this.setCookie = function(c_name,value, exdays)
	{
	var expiration_days = 360;	
			
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + expiration_days);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
	
	
	x = self.getCookie(c_name);
	}



this.get_identifier = function()
	{
	var list = ["a"]	
	var d = new Date().getTime();

	var N = 2;
	var x = (Math.random().toString(36)+'00000000000000000').slice(2, N+2);

	x += d;
	N = 5;
	x += (Math.random().toString(36)+'00000000000000000').slice(2, N+2);

	return x;		
	}



this.createCookie = function()
	{
    var n = {};
  	n.name 			= project.cookie_name;
  	n.browser 		= self.getBrowserInformation();
  	n.resolution	= self.screenResolution();
  	n.timestamp   	= new Date().getTime();  	
  	n.visit_start   = new Date().getTime();
  	n.visits         = 1;
  	n.elapsed_time          = 0;

	n.ident         = self.get_identifier();
  	n.user_id       = null;
  	
  	var myJSONText = JSON.stringify(n);  
  	self.cookie_obj = n;
  	
  	self.setCookie(project.cookie_name, myJSONText, 1000);
  	
  	  	
  	self.db_storage();
	}


// updates the cookie values 
this.new_visit = function()
	{	
    var myJSONText = JSON.stringify(self.cookie_obj);
  	self.setCookie(project.cookie_name, myJSONText, 1000);	
  	
  	// self.db_update();
	}



this.db_storage = function()
	{
	var o = {};
	o.collection 		= "homepage";
	o.identifier  		= project._id;			
	o.item 				= {};
	o.type 				= "cookie";
 			
	o.item				= self.cookie_obj;
	// o.item.timestamp	= new Date().getTime();
	
	var url = project.server + project.upstream + '/new_entity';	
    data = JSON.stringify(o);


	
	$.post(url,
		    {
		    'data' : data},
		    function(data){

			alert("POST ERFOLGREICH");    
	
		    }).error(function(data, textStatus)
		    {
		    alert("Post fehlgeschlagen");
		    }); 

	




		
	}

// updates the cookie
this.db_update = function()
{
if (self.cookie_obj)	
	{
	var o = {};
	o.collection = "homepage";
	o.identifier  = project._id;			
	o.item = {};
	o.type 			= "cookie";
 			
	o.item			= self.cookie_obj;



	var url = project.server + project.upstream + '/update_entity';	
    data = JSON.stringify(o);


	
	$.post(url,
		    {
		    'data' : data},
		    function(data){

			alert("UPDATE ERFOLGREICH");    
	
		    }).error(function(data, textStatus)
		    {
		    alert("Post fehlgeschlagen");
		    }); 

			 

	}
	
}


this.init = function()
	{		
	var cookie=self.getCookie(project.cookie_name);	
	
	if (cookie!=null && cookie!="") // the cookie is already stored 
		{

			
		var date = new Date().getTime();
		self.cookie_obj = eval('(' + cookie + ')');	
		self.cookie_obj.visits += 1;
		self.cookie_obj.visit_start = date;
		
		self.new_visit();
		
		} 
	else self.createCookie();


	
		
	}
	
	
self.init();	
}


