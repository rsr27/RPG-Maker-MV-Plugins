//=============================================================================
// DecimalCurrency
// by rsr27
// Date: 7/27/2017
//
// License: 
// https://creativecommons.org/licenses/by-nc-nd/3.0/
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
//=============================================================================
 
/*:
 * @plugindesc Changes the currency to a dollar and cents one.
 * @author rsr27
 *
 */
 
	(function() {
		var parameters = PluginManager.parameters('DecimalCurrency');
		
		var digitgroup = function(value) {
			return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
		};
		
		var toDollarCurrency = function(value) {
			
			var dollars = parseInt(value / 100);
			var cents = parseInt(value - (dollars * 100));
			
			if (cents < 9) {
				cents = "0" + cents;
			}
			
			var newval = digitgroup(dollars.toString()) + "." + cents;
			
			return newval;
		}

		Window_Base.prototype.drawCurrencyValue = function(value, unit, x, y, width) {
			var currencyText = toDollarCurrency(value);
			var textWidth = this.textWidth(currencyText);
			var unitWidth = Math.min(80, this.textWidth(unit));
			
			this.changeTextColor(this.systemColor());
			this.drawText(unit, x - textWidth + unitWidth, y, width - unitWidth - 6, 'right');
			
			this.resetTextColor();	
			this.drawText(currencyText, x + unitWidth, y, width - unitWidth - 6, 'right');
		};
		
		
		Window_ShopBuy.prototype.drawItem = function(index) {
			var item = this._data[index];
			var rect = this.itemRect(index);
			var unit = TextManager.currencyUnit;
			var currencyText = toDollarCurrency(this.price(item));
			var textWidth = this.textWidth(currencyText);
			
			var priceWidth = 96;
			rect.width -= this.textPadding();
			this.changePaintOpacity(this.isEnabled(item));
			this.drawItemName(item, rect.x, rect.y, rect.width - priceWidth);
			
			this.changeTextColor(this.systemColor());
			this.drawText(unit, rect.x + rect.width - priceWidth - textWidth, rect.y, priceWidth, 'right');
			
			this.resetTextColor();	
			this.drawText(currencyText, rect.x + rect.width - priceWidth, rect.y, priceWidth, 'right')
			
			this.changePaintOpacity(true);
		};

  
  
  })();  // dont touch this.
  
  