/*     
 * This is the blog's core functionality
 * 
 * 
 */

Island = {};


Island.Page = function(obj)
	{	
	var self = this;
	this.obj = obj; 

	this.div;   // the div of the page
	
	
	if (obj.parent) this.parent = obj.parent;
	else 			this.parent = null;



	// Holt die Projekteinstellungen, da kann man auf einem Server mehrere Homepages anlegen

	this.get_submit_obj = function()
		{
		var o = {};
		o.collection = "homepage";
		o.identifier  = project.id;
		return o; 
		}

	
	
	// the nitialization function
	
	this.init = function()
		{
		for (var name in obj)
			{
			self[name] = obj[name];	
			
			}	
			
		if (obj.type == "blog") self.blogs = obj.blogs;	
		}
	
	
	
	this.new_blogs = [];
	this.new_blog_it = 0;
	
	
	
	
	
	this.new_blog_interaction = function(id)
	{
	var n = id;

	
	// the title
	$(id + " .title").click(function(){	
		$(this).hide();
		
		$(n + " .title_input").show();	
		});	



	
	// the title input field
	$(id + " .title_input").change(function(){	
		
		var v = $(this).val();
		$(this).hide();
		
		
		$(n + " .title").html(v);		
		$(n + " .title").show();	
		});		
	
	
	
	// text
	$(id + " .text").click(function(){	
		$(this).hide();
		$(n + " .text_input").show();	
		});		
	
	// text input
	$(id + " .text_input").change(function(){	
		var v = marked(  $(this).val() );
		$(this).hide();
		$(n + " .text").html(v).show();
		// $(n + " .text").show();	
		});		
		
	
	
	alert("ID " + id);
	

	
	$(id + "_update").click(function(){
	
		var mongo_id = $(this).attr("mongo_id");
		
		if (!mongo_id) 
			{
			var o = self.get_submit_obj();	
			
			alert("Neues Item");
			
			o.item = {};
	 		o.parent = "page";
	 		o.parent_timestamp = self.timestamp;	 	
	 		
	 		o.type = "blogs";

			o.item.entries = [];  //Array der Einträge, lokalisiert
			
			var localized_item = {};
			localized_item.locale = "de";
			localized_item.title  = $(id + " .title").html();
			localized_item.text  = $(id + " .text").html();
			
			o.item.entries.push(localized_item);
			
			self.new_item(o, "blogs", obj, self.id);	

			}
		else
			{
			alert("UPDATE");	
			}		
	
		});
		
	$(id + "_delete").click(function(){
		$("#" + id).remove();	
		});		
		
	}





	
	
// second Generation, UPDATE
this.update_item = function(item, type, parent, id)
	{
	var url = project.server + project.upstream + '/update_item';
	var data = JSON.stringify(item);		


   	$.post(url,
	    {
	    'data' : data},
	    function(data){
	    
		switch(type)
			{
			case "blogs":			 
			  self.repaint();
			break;	
			}
	    

	    }).error(function(data, textStatus)
	    {
	    alert("Post fehlgeschlagen");
	    }); 		
	}	
	
	
this.delete_item = function(item, type, parent, id)
	{
	var url = project.server + project.upstream + '/delete_item';
	var data = JSON.stringify(item);		


   	$.post(url,
	    {
	    'data' : data},
	    function(data){
	    
		switch(type)
			{
			case "blogs":	
			 self.blogs.remove_by_attr("timestamp", data.timestamp);		 
			 console.log("Blog gelöscht");
			break;	
			}
	    

	    }).error(function(data, textStatus)
	    {
	    alert("Post fehlgeschlagen");
	    }); 	
	
	}
	
	
	// die 2. Generation
this.new_item = function(item, type, parent, id)
	{
	var url = project.server + project.upstream + '/new_item';	

    var data = JSON.stringify(item);
   
   	$.post(url,
	    {
	    'data' : data},
	    function(data){
	    
	   	switch(type)
	   		{
	   		case "blogs":
	   		self.blogs.push(data);
	   		break;	
	   		}
	    

	    }).error(function(data, textStatus)
	    {
	    alert("Post fehlgeschlagen");
	    }); 
	}

	
	
	
	this.blog_partial = null;
	
	this.blog_toolbar_interaction = function(type)
		{
		switch(type)
			{
			case "new_blog":
			
			 var ident = "new_blog_" + self.new_blog_it;
			 self.new_blog_it ++;
						
			
			 readStringFromFile("partials/blog_template.html", function(data){
	
			
	
			 var d = data.replace("xxx", ident);
			
			 alert(ident);
			
			 
			 var n_update = ident + "_update"; 
			 d = d.replace("UP", n_update);
			 	 	
			 var n_delete = ident + "_delete"; 
			 d = d.replace("DEL", n_delete);			 	
			 	
			 var n = "#" + self.name;
			 	
			 $(n).prepend(d);
			 
			 
	
			var path = n + " #" + ident;
			 
			 self.new_blog_interaction(path);
			 	 	
			 });
			

			
			

			
			break;	
			}
		}
	
	
	this.paint_blog_toolbar = function()
		{			
		var m = "";	
		
		var ident = "blog_toolbar_" + self.timestamp;
		
		$("#" + ident).remove();
		
		
		m += '<div class = "BlogToolbar" id = "' + ident + '">';
		
		  m += '<div class = "command" id = "new_blog">';
		    m += '<img src = "images/ds_plus.svg"/>';	
			
			m += '<div class = "command_type">'
			m += "new blog";
		    m += '</div>';			
		  m += '</div>';

		
		m += '</div>';
		

		
		// $(self.div).append(m);
		$("#" + self.name).append(m);
		
		// $(".PageBody").append(m);
		
		$("#" + self.name + " .BlogToolbar .command").click(function(){
			var x = $(this).attr("id");
			self.blog_toolbar_interaction(x);
		});
		
		}
	
	
	
	this.get_localized_entry = function(blog, locale)
		{
		for (var k = 0; k < blog.entries.length; k++)
			{
			if (blog.entries[k].locale = locale) return blog.entries[k];
			}
		}
	
	
	





	this.set_blog_entry_interaction = function(id, timestamp)
		{
		if (self.parent.admin_mode == true)	
			{
				
			$("#" + id + " .title").unbind('click');
				
			$("#" + id + " .title").click(function(){
				
				var ts = $(this).attr("data");		
				$("#" + id +  " .title").hide();
				$("#" + id +  " .title_input").show();
				
			});	
			
			$("#" + id + " .title_input").unbind('change');
		
			$("#" + id +  " .title_input").change(function(){
				alert("Änderung");
		
				var v = $(this).val();		
				$("#" + id +  " .title_input").hide();
				$("#" + id +  " .title").html(v).show();
			});	
			
			
			$("#" + id + " .command").click(function(){
				var type 		= $(this).attr("type");
				var timestamp 	= $(this).parent().parent().attr("data");
				

				var o = self.get_submit_obj();
				o.item = {};
				o.parent = "page";
				o.parent_timestamp = self.timestamp;			 
				o.type = "blogs";
				o.item = self.update_blog_entry(timestamp, id);
				 
				self.update_item(o, "blogs", obj, self.timestamp);


			});	
	
	
		 $("#" + id + " .text").click(function(){
		 					
				var height = $(this).css("height").px_to_number();
				height = parseInt(height * 1.15);
	
				
				$(this).hide();
				var v = toMarkdown($(this).html() );	
				$("#" + id +  " .text_input").html(v).show().css("height", height);			
			});			
			
			
			
			$("#" + id + " .text_input").change(function(){
	
				var v = marked( $(this).val() );	
	
					
				$("#" + id +  " .text_input").hide();
				$("#" + id +  " .text").html(v).show();
			});		
	
			
			
			
			}	
		}
	
	

	
	this.set_blog_interaction = function()
		{
		if (self.parent.admin_mode == true)	
		{	
			
			
			$(".BlogEntry .read_more").unbind("click");
			$(".BlogEntry .read_more").click(function(){
			
				var id = parseInt( parseInt( $(this).parent().attr("id") ) );
				
				console.log(id);
				
				$(".PageBodyOverlay").show();
				self.admin_paint_blog_entry(id);
				
				$(".BackToBlog").unbind("click");
				$(".BackToBlog").click(function(){
				$(".PageBodyOverlay").hide();
				});
						
			});
			
			
			
			$(".BlogEntry .title").click(function(){
				
				var ts = $(this).attr("data");		
				$("#" + ts +  " .title").hide();
				$("#" + ts +  " .title_input").show();
				
			});	
	
			$(".BlogEntry .title_input").change(function(){
				var ts = $(this).attr("data");		
				var v = $(this).val();		
				$("#" + ts +  " .title_input").hide();
				$("#" + ts +  " .title").html(v).show();
			});	
	
	
	
			
			$(".BlogEntry .text").click(function(){
				var ts = $(this).attr("data");
				
				var height = $(this).css("height").px_to_number();
				height = parseInt(height * 1.15);
	
				
				$(this).hide();
				var v = toMarkdown($(this).html() );	
				$("#" + ts +  " .text_input").html(v).show().css("height", height);			
			});			
			
			
			
			$(".BlogEntry .text_input").change(function(){
				var ts = $(this).attr("data");		
				var v = marked( $(this).val() );	
	
					
				$("#" + ts +  " .text_input").hide();
				$("#" + ts +  " .text").html(v).show();
			});			
			
			


			$(".BlogEntry .preview").click(function(){
				
				alert("PREVIEW");
				
				var ts = $(this).attr("data");
				
				var height = $(this).css("height").px_to_number();
				height = parseInt(height * 1.15);
	
				
				$(this).hide();
				var v = toMarkdown($(this).html() );	
				$("#" + ts +  " .preview_input").html(v).show().css("height", height);			
			});		


			$(".BlogEntry .preview_input").change(function(){
				var ts = $(this).attr("data");		
				var v = marked( $(this).val() );	
	
					
				$("#" + ts +  " .preview_input").hide();
				$("#" + ts +  " .preview").html(v).show();
			});		



			
			$(".BlogEntry .command").click(function(){
				var type = $(this).attr("type");
				var id = $(this).parent().parent().attr("id");
				self.blog_command(id, type)
			});		
			
			
			self.paint_blog_toolbar();
			}
		else
			{
			$(".BlogEntry .read_more").unbind("click");
			$(".BlogEntry .read_more").click(function(){
			
				var id = parseInt( parseInt( $(this).parent().attr("id") ) );
				
				console.log(id);
				
				$(".PageBodyOverlay").show();
				self.paint_blog_entry(id);
				
				$(".BackToBlog").unbind("click");
				$(".BackToBlog").click(function(){
					$(".PageBodyOverlay").hide();
				});
				
				
			});
				
				
			$(".BlogEntry .CommentField .submitter").unbind("click");	
			$(".BlogEntry .CommentBar").unbind("click");
			
				
			$(".BlogEntry .CommentField .submitter").click(function(){
				var id = parseInt( $(this).parent().parent().attr("id") );
				
				self.submit_comment(id);
				$("#" + id + " .CommentField").hide();
				$("#" + id + " .CM_IMG").show();
				
			});


			$(".BlogEntry .CommentBar").click(function(){
				
			var id = $(this).parent().attr("id");
			
			$("#" + id + " .CM_IMG").hide();
			$("#" + id + " .CommentField").show();

			});		
			

			
			
			}		
		}
	


	this.get_blog = function(timestamp)
		{
		for (var n = 0; n < self.blogs.length; n++)
			{
			if (self.blogs[n].timestamp == timestamp) return self.blogs[n];	
			}	
			
		alert("nicht gefunden " + self.blogs.length + " NAME " + self.name);
			
		/*
		var n = self.blogs.length;
		
		while(n--)
			{
			if (self.blogs[n].timestamp == timestamp) return self.blogs[n];
			}
		*/
		}




	this.submit_comment = function(blog_id)
		{
		var o = self.get_submit_obj();	
		o.parent = "page";
	 	o.parent_timestamp = self.timestamp;	 	
	 		
	 	o.type = "blogs";
				
		var blog = 	self.get_blog(blog_id);
		o.item = blog;
		
		entry 	 = self.get_localized_entry(blog, "de");	
		
		
		if (! entry.comments) 
			{
			entry.comments = [];	
			}

		
		var comment = {};
		 
		var v =  $("#" + blog.timestamp + " .CommentField textarea").val() ;
		
		
		comment.text = marked(v);
		comment.timestamp = new Date().getTime();	
			
				
		entry.comments.push(comment);
		
		self.update_item(o, "blogs", obj, self.timestamp);
			
		
		}



	// 
	this.update_blog_entry = function(timestamp, id)
	 {
	 alert(id);	
	 	
	 var item = self.get_blog(timestamp);
	 entry 	 = self.get_localized_entry(item, "de");
	 entry.title 		= $("#" + id + " .title").html();
	 entry.text  		= $("#" + id + " .text").html();
	 
	 alert(entry.title);
	 
	 Holla = item;
	 return item;
	}	
	



	// applied to the editable blog preview
	this.update_blog = function(id)
		{			
		var item = self.get_blog(id);
		entry 	 = self.get_localized_entry(item, "de");
		
		entry.title 		= $("#" + id + " .title").html();
		
		// entry.text  		= $("#" + id + " .text").html();
	

	
		entry.preview      = $("#" + id + " .preview").html();
	
		if (! entry.text)  entry.text = entry.preview;
	
	
		entry.tags  		= $("#" + id + " .blog_tags").val().split(",");
		entry.description  	= $("#" + id + " .blog_description").val() ;			
		
		
		
		
		
		aktuell = item;
		
		return item;
		}


	this.blog_command = function(id, type)
		{
		switch(type)
			{
			case "UP":
			 var o = self.get_submit_obj();
			 o.item = {};
			 o.parent = "page";
			 o.parent_timestamp = self.timestamp;			 
			 o.type = "blogs";
			 o.item = self.update_blog(id);
			 
			 self.update_item(o, "blogs", obj, self.timestamp);

			break;	
			
			case "PUB":
			 alert("wird öffentlich gemacht");
			break;
			
			case "DEL":
			 var o = self.get_submit_obj();
			 o.item = {};
			 o.parent = "page";
			 o.parent_timestamp = self.timestamp;			 
			 o.type = "blogs";
			 o.item = self.get_blog(id);
			 
			 self.delete_item(o, "blogs", obj, self.timestamp);
			
			$("#" + o.item.timestamp).remove();
			 
			break;
			
			
			case "META":
			
			 
			 var disp = $("#" + id + " .blog_tags").css("display");
			 if (disp == "none") 
			 	{
			 	$("#" + id + " .blog_tags").slideDown(200);
			 	$("#" + id + " .blog_description").slideDown(200);		
			 	}
			 else
			 	{
			 	$("#" + id + " .blog_description").slideUp(300);	
			 	$("#" + id + " .blog_tags").slideUp(300);		
			 	}
			 
			break;
			
			}
		
		}

	
		
	
	
	this.paint_preview_blog = function()
		{
		var s = "";	
						
			
		for (var i = 0; i < self.blogs.length; i++)
			{
			s += '<div class = "BlogEntry" id = "' + self.blogs[i].timestamp + '">';
			
			
			item = self.get_localized_entry(self.blogs[i], "de");
			
			
			s += '<div class = "title">';			
				s += item.title;
			s += '</div>';			
			
			s += '<div class = "text">';			
				s += item.text;
			s += '</div>';				
		
		
			s += '<div class = "read_more">READ MORE</div>';	
			s += '<br/>';
				
			s += '</div>';
				
			}	
			
			
		return s;		
		}
	
	
	
	
	this.admin_paint_preview_blog = function(id)
		{
		var s = "";	
						
		var i = self.blogs.length;
		
			
		while(i--)
			{
			var ts = self.blogs[i].timestamp;	
				
			s += '<div class = "BlogEntry" id = "' + ts + '">';
			
			item = self.get_localized_entry(self.blogs[i], "de");
					
			s += '<div class = "title" data = "' + ts + '">';			
				s += item.title;
			s += '</div>';			
			
			s += '<input class = "title_input" type="text" value="' + item.title + '" id = "InputBlogTitle"  data = "' + ts + '"/>';
						
			s += '<div class = "text" data = "' + ts + '">';			
				s += item.text;
			s += '</div>';				
			
			s += '<textarea class = "text_input" data = "' + ts + '" id = "InputBlogText">Here comes the content</textarea>';	


			var preview = item.preview;
			if (! item.preview) preview = item.text;
				

			s += '<textarea class = "blog_preview" data = "' + ts + '" id = "blog_preview">' + preview + '</textarea>';	

			if (! item.tags) item.tags = "tags,comma seperated";
			
			s += '<input title="tags,comma seperated" class = "blog_tags" type="tags" value="' + item.tags + '" id = "blog_tags"  data = "' + ts + '"/>';			


			var desc = item.description;
			if (! item.description) desc = "short description";

			s += '<textarea class = "blog_description" data = "' + ts + '" id = "blog_description">' + desc + '</textarea>';				
			
			s += self.parent.blog_footer;
			
			
			s += '</div>';
			
			

				

				
			}	
			
			
			
			
		return s;			
		}
	
	
	
	// will be outdated
	
	this.admin_paint_blog = function()
		{
		var s = "";	
						
		var i = self.blogs.length;
		
			
		while(i--)
			{
			var ts = self.blogs[i].timestamp;	
				
			s += '<div class = "BlogEntry" id = "' + ts + '">';
			
			item = self.get_localized_entry(self.blogs[i], "de");
			
			
			
			s += '<div class = "title" data = "' + ts + '">';			
				s += item.title;
			s += '</div>';			
			
			s += '<input class = "title_input" type="text" value="' + item.title + '" id = "InputBlogTitle"  data = "' + ts + '"/>';
					
					
			/*			
			s += '<div class = "text" data = "' + ts + '">';			
				s += item.text;
			s += '</div>';				
			

			s += '<textarea class = "text_input" data = "' + ts + '" id = "InputBlogText">Here comes the content</textarea>';	
			*/

			s += '<div class = "preview" data = "' + ts + '">';			
				s += item.preview;
			s += '</div>';		
		


			s += '<textarea class = "preview_input" data = "' + ts + '" id = "InputBlogPreview">Here comes the preview</textarea>';	



	
			s += '<div class = "read_more">READ MORE</div>';	
			s += '<br/>';		

			var preview = item.preview;
			if (! item.preview) preview = item.text;
				

			s += '<textarea class = "blog_preview" data = "' + ts + '" id = "blog_preview">' + preview + '</textarea>';	

			if (! item.tags) item.tags = "tags,comma seperated";
			
			s += '<input title="tags,comma seperated" class = "blog_tags" type="tags" value="' + item.tags + '" id = "blog_tags"  data = "' + ts + '"/>';			


			var desc = item.description;
			if (! item.description) desc = "short description";

			s += '<textarea class = "blog_description" data = "' + ts + '" id = "blog_description">' + desc + '</textarea>';				
			
			


			
			
			s += self.parent.blog_footer;
			
			
			s += '</div>';
			
			
			
				
			}	
			
			
			
			
		return s;				
	}
	

	
	
	
	this.admin_paint_blog_entry = function(id)
		{			
		blog 		= self.get_blog(id);
		
		if (blog) console.log("GEFUNDEN / ID " + id);
		else 	  console.log("BLOG nicht gefunden");
		
		var sequenz = "#/" + self.name + "?" + id;
				

		
		item 	 	= self.get_localized_entry(blog, "de");	

		history.pushState( { page: 1}, item.title, "#/" + self.name + "?" + id);

		var ts = blog.timestamp;

		
		var s = "";
		
		s += '<div class = "BackToBlog"><</div>';
		
		
		var name = "single_" + blog.timestamp;
		
		s += '<div class = "BlogEntry" id = "' + name + '" data = "' + blog.timestamp + '">';
		
			s += '<div class = "title">';			
				s += item.title;
			s += '</div>';			

			s += '<input class = "title_input" type="text" value="' + item.title + '" id = "InputBlogTitle"  data = "' + ts + '"/>';
			
			s += '<div class = "text">';			
				s += item.text;
			s += '</div>';				
		
			
			s += '<textarea class = "text_input" data = "' + ts + '" id = "InputBlogText">Here comes the content</textarea>';	


		
			s += self.parent.small_blog_footer;
		
				
		s += '</div>';
		
		
		$(".PageBodyOverlay").html(s);
		
		
		
		
		self.set_blog_entry_interaction(name, blog.timestamp);
		}
	
	
	
	
	
	
	this.call_blog_entry = function(id)
		{
		console.log("ID lautet " + id);
		blog 		= self.get_blog(id);
		
		item 	 	= self.get_localized_entry(blog, "de");	
		
		var s = "";
		
		s += '<div class = "BackToBlog"><</div>';
		
		s += '<div class = "BlogEntry" id = "' + blog.timestamp + '">';
		
			s += '<div class = "title">';			
				s += item.title;
			s += '</div>';			
			
			s += '<div class = "text">';			
				s += item.text;
			s += '</div>';				
		
		
			s += self.parent.blog_comment;
	
		
		
				
		s += '</div>';

		
		$(".PageBodyOverlay").html(s);
		$(".PageBodyOverlay").show();
		
				
		$(".BackToBlog").unbind("click");
		$(".BackToBlog").click(function(){
		$(".PageBodyOverlay").hide();
		});
		
		}
	
	
	// here the single blog gets displayed
	
	this.paint_blog_entry = function(id)
		{			
		blog 		= self.get_blog(id);
		
		var sequenz = "#/" + self.name + "?" + id;
				
		
		if (! blog) alert("Ich habe ein Problem " + id);
		
		item 	 	= self.get_localized_entry(blog, "de");	


		self.parent.action("blog", item, id);



		history.pushState( { page: 1}, item.title, "#/" + self.name + "?" + id);

		
		var s = "";
		
		s += '<div class = "BackToBlog"><</div>';
		
		s += '<div class = "BlogEntry" id = "' + blog.timestamp + '">';
		
			s += '<div class = "title">';			
				s += item.title;
			s += '</div>';			
			
			s += '<div class = "text">';			
				s += item.text;
			s += '</div>';				
		
		
			s += self.parent.blog_comment;
	
		
		
				
		s += '</div>';
		
		
		$(".PageBodyOverlay").html(s);

		}
	
	
	
	// outdated
	this.paint_blog = function()
		{
		var s = "";	
						
			
		for (var i = 0; i < self.blogs.length; i++)
			{
			s += '<div class = "BlogEntry" id = "' + self.blogs[i].timestamp + '">';
			
			
			item = self.get_localized_entry(self.blogs[i], "de");
			
			
			s += '<div class = "title">';			
				s += item.title;
			s += '</div>';			
			
			s += '<div class = "text">';			
				s += item.text;
			s += '</div>';				
		
		
			s += self.parent.blog_comment;
	
		
			// Now paint the comments
			if (item.comments)
				{
				var n = item.comments.length;
				
				while(n--)
					{
					s += '<div class = "comment">';
					
						s += '<div class = "date">';
												
							s += moment.utc(item.comments[n].timestamp).format();
						s += '</div>';	

					
						s += '<div class = "comment_text">';					
					  		s += item.comments[n].text;
						s += '</div>';						  
					s += '</div>';			
					}
				
				s += '<br>';		
				}
			///		
		
				
			s += '</div>';
				
			}	
			
			
		return s;	
		}
	

	
	this.repaint = function()
		{
		$("#" + self.name).remove();
		
		
		var s = '<div class = "Page" id = ' + self.name + ' data = ' + self.timestamp + '>';
		
		if (self.parent.admin_mode == true) s += self.parent.page_edit_bar;		

		
		if (self.type == "dashboard") s += self.parent.paint_dashboard();	
		if (self.type == "blog") 
			{
			if (! self.blogs)
				{ 
				self.blogs = [];
				self.paint_blog_toolbar();
				}
				
			if (self.parent.admin_mode == false) s += self.paint_preview_blog();
			else 						  		 s += self.admin_paint_blog();
			}
	
		s += '</div>';
		
		
		$(".PageBody").append(s);		
		
		self.set_blog_interaction();			
		}
	
	
	
	this.paint = function()
		{
		// window.location.href= self.parent.url+ self.name;	
		history.pushState( { page: 1}, "title 1", "#/" + self.name);
					
		var s = '<div class = "Page" id = ' + self.name + ' data = ' + self.timestamp + '>';
		
		if (self.parent.admin_mode == true) s += self.parent.page_edit_bar;		

		
		if (self.type == "dashboard") s += self.parent.paint_dashboard();	
		if (self.type == "blog") 
			{
			if (! self.blogs)
				{ 
				self.blogs = [];
				self.paint_blog_toolbar();
				}
				
			if (self.parent.admin_mode == false) s += self.paint_preview_blog();
			else 						  		 s += self.admin_paint_blog();
			}
	
		s += '</div>';
		
		return s;	
		}
	
	
	self.init();	
	};




