//=============================================================================
// onEquipEvent
// by Anonymous
// Date: 7/27/2017

//=============================================================================
 

/*:
 * @plugindesc Triggers a common event when an item is equipped or removed. 
 * @author Anonymous
 *
 * @param equipEventId
 * @desc The common event to be called when an item is equipped
 * @default 0
 *
 * @param unEquipEventId
 * @desc The common event to be called when an item is unequipped
 * @default 0
 */
 
		   
 // Declare your function

 
// 1.  change *** to your plug ins file name below.
// You are telling RPG maker that this plugin exsists.
	(function() {
		var parameters = PluginManager.parameters('onEquipEvent');

		var _Change_Equip = Game_Actor.prototype.changeEquip;
		
  
		Game_Actor.prototype.changeEquip = function(slotId, item) { 
	
			var nCommonEventId = 0;
			
			if (item == null) {
				nCommonEventId = parseInt(parameters['unEquipEventId']);
			}
			else {
				nCommonEventId = parseInt(parameters['equipEventId']);
			}
			
			_Change_Equip.call(this, slotId, item);  
			$gameTemp.reserveCommonEvent(nCommonEventId);
			
			
  }
  
  
  
  
  
  })();  // dont touch this.
  
  