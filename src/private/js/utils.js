function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
        break;
        }
    }
}

var randomId = function () {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
  };

var toastError = function(msg, duration = 3000) {
    DevExpress.ui.notify(strToHTML(msg), "error", duration);
}

var toastSuccess = function(msg, duration = 3000) {
    DevExpress.ui.notify(strToHTML(msg), "success", duration);
}

var toastInfo = function(msg, duration = 3000) {
    DevExpress.ui.notify(strToHTML(msg), "info", duration);
}

var confirmPopup = function(question) {
    var result = DevExpress.ui.dialog.confirm(question, "Question").then(function (dialogResult) {  
        return dialogResult;  
    });
    return result;
}

function $_GET(index) {
	var result = null,
        tmp = [];
        tmp = location.pathname.split("/");
        result = tmp[tmp.length - 1]
        .split("&")[index];
    return result;
}

function updateQueryStringParameter (uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    }
    else {
        return uri + separator + key + "=" + value;
    }
}

function calculerDateEcheance(datedoc, tombee, nbjours, fin_de_mois) {
    date = moment(datedoc, "DD/MM/YYYY");
    start_day = date.get('date');
    months = parseInt(nbjours / 30);
    date = date.add(months, 'months');
    end_day = date.get('date');

    if (start_day != end_day) {
        date = date.subtract(1, 'months').endOf("month");
    }
    days = nbjours % 30;
    date = date.add(days, 'days');

    if (fin_de_mois == 1) {
        date = date.endOf("month");
    }

    if (tombee >  0){
        if (date.get('date') > tombee) {
            date = date.add(1, 'months');
        }
        date = date.date(tombee);
    }
    
    return date.format("yyyy-MM-DD");
}

function executeFunctionByName(functionName/*, args*/) {
    var args = [];
    for (let i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    return window[func].apply(window, args);
  }

function functionExists(func) {
    return typeof window[func] !== 'undefined' && $.isFunction(window[func]);
}

function unpadLeft(s, c) {
    let l = s.length;
    for(let i = 0; i < l; i++) {
        if (s[i] != c) {
            return s.substr(i);
        }
    }
    return "";
}

//#region Popup
var openPopupList = function(popupName, filter)
{
    popup_filter = filter;
    
    popup_return = 0;
    $('#'+popupName).modal();
}
var openPopupTextBox = function(title, label, error_message, required, mask)
{

    popup_title = title;
    popup_label = label;
    popup_error_message = error_message;
    popup_required = required;
    popup_mask = mask;
    $("#modal_textbox_popup").modal();
}

var openPopupTextBoxImage = function(title, label, source, texte, link,error_message, required, mask, type_id)
{
    popup_title = title;
    popup_label = label;
    popup_source=source;
    popup_texte=texte;
    popup_link=link;
    popup_type_id=type_id;
    popup_error_message = error_message;
    popup_required = required;
    popup_mask = mask;
    $("#modal_textbox_popup_image").modal();
}

var openPopupTextArea = function(title, message, error_message, required, mask)
{
   
    popup_title = title;
    popup_message = message;
    popup_error_message = error_message;
    popup_required = required;
    popup_mask = mask;
    $("#modal_textarea_popup").modal();
}

var openPopupQuestion = function(title, label)
{
    popup_title = title;
    popup_label = label;
    popup_return = 0;
    $("#modal_question_popup").modal();
}

var openPopupSelectBox = function(title, label, cmb_data, cmb_data_nom, error_message, required)
{
    popup_title = title;
    popup_label = label;
    popup_error_message = error_message;
    popup_required = required;
    popup_cmb_data = cmb_data;
    popup_cmb_data_nom = cmb_data_nom;
    $("#modal_selectbox_popup").modal();
} 

var modalDefaults = {
    /*
     * By default, any dismissal of the modal (interaction with a
     * `data-dismiss="modal"` element) will reject the deferred
     */
    rejectOnDismiss: true,
    /*
     * If the plugin is called against a single element, then by default
     * the plugin will return the deferred instead of the collection.
     */
    returnDeferred: true
}
var modalNames = {
    DATA_ATTR_PROMISE_DISPATCH: 'data-promise-dispatch',
    DATA_KEY_PROMISE_DISPATCH: 'promiseDispatch',
    DATA_KEY_DEFERRED: 'modalDeferred',
    DATA_KEY_RETURN_DEFERRED: 'returnDeferred',
    DATA_KEY_REJECT_ON_DISMISS: 'rejectOnDismiss',
    VALUE_PENDING_DEFERRED_STATE: 'pending'
}
var modalAssignDeferred = function (dialog) {
    var deferred = $.Deferred();

    /*
     * The modal exists to allow for interactions that will resolve or
     * reject the deferred. Internal modification to the deferred's
     * state will handle closing it. External modifications should
     * result in the same as the interaction will no longer be needed.
     */
    deferred.always(function () {
        dialog.modal('hide');
    });

    dialog.data(modalNames.DATA_KEY_DEFERRED, deferred);
}
$.fn.modalDeferred = function (loadFunction, p) {
    var collection = this,
        method_return,
        options;

    if (typeof p === 'string') {
        switch (p) {
        case 'deferred':
            method_return = collection.data(modalNames.DATA_KEY_DEFERRED);
            break;
        default:
            collection.modal(p);
            break;
        }
    } else {
        /*
         * Combine the default options with the passed in overrides (if any) to
         * produce options for this execution
         */
        options = $.extend(
            {},
            modalDefaults,
            (p || {})
        );

        collection.each(function () {
            var dialog = $(this);

            modalAssignDeferred(dialog);

            dialog
                .data(modalNames.DATA_KEY_RETURN_DEFERRED, options.returnDeferred)
                .data(modalNames.DATA_KEY_REJECT_ON_DISMISS, options.rejectOnDismiss)
                .on('show.bs.modal', function () {
                    var deferred = dialog.data(modalNames.DATA_KEY_DEFERRED);

                    loadFunction(dialog);

                    if (!deferred || deferred.state() !== modalNames.VALUE_PENDING_DEFERRED_STATE) {
                        modalAssignDeferred(dialog);
                    }
                })
                .on('hide.bs.modal', function () {
                    $(this).off("show.bs.modal");
                    var deferred = dialog.data(modalNames.DATA_KEY_DEFERRED);

                    if (deferred.state() === modalNames.VALUE_PENDING_DEFERRED_STATE) {
                        deferred[(dialog.data(modalNames.DATA_KEY_REJECT_ON_DISMISS) ? 'reject' : 'resolve')]();
                    }
                })
                .on('click', '[' + modalNames.DATA_ATTR_PROMISE_DISPATCH + ']', function () {
                    var is_resolve_action = ($(this).data(modalNames.DATA_KEY_PROMISE_DISPATCH) === 'resolve');

                    dialog.data(modalNames.DATA_KEY_DEFERRED)[(is_resolve_action ? 'resolve' : 'reject')]();

                    dialog.modal('hide');
                })
                .modal(options);
        });
    }

    /*
     * If the above code did not dictate a method return value...
     */
    if (method_return == null) {
        /*
         * If the collection only had one element, and the caller used the
         * `returnDeferred` option to ask for the deferred instead of the
         * collection, then we'll return the deferred. Otherwise return the
         * collection like any other jQuery plugin would do.
         */
        if (collection.length === 1 && collection.data(modalNames.DATA_KEY_RETURN_DEFERRED)) {

            method_return = collection.data(modalNames.DATA_KEY_DEFERRED);
        } else {
            method_return = collection;
        }
    }

    return method_return;
};
//#endregion
