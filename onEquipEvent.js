//=============================================================================
// onEquipEvent
// by rsr27
// Date: 7/27/2017
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
 * @plugindesc Triggers a common event when an item is equipped or removed. 
 * @author rsr27
 *
 * @param equipEventId
 * @desc The common event to be called when an item is equipped
 * @default 0
 *
 */
 
	(function() 
	{
		var parameters = PluginManager.parameters('onEquipEvent');

		var _Change_Equip = Game_Actor.prototype.changeEquip;
		
		Game_Actor.prototype.changeEquip = function(slotId, item) { 
			var nCommonEventId = parseInt(parameters['equipEventId']);
			_Change_Equip.call(this, slotId, item);  
			$gameTemp.reserveCommonEvent(nCommonEventId);	
		}
	}
	)();  // dont touch this.
  
  