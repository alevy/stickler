(function() {
  for (var i = 0; i < 10; i++) {
    var p = document.createElement("p");
    p.innerHTML = "Ran " + i + " time(s)";
    document.body.appendChild(p);
  }
}());
