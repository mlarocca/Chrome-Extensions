//require utils.js


/** StorageWrapper: a wrapper for HTML 5 local storage system.
        function store(key, value, sessionOnly): 
				stores value under the key "key" in localStorage, unless sessionOnly is true, when the value is stored
				in sessionStorage instead;
								* If key is undefined or null, nothing can be stored and the call returns;
								* If value is undefined, the key will be removed from storage;
								* If local storage isn't supported, or the storage quota has been met, it aborts the 
										request and return false;
								* If instead storage is successfull, return true.
                                                                                                        
        function load(key):             
				loads the value associated with key from local storage
								* If local storage isn't supported, or no such key has been stored return null;
								* If both sessionStore and localStore contains a value associated with key,
										the session version has precedence.                                                                                     
    */
if (!window.StorageWrapper){
    var StorageWrapper = (function(){
            "use strict";
            
            /** @param sessionOnly: if truthy the data will be stored for this session only, otherwise it will be persistent for the page
              */
            function store(key, value, sessionOnly){
                    if (typeof key === "undefined" || key === null ){        //At least the key must be defined and not null, but might be 0
                            return false;
                    }
                    //Tests if sessionStorage is supported: otherwise tries to use persistent storage
                    if (sessionOnly && typeof sessionStorage !== "undefined"){
                            if (typeof value === "undefined"){       //Deletes the previous item, if any
                                    try{
                                            sessionStorage.removeItem(key);
                                    }catch(e){
                                            return false;
                                    }
                            }else{
                                    try{
                                            sessionStorage[key] = value;
                                    }catch(e){
                                            //Browser's storage quota might be exhausted
                                            return false;
                                    }                       
                            }
                    }else{
                            if (typeof localStorage === "undefined"){
                                    //HTML5 local storage unsopported: you might want to go back to cookies, but it's up to the caller
                                    return false;
                            }
                            if (typeof value === "undefined"){       //Deletes the previous item, if any
                                    try{
                                            localStorage.removeItem(key);
                                    }catch(e){
                                            return false;
                                    }
                            }else{
                                    try{
                                            localStorage[key] = value;
                                    }catch(e){
                                            //Browser's storage quota might be exhausted
                                            return false;
                                    }                       
                            }
                    }
                    return true;
            }
            
            function remove(key, sessionOnly){
                return store(key, null, sessionOnly);
            }
            

            function load(key){
                    if (typeof key === "undefined" || key === null){ //At least the key must be defined and not null, but might be 0
                            return null;
                    }
                    //Tests session storage first (session version have precedence over persistent one):
                    if (typeof sessionStorage !== "undefined" && sessionStorage[key]){
                            //HTML5 local storage unsopported: you might want to go back to cookies, but it's up to the caller
                            return sessionStorage[key];
                    }
                    //else: not found in sessionStorage
                    if (typeof localStorage !== "undefined" && localStorage[key]){
                            //HTML5 local storage unsopported: you might want to go back to cookies, but it's up to the caller
                            return localStorage[key];
                    }//else:        Not found in localStorage either
                    
                    return null;
            }       
            
            var storage_proto = {
                    store: store,
                    remove: remove,
                    load: load
            };
            
            Object.freeze(storage_proto);
            return Object.create(storage_proto);
    })();
}

if (!window.OptionsHandler){

    var OptionsHandler = (function(storageWrapper){
            "use strict";
            
            var TAGCLOUD_NAME_PREFIX = "TagCloud_Ext_"
            /** Options supported.
                Options are stored as couples name -> (defaul value)
             */
            var OPTIONS = {"search_engine": "search_Google", "target_language": "en", "highlight_color": "rgba(255,165,0,1.0)"};

    //<UTILITY (private) FUNCTIONS, not exposed in the interface>
            /** Stores the an option
                    @param sessionOnly: if truthy the data will be stored for this session only, otherwise it will be persistent for the page
              */
            function storeOption(name, value, sessionOnly) {
                
                if (typeof OPTIONS[name] === "undefined") {
                    throw "Invalid option name";
                }                 
                return storageWrapper.store(TAGCLOUD_NAME_PREFIX + name, value, sessionOnly);
            }

            function loadOption(name){
                
                if (typeof OPTIONS[name] === "undefined") {
                    throw "Invalid option name";
                }
                var value = storageWrapper.load(TAGCLOUD_NAME_PREFIX + name);
                
                if (typeof value === "undefined" || value === null) {
                    //on miss, return the default value
                    return OPTIONS[name];
                } else {
                    return value;
                }
            }
            
            /** @method getDefaultValue
              * @param {String} name The name of the option to retrieve.
              *
              * Returns the default value for an option 
              *
              */
            function getDefaultValue(name){
                if (typeof OPTIONS[name] === "undefined") {
                    throw "Invalid option name";
                } 
                return OPTIONS[name];
            }
            
     
            // Saves options to localStorage.
            function saveAllOptions() {
                var optionName,
                    select, i;
                    
                for (optionName in OPTIONS) {
                    select = document.getElementById(optionName);
                    switch (optionName) {
                        case "highlight_color":
                            storeOption(optionName, select.value);
                            break;
                        default:                    
                            storeOption(optionName, select.children[select.selectedIndex].value);
                    }
                }
              
                // Update status to let user know options were saved.
                var status = $("#status");
                status.html("Options Saved.");
                setTimeout(function() {
                                        status.html("");
                                    }, 
                         750);
            }

            // Restores select box state to saved value from localStorage.
            function restoreAllOptions() {
                var favorite,
                    optionName,
                    select,
                    child, i, j;
                    
                for (optionName in OPTIONS) {
                    favorite = loadOption(optionName);
                    if (favorite) {
                        switch (optionName) {
                            case "highlight_color":
                                $("#" + optionName).attr("value", favorite);
                                $('#colorpicker')[0].colorPicker.setValue(favorite);
                                break;
                            default:
                                select = document.getElementById(optionName);
                                for (j = 0; j < select.children.length; j++) {
                                    child = select.children[j];
                                    if (child.value === favorite) {
                                        child.selected = "true";
                                        break;
                                    }
                                }
                        }
                    }
                }
            }     
     
            
            var storage_proto = {
                    loadOption: loadOption,
                    storeOption: storeOption,
                    saveAllOptions: saveAllOptions,
                    restoreAllOptions: restoreAllOptions,
                    getDefaultValue: getDefaultValue
            };
            
            Object.freeze(storage_proto);
            return Object.create(storage_proto);
    })(StorageWrapper);
}