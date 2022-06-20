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
    xhr.open('GET', "/assets/json/pastas.json");
    xhr.onreadystatechange = function (data) {
      if(xhr.readyState == 4 && xhr.status == 200) {
        params.sentences = JSON.parse(data.currentTarget.response).pastas;
        sentenceScroller(params).draw();
      }
    };
    xhr.send();
});