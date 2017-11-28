//=============================================================================
// RandomShowText
// by rsr27
// Date: 11/4/2017
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
 * @plugindesc Allows you to build a list of "Show Text..." commands, one of
 * which will be randomly displayed.
 *
 * @author rsr27
 *
 * @help Plugin commands:
 *
 * RandomShowText clear
 * --------------------------------------------------------------------------------
 * Clears the list of messages. Use before initializing a new set of messages to
 * prevent the script from displaying old messages.
 *
 * RandomShowText new [imageName] [faceSlot] [backgroundType] [position] [text]
 * --------------------------------------------------------------------------------
 * This adds the message to the list. [imageName] is the image of the actor's face.
 * Using a semicolon for the [imageName] will use no face. [faceSlot] is the index 
 * of the face (0-7), [backgroundType] is the type of background (0-transparent, 
 * 1-dim, 2-solid), [position] is the position of the text (0-top, 1-middle, 2-bot), 
 * and the [text] is the text of the entry. 
 *
 * RandomShowText append [text]
 * --------------------------------------------------------------------------------
 * Adds [text] to the previous message entry. Useful for when the text might be too
 * long for the PluginCommand function.
 *
 * RandomShowText display
 * --------------------------------------------------------------------------------
 * Displays a random message from the list. After displaying the messages the list
 * is cleared.
 *
 * Example:
 * Plugin Command : RandomShowText clear
 * Plugin Command : RandomShowText new "Actor1" 1 0 2 "Hi, I'm Elise!"
 * Plugin Command : RandomShowText new "Actor1" 1 0 2 "Hi, my name is Elise!"
 * Plugin Command : RandomShowText display
 *
 */
 
	(function() {
		
		// Create our global object.
		$randomMessageList = new Object(null);
		$randomMessageList.text = [];
		$randomMessageList.face = [];
		$randomMessageList.slot = [];
		$randomMessageList.bg = [];
		$randomMessageList.pos = [];
		
		
		var parameters = PluginManager.parameters('RandomShowText');

		var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
		
			Game_Interpreter.prototype.pluginCommand = function(command, args) {
				
				_Game_Interpreter_pluginCommand.call(this, command, args);
				
				if (command === 'RandomShowText') {
					switch (args[0]) {
						case 'new':
							
							for (var i = 2; i <= 4; i++ ) {
								args[i] = parseInt(args[i]);
							}
							
							args[5] = args[5].split("[n]").join("\n");
							args[5] = args[5].replace(new RegExp("_", "g"), " ");
		
							$randomMessageList.face.push(args[1]);
							$randomMessageList.slot.push(args[2]);
							$randomMessageList.bg.push(args[3]);
							$randomMessageList.pos.push(args[4]);
							$randomMessageList.text.push(args[5]);
							
						break;
						case 'append':
							args[1] = args[1].split("[n]").join("\n");
							args[1] = args[1].replace(new RegExp("_", "g"), " ");
							$randomMessageList.text[$randomMessageList.text.length - 1] += args[1];
							
						case 'clear':
							$randomMessageList.face = [];
							$randomMessageList.slot = [];
							$randomMessageList.bg = [];
							$randomMessageList.pos = [];
							$randomMessageList.text = [];
						break;
						case 'display':
							
							var index = Math.floor((Math.random() * $randomMessageList.text.length));
													
							if ($randomMessageList.face[index] != ":") {
								$gameMessage.setFaceImage($randomMessageList.face[index],$randomMessageList.slot[index]);
							}
							else {
								$gameMessage.setFaceImage("", 0);
							}
							
							$gameMessage.setBackground($randomMessageList.bg[index]);
							$gameMessage.setPositionType($randomMessageList.pos[index]);
							$gameMessage.add($randomMessageList.text[index]);
							this.setWaitMode('message');
					
							$randomMessageList.face = [];
							$randomMessageList.slot = [];
							$randomMessageList.bg = [];
							$randomMessageList.pos = [];
							$randomMessageList.text = [];
							
						break;
					}
				}
			}
    
  
  
  })();  // dont touch this.
  
  