/** Templates **/

Templates = {};

Templates.Modals = {};

Templates.Modals.template =
    '<div class="modal fade show" role="dialog" id="{id}">' +
        '<div class="modal-dialog">' +
            '<div class="modal-content">' +
                '<div class="modal-header">' +
                    '<h4>{title}</h4>' +
                    '<button type="button" data-dismiss="modal" class="close">×</button>' +
                '</div>' +
                '<div class="modal-body"></div>' +
                '<div class="modal-footer"></div>' +
            '</div>' +
        '</div>' +
    '</div>';

Templates.Modals.actionTemplate = '<button type="button" data-dismiss="modal" class="btn {classes}">{text}</button>';

Templates.Modals.buttonClasses = {
    primary: 'btn-primary',
    seconday: 'btn-seconday'
};

Templates.Modals.createModal = function(title, elements, id, actions, dismissAction, actionWhenHidden) {
    const content = Templates.Modals.normalizeContent(elements);
    let modalContainer = $(Templates.Modals.template.format({title, id}).toHtmlElement());
    let body = modalContainer.find('.modal-body');
    body.append(content);
    let footer = modalContainer.find('.modal-footer');
    if (actions) {
        for (const action of actions) {
            const classes = action[2] || Templates.Modals.buttonClasses.primary;
            let htmlAction = $(Templates.Modals.actionTemplate.format({text: action[0], classes}).toHtmlElement()).click(action[1]);
            footer.append(htmlAction);
        }
    }

    if (dismissAction) {
        modalContainer.find('.modal-header').find('button').click(dismissAction);
    }

    modalContainer.on('hidden.bs.modal', actionWhenHidden || Templates.Modals.actionsWhenHidden.remove);
    return modalContainer;
};

Templates.Modals.createModalWithSelectList = function(title, elements, id, options, actions, actionWhenHidden) {
    let {selectBlock, selectList} = Templates.createSelectList(id, options);

    function getElementsWithList(elements, selectBlock) {
        return Templates.Modals.normalizeContent([elements, selectBlock]);
    }
    function getActionsLinkedToList(actions, selectList) {
        return actions
            ? actions.map(action => [action[0], () => action[1](selectList.val())])
            : actions;
    }

    return Templates.Modals.createModal(title, getElementsWithList(elements, selectBlock), id, getActionsLinkedToList(actions, selectList), actionWhenHidden);
};

Templates.Modals.displayModal = function(modal) {
    modal.modal('show');
};

/**
 * Normalize the parameter such as:
 * - if `elements` is a string, return a `div` containing this text
 * - if `elements` is an array, return a `div` containing a normalization of every object in this array
 * - otherwise, return a `div` containing `elements`
 * @param elements `string`, `array` or jQuery object
 * @returns {*|jQuery.fn.init|jQuery|HTMLElement} A `div` containing the elements
 */
Templates.Modals.normalizeContent = function(elements) {
    const container = $(document.createElement("div"));
    if (typeof(elements) === 'string') container.append(elements);
    else if (Array.isArray(elements)) elements.forEach(element => container.append(Templates.Modals.normalizeContent(element)));
    else container.append(elements);
    return container;
};

Templates.Modals.actionsWhenHidden = {
    remove: function () {
        $(this).remove();
    },
    reshow: function () {
        $(this).modal('show');
    }
};



String.prototype.format = String.prototype.format ||
    function () {
        "use strict";
        let str = this.toString();
        if (arguments.length) {
            let t = typeof arguments[0];
            let key;
            let args = ("string" === t || "number" === t) ?
                Array.prototype.slice.call(arguments)
                : arguments[0];

            for (key in args) {
                str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
            }
        }

        return str;
    };

String.prototype.toHtmlElement = String.prototype.toHtmlElement ||
    function () {
        let str = this.toString().trim();
        let template = document.createElement('template');
        template.innerHTML = str;
        return template.content.firstChild;
    };

/** User feedback **/
function blockView() {
    let block = $('#block');
    if (block.length === 0) {
        $('body').append('<div id="block"><img src="img/loading.png" alt="loader"></div>');
        block = $('#block');
    }
    block.show();
}

function unblockView() {
    $('#block').hide();
}


/** Utils **/
function getDomain() {
    const host = location.host;
    const port = location.port;

    if (host.endsWith(port)) {
        return host.substr(0, host.length - port.length - 1);
    }
    return host;
}