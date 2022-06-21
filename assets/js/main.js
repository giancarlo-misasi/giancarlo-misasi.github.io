document.addEventListener("DOMContentLoaded", function() {
    var params = {
        canvasId: "splash",
        backgroundColor: "#000000",
        fontFamily: 'arial',
        fontSizeVmin: 2,
        color: "#FFFFFF"
    };

    // Load senteces and start the animation
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "/assets/json/sentences.json");
    xhr.onreadystatechange = function (data) {
      if(xhr.readyState == 4 && xhr.status == 200) {
        params.sentences = JSON.parse(data.currentTarget.response).sentences;
        sentenceScroller(params).draw();
      }
    };
    xhr.send();

    // Setup smooth scrolling
    new SweetScroll({ });
});