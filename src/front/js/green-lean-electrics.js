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

Templates.Modals.createModal = function (title, elements, id, actions, dismissAction, actionWhenHidden) {
    const content = Templates.Modals.normalizeContent(elements);
    let modalContainer = $(Templates.Modals.template.format({title, id}).toHtmlElement());
    let body = modalContainer.find('.modal-body');
    body.append(content);
    let footer = modalContainer.find('.modal-footer');
    if (actions) {
        for (const action of actions) {
            const classes = action[2] || Templates.Modals.buttonClasses.primary;
            let htmlAction = $(Templates.Modals.actionTemplate.format({
                text: action[0],
                classes
            }).toHtmlElement()).click(action[1]);
            footer.append(htmlAction);
        }
    }

    if (dismissAction) {
        modalContainer.find('.modal-header').find('button').click(dismissAction);
    }

    modalContainer.on('hidden.bs.modal', actionWhenHidden || Templates.Modals.actionsWhenHidden.hide);
    return modalContainer;
};

Templates.Modals.createModalWithSelectList = function (title, elements, id, options, actions, actionWhenHidden) {
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

Templates.Modals.displayModal = function (modal) {
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
Templates.Modals.normalizeContent = function (elements) {
    const container = $(document.createElement("div"));
    if (typeof (elements) === 'string') container.append(elements);
    else if (Array.isArray(elements)) elements.forEach(element => container.append(Templates.Modals.normalizeContent(element)));
    else container.append(elements);
    return container;
};

Templates.Modals.actionsWhenHidden = {
    remove: function () {
        $(this).remove();
    },
    hide: function () {
        $(this).hide();
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
let blocks = 0;

function blockView() {
    let block = $('#block');
    if (block.length === 0) {
        $('body').append('<div id="block"><img src="img/loading.png" alt="loader"></div>');
        block = $('#block');
    }
    if (blocks === 0) {
        block.show();
    }
    blocks++;
}

function unblockView() {
    blocks--;
    if (blocks === 0) {
        $('#block').hide();
    }
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

function createMessageModal(title, message, id) {
    return Templates.Modals.createModal(
        title,
        message,
        id,
        [
            ['Ok', () => {
            }]
        ],
        () => {
        }
    );
}

/** Form **/

function sendLoginForm(userType) {
    blockView();

    var email = document.loginform.email.value;
    var pw = document.loginform.password.value;
    var data = {
        email: email,
        password: hashPassword(pw)
    };

    if(userType === "prosumer") {
        // call API
        $.ajax({
            method: 'POST',
            url: '/prosumerLogin',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                unblockView();
                console.log(response);
                //var object = JSON.parse(response);
                if (response.hasOwnProperty("error")) {
                    Templates.Modals.displayModal(createMessageModal("Error", response.error, "loginErrorModal"));
                    return false;
                } else if (response.token) {
                    window.localStorage.setItem('token', response.token);
                    window.location = "home.html";
                } else {
                    Templates.Modals.displayModal(createMessageModal("Error", "Login was unsuccessful, please check your email and password", "loginFailModal"));
                    return false;
                }
            }
        })
    }
    else {
        $.ajax({ //TODO
            method: 'POST',
            url: '/managerLogin',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                unblockView();
                console.log(response);
                //var object = JSON.parse(response);
                if(response.hasOwnProperty("error")){
                    Templates.Modals.displayModal(createMessageModal("Error",response.error, "loginErrorModal"));
                    return false;
                } else if (response.token) {
                    window.localStorage.setItem('token', response.token);
                    window.location = "home.html";
                } else {
                    Templates.Modals.displayModal(createMessageModal("Error","Login was unsuccessful, please check your email and password", "loginFailModal"));
                    return false;
                }
            }
        });
    }
}

function sendRegisterForm(userType) {
    var email = document.registerform.email.value;
    var pwd = document.registerform.password.value;
    var repeatpwd = document.registerform.repeatpassword.value;

    if(checkPassword(pwd) && pwd === repeatpwd){
        blockView();

        if(userType === "prosumer"){
            const data = {
                email: email, 
                password: hashPassword(pwd),
                bufferSize: 3000,
                bufferFilling: 0,
                productionRatioBuffer : 0.7,
                productionRatioMarket : 0.3,
                consumptionRatioBuffer : 0.8,
                consumptionRatioMarket : 0.2
            };
            // call API
            $.ajax({
                type: 'POST',
                url: '/prosumerSignUp',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function(response){
                    unblockView();
                    if(response.hasOwnProperty("error")){
                        Templates.Modals.displayModal(createMessageModal("Error",response.error, "signUpErrorModal"));
                        return false;
                    } else {
                        Templates.Modals.displayModal(Templates.Modals.createModal(
                            "Welcome !",
                            "Well registered, now check your mailbox to activate your account!",
                            "signUpSuccessModal",
                            [
                                ['Ok', () => location.assign('/')]
                            ],
                            () => location.assign('/')
                        ));
                    }
                }
            });
        } else { //TODO
            
            $.ajax({
                method: 'POST',
                url: `http://${getDomain()}:8080/getCurrentElectricityPrice`,
                dataType: 'json',
                success: function (response) {

                    const data = {
                        email: email, 
                        password: hashPassword(pwd),
                        bufferSize: 79200, //1 journée de prod
                        bufferFilling: 0,
                        marketPrice: response.currentElectricityPrice,
                        productionRatioBuffer : 0.7,
                        productionRatioMarket : 0.3,
                        powerPlantProduction: 0,
                        marketQuantityAvailable: 0,
                        powerPlantStatus: 0 //0 stopped, 1 starting, 2 running
                    };
                    // call API
                    $.ajax({
                        type: 'POST',
                        url: '/managerSignUp',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify(data),
                        success: function(response){
                            unblockView();
                            if(response.hasOwnProperty("error")){
                                Templates.Modals.displayModal(createMessageModal("Error",response.error, "signUpErrorModal"));
                                return false;
                            } else {
                                Templates.Modals.displayModal(Templates.Modals.createModal(
                                    "Welcome !",
                                    "Well registered, now check your mailbox to activate your account!",
                                    "signUpSuccessModal",
                                    [
                                        ['Ok', () => location.assign('/')]
                                    ],
                                    () => location.assign('/')
                                ));
                            }
                        }
                    });
                }
            });
        }
    } else {
        Templates.Modals.displayModal(createMessageModal("Error","Registration was unsuccessful, please check your email and password. (Your password must have between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter !)", "signUpWrongDatasModal"));
    }
}

function hashPassword(pwd) {
    var hash = 0;
    if (pwd.length === 0) return hash;
    for (i = 0; i < pwd.length; i++) {
        char = pwd.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function checkPassword(pwd) { 
    var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    if(pwd.match(passw)) { 
        return true;
    } else { 
        return false;
    }
}

function sendLogoutForm(userType) {
    if(userType === "prosumer")
        $.ajax({
            type: 'GET',
            url: '/prosumerLogout?token=' + window.localStorage.getItem('token'),
            dataType: 'json',
            contentType: 'application/json',
            success: function () {
                Templates.Modals.displayModal($('#loggedOutModal'));
            }
        });
    else 
        $.ajax({//TODO
            type: 'GET',
            url: '/managerLogout?token=' + window.localStorage.getItem('token'),
            dataType: 'json',
            contentType: 'application/json',
            success: function () {
                Templates.Modals.displayModal($('#loggedOutModal'));
            }
        });
}