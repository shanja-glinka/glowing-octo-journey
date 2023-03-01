class Translator {
    constructor() {
        this.language = null;
        this.dictionary = null;
        this.requestPath = null;

        this.defaultLangPath = './assets/var/';
        this.translateAttribute = 'data-translate';
    }

    initTranslate(lang, callback = null) {
        this.language = lang;
        this.dictionary = null;
        this.requestPath = this.defaultLangPath + 'translate-' + this.language + '.json';

        this.requestToTranslate(callback);
    }

    translatePage() {
        let translateElements = document.querySelectorAll('[' + this.translateAttribute + ']');

        if (!translateElements)
            return;

        translateElements.forEach(el => {
            el.innerHTML += this.translate(el.getAttribute(this.translateAttribute));
        });
    }

    translate(translateKey) {
        this.throwIfNotInit();

        return (typeof this.dictionary[translateKey] === 'undefined' ? translateKey : this.dictionary[translateKey]);
    }



    requestToTranslate(callback) {

        this.dictionary = {};

        this.throwIfNotInit();


        fetch(this.requestPath).then((response) => {
            if (response.ok) {
                response.json().then((resp) => {
                    this.dictionary = resp;
                    if (typeof callback === 'function')
                        callback(this.dictionary);
                });
            } else {
                this.dictionary = null;
                this.requestPath = null;
                throw ('Dictionary for "' + this.language + "' not found");
            }
        });
    }

    throwIfNotInit() {
        if (this.dictionary === null || this.requestPath === null)
            throw ('Do make call "Translator.initTranslate(lang)" for set translate dictionary');
    }
}

const translator = new Translator();


document.addEventListener('DOMContentLoaded', () => {
    translator.initTranslate('RU-ru', () => {
        translator.translatePage();
    });

});