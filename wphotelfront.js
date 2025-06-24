jQuery(document).ready(function($) {
	jQuery('.deduct_quantity').on('click', function() {
		var quantity = parseInt(jQuery(this).parent().find('.quantity_selector').val());
		if (quantity > 1) {
			jQuery(this).parent().find('.quantity_selector').val(quantity - 1);
		}
	}
	);
	jQuery('.add_quantity').on('click', function() {
		var quantity = parseInt(jQuery(this).parent().find('.quantity_selector').val());
		// get max from input attribute
		var max = parseInt(jQuery(this).parent().find('.quantity_selector').attr('max'));
		if(max != null && quantity >= max){
			return;
		}
		jQuery(this).parent().find('.quantity_selector').val(quantity + 1);
	}
	);
	// on change check_in_date update check_out_date
	jQuery('.check_in_date').on('change', function() {
		var dateString = jQuery(this).val(); // Assuming the input value is in the format DD.MM.YYYY
		var dateParts = dateString.split('.'); // Split the input into day, month, and year parts
		var formattedDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // Create the Date object
		
		// Now you can proceed with the rest of your logic
		formattedDate.setDate(formattedDate.getDate() + 1);
		jQuery('.check_out_date').datepicker('option', 'minDate', formattedDate);
		// check if check_out_date is smaller than check_in_date
		var check_out_date = jQuery('.check_out_date').val();
		var check_out_date_parts = check_out_date.split('.'); // Split the input into day, month, and year parts
		var formattedDate = new Date(check_out_date_parts[2], check_out_date_parts[1] - 1, check_out_date_parts[0]); // Create the Date object
		if(formattedDate < new Date(dateParts[2], dateParts[1] - 1, dateParts[0])){
			jQuery('.check_out_date').val(
			formattedDate.getDate() + '.' + (formattedDate.getMonth() + 1) + '.' + formattedDate.getFullYear()
			);
		}
	});
	setTimeout(function(){
		var dateString = jQuery('.check_in_date').val(); // Assuming the input value is in the format DD.MM.YYYY
		var dateParts = dateString.split('.'); // Split the input into day, month, and year parts
		var formattedDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // Create the Date object
		
		// Now you can proceed with the rest of your logic
		formattedDate.setDate(formattedDate.getDate() + 1);
		jQuery('.check_out_date').datepicker('option', 'minDate', formattedDate);
	},400);
	
	jQuery('.add_ticket_to_cart').on('click', function() {
		var ticket = jQuery(this).parents('tr');
		
		if(parseInt(jQuery(this).parent().parent().find('.quantity_selector').val()) > parseInt(jQuery(this).parent().parent().find('.quantity_selector').attr('max'))){
			alert('Maximum tickets available for this ticket is: '+jQuery(this).parent().parent().find('.quantity_selector').attr('max'));
			return false;
		}
		$.ajax({
			url: product_ajax.ajaxurl,
			type: 'POST',
			data: {
				action: 'woo_events_product_add_to_cart',
				product_id: jQuery(this).data('productid'),
				ticket_id: jQuery(this).data('ticket'),
				quantity: jQuery(this).parent().parent().find('.quantity_selector').val()
			},
			success: function(data) {
				jQuery('body').trigger("added_to_cart", [data.fragments, data.cart_hash]);
				jQuery('#book_room_modal').trigger('click');
				jQuery('.book_room_list').addClass('loading').html('<div class=\'loading_modal\'><span class=\'spinner is-active\'>Loading..</span><svg class="spinning" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg></div>');
				jQuery.ajax({
					url: product_ajax.ajaxurl,
					type: 'POST',
					data: {
						action: 'get_hotels',
						product_id: jQuery('#book_room_modal').data('event-hotelid'),
						check_in_date: jQuery('#book_room_modal').data('event-start'),
						check_out_date: jQuery('#book_room_modal').data('event-end'),
						adults: 2,
						children: 0,
						rooms: 1,
						cache: 0,
						max_results: 6,
						// rating: jQuery(this.el).find('.stars').val(),
					},
					success: function(data) {
						// move map center
						var hotels = JSON.parse(data);
						hotels = hotels.hotels;
						jQuery('.book_room_list').removeClass('loading').html('');

						this.createSvgCircle = function(reviews){
							// create SVG circle that will be filled with color procentagewise knowing that reviews is a number between 0 and 10
							$max = 10;
							$procents = reviews/$max*100;
							var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14" fill="none">';
							svg += '<g clip-path="url(#clip0_17_917)">';
							svg += '<circle cx="7" cy="7" r="7" fill="#E1E1E1"/>';
							svg += '<rect y="-0.800781" width="'+$procents+'%" height="16" fill="#C6A002"/>';
							svg += '</g>';
							svg += '<defs>';
							svg += '<clipPath id="clip0_17_917">';
							svg += '<rect width="14" height="14" rx="7" fill="white"/>';
							svg += '</clipPath>';
							svg += '</defs>';
							svg += '</svg>';
							return svg;
						}
						var self = this;

						hotels.forEach(function(hotel){
							// star rating html
							var stars = '';
							for (var i = 0; i < parseInt(hotel.star_rating); i++) {
								stars += '<i class="fa fa-star" data-av_icon="" data-av_iconfont="entypo-fontello"></i>';
							}
							var reviews = '';
							if(hotel.reviews != null){
								// svgreviews = self.reviewsModule(hotel.reviews.rating);
								reviews = '<div class="reviews trip_advisor">'+hotel.reviews.rating+'<span> ('+hotel.reviews.reviews.length+') </span></div>';
							}
							var images2 = '';
							imgs = JSON.parse(hotel.images);
							imgs.forEach(function(img){
								if(images2.length > 0) return;
								images2 += '<img src="'+img.replace("{size}","240x240")+'">';
								return;
							});					
							var circlesvg = "";
							if(hotel.reviews != null){
								circlesvg = self.createSvgCircle(hotel.reviews.rating);
							}
							jQuery('.book_room_list').append('<div class="hotel medium-6 small-12"><div class="gallery hotel_slider" style="max-width:300px;">'+images2+'<span class="star_rating">'+parseInt(hotel.star_rating)+' <img src="https://grandstandtickets.com/wp-content/uploads/2024/06/star.svg"></img></span><p class="distance_center">Distance from center: <b>'+hotel.distancetocity+' km</b></p><p class="distance_event">Distance from event: <b>'+hotel.distancetoevent+' km</b></p></div><div class="hotel_data"><h3><a  target="_blank" href="'+hotel.url+'">'+hotel.name+'</a></h3><span class="reviews">'+circlesvg+reviews+'</span><p class="hotel_data_room_type">'+hotel.room+'</p><p class="hotel_data_room_price">'+hotel.price+' '+hotel.currency+'</p><a  target="_blank" href="'+hotel.url+'">view more</a><button class="add_hotel_to_cart" data-bookhash="'+hotel.room+'" data-checkoutdate="'+jQuery('#book_room_modal').data('event-end')+'" data-checkindate="'+jQuery('#book_room_modal').data('event-start')+'" data-adults="2" data-children="0" data-rooms="1" data-productid="'+jQuery('#book_room_modal').data('event-hotelid')+'" data-hotelid="'+hotel.hotel_id+'"><i class="icon-shopping-cart"></i></button></div></div>');						
						});
					}

				});				
				jQuery('#book_room .ticket_name').html('<img src="https://grandstandtickets.com/wp-content/uploads/2024/07/icon_ticket.svg" />'+ticket.find('td:nth(0)').text());
				jQuery('#book_room .ticket_price').html(ticket.find('td:nth(1)').text());	
			}
		});
		return false;
	});

	jQuery('body').on('click','.add_hotel_to_cart', function() {
		jQuery('.hotel-rooms').addClass('loading');
		$.ajax({
			url: product_ajax.ajaxurl,
			type: 'POST',
			data: {
				action: 'woo_events_product_add_to_cart',
				product_id: jQuery(this).data('productid'),
				hotel_id: jQuery(this).data('hotelid'),
				bookhash: jQuery(this).data('bookhash'),
				price: jQuery(this).data('price'),
				check_in_date: jQuery(this).data('checkindate'),
				check_out_date: jQuery(this).data('checkoutdate'),
				adults: jQuery(this).data('adults'),
				children: jQuery(this).data('children'),
				rooms: jQuery(this).data('rooms'),
				quantity: 1
			},
			success: function(data) {
				jQuery('body').trigger("added_to_cart", [data.fragments, data.cart_hash]);
				jQuery('.mfp-close').trigger('click');
				// check if mobile and redirect to cart
				if(jQuery(window).width() < 768){
					window.location.href = '/cart/';
				}
				jQuery('.hotel-rooms').removeClass('loading');
			}
		});
		return false;
	});

	if(jQuery('.hotels_block').length > 0){
		jQuery('.hotels_block').each(function(){
			initHotels(this);
		});
	}
	if(jQuery('.hotel-rooms').length > 0){
		jQuery('.hotel-rooms').each(function(){
			initHotelPage(this);
		});
	}
});

