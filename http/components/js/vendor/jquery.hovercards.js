/* HOVER FUNCTIONS */
function change_image(bild){
        //console.log(bild);
	$('#cardPicDummy').fadeOut(100, function() {
		$("#cardPicDummy").attr("src", '/img/cardpics/'+bild+'.jpg');
			$('#cardPicDummy').fadeIn(100);
	});
}

/* 
 * 
 * TEST
 * */
function change_image_thumb(bild){
        //console.log(bild);
	$('#cardPicDummy').fadeOut(100, function() {
		$("#cardPicDummy").attr("src", '/img/cardpics/'+bild+'.jpg');
			$('#cardPicDummy').fadeIn(100);
	});
}