function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}




/********************************* DASHBOARD *********************************/


Island.Dashboard = function(parent)
{
var self 	= this;
self.parent = parent;

this.init = function()
	{
	var s = "";
	
	s += '<div class = "Dashboard">';
	
		s += '<div class = "Header">';

		  s += '<div class = "NewPage" id = "new_page">';
		  s += '<img src = "images/ds_plus.svg"/>';			   
		  s += '</div>';			
			
		s += '</div>';	
	
	s += '</div>';
	
	$(".Island").append(s);
	
	
	$(".NewPage").click(function(){
		
		alert("klick");	
	});
	
	
	}	
	
self.init();
}



Island.Homepage = function()
	{
	var self = this;
	
	this.url = null; // to make the site RESTful
	this.dashboard 		= null;	
	this.admin_mode 	= true;     
	
	
	this.pages = []; 				 // the array of pages
	
	this.frontpage = null; 			 // the page which is on top
	


	this.paint_dashboard = function()
		{
		if (! self.dashboard)
			{
			self.dashboard = new Island.Dashboard(this);
			}
			

		}


	this.check_url = function()
		{
		var a 	= window.location.href;
		var pos = a.search("#");
				
		if (pos != -1) 
			{
			var b = a.slice(0,pos);
			self.url = b + "#/";	
			
			var c = a.slice(pos+2, a.length);
			
			alert(c);
			
			self.call_page_by_name(c);				
			}
		else self.url = window.location.href + "#/";			
		}


	// The partials
	this.blog_footer = null;
	this.small_blog_footer = null;
	
	this.paint_fast_admin = function()
	  {
		readStringFromFile("partials/admin_toolbar.html", function(data){						 
	  		 //$(".Island").append(data);
	  		 $("body").append(data);
			 });
	  
	  $(".AdminToolbar .command").click(function(){
	   var id = $(this).attr("id");
	   self.admin_command(id);	
	  });



	 readStringFromFile("partials/blog_footer.html", function(data){			 
			self.blog_footer = data;
			 });


	 readStringFromFile("partials/small_blog_footer.html", function(data){			 
			self.small_blog_footer = data;
			 });


	  }
	



	this.action = function(type, obj, id)
		{
		switch(type)
			{
			case "blog":
			 // alert("hier wird ein Blog aufgerufen");
				var o = {};
				o.collection 		= "homepage";
				o.identifier  		= project.id;			
				o.item = {};
	 			o.type 				= "action";

				o.item.type  		= "blog_click";
				o.item.id			= id; 		
				o.item.timestamp	= new Date().getTime();
					
				self.new_entity(o, "action");
			 
			break;	
			}	
		}
	
	
	
		// Communication Server
	this.new_entity = function(item, type)
		{		
		var url = project.server + project.upstream + '/new_entity';	
    	var data = JSON.stringify(item);

		$.post(url,
		    {
		    'data' : data},
		    function(data){
		    
		   	switch(type)
		   		{
		   		case "page":
	   		   		$(".PageBody").html("");
	   		   		$(".Header").html("");		
	   		   		
	   		   		var o = data;
		    		o.parent = self;
		    		o.id     = self.pages.length;
		    	
					self.pages.push(new Island.Page(o)) ;
	   		   			  
			   		self.paint_pages();
		   		break;	
		   				   		
		   		case "action":
		   		break;
		   		
		   		
		   		
		   		default:
		   		 alert(type);
		   		break;
		   		
		   		}
		    
	
		    }).error(function(data, textStatus)
		    {
		    alert("Post fehlgeschlagen");
		    }); 

		
			
		}
	
	


this.delete_entity = function(item, type)
	{
		
	var url = project.server + project.upstream + '/delete_entity';
	
	var data = JSON.stringify(item);
   
   	$.post(url,
	    {
	    'data' : data},
	    function(data){

	    
	   	switch(type)
	   		{
	   		case "page":
	   		   $(".PageBody").html("");
	   		   $(".Header").html("");			  
			   self.paint_pages();
	   		break;	

	   		
	   		default:
	   		 alert(type);
	   		break;
	   		
	   		}
	    

	    }).error(function(data, textStatus)
	    {
	    alert("Post fehlgeschlagen");
	    }); 
	
	
		
	}


	
	
	this.show_form = function(type, id)
		{
		$(".MainForm").show();	
			
			
		switch(type)
			{
			case "page":
			
			readStringFromFile("partials/new_page_form.html", function(data){			 
	  		 $(".MainForm").html(data);
	  		 
	  		 // EXIT
	  		 $(".MainForm .exit").click(function(){	 $(".MainForm").hide();  });
	  		 
	  		 
	  		 $(".new_page_form .submitter").click(function(){  		 	

				$(".MainForm").hide();

				var o = {};
				o.collection = "homepage";
				o.identifier  = project.id;			
				o.item = {};
	 			o.type 			= "page";
	 			o.published     = false;	 			
	 			o.item.name 	= $(".new_page_form .page_title").val();
	 			o.item.type     = $(".new_page_form #page_type").select().val();
	 		
	 		    o.item.seq     = parseInt( $(".new_page_form #sequence").select().val() );	 		// to contro9l the sequence	 				 
				self.new_entity(o, "page");
	  		 	});
	  		 
			 });		  
			
			break;	
			
			
			case "admin":
			
			readStringFromFile("partials/new_admin_form.html", function(data){			 
	  		 $(".MainForm").html(data);
	  		 
	  		 // EXIT
	  		 $(".MainForm .exit").click(function(){	 $(".MainForm").hide();  });
	  		 
	  		 
	  		  $(".new_admin_form .submitter").click(function(){ 
	  		  	var o = {};
				o.collection = "homepage";
				o.identifier  = project.id;
						
				o.item = {};
	 			o.type 			= "admin";
	
	 			
	 			o.item.name 		= $(".new_admin_form #admin_name").val();
	 			o.item.mail 		= $(".new_admin_form #admin_mail").val();
	 			o.item.password 	= $(".new_admin_form #admin_password").val();

	 			
	 			aktuell = o.item;

				self.new_entity(o, "admin");
	  		  });
	  		 
	  		 
			 });		  
			
			break;	
			
			
			case "resource":
			 readStringFromFile("partials/new_resource_form.html", function(data){			 
	  		 $(".MainForm").html(data);
	  		 
	  		 $(".MainForm .exit").click(function(){	 $(".MainForm").hide();  });
	  		 	  		 	
	  		 $(".new_resource_form .submitter").click(function(){ 	
	  		   alert("Hochladen des Files");
	  		 	});	  		   	
	  		 	
	  		 
	  		 });
	  		 
	  		 
			break;
						
			
			case "homepage":
			 readStringFromFile("partials/edit_homepage.html", function(data){			 
	  		 $(".MainForm").html(data);
	  		 
	  		 $(".MainForm #homepage_title").val(  self.homepage_defs.title);
	  		 $(".MainForm #homepage_logo").val(  self.homepage_defs.logo);
	  		 $(".MainForm #homepage_contact").val(  toMarkdown(self.homepage_defs.contact) );	
	  		 $(".MainForm #homepage_disclaimer").val(  toMarkdown(self.homepage_defs.disclaimer) );	  		 
	  		 $(".MainForm #homepage_style").val(  self.homepage_defs.style);		  		   		 
	  		 $(".MainForm #homepage_languages").val(  self.homepage_defs.languages);
	  		 $(".MainForm #homepage_social_media").val(  self.homepage_defs.social);
	  		 
	  		 $(".MainForm #homepage_server").val(  self.homepage_defs.server);
	  		 $(".MainForm #homepage_upstream").val(  self.homepage_defs.upstream);	  		 


	  		 $(".MainForm #homepage_cookie").val(  self.homepage_defs.cookie_name);
	  		 
	  		 console.log (self.homepage_defs.cookie_name);
	  		 
	  		 
	  		 
	  		 $(".MainForm .exit").click(function(){	 $(".MainForm").hide();  });
	  		 	  		 	 		   	
	  		 	
	  		 	
	  		  $(".MainForm .submitter").click(function(){
	  		  	
	  		  	var o = {};
				o.collection = "homepage";
				o.item = self.homepage_defs;
				o.identifier 		 = self.homepage_defs._id;
				
				
				
				o.item.title 		= $("#homepage_title").val();
				o.item.logo  		= $("#homepage_logo").val();
				o.item.contact  	= marked( $("#homepage_contact").val() );						
				o.item.disclaimer  	= marked( $("#homepage_disclaimer").val() );			
				o.item.languages    = $("#homepage_languages").val().split(",");			
				o.item.social       = $("#homepage_social_media").val().split(",");			

				o.item.style		= $("#homepage_style").val();

				o.item.cookie_name		= $("#homepage_cookie").val();
								
				o.item.server		= $("#homepage_server").val();
				o.item.upstream		= $("#homepage_upstream").val();			
					
				
				item = o;
				
				for (var i = 0; i < o.item.page.length; i++)
					{
					delete (o.item.page[i].parent);
					delete(o.item._id);
					}
	  		  	
	  		  	
	  		  	
	  		  	
	  		  	
	  		  	$(".MainForm").hide(); 
	  		  	
	  		  	///
	  		  	var url = project.server + project.upstream + '/update_element';	
				alert(url);
			
			    var data = JSON.stringify(o);
			   
			   	$.post(url,
				    {
				    'data' : data},
				    function(data){
				    
				    alert("Update des Elements erfolgreich");
				    
					homepage = data;
					
					var x = JSON.stringify(homepage);
					alert(x);
					
				      
				    }).error(function(data, textStatus)
				    {
				    alert("Post fehlgeschlagen");
				    });  
							  	
	  	  		 });	 
	  	  		 
	  		 
	  		 	///
	  		 
	  		 });
			break;
			
			}	
		}




this.submit_edited_homepage = function()
	{
		
	}



this.socket_communication = function()
	{

    var url = project.upload_url;
    
    var socket = io.connect(url);
    var siofu = new SocketIOFileUpload(socket);	
	
	this.socket = socket;
	this.siofu = siofu;  // 	


    siofu.listenOnInput(document.getElementById("upload_file"));
 

    // Do something when a file is uploaded:
    siofu.addEventListener("complete", function(event){
        console.log(event.success);
        console.log(event.file);
		alert("File komplett hochgeladen");
    	});



    self.socket.on('files', function (data) { 	
    	// self.show_uploaded_files(data);
    })


	
	
		
	}



	
	
	this.admin_command = function(id)
		{
		switch(id)
			{
			case "NEW_PAGE":
			 self.show_form("page", 0);
			break;	
			
			case "NEW_ADMIN":
			 self.show_form("admin", 0);
			break;				
			
			case "NEW_RESOURCE":
			 self.show_form("resource", 0);
			break;
			
			case "HOMEPAGE":
			 self.show_form("homepage", 0);
			break;				
			
			case "STATS":
			 alert("hier kommt die Statistik");
			break;
			
			
			default:
			 alert(id);
			break;
			
			}
		
		
		}
	
	
	
	this.cookie_manager = null;
	
	this.load_project = function()
		{
		var url = project.server + project.upstream + '/get_element';
	
    	var o = 	{};
    	o.collection 	= "homepage";
    	o.identifier 	= project.id;
     
    	var data = JSON.stringify(o);
   
	   	$.post(url,
		    {
		    'data' : data},
		    function(data){
		    
		     if (data.page)
		     {	
		     self.homepage_defs = data;

			 if (self.homepage_defs.cookie_name) self.cookie_manager = new Visit.Cookie(self.homepage_defs);
		     
		     
		     	
		    for (var i = 0; i < data.page.length; i++)
		    	{
		    	var o = data.page[i];
		    	o.parent = self;
		    	o.id     = i;
		    	
				self.pages.push(new Island.Page(o)) ;
		    	}
		    
		   	self.paint_homepage_elements();		    
		   	self.paint_pages();
		   	

		   	}
		   	
		    self.admin = data.admin;
		   	
		   	
		    
		    }).error(function(data, textStatus)
		    {
		    alert("Post fehlgeschlagen");
		    });  
		}
	
	
	
	this.blog_comment 	= null;
	this.page_edit_bar	= null;
	
	
	
	this.read_partials = function()
	{
	readStringFromFile("partials/blog_comment.html", function(data){
		self.blog_comment = data;			 
		});		   	
	  		 	
	readStringFromFile("partials/page_edit_bar.html", function(data){
		self.page_edit_bar = data;			 
		});		  		 	
	  		 	
	  		 		
	}
	
	

	this.homepage_definition = function()
		{
		readStringFromFile("partials/homepage_form.html", function(data){

			 
			$(".Island").html(data);		
			
			$(".Homepage .submitter").click(function(){
			
				var o = {};
				o.collection = "homepage";
				o.item = {};
				
				o.item.title 		= $("#homepage_title").val();
				o.item.logo  		= $("#homepage_logo").val();
				o.item.contact  	= marked( $("#homepage_contact").val() );						
				o.item.disclaimer  	= marked( $("#homepage_disclaimer").val() );			
				o.item.languages    = $("#homepage_languages").val().split(",");			
				o.item.social       = $("#homepage_social_media").val().split(",");			

				o.item.style		= $("#homepage_style").val();
				
				o.item.server		= $("#homepage_server").val();
				o.item.upstream		= $("#homepage_upstream").val();			
					
				
				item = o;
				
			    var url = project.server + project.upstream + '/new_element';	
			
			    var data = JSON.stringify(o);
			   
			   	$.post(url,
				    {
				    'data' : data},
				    function(data){
				    
					homepage = data;
					
					var x = JSON.stringify(homepage);
					alert(x);
					
				      
				    }).error(function(data, textStatus)
				    {
				    alert("Post fehlgeschlagen");
				    });  
					
					
				});
				 
			});	
		}


	
	this.init = function()
		{
		self.read_partials();	
			
		if (project.id)
			{	
			


			if (self.admin_mode == true) self.paint_fast_admin();
	    	self.load_project();	                                // this commands loads the whole project
	    	}
	    else self.homepage_definition();
		};
	
	
	
	
	this.change_page = function()
		{
		var a 	= window.location.href;
		var b = a.split("#/");
		
		if (b.length > 1)
			{
			var url = b[1];	
				
			var c = url.search("\\?");
			if (c!= -1)
				{
				var page = url.slice(0, c);	
				var blog = url.slice(c+1, url.length);
				

				
				if (self.pages.length == 0)
					{
					console.log("TIMEOUT");	
					var s = self.change_page;
					window.setTimeout(s, 2000);	
					}
				else
					{
					console.log("Der Blog hat den Timestamp " + blog);	
					self.call_page_by_name(page, true);	
					
					var id = parseInt(blog);
					
					actual_page 		= self.get_page(page);
					
					
					// actual_blog 	= actual_page.get_blog(parseInt(blog));
					
					actual_page.call_blog_entry(id);
					}
				
				

					
				}
			else
				{
				self.call_page_by_name(url, true);
				}
			}
		}
	
	
	
	this.get_page = function(name)
		{
		for (var i = 0; i < self.pages.length; i++)
			{
			if (self.pages[i].name == name) return self.pages[i];
			}			
		return null;
		}
	
	
	
	this.call_page_by_name = function(name, history_mode)
		{
		var id = -1;	
			
		for (var i = 0; i < self.pages.length; i++)
			{
			if (self.pages[i].name == name) id = i;
			}	
			
		self.call_page(id, history_mode);
		}
	
	
	
	this.clear_page = function()
		{
		TweenLite.to(self.frontpage, 1.2, { left: "100%" });
		}
	
	
	// this calls and paints a page
	this.call_page = function(no, history_mode)
		{
		console.log( self.pages[no].name);
			
		$(".PageBodyOverlay").hide();	
			
		if (!self.pages[no].div)
			{
			if (self.frontpage) self.clear_page();		
								
			var s = "";
			var a = self.pages[no].paint();
	
			s += a;
					
			$(".PageBody").append(s);
						
			self.pages[no].div = $(".PageBody " + "#" + self.pages[no].name);
			self.frontpage = self.pages[no].div[0];   // it becomes frontpage		
		

			
			if (self.pages[no].type == "blog")
				{
				console.log("BlogInteraktion");	
				self.pages[no].set_blog_interaction();	
				}

		
			// interaction
			
			$(".page_edit_bar .command").unbind('click');
			$(".page_edit_bar .command").click(function(){
				
				var type  		= $(this).attr("type");
				var name 		= $(this).parent().parent().attr("id");
				var timestamp 	= parseInt( $(this).parent().parent().attr("data") );				

				switch(type)
					{
					case "DEL":


					var o = {};
					o.collection = "homepage";
					o.identifier  = project.id;			
		 			o.type 			= "page";

			
					mein_item   	  = self.pages.find_by_attr("timestamp", timestamp);		
					mein_item = mein_item.obj;
					delete (mein_item.parent);
					
					o.item 		= mein_item;

			
					var answer = confirm("Do you really want to delete the page " + name + "?");	
			
					if (answer)
						{	
						self.delete_entity(o, "page");
						$("#" + self.name).remove();
						self.pages.remove_by_attr("timestamp", timestamp);					
						}


					break;	
					}
			
			});		
		
		
			}
		else
			{
			if (self.frontpage) self.clear_page();	
			
			var last = $(self.frontpage).attr("id");
			if (history_mode)
				{
				console.log("schreibe was in die History");	 
				history.pushState( { page: 1}, "title 1", "#/" + self.pages[no].name);
				}
			
			
			
			if (self.pages[no].type == "blog") self.pages[no].set_blog_interaction();	

			
				
			TweenLite.to(self.pages[no].div[0], 0, { left: "-100%" });	
			TweenLite.to(self.pages[no].div[0], 0.7, { left: "0%", opacity: 1 });
			self.frontpage = self.pages[no].div[0];   // it becomes frontpage		
			}
			
		
		
		
		
		}
	
	
	
	this.page_edit = function(page)
	{
	return "XXX";	
	}
	
	
	
	this.paint_homepage_elements = function()
	{
	var n = "";
	
	n += '<div class = "homepage_title">' + self.homepage_defs.title + '</div>';
		
	$(".Homepage_Header").append(n);
	
	n = "";
	
	n += '<select id = "language_choice" name="top5" size="1">';
      	

	// language
	self.language = self.homepage_defs.languages[0];
	
	for (var i = 0; i < self.homepage_defs.languages.length; i++)
		{
		if 		(i == 0)  n += '<option selected>' + self.homepage_defs.languages[i] + '</option>';
		else			  n += '<option>' + self.homepage_defs.languages[i]  + '</option>';
		}	
		
	n += '</select>';
	
	// contact information
	n += '<div id = "contact">CONTACT</div>';	
	n += '<div id = "contact_info">CONTACT</div>';	

	n += '<div id = "disclaimer">DISCLAIMER</div>';	
	n += '<div id = "disclaimer_info">DISCLAIMER</div>';
	
	$(".PageFooter").append(n);


	$("#language_choice").change(function(){
		alert("Änderung");
	});


	$("#contact").click(function(){
		var x = $("#contact_info").css("display");
		
		if (x == "none") $("#contact_info").show();
		else 			 $("#contact_info").hide();
		
	});


	$("#disclaimer").click(function(){
		var x = $("#disclaimer_info").css("display");

		if (x == "none") $("#disclaimer_info").show();
		else 			 $("#disclaimer_info").hide();
	});

	
	}
	
	
	
	
	this.paint_pages = function()
		{
	
			
		var s = "";	
			
		for (var i = 0; i < self.pages.length; i++)
			{
			if (self.pages[i].published == true) 
				var link = self.pages[i].name + "_link";
			
				s += '<div class = "page_link" data = ' + i + ' id = ' + link + '>' + self.pages[i].name + '</div>';
			
				
			}
		
		$(".Island .Header").html(s);	
		
		
		$(".page_link").click(function(){
			var n = parseInt( $(this).attr("data") );
			self.call_page(n);
		});

				

		
		
		
		}
	
	
	self.init();
		
	}


window.onpopstate = function(event) {


  if (island) island.change_page();	
  // alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
};

