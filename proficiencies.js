//=============================================================================
// Proficiencies
// by rsr27
// Date: 1/1/2018
// v1.0
//
// Changelog:
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
 * @plugindesc A
 *
 * @author rsr27
 *
 * @param Title
 * @desc The title of the journal.
 * @default Proficiencies
 *
 * @param Menu Command
 * @desc If true, add a command on the main menu next to formations.
 * @default true
 *
 * @param Actors
 * @desc Tells how many actors have proficiencies
 * @default 25
 *
 * @help Plugin commands:
 *
 */
		function ProficiencyEntry () {
			this._name = "???";
			this._id = 0;
			this._desc = "";
			this._var = 0;
			this._use_switch = 0;
			this._max = 10;
			this._req_var = 0;
			this._price = [];
			
			this.getValue = function() {
				return $gameVariables.value(this._var);
			};
			
			this.raiseValue = function(add) {
				$gameVariables.setValue(this._var, $gameVariables.value(this._var) + add);
			};
		}
		
		function ProficiencyTable () {
			this._entries = [];
			this._points = 0;
		}
		
		$ProficienciesData = new Object();
		$ProficienciesData.actorList = [];
		$ProficienciesData.actorProfTable = [];
		$ProficienciesData.profList = [];
		$ProficienciesData.selectedActor = -1;
		$ProficienciesData.currentTitle = "WAT";
		$ProficienciesData.currentDescription = "WAT";
		$ProficienciesData.currentActor = -1;
		$ProficienciesData.currentEntry = -1;
		$ProficienciesData.currentSpentPoints = 0;
		$ProficienciesData.currentSpentLevels = 0;
		
		
		var parameters = PluginManager.parameters('proficiencies');
		var k = parseInt(parameters['Actors']);
		
		for (var j = 0; j < k; j++) { 
			var p = new ProficiencyTable();
			p._entries = [];
			$ProficienciesData.actorProfTable.push(p);
		};
		
		
		// -----------------------------------------------------
		
		function Window_ProficienciesTitle() {
			this.initialize.apply(this, arguments);
		}
		
		Window_ProficienciesTitle.prototype = Object.create(Window_Base.prototype);
		Window_ProficienciesTitle.prototype.constructor = Window_ProficienciesTitle;

		Window_ProficienciesTitle.prototype.initialize = function() {
			Window_Base.prototype.initialize.call(this, 0, 0, Graphics.boxWidth, this.fittingHeight(1));
			this.refresh();
		};

		Window_ProficienciesTitle.prototype.refresh = function() {
			var parameters = PluginManager.parameters('proficiencies');
			this.contents.clear();
			var text = this.convertEscapeCharacters(parameters['Title']);
			var w = this.textWidth(text);
			this.drawTextEx(text, (Graphics.boxWidth/2) - (w/2), 0);
			//this.drawTextEx("\\N[16]" + this.convertEscapeCharacters(parameters['Title']), 0, 0, Graphics.boxWidth, "center");
		};
  
		// -----------------------------------------------------
		
		function Window_ProficienciesConfirm() {
			this.initialize.apply(this, arguments);
		}
		
		Window_ProficienciesConfirm.prototype = Object.create(Window_Selectable.prototype);
		Window_ProficienciesConfirm.prototype.constructor = Window_ProficienciesConfirm;

		Window_ProficienciesConfirm.prototype.isOptionEnabled = function(i) {
			
			var index = i;
			
			if ($ProficienciesData.currentActor <= -1 || $ProficienciesData.currentEntry <= -1) {
				return false;
			};
			// +1
			if (index == 0) {
				
				var activeProfData = $ProficienciesData.actorProfTable[$ProficienciesData.currentActor]._entries[$ProficienciesData.currentEntry];
				var currentCost = 1;
				
				if (activeProfData.getValue() + $ProficienciesData.currentSpentLevels >= activeProfData._max) {
					return false;
				}
				
				if (activeProfData._price.length > 0) {
					currentCost = activeProfData._price[activeProfData.getValue() + 1];
				}
			
				if (currentCost > $ProficienciesData.actorProfTable[$ProficienciesData.currentActor]._points - $ProficienciesData.currentSpentPoints) {
					return false;
				}
			
			}
			else if (index == 1) {
				if ($ProficienciesData.currentSpentPoints <= 0) {
					return false;
				}
			}
			else if (index == 2) {
				if ($ProficienciesData.currentSpentPoints <= 0) {
					return false;
				}
			};
			
			return true;
		};
		
		Window_ProficienciesConfirm.prototype.isCurrentItemEnabled = function() {
			return this.isOptionEnabled(this._index);
		};

		Window_ProficienciesConfirm.prototype.initialize = function() {
			var y = this.fittingHeight(1);
			Window_Selectable.prototype.initialize.call(this, 316, Graphics.boxHeight - y, Graphics.boxWidth - 316, this.fittingHeight(1));
			this.refresh();
			this.select(0);
		};

		Window_ProficienciesConfirm.prototype.maxItems = function() {
			return 4;
		};

		Window_ProficienciesConfirm.prototype.selectItem = function() {
			
		};
		
		Window_ProficienciesConfirm.prototype.maxCols = function() {
			return 4;
		};
		
		Window_ProficienciesConfirm.prototype.refresh = function() {
			
			this.contents.clear();
			this.resetTextColor();
						
			if (!this.isOptionEnabled(0)) this.changeTextColor(this.textColor(7));
			var rectangle = this.itemRectForText(0);
			this.drawText("+1", rectangle.x, rectangle.y, rectangle.width, "center");
			this.resetTextColor();
			
			if (!this.isOptionEnabled(1)) this.changeTextColor(this.textColor(7));
			var rectangle = this.itemRectForText(1);
			this.drawText("-1", rectangle.x, rectangle.y, rectangle.width, "center");
			this.resetTextColor();
			
			if (!this.isOptionEnabled(2)) this.changeTextColor(this.textColor(7));
			var rectangle = this.itemRectForText(2);
			this.drawText("Confirm", rectangle.x, rectangle.y, rectangle.width, "center");
			this.resetTextColor();
			
			if (!this.isOptionEnabled(3)) this.changeTextColor(this.textColor(7));
			var rectangle = this.itemRectForText(3);
			this.drawText("Cancel", rectangle.x, rectangle.y, rectangle.width, "center");
			this.resetTextColor();
		}
		
		// -----------------------------------------------------
		
		
		function Window_ProficienciesActor() {
			this.initialize.apply(this, arguments);
		}
		
		Window_ProficienciesActor.prototype = Object.create(Window_Selectable.prototype);
		Window_ProficienciesActor.prototype.constructor = Window_ProficienciesActor;

		Window_ProficienciesActor.prototype.initialize = function() {
			var y = this.fittingHeight(1);
			Window_Selectable.prototype.initialize.call(this, 0, y, Graphics.boxWidth, this.fittingHeight(1));
			this.refresh();
			this.select(0);
		};

		Window_ProficienciesActor.prototype.maxItems = function() {
			return $ProficienciesData.actorList.length;
		};

		Window_ProficienciesActor.prototype.selectItem = function() {
			
		};
		
		Window_ProficienciesActor.prototype.maxCols = function() {
			return $ProficienciesData.actorList.length;
		};
		
		Window_ProficienciesActor.prototype.refresh = function() {
			
			this.contents.clear();
			
			for (var i = 0; i < this.maxItems(); i++ ) {
				var rectangle = this.itemRectForText(i);
				var text = $gameActors.actor($ProficienciesData.actorList[i])._name;
				this.drawText(text, rectangle.x, rectangle.y, rectangle.width, "center");
				
			};
		}
		
		// -----------------------------------------------------
		
		function Window_ProficienciesSelect() {
			this.initialize.apply(this, arguments);
		}
		Window_ProficienciesSelect.prototype = Object.create(Window_Selectable.prototype);
		Window_ProficienciesSelect.prototype.constructor = Window_ProficienciesSelect;

		Window_ProficienciesSelect.prototype.initialize = function() {
			var y = this.fittingHeight(1) * 2;
			Window_Selectable.prototype.initialize.call(this, 0, y, 316, Graphics.boxHeight - y);
			this.refresh();
			this.select(0);
		};

		Window_ProficienciesSelect.prototype.maxItems = function() {
			
			if ($ProficienciesData.selectedActor >= 1) {
				return $ProficienciesData.actorProfTable[$ProficienciesData.selectedActor - 1]._entries.length;
			}
			
			return 1;
		};

		Window_ProficienciesSelect.prototype.maxCols = function() {
			return 2;
		};

		Window_ProficienciesSelect.prototype.refresh = function() {
			
			this.contents.clear();
			
			if ($ProficienciesData.selectedActor >= 1) {
				for (var i = 0; i < this.maxItems(); i++ ) {
					var rectangle = this.itemRectForText(i);
					var text = $ProficienciesData.actorProfTable[$ProficienciesData.selectedActor - 1]._entries[i]._name;
					
					if ($ProficienciesData.actorProfTable[$ProficienciesData.selectedActor - 1]._entries[i]._req > 0) {
						text = "???";
					};
					
					this.drawText(text, rectangle.x, rectangle.y, rectangle.width, "center");
				}
			}
							
		};
		
		// -----------------------------------------------------
		function Window_ProficienciesPoints() {
			this.initialize.apply(this, arguments);
		}
		
		Window_ProficienciesPoints.prototype = Object.create(Window_Base.prototype);
		Window_ProficienciesPoints.prototype.constructor = Window_ProficienciesPoints;

		Window_ProficienciesPoints.prototype.initialize = function() {
			var y = this.fittingHeight(1) * 2;
			Window_Base.prototype.initialize.call(this, 316, Graphics.boxHeight - y, TEXT_AREA_WIDTH, this.fittingHeight(1));
			this.refresh();
		};

		Window_ProficienciesPoints.prototype.refresh = function() {
			
			this.contents.clear();
			
			if ($ProficienciesData.selectedActor >= 1) {
				var text = $gameActors.actor($ProficienciesData.selectedActor)._name;
				
				if (text[text.length - 1] == 's') {
					text += "'"
				}
				else {
					text += "'s"
				};
				
				var points = $ProficienciesData.actorProfTable[$ProficienciesData.selectedActor - 1]._points;
				points -= $ProficienciesData.currentSpentPoints;
				this.drawText(text + " Points: " + points, 0, 0, this.width, "left");
				
			}
		
		};
		
		// -----------------------------------------------------
		function Window_ProficienciesText() {
			this.initialize.apply(this, arguments);
		}
		
		Window_ProficienciesText.prototype = Object.create(Window_Base.prototype);
		Window_ProficienciesText.prototype.constructor = Window_ProficienciesText;

		Window_ProficienciesText.prototype.initialize = function() {
			var y = this.fittingHeight(1) * 2;
			Window_Base.prototype.initialize.call(this, 316, y, TEXT_AREA_WIDTH, Graphics.boxHeight - y - (this.fittingHeight(1) * 2));
			this.refresh();
		};

		Window_ProficienciesText.prototype.refresh = function() {
			
			this.contents.clear();
			
			var title = $ProficienciesData.currentTitle;
			var text = $ProficienciesData.currentDescription;
			var actor = $ProficienciesData.currentActor;
			var entry = $ProficienciesData.currentEntry;
			
			if (actor <= -1 || entry <= -1) {
				return;
			}
			
			var y = 0;
			
			var text_array = text.split("\n");
			
			var val = $ProficienciesData.actorProfTable[actor]._entries[entry].getValue();
			var max = $ProficienciesData.actorProfTable[actor]._entries[entry]._max;
			
			if ($ProficienciesData.currentSpentLevels > 0) {
				val = val + " (+" + $ProficienciesData.currentSpentLevels + ")";
			}
		
			this.changeTextColor(this.systemColor());	
			this.drawTextEx(this.convertEscapeCharacters(title) + ": " + val + " / " + max, 0, y, Graphics.boxWidth, "left");
			
			this.resetTextColor();
			for (var i = 0; i < text_array.length; i++) {
				this.drawTextEx(text_array[i], 0, (i + 1) * (this.fittingHeight(1) / 2) + y, Graphics.boxWidth, "left");
			}
		};
		
		Window_ProficienciesText.prototype.measureText = function(text) {
			return this.textWidth(text);
		}
		
		// -----------------------------------------------------
		function Scene_Proficiencies() {
			this.initialize.apply(this, arguments);
		}
		

		Scene_Proficiencies.prototype = Object.create(Scene_MenuBase.prototype);
		Scene_Proficiencies.prototype.constructor = Scene_Proficiencies;

		Scene_Proficiencies.prototype.initialize = function() {
			Scene_MenuBase.prototype.initialize.call(this);
		};
		
		Scene_Proficiencies.prototype.selectActor = function() {
			$ProficienciesData.selectedActor = $ProficienciesData.actorList[this._actorWindow._index];
			this._selectWindow.activate();
			this._selectWindow.refresh();
			this._pointWindow.refresh();
			this._actorWindow.deactivate();
		}
		
		Scene_Proficiencies.prototype.backFromProf = function() {
			$ProficienciesData.selectedActor = -1;
			this._textWindow.refresh();
			this._pointWindow.refresh();
			this._selectWindow.refresh();
			this._selectWindow.deactivate();
			this._actorWindow.activate();
		}
		
		Scene_Proficiencies.prototype.backFromConfirm = function() {
			$ProficienciesData.currentEntry = -1;
			this._textWindow.refresh();
			this._pointWindow.refresh();
			this._confirmWindow.refresh();
			this._confirmWindow.deactivate();
			this._selectWindow.activate();
		}
		
		Scene_Proficiencies.prototype.selectProf = function() {

			var _actor = $ProficienciesData.selectedActor - 1;
			
			$ProficienciesData.currentDescription = $ProficienciesData.actorProfTable[_actor]._entries[this._selectWindow._index]._desc;
			$ProficienciesData.currentTitle = $ProficienciesData.actorProfTable[_actor]._entries[this._selectWindow._index]._name;
			$ProficienciesData.currentActor = _actor;
			$ProficienciesData.currentEntry = this._selectWindow._index;
			
			var src_text = $ProficienciesData.currentDescription;
			var formatted_text = "";
			var last_space = 0;
			var last_start = 0;
			
			src_text = this._textWindow.convertEscapeCharacters(src_text);
			
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
			
			$ProficienciesData.currentDescription = formatted_text;
			
			this._pointWindow.refresh();
			this._textWindow.refresh();
			this._confirmWindow.refresh();
			
			this._confirmWindow.activate();
		}
		
		Scene_Proficiencies.prototype.selectConfirm = function() {
			
			var index = this._confirmWindow._index;
			
			var activeProfData = $ProficienciesData.actorProfTable[$ProficienciesData.currentActor]._entries[$ProficienciesData.currentEntry];
			
			switch (index) {
				case 0: // +1
					if (activeProfData.getValue() + $ProficienciesData.currentSpentLevels < activeProfData._max) {
						
						var currentCost = 1;
						if (activeProfData._price.length > 0) {
							currentCost = activeProfData._price[activeProfData.getValue() + $ProficienciesData.currentSpentLevels];
						}
						
						$ProficienciesData.currentSpentLevels += 1;
						$ProficienciesData.currentSpentPoints += currentCost;
					}
				
					this._textWindow.refresh();
					this._pointWindow.refresh();
					this._confirmWindow.activate();
				break;
				case 1: // -1
					if ($ProficienciesData.currentSpentLevels >= 1) {
						var currentCost = 1;
						if (activeProfData._price.length > 0) {
							currentCost = activeProfData._price[activeProfData.getValue() + $ProficienciesData.currentSpentLevels - 1];
						}
						
						$ProficienciesData.currentSpentLevels -= 1;
						$ProficienciesData.currentSpentPoints -= currentCost;
					};
					
					this._textWindow.refresh();
					this._pointWindow.refresh();
					this._confirmWindow.activate();
				break;
				case 2: // Confirm
					var a = $ProficienciesData.currentActor;
					var e = $ProficienciesData.currentEntry;
					
					$ProficienciesData.actorProfTable[a]._entries[e].raiseValue($ProficienciesData.currentSpentLevels);
					$ProficienciesData.actorProfTable[a]._points -= $ProficienciesData.currentSpentPoints;

					$ProficienciesData.currentSpentPoints = 0;
					$ProficienciesData.currentSpentLevels = 0;
					
					this._textWindow.refresh();
					this._pointWindow.refresh();
					this._confirmWindow.activate();
				break;
				case 3: // Cancel
					$ProficienciesData.currentSpentPoints = 0;
					$ProficienciesData.currentSpentLevels = 0;
					$ProficienciesData.currentEntry = -1;
					this._pointWindow.refresh();
					this._textWindow.refresh();
					this._confirmWindow.deactivate();
					this._selectWindow.activate();
				break;
				
			};
			
			this._confirmWindow.refresh();
			//._price
			
		};
		
		Scene_Proficiencies.prototype.create = function() {
			Scene_MenuBase.prototype.create.call(this);

			this._titleWindow = new Window_ProficienciesTitle();
			this.addWindow(this._titleWindow);
			
			this._actorWindow = new Window_ProficienciesActor();
			this.addWindow(this._actorWindow);
			
			this._selectWindow = new Window_ProficienciesSelect();
			this.addWindow(this._selectWindow);
			
			this._textWindow = new Window_ProficienciesText();
			this.addWindow(this._textWindow);
			
			this._confirmWindow = new Window_ProficienciesConfirm();
			this.addWindow(this._confirmWindow);
			
			this._pointWindow = new Window_ProficienciesPoints();
			this.addWindow(this._pointWindow);

			this._confirmWindow.setHandler('ok', this.selectConfirm.bind(this));
			this._confirmWindow.setHandler('cancel', this.backFromConfirm.bind(this));
			
			this._selectWindow.setHandler('ok', this.selectProf.bind(this));
			this._selectWindow.setHandler('cancel', this.backFromProf.bind(this));
			
			this._actorWindow.setHandler('ok', this.selectActor.bind(this));
			this._actorWindow.setHandler('cancel', this.popScene.bind(this));
			this._actorWindow.activate();
		};
		
		// -----------------------------------------------------

		var openProficiencies = function() {
			
			$ProficienciesData.actorList = [];
				
			for (var i = 0; i < $gameParty.members().length; i++) {
				var actorId = $gameParty.members()[i]._actorId;
				if ($dataActors[actorId].meta.no_profs == undefined) {
					$ProficienciesData.actorList.push(actorId);
				}
				
			}
			
			SceneManager.push(Scene_Proficiencies);
		};
		
	// -----------------------------------------------------
		
		var parseText = function(text) {
			text = text.split("[n]").join("\n");
			text = text.replace(new RegExp("_", "g"), " ");
			return text;
		};
		
		
	(function() {
		

		// -----------------------------------------------------
		
		var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
		
			Game_Interpreter.prototype.pluginCommand = function(command, args) {
				
				_Game_Interpreter_pluginCommand.call(this, command, args);
				
				if (command === 'Proficiencies') {
					switch (args[0]) {
						case 'addpoints':
							_actor = parseInt(args[1]) - 1;
							_amount = parseInt(args[2]);
							$ProficienciesData.actorProfTable[_actor]._points += _amount;
						break;
						case 'subpoints':
							_actor = parseInt(args[1]) - 1;
							_amount = parseInt(args[2]);
							$ProficienciesData.actorProfTable[_actor]._points -= _amount;
							if ($ProficienciesData.actorProfTable[_actor]._points < 0) {
								$ProficienciesData.actorProfTable[_actor]._points = 0;
							}
						break;
						case 'show':
							openProficiencies();
						break;
						case 'add': // actor variable switch once 
							_actor = parseInt(args[1]) - 1;
							_variable = parseInt(args[2]);
							_switch = parseInt(args[3]);
							_max = parseInt(args[4]);
							_req  = parseInt(args[5]);
							_title = parseText(args[6]);
							
							var _value 		= parseText(args[7]);
							
							for (var i = 8; i < args.length; i++) {
								_value += " " + parseText(args[i]);
							}
							
							if (_actor < $ProficienciesData.actorProfTable.length && _actor > 0) {
							  var newProf = new ProficiencyEntry();
							  newProf._name = _title;
							  newProf._var = _variable;
							  newProf._desc = _value;
							  newProf._price = [1,2,3,4,5,6,7,8,9,10];
							  
							  // TODO: Other attribs
							  
							  $ProficienciesData.actorProfTable[_actor]._entries.push(newProf);
							}
							
							
							
						 
						
						break;
					}
				}
			}
		
	})();  // dont touch this.
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  