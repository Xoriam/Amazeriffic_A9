// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, strict: true, undef: true, unused: true */

var main = function (toDoObjects) {
	"use strict";

	console.log("SANITY CHECK");

	var socket = io();
	var toDos = toDoObjects.map(function (toDo) {
		  // we'll just return the description
		  // of this toDoObject
		  return toDo.description;
	});

	$(".tabs a span").toArray().forEach(function (element) {
		var $element = $(element);

		// create a click handler for this element
		$element.on("click", function () {
			var $content,
				i;

			$(".tabs a span").removeClass("active");
			$element.addClass("active");
			$("main .content").empty();

			if ($element.parent().is(":nth-child(1)")) {
				//console.log($element[0].className);
				$content = $("<ul>");
				for (i = toDos.length-1; i >= 0; i--) {
					$content.append($("<li>").text(toDos[i]));
				}

				socket.on("update", function (results){
					if($element[0].className == "active"){
						//Do the same as what the post returns to the one who sent the new TODO
						toDoObjects.push(results);
						console.log(results);

						//Update toDos
						toDos = toDoObjects.map(function (toDo) {
							return toDo.description;
						});
			
						$content.prepend($("<li>").text(results.description));
						window.alert("A new item has been added.");
					}
				});
			} else if ($element.parent().is(":nth-child(2)")) {
				$content = $("<ul>");
				toDos.forEach(function (todo) {
					$content.append($("<li>").text(todo));
				});

				socket.on("update", function (results){
					if($element[0].className == "active"){
						toDoObjects.push(results);
						console.log(results);

						//Update toDos
						toDos = toDoObjects.map(function (toDo) {
							return toDo.description;
						});

						window.alert("A new item has been added.");

						$content.append($("<li>").text(results.description));
					}
				});

			} else if ($element.parent().is(":nth-child(3)")) {
				var tags = [];

				toDoObjects.forEach(function (toDo) {
					toDo.tags.forEach(function (tag) {
						if (tags.indexOf(tag) === -1) {
							tags.push(tag);
						}
					});
				});
				console.log(tags);

				var tagObjects = tags.map(function (tag) {
					var toDosWithTag = [];

					toDoObjects.forEach(function (toDo) {
						if (toDo.tags.indexOf(tag) !== -1) {
							toDosWithTag.push(toDo.description);
						}
					});

					return { "name": tag, "toDos": toDosWithTag };
				});

				console.log(tagObjects);

				tagObjects.forEach(function (tag) {
					var $tagName = $("<h3>").text(tag.name),
						$content = $("<ul>");


					tag.toDos.forEach(function (description) {
						var $li = $("<li>").text(description);
						$content.append($li);
					});

					$("main .content").append($tagName);
					$("main .content").append($content);
				});

				socket.on("update", function (results){
					if($element[0].className == "active"){
						var my_tags = [];
						toDoObjects.push(results);
						console.log(results);

						//Update toDos
						toDos = toDoObjects.map(function (toDo) {
							return toDo.description;
						});

						results.tags.forEach(function (a_tag) {
							my_tags.push(a_tag);
						});

						my_tags.forEach(function(tag){
							var $tagName = $("<h3>").text(tag),
								$content = $("<ul>");

							$content.append($("<li>").text(results.description));

							$("main .content").append($tagName);
							$("main .content").append($content);
						});

						window.alert("A new item has been added.");
					}
				});

			} else if ($element.parent().is(":nth-child(4)")) {
				var $input = $("<input>").addClass("description"),
					$inputLabel = $("<p>").text("Description: "),
					$tagInput = $("<input>").addClass("tags"),
					$tagLabel = $("<p>").text("Tags: "),
					$button = $("<span>").text("+");

				$button.on("click", function () {
					var description = $input.val(),
						tags = $tagInput.val().split(","),
						newToDo = {"description":description, "tags":tags};
					
					
					$.post("todos", newToDo, function (result) {
						console.log(result);

						//toDoObjects.push(newToDo);
						toDoObjects = result;

						// update toDos
						toDos = toDoObjects.map(function (toDo) {
							return toDo.description;
						});

						$input.val("");
						$tagInput.val("");
					});

					socket.emit("new todo", newToDo);
					
				});     

				$content = $("<div>").append($inputLabel)
									 .append($input)
									 .append($tagLabel)
									 .append($tagInput)
									 .append($button);
			}

			$("main .content").append($content);

			return false;
		});
	});

	$(".tabs a:first-child span").trigger("click");

};

$(document).ready(function () {
	$.getJSON("todos.json", function (toDoObjects) {
		main(toDoObjects);
	});
});
