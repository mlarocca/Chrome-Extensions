var MAX_LABEL_SIZE = 60,
    MIN_LABEL_SIZE = 12;
var MAX_TAGS = 100;

    /** @property WORD_BLACKLIST
      * @type {Object}
      * @readOnly
      * @private
      * Sublist of the 100 most common words used in English.<br>
      * Used to avoid including them in the tag cloud.
      */
var WORD_BLACKLIST =    {
                            "en":   {   "the": true, "be": true, "to": true, "of": true, "and": true,
                                        "a": true, "in": true, "that": true, "have": true, "I": true,
                                        "it": true, "for": true, "not": true, "on": true, "with": true,
                                        "he": true, "as": true, "you": true, "do": true, "at": true,
                                        "this": true, "but": true, "his": true, "by": true, "from": true,
                                        "they": true, "we": true, "her": true, "hers": true, "she": true, "or": true,
                                        "an": true, "my": true, "mine": true, "one": true,"would": true, "their": true, 
                                        "theirs": true, "so": true, "up": true, "out": true, "if": true, "about": true,
                                        "who": true, "get": true, "which": true, "me": true, "when": true,
                                        "no": true, "just": true, "him": true, "into": true, "your": true, "yours": true,
                                        "them": true, "than": true, "then": true, "its": true, "over": true,
                                        "also": true, "two": true, "how": true, "our": true, "ours": true, "day": true, 
                                        "days": true, "us": true, "is": true, "are": true, "has": true
                                    }
                        }

var SEARCH_API_URL = {  "search_Google" : "http://www.google.com/search?q=",
                        "search_Twitter" : "https://twitter.com/search?q=",
                        "search_Facebook" : "https://www.facebook.com/search/results.php?q=",
                        "search_Quora" : "http://api.quora.com/search?q=",
                        "search_Wikipedia" : "http://wikipedia.org/w/index.php?search="
                    };
                    
var TRANSLATE_API_URL = {  "translate_Google" : "http://translate.google.it/#auto/" };

var ALLOWED_LANGUAGES = {"en": true, "fr": true, "it": true, "de": true, "ru": true, "es": true, "pt": true, "ch": true, "jp":true};