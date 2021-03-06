document.addEventListener("DOMContentLoaded", function () {
  var sentence_params = {
    json_file: "/assets/json/sentences.json",
    canvasId: "splash",
    backgroundColor: "#000000",
    fontFamily: 'arial',
    fontSizeVmin: 2,
    color: "#FFFFFF"
  };

  // Load senteces and start the animation
  var xhr = new XMLHttpRequest();
  xhr.open('GET', sentence_params.json_file);
  xhr.onreadystatechange = function (data) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      sentence_params.sentences = JSON.parse(data.currentTarget.response).sentences;
      sentenceScroller(sentence_params).draw();
    }
  };
  xhr.send();
});