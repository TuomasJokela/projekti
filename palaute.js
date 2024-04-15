var modal = document.getElementById("myModal");
var btn = document.getElementById("openModalBtn");
var span = document.getElementsByClassName("close")[0];


btn.onclick = function() {
modal.style.display = "block";
}


span.onclick = function() {
modal.style.display = "none";
}


window.onclick = function(event) {
if (event.target == modal) {
    modal.style.display = "none";
}
}


document.getElementById("submitFeedbackBtn").onclick = function() {
var feedback = document.getElementById("feedbackTextarea").value;
alert("Kiitos palautteesta:\n" + feedback);
modal.style.display = "none";
}