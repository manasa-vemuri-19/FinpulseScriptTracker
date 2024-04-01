var _config = {
    pageTitle: 'Finpulse Activity Tracker'
    , pollingInterval: 10 //seconds 
    , saveFileName: 'Finpulse_Script_'
    , saveFileExtension: '.sql' // .txt
    , baseUrl: {
        Prod: 'http://nebula/APIService/api/',
        Test: 'http://localhost:61179/api/'
    },
    Environment: "Prod"
}






var objInterval = undefined;
document.addEventListener('DOMContentLoaded', () => {
    Main();
    objInterval = setInterval(Main, _config.pollingInterval * 1000);
});
function Main() {
    processData().then((data) => {
        BuildProgressTracker(data);
        BuildTable(data);
        ApplyCodeHighlight();
        ApplyToolTip();
        AddCopyButton();
    });
}


$("#gotop").click(function () {
    $("html, body").animate({
        scrollTop: "0px"
    }, 5100);
});



async function processData() {
    const _baseurl = _config.Environment.toLowerCase() == 'prod' ? _config.baseUrl.Prod : _config.baseUrl.Test;
    const url = _baseurl + '/finpulsetracker'

    return new Promise((resolve, reject) => {

        $.getJSON(url, {}, function (data, textStatus, jqXHR) {
            var items = data;
            resolve(data);
        });
    });

}

function BuildProgressTracker(items) {
    var $Container = $('#divContainer');
    $Container.html('');
    let divIconWrapper = Object.assign(document.createElement("div"), {
        className: "div-icon-wrapper"
    });

    var icons = [];
    items.forEach((item) => {
        var clas = item.Status.toLowerCase();
        var id = "buttonlist_" + (item.SequenceNo + "").replace('.', '_');
        var iconhtml = `<button id="${id}"  title="${item.Title}"  
        onclick="javascript:document.getElementById('${item.SequenceNo}').scrollIntoView();"
        class="button-list ${clas}-color ${clas}-lite-bgcolor ${clas}-border ${clas}-button ">${item.SequenceNo}</button>`
        icons.push(iconhtml)
    });

    var headerhtml = `<div class="div-header">
    <span class="page-title">📝${_config.pageTitle}</span>
    <span class="a-download-sql" onclick="downloadSQL()" >⬇️download sql file</span>
     </div> `
    var icon_html = icons.join('');
    divIconWrapper.innerHTML = headerhtml + icon_html
    $Container.append(divIconWrapper)



}

function BuildTable(items) {

    var $Container = $('#divContainer');

    items.forEach((item) => {

        var query = item.QueryText.trim();
        var user = item.InProgressByUser;
        var clas = item.Status.toLowerCase();
        var hdnuser = document.getElementById('hdnUser').value;
        query = query.replace("'inprogress'", "'inprogress' , InProgressByUser ='" + hdnuser + "' ");

        var template =
            `<pre class="${clas}-lite-bgcolor ${clas}-border ${clas}-left-border "><h2 class= "${clas}-color" id="${item.SequenceNo}"> ${item.SequenceNo}. ${item.Title} <span style='position: absolute;color:red;margin-left: 100px;right: 150px;' > ${user} </span> </h2>
            <code class="language-sql ${clas}-lite-bgcolor">${query}</code>
            </pre> `
        $Container.append($(template));
    });
}





function ApplyCodeHighlight() {
    document.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el));

}

function ApplyToolTip() {
    $(".button-list").tooltip({ tooltipClass: "custom-tooltip" });
}

function AddCopyButton() {
    document.querySelectorAll('pre code').forEach((el) => {

        let button = Object.assign(document.createElement("button"), {
            innerHTML: "Copy",
            className: "hljs-copy-button",
            type: "button",
            title: "copy code"
        });


        var classColor = '';
        if (el.className.indexOf('completed') > -1)
            classColor = 'completed-bgcolor';
        if (el.className.indexOf('pending') > -1)
            classColor = 'pending-bgcolor';
        if (el.className.indexOf('inprogress') > -1)
            classColor = 'inprogress-bgcolor';


        button.classList.add(classColor);

        button.dataset.copied = false;
        el.parentElement.classList.add("hljs-copy-wrapper");
        el.parentElement.appendChild(button);
        //el.parentElement.style.setProperty("--hljs-theme-background", window.getComputedStyle(el).backgroundColor);

        button.onclick = function () {

            var copyText =
                this.parentElement.getElementsByTagName("code")[0]
                    .innerText;
            var textArea = document.createElement("textarea");
            textArea.value = copyText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("Copy");
            textArea.remove();
            button.innerHTML = "Copied!";
            button.dataset.copied = true;
            setTimeout(() => {
                button.dataset.copied = false;
                button.innerHTML = "Copy";
                alert = null
            }, 700)
        }

    });
}

function downloadSQL() {
    var sqlbuilder = [];
    document.querySelectorAll('pre code').forEach((el) => {

        var sql = el.innerText;
        var title = el.parentElement.getElementsByTagName('h2')[0].innerText;

        var format = `----<<<${title}>>>--\n${sql}\n--================================\n\n\n`;
        sqlbuilder.push(format);
    });
    var sqlFinal = sqlbuilder.join('');

    var date = moment().format('DDMMMYYYY_hhmmssA');
    const fileName = `${_config.saveFileName}${date}_IST.${_config.saveFileExtension}`;

    const textDataBlob = new Blob([sqlFinal], { type: "text/plain" });
    const downloadUrl = window.URL.createObjectURL(textDataBlob)
    const downloadLink = document.createElement('a');
    downloadLink.download = fileName;
    downloadLink.href = downloadUrl;
    downloadLink.click()

}

