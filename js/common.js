const TARGET_VALUE_MAX = 15;
const OFFSET = 0.2;
const TIME_OFFSET = 2000;
var curBalance = 0;

$(document).ready(function () {
    $("#targetValue").html("$" + TARGET_VALUE_MAX);
    $("#progressbar").progressbar({value: 0}, {"classes.ui-progressbar": "highlight"});

    var balanceUsd = 0;
    $.ajax({
        type: "post",
        dataType: "json",
        url: "http://alex.devel.softservice.org/testapi/",
        success: function (data) {
            balanceUsd = parseFloat(data["balance_usd"]);
            if (isNaN(balanceUsd)) {
                showError("", "", "json_data_error")
                return;
            }

            balanceUsd = round(balanceUsd, 2)
            showBalance(balanceUsd);
        },
        error: function (x, ajaxOptions, exception) {
            showError(x, ajaxOptions, exception);
        }
    });
});


function showBalance(balanceUsd) {
    curBalance = balanceUsd;
    if(curBalance >= TARGET_VALUE_MAX) {
        achieveTarget();
    }

    var lack = round(TARGET_VALUE_MAX - balanceUsd, 2);
    $("#lack").html(lack);
    $("#message").show();

    const pBalance = curBalance * 100 / TARGET_VALUE_MAX;
    $("#progressbar").progressbar({value: pBalance});

    $("#balance").attr("value", curBalance);
    $("#balance").html(round(curBalance, 2));
    updateCursor(pBalance, 0);

    var timer = setInterval(function () {
        curBalance += OFFSET;
        var pCnt = curBalance * 100 / TARGET_VALUE_MAX;
        if (round(curBalance, 2) >= TARGET_VALUE_MAX) {
            clearInterval(timer);
            achieveTarget();
        } else {
            $("#progressbar").progressbar({value: pCnt});
            updateCursor(pCnt, OFFSET);
        }
    }, TIME_OFFSET);
}

function achieveTarget() {
    $("#targetPanel").addClass("panel-target-success");
    $('#progressbar').progressbar({value: 100});
    $('#cursor').hide();
    $("#message").hide();
}

function updateCursor(pValue, offset) {
    var width = $('#progressbar').css('width').replace(/[^-\d\.]/g, '');
    $("#balance").attr("value", curBalance);
    $("#balance").html(round(curBalance, 2));
    var offsetCursor = pValue * width / 100;
    $('#cursor').css("padding-left", offsetCursor + "px");
}

// copy from stackoverflow.com
// format float: 2.00... - > 2 , 1.3456... -> 1.34
function round(value, exp) {
    if (typeof exp === 'undefined' || +exp === 0)
        return Math.round(value);

    value = +value;
    exp = +exp;

    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
        return NaN;

    // Shift
    value = value.toString().split('e');
    value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}

// copy from stackoverflow.com
// AJAX error handling on a client
function showError(x, ajaxOptions, exception) {
    var message;
    var statusErrorMap = {
        '400': "Server understood the request, but request content was invalid.",
        '401': "Unauthorized access.",
        '403': "Forbidden resource can't be accessed.",
        '500': "Internal server error.",
        '503': "Service unavailable."
    };
    if (x.status) {
        message = statusErrorMap[x.status];
        if (!message) {
            message = "Unknown Error \n.";
        }
    } else if (exception == 'parsererror') {
        message = "Error.\nParsing JSON Request failed.";
    } else if (exception == 'timeout') {
        message = "Request Time out.";
    } else if (exception == 'abort') {
        message = "Request was aborted by the server";
    } else if (exception == 'json_data_error') {
        message = "Json data has error";
    }
    else {
        message = "Unknown Error \n.";
    }
    $("div#errorcontainer").css("display", "inline");
    $("div#errorcontainer").html(message);
};
