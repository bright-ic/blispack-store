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

	if($('.tabs.featured-categories-tabs .tab-item')[0]) {
		$('.tabs.featured-categories-tabs .tab-item').on('click', function() {
			$that = $(this);
			$target = $that.data('target');
			$target_element = $('#'+$target)[0] ? $('#'+$target) : ($('.'+$target)[0] ? $('.'+$target) : null);
			if($target_element && $target_element[0]) {
				if($('.featured-category-products .featured-tab-content-item.active')[0]) {
					$('.featured-category-products .featured-tab-content-item').removeClass('active')
				}
				$target_element.addClass('active');
			}

			$('.tabs.featured-categories-tabs .tab-item').removeClass('active');
			$that.addClass('active');
		})
	}
});