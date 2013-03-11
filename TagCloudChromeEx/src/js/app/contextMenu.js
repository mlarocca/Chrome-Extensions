(function initMenu(){
    //avoid polluting the global namespace
             

    /** @method search
      * @private
      *
      * Helper function<br>
      * Search the text in the input field with id "search_bar", using the search engine whose base
      * url for the search api is specified as first parameter.
      *
      * @param {String} search_api_url The base address of the search api for the engine that is going to be used
      */
    function search(search_api_url, full_text){
        if (full_text && search_api_url){
            window.open(search_api_url + full_text);
        }
        return ;
    }  


    // The onClicked callback function.
    function onClickHandler(info, tab) {

        var id = info.menuItemId;
        if (/^search_[\S]*/.test(id)){
            //search menu item clicked
            search(SEARCH_API_URL[id], info.selectionText.replace(/\s+/g, "+"));
            
        }else if (/^translate_[\S]*/.test(id)){
            //translate menu item clicked
            var language;
            try{
                language = OptionsHandler.loadOption("target_language");// localStorage["TagCloud_Ext_target_language"];
                if (!ALLOWED_LANGUAGES[language]){
                    language = OptionsHandler.getDefaultValue("target_language");
                }
            } catch(e) {
                language = OptionsHandler.getDefaultValue("target_language");    //English by default
            }
            search(TRANSLATE_API_URL[id] + language + "/" , info.selectionText);
        
        }else if (id === "remove_highlighting"){

            chrome.tabs.sendMessage(tab.id, { 
                                                'action': 'removeAllHighlighting',
                                                'className': TAG_CLOUD_HIGHLIGH_CLASS
                                            });
        }
    }    
    chrome.contextMenus.onClicked.addListener(onClickHandler);

    var i, engine, title, id, engines = ["Google","Twitter","Facebook","Quora","Wikipedia"];
    for ( i = 0; i < engines.length; i++) {
        engine = engines[i];
        title = "Search with '" + engine + "...";
        id = chrome.contextMenus.create({"contexts": ["selection"], "title": title, "id": "search_" + engine});                                
    }

    chrome.contextMenus.create({"contexts": ["selection"], "title": "Translate...", "id": "translate_Google"});
    chrome.contextMenus.create({"contexts": ["page"], "title": "Remove Highlighting", "id": "remove_highlighting"});
})();

// Set up context menu tree at install time.
//chrome.runtime.onInstalled.addListener(function() {
//});