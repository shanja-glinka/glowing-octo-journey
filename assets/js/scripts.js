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

class ContentAnimation {
    constructor() {
    }

    getLineFillProc(element) {
        let proc = (!element.getAttribute('data-fill') ? '0' : element.getAttribute('data-fill')).replace('%', '');
        return Math.abs(100 - parseInt(proc)).toString() + '%';
    }

    fillSkillLines() {
        let lines = document.querySelectorAll('.skills__box .skills__it-stacks .fill-line');

        if (!lines.length)
            return;

        lines.forEach(line => {
            setTimeout(() => {
                line.style.right = this.getLineFillProc(line);
            }, 300);
        });
    }

    run() {
        this.fillSkillLines();
    }
}

class Attentions {

    constructor() {
        this.lastrAttention = null;
        this.lastCall = null;
    }

    init() {
        this.elements = document.querySelectorAll('[data-attention]');

        if (!this.elements)
            return;


        this.elements.forEach(el => {
            el.addEventListener('mouseover', () => {
                this.attentionShow(el);
            });

            el.addEventListener("touchstart", () => {
                this.attentionShow(el);
            }, true);
        });
    }

    hideAllAttentions() {
        document.querySelector('#attentions-container').childNodes.forEach(el => {
            if (typeof el.style === 'undefined' || el.style.display === 'none')
                return;

            el.style.opacity = 0;

            setTimeout(() => {
                el.style.display = null;
                el.style.top = null;
                el.style.left = null;
            }, 300);

        });
    }

    attentionHide() {
        this.lastCall.removeEventListener('mouseout', this.mouseoutHandler);
        this.lastCall.removeEventListener('touchend', this.mouseoutHandler);

        this.hideAllAttentions();

    }

    attentionShow(callElement) {
        let attentionBlockElement = document.querySelector('.attention__' + callElement.getAttribute('data-attention'));

        if (attentionBlockElement.style.display === 'display')
            return;

        // this.hideAllAttentions();

        this.lastCall = callElement;


        attentionBlockElement.style.display = 'block';

        let rect = callElement.getBoundingClientRect();
        let bodyHeight = document.querySelector('body').getBoundingClientRect();
        let rect2 = attentionBlockElement.getBoundingClientRect();


        if (bodyHeight.bottom < rect.top + rect.height + rect2.height) {
            attentionBlockElement.style.top = (rect.top - rect2.height) + 'px';
        } else
            attentionBlockElement.style.top = (rect.top + rect.height) + 'px';
        attentionBlockElement.style.left = rect.left + 'px';
        attentionBlockElement.style.opacity = 1;

        setTimeout(() => {

            this.mouseoutHandler = this.attentionHide.bind(this);
            callElement.addEventListener('mouseout', this.mouseoutHandler);
            callElement.addEventListener('touchend', this.mouseoutHandler);
        }, 100);

    }
}


const translator = new Translator();
const contentAnimation = new ContentAnimation();
const attentions = new Attentions();


document.addEventListener('DOMContentLoaded', () => {
    translator.initTranslate('RU-ru', () => {
        translator.translatePage();
        attentions.init();
        contentAnimation.run();
    });


});