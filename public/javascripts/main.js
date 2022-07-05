// fade out for flash messages
setTimeout(function () {
  $("#flash-msg").fadeOut("slow");
}, 6000);

setTimeout(function () {
  $("#success").fadeOut("slow");
}, 6000);

setTimeout(function () {
  $("#error").fadeOut("slow");
}, 6000);

$(function() {
    if($('select[name="select_category"]')[0]) {
        $('select[name="select_category"]').on("change", function() {
            var redirect_link = $(this).val();
            if(redirect_link !== "") {
                window.location.href = redirect_link;
            }
        })
    }

	var animationEnd = (function(el) {
		var animations = {
		  animation: 'animationend',
		  OAnimation: 'oAnimationEnd',
		  MozAnimation: 'mozAnimationEnd',
		  WebkitAnimation: 'webkitAnimationEnd',
		};
	   
		for (var t in animations) {
		  if (el.style[t] !== undefined) {
			return animations[t];
		  }
		}
	  })(document.createElement('div'));

	  $('.slider-image').one(animationEnd, function(e) { });
});