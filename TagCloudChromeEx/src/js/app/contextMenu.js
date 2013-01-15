
(function scope(){
    //avoid polluting the global namespace

        
    var SEARCH_API_URL = {  "search_Google" : "http://www.google.com/search?q=",
                            "search_Twitter" : "https://twitter.com/search?q=",
                            "search_Facebook" : "https://www.facebook.com/search/results.php?q=",
                            "search_Quora" : "http://api.quora.com/search?q=",
                            "search_Wikipedia" : "http://wikipedia.org/w/index.php?search="
                        };
                        
    var TRANSLATE_API_URL = {  "translate_Google" : "http://translate.google.it/#auto/en/" };                 

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
            search(SEARCH_API_URL[id], info.selectionText.replace(/\s+/g, "+"));
            //search menu item clicked
        }else if (/^translate_[\S]*/.test(id)){
            //search menu item clicked
            search(TRANSLATE_API_URL[id], info.selectionText);
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
})();

// Set up context menu tree at install time.
//chrome.runtime.onInstalled.addListener(function() {
//});