function initHotelPage(el){
	this.el = el;
	this.init = function(){
		this.getHotelRooms();
		jQuery('.search_rooms').on('click', function(){
			this.getHotelRooms();
		}.bind(this));
		jQuery('.datepicker').datepicker({
			dateFormat: 'dd.mm.yy'
		});
	}
	this.getHotelRooms = function(){
		this.showLoading();
		var self = this;
		jQuery.ajax({
			url: product_ajax.ajaxurl,
			type: 'POST',
			data: {
				action: 'get_hotel',
				product_id: jQuery(this.el).find('.product_id').val(),
				hotel_id: jQuery(this.el).find('.hotel_id').val(),
				check_in_date: jQuery(this.el).find('.check_in_date').val(),
				check_out_date: jQuery(this.el).find('.check_out_date').val(),
				rooms: jQuery(this.el).find('.rooms').val(),
				adults: jQuery(this.el).find('.adults').val(),
				children: jQuery(this.el).find('.childs').val(),
			},
			success: function(data) {
				self.showHotelRooms(data);
				self.hideLoading();
			}
		});
	}
	this.showHotelRooms = function(data){
		var rooms = JSON.parse(data);
		var html = '';
		rooms.forEach(function(room){
			var tax_html = '';
			if(room.taxdata != null){
				if(room.taxdata.taxes != null){
					room.taxdata.taxes.forEach(function(tax){
						var name = tax.name.replaceAll("_"," ");
						// upcase first letter
						name = name.charAt(0).toUpperCase() + name.slice(1);
						tax_html += '<p style="font-size: 12px;">'+name+': '+tax.amount+' '+tax.currency_code+(tax.included_by_supplier?' (included)':' (not included)')+'</p>';
					});
				}
			}
			html += '<div class="room"><h3>'+room.name+'</h3><p class="hotel_room_meal"><img src="https://grandstandtickets.com/wp-content/uploads/2024/07/icon_restaurant.svg" /> '+room.meal+'</p class="hotel_room_bed"><p><img src="https://grandstandtickets.com/wp-content/uploads/2024/07/icon_bed.svg" /> '+(room.bed_type == null?'Not specified':room.bed_type)+'</p><p class="hotel_room_price">'+room.price+' '+room.currency+'</p><button class="add_hotel_to_cart" data-bookhash="'+room.room_id+'" data-price="'+room.price+'" data-checkoutdate="'+room.checkoutdate+'" data-checkindate="'+room.checkindate+'" data-adults="'+room.adults+'" data-children="'+room.children+'" data-rooms="'+room.rooms+'" data-productid="'+jQuery(this.el).find('.product_id').val()+'" data-hotelid="'+room.hotel_id+'">Add to cart</button>'+tax_html+'</div>';
		});
		if(rooms.length == 0){
			html = '<p>No rooms available</p>';
		}
		jQuery(this.el).find('.rooms_list').html(html);		
	}
	this.showLoading = function(){
		jQuery(this.el).addClass('loading');
	}
	this.hideLoading = function(){
		jQuery(this.el).removeClass('loading');
	}
	this.init();
}

