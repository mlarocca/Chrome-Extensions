var MAX_LABEL_SIZE = 60,
    MIN_LABEL_SIZE = 12;
var MAX_TAGS = 100;

    /** For the most common languages, keeps track of the most common words (like articols, prepositions etc...)
      * that are hence likely to be used with a high frequency in every page, but shouldn't be included
      * in the Tag Cloud, since they wouldn't add any meaning to the page itself.
      * A function is used instead of a (constant) object to save memory and store only the object related to the language
      * actually used. The function is called only once, so there is no need to save the result in the closure
      * to avoid recomputing it.
      *
      * @method WORD_BLACKLIST
      * @param {String} language The international 2 digits code for the page language;
      * @return {Object|undefined} A sublist of the 100 most common words used in the language of the page,
                         if that language is supportes;
                         Otherwise, it returns undefined.
      * @private
      * <br>
      * 
      */
function WORD_BLACKLIST(language) {
    switch (language) {
    
        case "en":  return {   "the": true, "be": true, "to": true, "of": true, "and": true,
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
                            };
                                    
        case "it":   return {
                        "non": true, "di": true, "che": true, "è": true, "e": true, "é": true,
                        "e'": true, "la": true, "il": true, "un": true, "una": true, "uno": true,
                        "un'": true, "a": true, "per": true, "in": true, "mi": true, "sono": true,
                        "ho": true, "ma": true, "l": true, "lo": true, "ha": true, "le": true,
                        "si": true, "ti": true, "i": true, "con": true, "se": true, "io": true,
                        "come": true, "da": true, "dal": true, "dai": true,
                        "ci": true, "no": true, "questo": true, "questa": true,
                        "questi": true, "qui": true, "hai": true, "del": true, "tu": true, "sì": true,
                        "me": true, "più": true, "al": true, "mio": true, "mia": true, "miei": true,
                        "c'": true, "lei": true, "te": true, "gli": true, "della": true, "mia": true,
                        "ne": true, "so": true, "o": true, "alla": true, "dei": true, "quello": true,
                        "va": true, "lui": true, "nel": true, "suo": true, "sua": true, "suoi": true,
                        "oh": true, "oh!": true, "tuo": true, "tua": true, "tuoi": true, "hanno": true,
                        "noi": true, "sta": true, "due": true, "mi": true, "il": true, "ai": true,
                        "dei": true, "sti": true
                    };
                                    
        case "fr":  return {
                        "le": true, "de": true, "un": true, "à": true, "suis": true, "es": true, "est": true,
                        "sommes": true, "êtes": true, "sont": true, "et": true, "en": true, "ai": true, 
                        "as": true, "a": true, "avons": true, "avez": true, "ont": true, "que": true, "pour": true, 
                        "dans": true, "ce": true,"c'": true, "c'est": true,  "il": true, "qui": true, 
                        "ne": true, "sur": true, "se": true, "pas": true, "plus": true, "par": true, 
                        "je": true, "tu": true, "il": true, "elle": true, "nous": true, "vous": true, 
                        "ils": true, "elles": true, "lui": true, "avec": true, "mon": true, "son": true,
                        "ton": true, "ma": true, "sa": true, "ta": true, "me": true, "autre": true, 
                        "on": true, "mais": true, "ou": true, "si": true, "notre": true, "leur": true, 
                        "leurs": true, "y": true, "deux": true, "aussi": true, "celui": true, "où": true,
                        "fois": true, "cela": true, "temps": true,"non": true, "jour": true 
                    };
                    
                                    
        case "de":  return {
                        "das": true, "ist": true, "du": true, "ich": true, "nicht": true, 
                        "die": true, "es": true, "und": true, "sie": true, "der": true, 
                        "was": true, "wir": true, "zu": true, "ein": true, "er": true, 
                        "in": true, "mir": true, "mit": true, "ja": true, "wie": true, 
                        "den": true, "auf": true, "mich": true, "dass": true, "daß": true, 
                        "so": true, "hier": true, "eine": true, "wenn": true, "hat": true, 
                        "all": true, "sind": true, "von": true, "dich": true, "war": true, 
                        "haben": true, "für": true, "an": true, "habe": true, "da": true, 
                        "nein": true, "bin": true, "noch": true, "dir": true, "uns": true, 
                        "sich": true, "nur": true, "einen": true, "dem": true, "auch": true,
                        "als": true,"dann": true,"ihn": true,"mal": true, "hast": true,
                        "ihr": true, "aus": true, "um": true, "aber": true, "meine": true,
                        "wird": true, "doch": true, "mein": true, "bist": true, "im": true,
                        "keine": true, "oder": true, "man": true, "nach": true, "wo": true,
                        "oh": true, "will": true, "also": true, "bei": true, "diese": true,
                        "vor": true,"hab": true, "zum": true, "ihm": true, "des":true, 
                        "am": true, "einem": true
                    };
                                    
        case "es":  return {
                        "el": true, "la": true, "los": true, "les": true, "las": true, "de": true, 
                        "que": true, "y": true, "a": true, "en": true, "un": true, "soy": true, 
                        "eres": true, "es": true, "somos": true, "sois": true, "son": true, 
                        "sos": true, "se": true, "no": true, "he": true, "has": true, "ha": true, 
                        "hemos": true, "habéis": true, "han": true,"por": true, "con": true, 
                        "su": true, "para": true, "como": true, "estoy": true, "estás": true, 
                        "está": true, "estamos": true, "estáis": true, "están": true, 
                        "estás": true, "yo": true, "tú": true, "él": true, "ella": true, 
                        "usted": true, "ud": true, "nosotros": true, "vosotros": true, "ellos": true, 
                        "ellas": true, "ustedes": true, "uds": true, "vos": true, "le": true, 
                        "lo": true, "pero": true, "o": true, "este": true, "esta": true, 
                        "esto": true, "estos": true, "estas": true, "ese": true, "esa": true, 
                        "eso": true, "esas": true, "esos": true, "la": true, "si": true, 
                        "me": true, "te": true, "se": true, "nos": true, "ya": true, "él": true,
                        "ella": true, "ellos": true, "ellas": true, "muy": true, "qué": true, 
                        "mi": true, "dos": true, "ni": true, "sí": true, "día": true, "uno": true, 
                        "una": true, "unos": true, "unas": true
                    };   
                    
        case "pt":  return {
                        "o": true, "os": true, "a": true, "eles": true, "na": true, "no": true,
                        "da": true, "e": true, "do": true, "em": true, "a": true, "am": true,
                        "você": true, "é": true, "nós": true, "é": true, "por": true,
                        "eu": true, "ela": true, "nos": true, "eles": true,
                        "não": true, "ele": true, "tem": true, "nós": true, 
                        "ter": true, "com": true, "que": true, "de" : true,
                        "seu": true, "a": true, "como": true, "se": true,
                        "vós": true, "ou": true, "este": true,  "esta": true, "isto": true,
                        "estes": true,  "estas": true, "esses": true, "essas": true, 
                        "quê": true, "um": true, "dois": true, "sim": true    
                    };
                    
        default: return undefined;
    }
}    

var SEARCH_API_URL = {  
                        "search_Google" : "http://www.google.com/search?q=",
                        "search_Twitter" : "https://twitter.com/search?q=",
                        "search_Facebook" : "https://www.facebook.com/search/results.php?q=",
                        "search_Quora" : "http://api.quora.com/search?q=",
                        "search_Wikipedia" : "http://wikipedia.org/w/index.php?search="
                     };
                    
var TRANSLATE_API_URL = {  "translate_Google" : "http://translate.google.it/#auto/" };

/** @property ALLOWED_LANGUAGES
    List of languages supported for tranlastion
    MUST match the list in the select box inside options.html
  */
var ALLOWED_LANGUAGES = {"en": true, "fr": true, "it": true, "de": true, "ru": true, "es": true, "pt": true, "zh-CN": true, "ja":true};


/** @property TAG_CLOUD_HIGHLIGH_CLASS
    @readonly
    
    Name of the class for highlighted words inside the text
    
  */
var TAG_CLOUD_HIGHLIGH_CLASS = "tag-cloud-highlight";