const id = "hello world";
var account = () => {
    let i = 0;
    i++
    return i++
};
var button = document.getElementById("test");
button.addEventListener("click", function () {
    var t = account();
    t = t + 2;;
    alert("num:" + t);
});