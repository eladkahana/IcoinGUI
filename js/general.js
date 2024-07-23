// Function to open a tab
function openTab(tabName) {
    var i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabLinks = document.getElementsByClassName("tab");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");

    if (tabName === "dashboard") {
        const iframe = document.getElementById(tabName).querySelector("iframe");
        iframe.contentWindow.location.reload();
    }
}

function resizeIframe(iframe) {
    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
}