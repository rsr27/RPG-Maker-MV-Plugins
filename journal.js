//=============================================================================
// Journal
// by rsr27
// Date: 11/26/2017
// v1.0
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
 * Journal add [id] [title] [text]
 * --------------------------------------------------------------------------------
 * Adds a journal entry with the supplied parameters. Use underscores "_" to be
 * replaced with spaces.
 *
 * Example(s):
 * Journal entry tutorial Journal_Tutorial This_is_a_journal_example.
 * --------------------------------------------------------------------------------
 * ================================================================================
 *
 * ================================================================================
 * Journal update [id] [title] [text]
 * --------------------------------------------------------------------------------
 * Updates a journal entry with the new values. Currently they overwrite. Future
 * updates will make a parameter of "_" be ignored.
 *
 * Example(s):
 * Journal update tutorial Journal_Tutorial_2 This_is_a_journal_example.[n][n]Text.
 * --------------------------------------------------------------------------------
 * ================================================================================
 *
 * ================================================================================
 * Journal append [id] [text]
 * --------------------------------------------------------------------------------
 * Adds the text to the specified journal entry.
 *
 * Example(s):
 * Journal append tutorial [n][n]More_text.
 * --------------------------------------------------------------------------------
 * ================================================================================
 *
 * ================================================================================
 * Escape sequences:
 * --------------------------------------------------------------------------------
 * [n] = New Line
 * --------------------------------------------------------------------------------
 * ================================================================================
 *
 */
 
	(function() {
		
		// Create our global object.
		$Journal = new Object(null);
		
		$Journal._display_entry = 0;
		
		$Journal._id = [];
		$Journal._title = [];
		$Journal._entry = [];
		
		var parameters = PluginManager.parameters('journal');
		
		var parseText = function(text) {
			text = text.split("[n]").join("\n");
			text = text.replace(new RegExp("_", "g"), " ");
			
			// TODO: Replace game variables
			text = text.split("\\V[2]").join($gameVariables.value(2));
			
			return text;
		};
		
		// -----------------------------------------------------
		
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
		
		function Window_JournalOption() {
			this.initialize.apply(this, arguments);
		}
		Window_JournalOption.prototype = Object.create(Window_Selectable.prototype);
		Window_JournalOption.prototype.constructor = Window_JournalOption;

		Window_JournalOption.prototype.initialize = function() {
			Window_Selectable.prototype.initialize.call(this, 0, this.fittingHeight(1), 316, Graphics.boxHeight - this.fittingHeight(1));
			this.refresh();
			this.select(0);
			this.activate();
		};

		Window_JournalOption.prototype.maxItems = function() {
			return $Journal._entry.length;
		};

		Window_JournalOption.prototype.maxCols = function() {
			return 1;
		};

		Window_JournalOption.prototype.changeOption = function() {
			$Journal._display_entry = this._index;
		};

		Window_JournalOption.prototype.refresh = function() {
			
			this.contents.clear();
			
			for (var i = 0; i < this.maxItems(); i++ ) {
				var rectangle = this.itemRectForText(i);
				this.drawText($Journal._title[i], rectangle.x, rectangle.y, rectangle.width, "center");
			}
							
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
			this.changeTextColor(this.systemColor());
			this.drawText(parameters['Title'], 0, 0, Graphics.boxWidth, "center");
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
			Window_Base.prototype.initialize.call(this, 316, this.fittingHeight(1), 500, Graphics.boxHeight - this.fittingHeight(1));
			this.refresh();
		};

		Window_JournalText.prototype.refresh = function() {
			this.contents.clear();
			
			if ($Journal._entry.length > 0 && $Journal._display_entry >= 0 && $Journal._display_entry < $Journal._entry.length) {
				
				var text_array = $Journal._entry[$Journal._display_entry].split("\n");
				
				for (var i = 0; i < text_array.length; i++ ) {
					this.drawText(text_array[i], 0, i * (this.fittingHeight(1) / 2), Graphics.boxWidth, "left");
				}
				
				
				
			};
		};
		
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
			$Journal._display_entry = this._sidebarWindow._index;
			this._sidebarWindow.activate();
			this._textWindow.refresh();
		};
		
		Scene_Journal.prototype.create = function() {
			Scene_MenuBase.prototype.create.call(this);

			this._titleWindow = new Window_JournalTitle();
			this.addWindow(this._titleWindow);
			
			this._sidebarWindow = new Window_JournalOption();
			this.addWindow(this._sidebarWindow);
			this._sidebarWindow.setHandler('cancel', this.popScene.bind(this));
			this._sidebarWindow.setHandler('ok', this.onCategoryOk.bind(this));

			this._textWindow = new Window_JournalText();
			this.addWindow(this._textWindow);
	
		};
		
		// -----------------------------------------------------

		var openJournal = function() {
			SceneManager.push(Scene_Journal);
		};
		
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
						case 'entry':
							args[2] = parseText(args[2]);
							args[3] = parseText(args[3]);
							
							$Journal._id.push(args[1]);
							$Journal._title.push(args[2]);
							$Journal._entry.push(args[3]);
						break;
						case 'update':
							args[2] = parseText(args[2]);
							args[3] = parseText(args[3]);
						
							for (var i = 0; i < $Journal._entry.length; i++ ) {
								if ($Journal._id[i] == args[1]) {
									$Journal._title[i] = args[2];
									$Journal._entry[i] = args[3];
									break;
								}
							}
						break;
						case 'append':
							args[2] = parseText(args[2]);
						
							for (var i = 0; i < $Journal._entry.length; i++ ) {
								if ($Journal._id[i] == args[1]) {
									$Journal._entry[i] += args[2];
									break;
								}
							}
						break;
					}
				}
			}
    
  
  
  })();  // dont touch this.
  
  