function initHotels(el){
	this.el = el;
	this.map = null;
	this.init = function(){
		var self = this;
		// load google maps js
		var script = document.createElement('script');
		window['initMap'] = this.initMap.bind(this);
		script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyClfknTnRyps2mzcbKXL85owda-H0iknHM&callback=initMap';
		script.async = true;
		document.head.appendChild(script);
		// load marker clusterer
		var script = document.createElement('script');
		script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gmaps-marker-clusterer/1.2.2/markerclusterer.min.js';
		script.async = true;
		document.head.appendChild(script);
		jQuery('.datepicker').datepicker({
			dateFormat: 'dd.mm.yy'
		});
		jQuery('.search_hotels').on('click', function(){
			self.showLoading();
			self.getHotels(0);
		});				
	}
	this.initMap = function(){
		this.map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: {lat: 40.7128, lng: -74.0060}
		});
		this.getHotels(1);
	}
	this.reviewsModule = function(reviews){
		// create SVG like tripadvisor with 5 circles that can be filled full or halfs knowing that reviews is a number between 0 and 10
		var svg = '<svg width="100" height="20">';
		reviews = Math.round(reviews);
		var full = Math.floor(reviews/2);
		var half = reviews % 2;
		for (var i = 0; i < full; i++) {
			svg += '<circle cx="'+(i*20+10)+'" cy="10" r="7" fill="#00aa6c" />';
		}
		if(half){
			svg += '<circle cx="'+(full*20+10)+'" cy="10" r="7" fill="#00aa6c" />';
			svg += '<circle cx="'+(full*20+10)+'" cy="10" r="3" fill="#fff" />';
		}
		for (var i = full+half; i < 5; i++) {
			svg += '<circle cx="'+(i*20+10)+'" cy="10" r="7" fill="#fff" />';
		}
		svg += '</svg>';
		return svg;
	}
	this.createSvgCircle = function(reviews){
		// create SVG circle that will be filled with color procentagewise knowing that reviews is a number between 0 and 10
		$max = 10;
		$procents = reviews/$max*100;
		var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14" fill="none">';
		svg += '<g clip-path="url(#clip0_17_917)">';
		svg += '<circle cx="7" cy="7" r="7" fill="#E1E1E1"/>';
		svg += '<rect y="-0.800781" width="'+$procents+'%" height="16" fill="#C6A002"/>';
		svg += '</g>';
		svg += '<defs>';
		svg += '<clipPath id="clip0_17_917">';
		svg += '<rect width="14" height="14" rx="7" fill="white"/>';
		svg += '</clipPath>';
		svg += '</defs>';
		svg += '</svg>';
		return svg;
	}
	this.initSlider = function(){
		jQuery('.gallery').slick();
	}
	this.getHotels = function(cache){
		var self = this;
		var infoWindows = [];
		jQuery.ajax({
			url: product_ajax.ajaxurl,
			type: 'POST',
			data: {
				action: 'get_hotels',
				product_id: jQuery(this.el).data('id'),
				check_in_date: jQuery(this.el).find('.check_in_date').val(),
				check_out_date: jQuery(this.el).find('.check_out_date').val(),
				adults: jQuery(this.el).find('.adults').val(),
				children: jQuery(this.el).find('.children').val(),
				rooms: jQuery(this.el).find('.rooms').val(),
				cache: cache,
				// rating: jQuery(this.el).find('.stars').val(),
			},
			success: function(data) {
				self.hideLoading();
				// move map center
				var bounds = new google.maps.LatLngBounds();
				var hotels = JSON.parse(data);
				hotels = hotels.hotels;
				// marker click show info window
				
				var markers = [];
				jQuery('.hotels_list').html('');
				// remove markers
				markers.forEach(function(marker){
					marker.setMap(null);
				});
				// remove clusters
				if(typeof markerCluster != 'undefined'){
					markerCluster.clearMarkers();
				}
				var event_marker = false;
				hotels.forEach(function(hotel){
					// star rating html
					var stars = '';
					for (var i = 0; i < parseInt(hotel.star_rating); i++) {
						stars += '<i class="fa fa-star" data-av_icon="" data-av_iconfont="entypo-fontello"></i>';
					}
					var reviews = '';
					if(hotel.reviews != null){
						// svgreviews = self.reviewsModule(hotel.reviews.rating);
						reviews = '<div class="reviews trip_advisor">'+hotel.reviews.rating+'<span> ('+hotel.reviews.reviews.length+') </span></div>';
					}
					var images2 = '';
					imgs = JSON.parse(hotel.images);
					imgs.forEach(function(img){
						if(images2.length > 0) return;
						images2 += '<img src="'+img.replace("{size}","240x240")+'">';
						return;
					});
					if(hotel.reviews != null){
						var circlesvg = self.createSvgCircle(hotel.reviews.rating);
					} else {
						var circles = self.createSvgCircle(0);
					}
					jQuery('.hotels_list').append('<div class="hotel medium-6 small-12"><div class="gallery hotel_slider" style="max-width:300px;">'+images2+'<span class="star_rating">'+parseInt(hotel.star_rating)+' <img src="https://grandstandtickets.com/wp-content/uploads/2024/06/star.svg"></img></span><p class="distance_center">Distance from center: <b>'+hotel.distancetocity+' km</b></p><p class="distance_event">Distance from event: <b>'+hotel.distancetoevent+' km</b></p></div><div class="hotel_data"><h3><a  target="_blank" href="'+hotel.url+'">'+hotel.name+'</a></h3><span class="reviews">'+circlesvg+reviews+'</span><p class="hotel_data_room_type">'+hotel.room+'</p><p class="hotel_data_room_price">'+hotel.price+' '+hotel.currency+'</p><a  target="_blank" href="'+hotel.url+'">view more</a><button class="add_hotel_to_cart" data-bookhash="'+hotel.room+'" data-checkoutdate="'+jQuery(this.el).find('.check_out_date').val()+'" data-checkindate="'+jQuery(this.el).find('.check_in_date').val()+'" data-adults="'+jQuery(this.el).find('.adults').val()+'" data-children="'+jQuery(this.el).find('.children').val()+'" data-rooms="'+jQuery(this.el).find('.rooms').val()+'" data-productid="'+jQuery(self.el).data('id')+'" data-hotelid="'+hotel.hotel_id+'"><i class="icon-shopping-cart"></i></button></div></div>');
					let infowindow = new google.maps.InfoWindow();
					var marker = new google.maps.Marker({
						position: {lat: parseFloat(hotel.latitude), lng: parseFloat(hotel.longitude)},
						map: self.map,
						title: hotel.name,
						animation: google.maps.Animation.DROP,
						// set hotel icon
						icon: {
							url: 'http://maps.gstatic.com/mapfiles/ms2/micons/lodging.png',
							scaledSize: new google.maps.Size(40, 40)
						}
					});
					if(!event_marker){
						var event_marker = new google.maps.Marker({
							position: {lat: parseFloat(hotel.event_lat), lng: parseFloat(hotel.event_lng)},
							map: self.map,
							title: 'Event Location',
							animation: google.maps.Animation.DROP,
							// set hotel icon
							icon: {
								url: 'https://www.grandstandtickets.com/wp-content/uploads/2024/10/map_center_location_event.png',
								scaledSize: new google.maps.Size(33, 62)
							}
						});
						markers.push(marker);
					}

					let images = JSON.parse(hotel.images);
					markers.push(marker);
					marker.addListener('click', function() {
						// close other info windows
						infoWindows.forEach(function(infoWindow){
							infoWindow.close();
						});
						infowindow.setContent('<div class="map_marker_popup"><img src="'+images[0].replace("{size}","x220")+'"><br/><strong>' + hotel.name + '</strong><br><p>' + hotel.room + '</p><br><p class="map_price>"' + hotel.price + ' GBP</p><br/><a target="_blank" href="'+hotel.url+'">view more</a></div>');
						infowindow.open(self.map, marker);
					});
					bounds.extend(marker.getPosition());
					infoWindows.push(infowindow);
				});
				// init slider
				// self.initSlider();
				// markers cluster
				var markerCluster = new MarkerClusterer(self.map, markers, {
					imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
				});
				self.map.fitBounds(bounds);
				self.map.setCenter(bounds.getCenter());
				// close info windows on click map
				self.map.addListener('click', function() {
					infoWindows.forEach(function(infoWindow){
						infoWindow.close();
					});
				});
				// remove other 

				// self.showHotels(data);
			}
		});
	}
	this.showLoading = function(){
		jQuery(this.el).addClass('loading');
	}
	this.hideLoading = function(){
		jQuery(this.el).removeClass('loading');
	}
	this.init();
}