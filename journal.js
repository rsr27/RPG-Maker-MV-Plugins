//=============================================================================
// Journal
// by rsr27
// Date: 12/9/2017
// v2.1
//
// Changelog:
//
// v2.11:
// Added the ability to use escape sequences in journal title.
//
// v2.1:
// Added the ability to delete entries and check if an entry exists. Updated
// descriptions of functions. Made the list not clear when switching
// categories.
// 
// v2.0:
// Huge changes: Added categories, colored text support, new text when a new
// entry is added, selection indicator, and image support.
//
// v1.3:
// Added the ability to use no underscores for text, text wrapping fixes, and
// escape sequence support. Selected entries are highlighted.
//
// v1.3:
// Added the ability to use no underscores for text, text wrapping fixes, and
// escape sequence support. Selected entries are highlighted.
//
// v1.2:
// Fixed a bug when choosing new game wouldn't clear the previous journal.
//
// v1.1:
// Added wordwrapping and the label of the selected entry.
//
// v1.0:
// Initial release. Some bugs may be present.
//
// License: 
// https://creativecommons.org/licenses/by-nc-nd/3.0/
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
//=============================================================================

/*:
 * @plugindesc Allows you to display a journal list and entries.
 *
 * @author rsr27
 *
 * @param Title
 * @desc The title of the journal.
 * @default Captain's Log
 *
 * @param Menu Command
 * @desc If true, add a command on the main menu next to formations.
 * @default true
 *
 * @param Category Names
 * @desc The names of the categories for the database.
 * @default Journal,Quests,Recipes,Lore
 *
 * @param Entry Exists Variable
 * @desc The index of the variable that holds the value for checking if an entry exists.
 * @default 0
 *
 * @help Plugin commands:
 *
 * ================================================================================
 * Journal show
 * --------------------------------------------------------------------------------
 * Opens the journal window.
 * --------------------------------------------------------------------------------
 * ================================================================================
 *
 * ================================================================================
 * Journal add [category] [id] [image] [title] [text] 
 * Journal entry [category] [id] [image] [title] [text] 
 * --------------------------------------------------------------------------------
 * Adds a journal entry with the supplied parameters. Use underscores "_" to be
 * replaced with spaces. If image is '0', then no image will be used. Use 
 * underscores for multiword titles.
 *
 * Example(s):
 * Journal entry 0 tutorial 0 Tutorial Welcome to the journal plugin!
 * Journal add 0 tutorial2 0 Tutorial_2 Welcome to the journal plugin!
 * --------------------------------------------------------------------------------
 * ================================================================================
 *
 * ================================================================================
 * Journal update [type] [category] [id] [value]
 * --------------------------------------------------------------------------------
 * Updates a journal entry with the new values. Type can be 'text', 'title' or 
 * 'image'.
 *
 * Example(s):
 * Journal update text 0 tutorial New text starts here.
 * Journal update title 0 tutorial New Title
 * Journal update image 0 tutorial sexy_anime_girl
 * --------------------------------------------------------------------------------
 * ================================================================================
 *
 * ================================================================================
 * Journal append [type] [category] [id] [value]
 * --------------------------------------------------------------------------------
 * Adds the value to the specified journal entry. Type can be 'text' or 'title'.
 *
 * Example(s):
 * Journal append text 0 tutorial More text.
 * Journal append title 0 tutorial Version 2
 * --------------------------------------------------------------------------------
 * ================================================================================
 *
 * ================================================================================
 * Journal exists [category] [id]
 * --------------------------------------------------------------------------------
 * Puts 1 into the variable parameter when the entry exists, and a zero when it
 * doesn't. If the parameter for variable isn't set to non-zero, nothing happens.
 *
 * Example(s):
 * Journal exists 0 tutorial
 * --------------------------------------------------------------------------------
 * ================================================================================
 *
 * ================================================================================
 * Journal delete [category] [id]
 * --------------------------------------------------------------------------------
 * Removes the entry from the list. The list is resorted after the remove.
 *
 * Example(s):
 * Journal remove 0 tutorial
 * --------------------------------------------------------------------------------
 * ================================================================================
 */
	
	var parameters = PluginManager.parameters('journal');
 
	function Entry () {
		this._id = "";
		this._title = "";
		this._entry = "";
		this._image = "";
		this._read = false;
		this._extra = 0;
	}
	
	function JournalObject() {
		this._display_entry = -1;
		this._fixed_text = "";
		this._selected_category = 0;
		this._active_image = null;
		
		this._entry_category = [];
		
		this._categories = parameters['Category Names'].split(",");
		
		this._entry_category = new Array(this._categories.length);
		
		for (var i = 0; i < this._categories.length; i++) {
			this._entry_category[i] = new Object(null);
			this._entry_category[i]._entries = [];
		}
		
	};
	
		var parseText = function(text) {
			text = text.split("[n]").join("\n");
			text = text.replace(new RegExp("_", "g"), " ");
			return text;
		};
		
		var removeTextEscapeSequences = function(text) {
			var exp = /(\\[A-Z]*)[[0-9]*[\]]/g;
			var new_text = text.replace(exp, "");
			return new_text;
		};
		
	$Journal = new JournalObject();
 
		const TEXT_AREA_WIDTH = 500;
		
		// Create our global object.
		$Journal = new JournalObject();
		
		
		var newAlias = DataManager.setupNewGame;
		
		DataManager.setupNewGame = function() {
			
			newAlias.call(this);
			
			$Journal = new JournalObject();
					
		};
		
		var saveAlias = DataManager.makeSaveContents;
		
		DataManager.makeSaveContents = function() {
			// A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
			var contents = saveAlias.call(this);
			contents.journal = $Journal;
			
			return contents;
		};
		
		var loadAlias = DataManager.extractSaveContents;
		
		DataManager.extractSaveContents = function(contents) {
			loadAlias.call(this, contents);
			$Journal = contents.journal;
		};
		
		// -----------------------------------------------------
		
		function Window_JournalCategory() {
			this.initialize.apply(this, arguments);
		}
		
		Window_JournalCategory.prototype = Object.create(Window_Selectable.prototype);
		Window_JournalCategory.prototype.constructor = Window_JournalCategory;

		Window_JournalCategory.prototype.initialize = function() {
			var y = this.fittingHeight(1);
			Window_Selectable.prototype.initialize.call(this, 0, y, Graphics.boxWidth, this.fittingHeight(1));
			this.refresh();
			this.select(0);
		};

		Window_JournalCategory.prototype.maxItems = function() {
			return $Journal._categories.length;
		};

		Window_JournalCategory.prototype.maxCols = function() {
			return $Journal._categories.length;
		};
		
		Window_JournalCategory.prototype.refresh = function() {
			
			this.contents.clear();
			
			for (var i = 0; i < this.maxItems(); i++ ) {
				var rectangle = this.itemRectForText(i);
				this.drawText($Journal._categories[i], rectangle.x, rectangle.y, rectangle.width, "center");
				
			};
		}
		
		
		// -----------------------------------------------------
		
		function Window_JournalOption() {
			this.initialize.apply(this, arguments);
		}
		Window_JournalOption.prototype = Object.create(Window_Selectable.prototype);
		Window_JournalOption.prototype.constructor = Window_JournalOption;

		Window_JournalOption.prototype.initialize = function() {
			var y = this.fittingHeight(1) * 2;
			Window_Selectable.prototype.initialize.call(this, 0, y, 316, Graphics.boxHeight - y);
			this.refresh();
			this.select(0);
		};

		Window_JournalOption.prototype.maxItems = function() {
			if ($Journal._selected_category == -1) 
				return 0;
			else {
				return $Journal._entry_category[$Journal._selected_category]._entries.length;
			};
			
			return 0;
		};

		Window_JournalOption.prototype.maxCols = function() {
			return 1;
		};

		Window_JournalOption.prototype.refresh = function() {
			
			this.contents.clear();
			
			if ($Journal._selected_category < 0)
				return;
			
			for (var i = 0; i < this.maxItems(); i++ ) {
				
				var rectangle = this.itemRectForText(i);
				
				if (rectangle.y > Graphics.boxHeight - (this.fittingHeight(1) * 2))
					continue;
				
				if (rectangle.y + rectangle.height < 0)
					continue;
				
				var text = $Journal._entry_category[$Journal._selected_category]._entries[i]._title;
				var read = $Journal._entry_category[$Journal._selected_category]._entries[i]._read;
				var san_text = this.convertEscapeCharacters(text);
				var text_header = "";
				
					
				if ($Journal._display_entry == i) {
					this.changeTextColor(this.systemColor());
					text = removeTextEscapeSequences(text);
					text = "---" + text + "---";
					var w = this.textWidth(text);
					this.drawText(text, rectangle.x, rectangle.y, rectangle.width, "center");
					// this.drawTextEx(text, rectangle.x + (rectangle.width/2) - (w/2), rectangle.y);
				}
				else {
					this.resetTextColor();
					
					if (!read)
						text = "\\C[16]*NEW*\\C[0] " + text;
					
					var w = this.textWidth(removeTextEscapeSequences(text));
						
					this.drawTextEx(text, rectangle.x + (rectangle.width/2) - (w/2), rectangle.y);
					}
				};
							
		};
		
		
		// Journal Window --------------------------------------
		
		function Window_Journal() {
			this.initialize.apply(this, arguments);
		}
		
		Window_Journal.prototype = Object.create(Window_Base.prototype);
		
		Window_Journal.prototype.initialize = function() {
			Window_Base.prototype.initialize.call(this, 0, 0, Graphics.boxWidth, this.fittingHeight(1));
			this.refresh();
		};
		
		// -----------------------------------------------------
		
		function Window_JournalTitle() {
			this.initialize.apply(this, arguments);
		}
		Window_JournalTitle.prototype = Object.create(Window_Base.prototype);
		Window_JournalTitle.prototype.constructor = Window_JournalTitle;

		Window_JournalTitle.prototype.initialize = function() {
			Window_Base.prototype.initialize.call(this, 0, 0, Graphics.boxWidth, this.fittingHeight(1));
			this.refresh();
		};

		Window_JournalTitle.prototype.refresh = function() {
			this.contents.clear();
			var text = this.convertEscapeCharacters(parameters['Title']);
			var w = this.textWidth(text);
			this.drawTextEx(text, (Graphics.boxWidth/2) - (w/2), 0);
			//this.drawTextEx("\\N[16]" + this.convertEscapeCharacters(parameters['Title']), 0, 0, Graphics.boxWidth, "center");
		};
		
		// -----------------------------------------------------
		
		function Window_JournalSidebar() {
			this.initialize.apply(this, arguments);
		}
		
		Window_JournalSidebar.prototype = Object.create(Window_Base.prototype);
		Window_JournalSidebar.prototype.constructor = Window_JournalSidebar;

		Window_JournalSidebar.prototype.initialize = function() {
			Window_Base.prototype.initialize.call(this, 0, this.fittingHeight(1), 316, Graphics.boxHeight - this.fittingHeight(1));
			this.refresh();
		};

		Window_JournalSidebar.prototype.refresh = function() {
			this.contents.clear();
		};
		
		// -----------------------------------------------------
		
		function Window_JournalText() {
			this.initialize.apply(this, arguments);
		}
		
		Window_JournalText.prototype = Object.create(Window_Base.prototype);
		Window_JournalText.prototype.constructor = Window_JournalText;

		Window_JournalText.prototype.initialize = function() {
			var y = this.fittingHeight(1) * 2;
			Window_Base.prototype.initialize.call(this, 316, y, TEXT_AREA_WIDTH, Graphics.boxHeight - y);
			this.refresh();
		};

		Window_JournalText.prototype.refresh = function() {
			
			this.contents.clear();
			
			if ($Journal._selected_category >= 0 && $Journal._selected_category < $Journal._entry_category.length) {
				
				if ($Journal._entry_category[$Journal._selected_category]._entries.length > 0 && $Journal._display_entry >= 0 && $Journal._display_entry < $Journal._entry_category[$Journal._selected_category]._entries.length) {
					
					var title = $Journal._entry_category[$Journal._selected_category]._entries[$Journal._display_entry]._title;
					var text = $Journal._fixed_text;
					var y = 0;
					
					var text_array = text.split("\n");
					
					if ($Journal._image != null) {
						this.contents.blt($Journal._image, 0, 0, $Journal._image.width, $Journal._image.height, 0, 0);
						y = $Journal._image.height;
					};

					this.changeTextColor(this.systemColor());	
					this.drawTextEx(this.convertEscapeCharacters(title), 0, y, Graphics.boxWidth, "left");
					
					this.resetTextColor();
					for (var i = 0; i < text_array.length; i++) {
						this.drawTextEx(text_array[i], 0, (i + 1) * (this.fittingHeight(1) / 2) + y, Graphics.boxWidth, "left");
					};
					
					
				};
			};
		};
		
		Window_JournalText.prototype.measureText = function(text) {
			return this.textWidth(text);
		}
		
		// -----------------------------------------------------
		
		function Scene_Journal() {
			this.initialize.apply(this, arguments);
		}

		Scene_Journal.prototype = Object.create(Scene_MenuBase.prototype);
		Scene_Journal.prototype.constructor = Scene_Journal;

		Scene_Journal.prototype.initialize = function() {
			Scene_MenuBase.prototype.initialize.call(this);
		};

		Scene_Journal.prototype.onCategoryOk = function() {
			
			$Journal._image = null;
			
			if ($Journal._selected_category >= 0 && $Journal._selected_category < $Journal._entry_category.length) {
				
				$Journal._display_entry = this._sidebarWindow._index;
				this._sidebarWindow.refresh();
				
				if ($Journal._display_entry >= 0 && $Journal._display_entry < $Journal._entry_category[$Journal._selected_category]._entries.length) {
					
					// Preload image
					var img_name = $Journal._entry_category[$Journal._selected_category]._entries[$Journal._display_entry]._image;
						
					if (img_name != "0") {
						$Journal._image = ImageManager.loadPicture(img_name);
						
						$Journal._image.addLoadListener(function() {
							this._textWindow.refresh(); 
						}.bind(this));
					};
					
					// Prepare the text
					var src_text = $Journal._entry_category[$Journal._selected_category]._entries[$Journal._display_entry]._text;
					var formatted_text = "";
					var last_space = 0;
					var last_start = 0;
					
					src_text = this._sidebarWindow.convertEscapeCharacters(src_text);
					
					for (var i = 0; i < src_text.length; i++) {
						
						var c = src_text[i];
						
						if (c == ' ') {
							last_space = i;
						}
						
						var l = i + 1;
						
						if (i + 1 >= src_text.length) {
							l = i;
						}
						
						var w = this._textWindow.measureText(src_text.substring(last_start, l).trim());
						
						var text = "";
				
						if (w + 36 > TEXT_AREA_WIDTH) {
							
							text = src_text.substring(last_start, last_space).trim();
							formatted_text += text + "\n";
							last_start = last_space + 1;
							i = last_start;		
							continue;
						}
						else if (i == src_text.length - 1) {
							text = src_text.substring(last_start - 1, src_text.length).trim();
							formatted_text += text;
							break;
						}
					};
					
					$Journal._entry_category[$Journal._selected_category]._entries[$Journal._display_entry]._read = true;
					$Journal._fixed_text = formatted_text;
				
					
				}
			}
			
			this._sidebarWindow.activate();
			this._textWindow.refresh();
		};
		
		Scene_Journal.prototype.selectCategory = function() {
			$Journal._selected_category = this._categoryWindow._index;
			this._categoryWindow.deactivate();
			this._sidebarWindow.activate();
			this._sidebarWindow.refresh();
		};
		
		Scene_Journal.prototype.cancelEntry = function() {
			this._sidebarWindow.select(0);
			this._sidebarWindow.deactivate();
			//$Journal._selected_category = -1;
			$Journal._display_entry = -1;
			this._textWindow.refresh();
			this._categoryWindow.activate();
			this._sidebarWindow.refresh();
		};
		
		Scene_Journal.prototype.create = function() {
			Scene_MenuBase.prototype.create.call(this);

			this._titleWindow = new Window_JournalTitle();
			this.addWindow(this._titleWindow);
			
			this._categoryWindow = new Window_JournalCategory();
			this.addWindow(this._categoryWindow);
			this._categoryWindow.setHandler('ok', this.selectCategory.bind(this));
			this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
			this._categoryWindow.activate();
			
			this._sidebarWindow = new Window_JournalOption();
			this.addWindow(this._sidebarWindow);
			this._sidebarWindow.setHandler('ok', this.onCategoryOk.bind(this));
			this._sidebarWindow.setHandler('cancel', this.cancelEntry.bind(this));

			this._textWindow = new Window_JournalText();
			this.addWindow(this._textWindow);
	
		};
		
		// -----------------------------------------------------

		var openJournal = function() {
			SceneManager.push(Scene_Journal);
		};
		
		var hasEntry = function(entry) {
			
			for (var i = 0; i < $Journal._entry.length; i++ ) {
				if ($Journal._id[i] == args[1]) {
					return true;
				}
			}
			
			return false;
		};
		
		// -----------------------------------------------------
		
	(function() {
		
		if (parameters['Menu Command'] == 'true') {
			
			var MenuCommandAlias = Window_MenuCommand.prototype.addMainCommands;
			var SceneMenuAlias = Scene_Menu.prototype.createCommandWindow;
			
			Window_MenuCommand.prototype.addMainCommands = function() {
				var enabled = this.areMainCommandsEnabled();
				MenuCommandAlias.call(this);
				this.addCommand("Journal", 'journal', enabled);
			};
			
			Scene_Menu.prototype.createCommandWindow = function() {
				SceneMenuAlias.call(this);
				this._commandWindow.setHandler('journal',      openJournal.bind(this));
			}
			
		}
		
		// -----------------------------------------------------
		
		var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
		
			Game_Interpreter.prototype.pluginCommand = function(command, args) {
				
				_Game_Interpreter_pluginCommand.call(this, command, args);
				
				if (command === 'Journal') {
					switch (args[0]) {
						case 'show':
							openJournal();
						break;
						case 'add':
						case 'entry': // add [category] [id] [image] [title] [text]
						
							var category 	= parseInt(args[1]);
							var id 			= args[2];
							var image 		= args[3];
							
							var k 			= 4;
							
							var title 		= parseText(args[k]);
							k = k + 1;
							var text 		= parseText(args[k]);
							for (i = k + 1; i < args.length; i++) {
								text += " " + parseText(args[i]);
							}
							
							var b = new Entry();
							
							b._id = id;
							b._title = title;
							b._text = text;
							b._read = false;
							b._image = image;
							
							if (category < $Journal._entry_category.length) {
								$Journal._entry_category[category]._entries.push(b);
								$Journal._entry_category[category]._entries.sort(function(a, b) {
									return (a._title > b._title);
								});
							};
							
						break;
						case 'update': // update [type] [category] [id] [value]
						
							// update text 0 1
							var type = args[1]; // title, text, image
							
							var category 	= parseInt(args[2]);
							var id 			= args[3];
							var value 		= parseText(args[4]);
							
							for (var i = 5; i < args.length; i++) {
								value += " " + parseText(args[i]);
							}
							
							for (var i = 0; i < $Journal._entry_category[category]._entries.length; i++) {
								if ($Journal._entry_category[category]._entries[i]._id == id) {
									if (type == 'text') {
										$Journal._entry_category[category]._entries[i]._text = value;
									} else if (type == 'title')  {
										$Journal._entry_category[category]._entries[i]._title = value;

									} else if (type == 'image') {
										$Journal._entry_category[category]._entries[i]._image = value;										
									}							
								}
							}
						
						break;
						case 'append':// append [type] [category] [id] [value]
						
							// update text 0 1
							var type = args[1]; // title, text, image
							
							var category 	= parseInt(args[2]);
							var id 			= args[3];
							var value 		= parseText(args[4]);
							
							for (var i = 5; i < args.length; i++) {
								value += " " + parseText(args[i]);
							}
							
							for (var i = 0; i < $Journal._entry_category[category]._entries.length; i++) {
								if ($Journal._entry_category[category]._entries[i]._id == id) {
									if (type == 'text') {
										$Journal._entry_category[category]._entries[i]._text += value;
									} else if (type == 'title')  {
										$Journal._entry_category[category]._entries[i]._title += value;
									}					
								}
							}
						break;
						case 'exists': // exists [category] [id]
							var category 	= parseInt(args[1]);
							var id 			= args[2];
							var found		= 0;
							var variable_id = parseInt(parameters['Entry Exists Variable']);
							
							if (variable_id >= 1) {
								
								for (var i = 0; i < $Journal._entry_category[category]._entries.length; i++) {
									if ($Journal._entry_category[category]._entries[i]._id == id) {
										found = 1;
										break;
									}
								}
							
								$gameVariables.setValue(variable_id, found);
							}
							
						break;
						case 'delete':// delete [category] [id]
						case 'remove':// remove [category] [id]
							var category 	= parseInt(args[1]);
							var id 			= args[2];
							
						
							for (var i = 0; i < $Journal._entry_category[category]._entries.length; i++) {
								if ($Journal._entry_category[category]._entries[i]._id == id) {
									$Journal._entry_category[category]._entries.splice(i,1);
									break;
								}
							}
							
							if (category < $Journal._entry_category.length) {
								$Journal._entry_category[category]._entries.sort(function(a, b) {
									return (a._title > b._title);
								});
							};
							
						break;
					}
				}
			}
    
  
  
  })();  // dont touch this.
  
  