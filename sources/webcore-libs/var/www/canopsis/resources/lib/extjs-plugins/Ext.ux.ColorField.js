// Author: slammer  
// http://www.sencha.com/forum/showthread.php?140793-Simple-Ext.ux.ColorField-plugin

//Modified by Capensis: Add colors and fix '#'

Ext.define('Ext.ux.ColorField', {
    extend: 'Ext.form.field.Trigger',
    alias: 'widget.colorfield',    
    requires: ['Ext.form.field.VTypes', 'Ext.layout.component.field.Text'],

    lengthText: "Color hex values must be either 3 or 6 characters.",
    blankText: "Must have a hexidecimal value in the format ABCDEF.",
    
    regex: /^[0-9a-f]{3,6}$/i,

    colors: undefined,

    validateValue : function(value){
	if (this.allowBlank && !value)
        {
            return true
        }

        if(!this.getEl()) {
            return true;
        }
        if(value.length!=3 && value.length!=6) {
            this.markInvalid(Ext.String.format(this.lengthText, value));
            return false;
        }
        if((value.length < 1 && !this.allowBlank) || !this.regex.test(value)) {
            this.markInvalid(Ext.String.format(this.blankText, value));
            return false;
        }
        
        this.markInvalid();
        this.setColor(value);
        return true;
    },

    markInvalid : function( msg ) {
        Ext.ux.ColorField.superclass.markInvalid.call(this, msg);
        this.inputEl.setStyle({
            'background-image': 'url(themes/extjs/themes/images/default/grid/invalid_line.gif)'
        });
    },
    
    getValue : function(){
	hex = Ext.ux.ColorField.superclass.getValue.call(this);
	if (hex && hex.length > 1)
		if (hex[0] != '#')
			hex = '#' + hex
	return hex
    },
    
    setValue : function(hex){
	if (hex && hex.length > 1){
		var shex = hex
		if (shex[0] == '#')
			shex = shex.slice(1)
			
		Ext.ux.ColorField.superclass.setValue.call(this, shex);
		this.setColor(hex);
	}
    },
    
    setColor : function(hex) {
		if (hex[0] != '#')
			hex = '#' + hex
		
        Ext.ux.ColorField.superclass.setFieldStyle.call(this, {
            'background-color': hex,
            'background-image': 'none'
        });
    },

    menuListeners : {
        select: function(m, d){
            this.setValue(d);
        },
        show : function(){
            this.onFocus();
        },
        hide : function(){
            this.focus();
            var ml = this.menuListeners;
            this.menu.un("select", ml.select,  this);
            this.menu.un("show", ml.show,  this);
            this.menu.un("hide", ml.hide,  this);
        }
    },
    
    onTriggerClick : function(e){
        if(this.disabled){
            return;
        }
       
	var colors = ["000000", "993300", "333300", "003300", "003366", "000080", "333399", "333333", "800000", "FF6600", "808000", "008000", "008080", "0000FF", "666699", "808080", "FF0000", "FF9900", "99CC00", "339966", "33CCCC", "3366FF", "800080", "969696", "FF00FF", "FFCC00", "FFFF00", "00FF00", "00FFFF", "00CCFF", "993366", "C0C0C0", "FF99CC", "FFCC99", "FFFF99", "CCFFCC", "CCFFFF", "99CCFF", "CC99FF", "FFFFFF"];
	var height = undefined
	if (this.colors){
		colors = this.colors;
		height = 18 * Math.round((colors.length / 8))
	}
 
        this.menu = new Ext.menu.ColorPicker({
	    colors: colors,
	    height: height,
            shadow: true,
            autoShow : true
        });
        this.menu.alignTo(this.inputEl, 'tl-bl?');
        this.menu.doLayout();
        
        this.menu.on(Ext.apply({}, this.menuListeners, {
            scope:this
        }));
        
        this.menu.show(this.inputEl);
    }
});
