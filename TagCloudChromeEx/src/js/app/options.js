//require: jQuery 1.8.3
$(function initOptions(){
    //Avoid polluting global namespace;
    
    var TAGCLOUD_NAME_PREFIX = "TagCloud_Ext_"
    var OPTIONS_NAMES = ["search_engine", "language", "highlight_color"];


    $("#save").click(OptionsHandler.saveAllOptions);
    
    $("#resetModal_OK").click(OptionsHandler.restoreAllOptions);
    
    $('.info').tooltip();
    
    $('#colorpicker').colorpicker({ format: 'rgba' });

    OptionsHandler.restoreAllOptions();
    
});