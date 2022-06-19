// fade out for flash messages
setTimeout(function () {
  $("#flash-msg").fadeOut("slow");
}, 3000);

setTimeout(function () {
  $("#success").fadeOut("slow");
}, 3000);

setTimeout(function () {
  $("#error").fadeOut("slow");
}, 3000);

$(function() {
    if($('select[name="select_category"]')[0]) {
        $('select[name="select_category"]').on("change", function() {
            var redirect_link = $(this).val();
            if(redirect_link !== "") {
                window.location.href = redirect_link;
            }
        })
    }
});