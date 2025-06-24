<?php
use WooEventsProduct\EmergicTravel;

// Add new product type selector
add_filter('product_type_selector', 'woo_hotels_product_type_selector');
function woo_hotels_product_type_selector($types)
{
	$types['hotel'] = __('Hotel Product', 'woo-hotels-product');
	return $types;
}

// Add the product type class
add_action('init', 'woo_hotels_product_type_class');
function woo_hotels_product_type_class()
{
	class WC_Product_Hotel extends WC_Product
	{
		public function __construct($product)
		{
			$this->product_type = 'hotel';
			parent::__construct($product);
		}
	}
}

// Load new product Type class
add_filter( 'woocommerce_product_class', 'woo_hotels_product_class', 10, 2 );
function woo_hotels_product_class( $classname, $product_type ) {
	if ( $product_type == 'hotel' ) {
		$classname = 'WC_Product_Hotel';
	}
	return $classname;
}

// Add new product type data
add_filter('woocommerce_product_data_tabs', 'woo_hotels_product_data_tabs');
function woo_hotels_product_data_tabs($tabs)
{
	$tabs['hotel'] = array(
		'label' => __('Hotel Product', 'woo-hotels-product'),
		'target' => 'hotel_product_data',
		'class' => array('show_if_hotel'),
	);
	return $tabs;
}

// Add new product type panel
add_action('woocommerce_product_data_panels', 'woo_hotels_product_data_panels');

function woo_hotels_product_data_panels(){
	global $post;
	?>
	<div id='hotel_product_data' class='panel woocommerce_options_panel'>
		<div class='options_group'>
			<?php
			// get values
			$city = get_post_meta($post->ID, '_city', true);
			$region_id = get_post_meta($post->ID, '_region_id', true);
			$check_in_date = get_post_meta($post->ID, '_check_in_date', true);
			$check_out_date = get_post_meta($post->ID, '_check_out_date', true);
			$margin_price = get_post_meta($post->ID, '_margin_price', true);
			$event_lat = get_post_meta($post->ID, '_event_lat', true);
			$event_long = get_post_meta($post->ID, '_event_long', true);
			$city_lat = get_post_meta($post->ID, '_city_lat', true);
			$city_long = get_post_meta($post->ID, '_city_long', true);
			// add city input field
			woocommerce_wp_text_input(
				array(
					'id' => '_city',
					'label' => __('City', 'woo-hotels-product'),
					'desc_tip' => 'true',
					'description' => __('Enter the city.', 'woo-hotels-product'),
					'type' => 'text',
					'class' => 'search_hotel_city',
					'value' => $city,
				)
			);
			// add region id input field
			woocommerce_wp_text_input(
				array(
					'id' => '_region_id',
					'label' => __('Region Id', 'woo-hotels-product'),
					'desc_tip' => 'true',
					'description' => __('Autocompletes on city select', 'woo-hotels-product'),
					'type' => 'text',
					'class' => 'search_hotel_id',
					'value' => $region_id,
				)
			);
			// add check in date input field
			woocommerce_wp_text_input(
				array(
					'id' => '_check_in_date',
					'label' => __('Check In Date', 'woo-hotels-product'),
					'desc_tip' => 'true',
					'description' => __('Enter the check in date.', 'woo-hotels-product'),
					'type' => 'date',
					'value' => $check_in_date,
				)
			);
			// add check out date input field
			woocommerce_wp_text_input(
				array(
					'id' => '_check_out_date',
					'label' => __('Check Out Date', 'woo-hotels-product'),
					'desc_tip' => 'true',
					'description' => __('Enter the check out date.', 'woo-hotels-product'),
					'type' => 'date',
					'value' => $check_out_date,
				)
			);
			// add margin price input field
			woocommerce_wp_text_input(
				array(
					'id' => '_margin_price',
					'label' => __('Margin Price (£)(%)', 'woo-hotels-product'),
					'desc_tip' => 'true',
					'description' => __('Enter the margin price.', 'woo-hotels-product'),
					'type' => 'number',
					'custom_attributes' => array(
						'step' => 'any',
						'min' => '0',
					),
					'value' => $margin_price,
				)
			);
			// add event coordonates input field
			woocommerce_wp_text_input(
				array(
					'id' => '_event_lat',
					'label' => __('Event Coord Latitude', 'woo-hotels-product'),
					'desc_tip' => 'true',
					'description' => __('Enter Latitude of the event location', 'woo-hotels-product'),
					'type' => 'number',
					'custom_attributes' => array(
						'step' => 'any',
					),
					'value' => $event_lat,
				)
			);			
			woocommerce_wp_text_input(
				array(
					'id' => '_event_long',
					'label' => __('Event Coord Longitude', 'woo-hotels-product'),
					'desc_tip' => 'true',
					'description' => __('Enter Longitude of the event location', 'woo-hotels-product'),
					'type' => 'number',
					'custom_attributes' => array(
						'step' => 'any',
					),
					'value' => $event_long,
				)
			);
			// add city center coordonates input field
			woocommerce_wp_text_input(
				array(
					'id' => '_city_lat',
					'label' => __('City Center Latitude', 'woo-hotels-product'),
					'desc_tip' => 'true',
					'description' => __('Enter Latitude of the city center', 'woo-hotels-product'),
					'type' => 'number',
					'custom_attributes' => array(
						'step' => 'any',
					),
					'value' => $city_lat,
				)
			);
			woocommerce_wp_text_input(
				array(
					'id' => '_city_long',
					'label' => __('City Center Longitude', 'woo-hotels-product'),
					'desc_tip' => 'true',
					'description' => __('Enter Longitude of the city center', 'woo-hotels-product'),
					'type' => 'number',
					'custom_attributes' => array(
						'step' => 'any',
					),
					'value' => $city_long,
				)
			);
			?>
		</div>
	</div>
	<?php
}

// Save new product type data
add_action('woocommerce_process_product_meta', 'woo_hotels_product_save_data');

function woo_hotels_product_save_data($post_id)
{
	// save city
	$city = isset($_POST['_city']) ? $_POST['_city'] : '';
	update_post_meta($post_id, '_city', sanitize_text_field($city));
	// save region id
	$region_id = isset($_POST['_region_id']) ? $_POST['_region_id'] : '';
	update_post_meta($post_id, '_region_id', sanitize_text_field($region_id));
	// save check in date
	$check_in_date = isset($_POST['_check_in_date']) ? $_POST['_check_in_date'] : '';
	update_post_meta($post_id, '_check_in_date', sanitize_text_field($check_in_date));
	// save check out date
	$check_out_date = isset($_POST['_check_out_date']) ? $_POST['_check_out_date'] : '';
	update_post_meta($post_id, '_check_out_date', sanitize_text_field($check_out_date));
	// save margin price
	$margin_price = isset($_POST['_margin_price']) ? $_POST['_margin_price'] : '';
	update_post_meta($post_id, '_margin_price', sanitize_text_field($margin_price));
	// save event lat
	$event_lat = isset($_POST['_event_lat']) ? $_POST['_event_lat'] : '';
	update_post_meta($post_id, '_event_lat', sanitize_text_field($event_lat));
	// save event long
	$event_long = isset($_POST['_event_long']) ? $_POST['_event_long'] : '';
	update_post_meta($post_id, '_event_long', sanitize_text_field($event_long));
	// save city lat
	$city_lat = isset($_POST['_city_lat']) ? $_POST['_city_lat'] : '';
	update_post_meta($post_id, '_city_lat', sanitize_text_field($city_lat));
	// save city long
	$city_long = isset($_POST['_city_long']) ? $_POST['_city_long'] : '';
	update_post_meta($post_id, '_city_long', sanitize_text_field($city_long));
}

// add ajax to search hotel city
add_action('wp_ajax_search_hotel_city', 'search_hotel_city');
add_action('wp_ajax_nopriv_search_hotel_city', 'search_hotel_city');

function search_hotel_city(){
	// get city
	$city = $_GET['term'];
	// search city
	$emergic_travel = new EmergicTravel();
	$regions = $emergic_travel->searchRegion($city);
	$cities = [];
	if(is_array($regions)){
		foreach($regions as $region){
			if($region->type == 'City'){
				$city = new \stdClass();
				$city->value = $region->id;
				$city->label = $region->name;
				$cities[] = $city;
			}
		}
	}
	echo json_encode($cities);
	// return
	wp_die();
}

// add shortcode to display table with product prices
add_shortcode('woo_hotels_product_prices', 'woo_hotels_product_prices');

// add schedule to cache hotels data every 30 minutes
add_action('init', 'schedule_cache_product_hotels');
function schedule_cache_product_hotels(){
	if(!wp_next_scheduled('cache_product_hotels')){
		wp_schedule_event(time(), 'every_30_minutes', 'cache_product_hotels');
	}
}

// add custom cron schedule
add_filter('cron_schedules', 'add_every_30_minutes');
function add_every_30_minutes($schedules){
	$schedules['every_30_minutes'] = array(
		'interval' => 1800,
		'display' => __('Every 30 minutes')
	);
	return $schedules;
}

// cache hotels data based on 2 adults 1 room checkin check out date of the product and region id
function cacheProductHotels(){
	// get all products of type hotel
	$products = wc_get_products(array('type' => 'hotel'));
	// loop through products
	foreach ($products as $product) {
		// get product id
		$product_id = $product->get_id();
		// get product region id
		$region_id = get_post_meta($product_id, '_region_id', true);
		// get product check in date
		$check_in_date = get_post_meta($product_id, '_check_in_date', true);
		// get product check out date
		$check_out_date = get_post_meta($product_id, '_check_out_date', true);
		// check_in_date to timestamp DD.MM.YYYY
		$check_in_date = strtotime($check_in_date);
		// check_out_date to timestamp DD.MM.YYYY
		$check_out_date = strtotime($check_out_date);
		// get hotels
		$hotels = (new EmergicTravel())->searchHotelInRegion($region_id,date("Y-m-d",$check_in_date),date("Y-m-d",$check_out_date),2,0,1);
		// save hotels as transient
		set_transient('product_hotels_'.$product_id, $hotels, 60*60);
	}		
}


// get hotel product price
function getHotelProductPrice($product_id,$api_price,$current_currency = "GBP"){
	$margin_price = get_post_meta($product_id, '_margin_price', true);
	$price = $api_price + ($api_price * $margin_price / 100);
	$currency = "GBP";
	if($current_currency != "GBP"){
		$currency = $current_currency;
		$price = ceil($price);
		return array('price' => $price, 'currency' => $currency);
	}
	$currentCurrencyRate = 1;
	if(class_exists('WOOMULTI_CURRENCY_Data')) {
		$multiCurrencySettings = WOOMULTI_CURRENCY_Data::get_ins();
		$wmcCurrencies = $multiCurrencySettings->get_list_currencies();
		$userSelectedCurrency = $multiCurrencySettings->get_current_currency();
		// get rate of current currency
		$productCurrencyRate = floatval( $wmcCurrencies[ $current_currency ]['rate'] );
		$userSelectedRate = floatval( $wmcCurrencies[ $userSelectedCurrency ]['rate'] );
		$currency = $currentCurrency;
		// get difference between current currency and user selected currency
		$currentCurrencyRate =  $userSelectedRate / $productCurrencyRate;
		$currency = $userSelectedCurrency;
	}
	$price = $price * $currentCurrencyRate;
	$price = number_format($price, 2, '.', '');
	// round up price
	$price = ceil($price);
	return array('price' => $price, 'currency' => $currency);
}


// get hotels ajax by product id and custom checkin and checkout date
add_action('wp_ajax_get_hotels', 'get_hotels');
add_action('wp_ajax_nopriv_get_hotels', 'get_hotels');

function get_hotels(){
	// show php errors
	global $wpdb;
	// get product id
	$product_id = $_POST['product_id'];
	// get product
	$product = wc_get_product($product_id);
	// get product city
	$city = get_post_meta($product_id, '_city', true);
	// get product region id
	$region_id = get_post_meta($product_id, '_region_id', true);
	// get product check in date
	$check_in_date = $_POST['check_in_date'];
	// get product check out date
	$check_out_date = $_POST['check_out_date'];
	// check_in_date to timestamp DD.MM.YYYY
	$check_in_date = strtotime($check_in_date);
	// check_out_date to timestamp DD.MM.YYYY
	$check_out_date = strtotime($check_out_date);
	$adults = $_POST['adults'];
	$children = $_POST['children'];
	$rooms = $_POST['rooms'];
	// $rating = $_POST['rating'];
	$rating = null;

	// get product city center coords from product id
	$city_lat = get_post_meta($product_id, '_city_lat', true);
	$city_lng = get_post_meta($product_id, '_city_long', true);
	// get product event coords from product id
	$event_lat = get_post_meta($product_id, '_event_lat', true);
	$event_lng = get_post_meta($product_id, '_event_long', true);
	if((isset($_POST['cache']) && $_POST['cache'] == "0") || $adults != 2 || $children != 0 || $rooms != 1){
		// get hotels
		$hotels = (new EmergicTravel())->searchHotelInRegion($region_id,date("Y-m-d",$check_in_date),date("Y-m-d",$check_out_date),$adults,$children,$rooms,$rating);
	} else {
		// get hotels from transient
		$hotels = get_transient('product_hotels2_'.$product_id."_".md5($check_in_date."".$check_out_date));
		if(!$hotels){
			// get hotels
			$hotels = (new EmergicTravel())->searchHotelInRegion($region_id,date("Y-m-d",$check_in_date),date("Y-m-d",$check_out_date),$adults,$children,$rooms,$rating);
			// save hotels as transient
			set_transient('product_hotels2_'.$product_id."_".md5($check_in_date."".$check_out_date), $hotels, 60*60);
		}
	}
	// $hotels = (new EmergicTravel())->searchHotelInRegion($region_id,date("Y-m-d",$check_in_date),date("Y-m-d",$check_out_date),$adults,$children,$rooms,$rating);
	$returnhotels = [];
	$center = [
		'latitude' => 0,
		'longitude' => 0,
	];
	if($hotels)
	foreach ($hotels as $hotel) {
		$name = $hotel->id;
		$name = str_replace('_', ' ', $name);
		$name = strtolower($name);
		$name = ucwords($name);
		// get hotel price
		$hotel_price = getHotelProductPrice($product_id,$hotel->rates[0]->payment_options->payment_types[0]->show_amount,$hotel->rates[0]->payment_options->payment_types[0]->currency_code);
		// get hotel from database using hotel id
		$db_hotel = $wpdb->get_row("SELECT * FROM hotels WHERE hotel_id = \"$hotel->id\"");
		$reviews = getHotelReviews($hotel->id);
		if($db_hotel){
			$distancetocity = 0;
			$distancetoevent = 0;

			if($city_lat && $city_lng){
				$distancetocity = distance($city_lat, $city_lng, $db_hotel->latitude, $db_hotel->longitude, "K");
			}
			if($event_lat && $event_lng){
				$distancetoevent = distance($event_lat, $event_lng, $db_hotel->latitude, $db_hotel->longitude, "K");
			}	

			$returnhotels[] = [
				'name' => $name,
				'room' => $hotel->rates[0]->room_name,
				'price' => $hotel_price['price'],
				'currency' => $hotel_price['currency'],
				'hotel_id' => $hotel->id,
				'match_hash' => $hotel->rates[0]->match_hash,
				'latitude' => $db_hotel->latitude,
				'longitude' => $db_hotel->longitude,
				'images' => $db_hotel->images,
				// get product url
				'url' => get_permalink($product_id).'?hotel='.$hotel->id.'&check_in_date='.date("d.m.Y",$check_in_date).'&check_out_date='.date("d.m.Y",$check_out_date).'&adults='.$adults.'&children='.$children.'&rooms='.$rooms,
				'address' => $db_hotel->address,
				'description_struct' => $db_hotel->description_struct,
				'star_rating' => $db_hotel->star_rating,
				'reviews' => $reviews,
				'distancetocity' => $distancetocity,
				'distancetoevent' => $distancetoevent,
				'city_lat' => $city_lat,
				'city_lng' => $city_lng,
				'event_lat' => $event_lat,
				'event_lng' => $event_lng,
			];			
			$center['latitude'] += $db_hotel->latitude;
			$center['longitude'] += $db_hotel->longitude;
			
		} else {
			// $returnhotels[] = [
			// 	'name' => $name,
			// 	'room' => $hotel->rates[0]->room_name,
			// 	'price' => $hotel_price,
			// 	'currency' => $hotel->rates[0]->payment_options->payment_types[0]->currency_code,
			// 	'hotel_id' => $hotel->id,
			// 	'match_hash' => $hotel->rates[0]->match_hash,
			// ];
		}
	}
	if(count($returnhotels) == 0){
		echo json_encode(array('hotels'=>[],'center'=>$center));
		wp_die();
	} else {
		$center['latitude'] = $center['latitude'] / count($returnhotels);
		$center['longitude'] = $center['longitude'] / count($returnhotels);
	}

	echo json_encode(array('hotels'=>$returnhotels,'center'=>$center));
	// return
	wp_die();
}


function woo_hotels_product_prices($atts)
{
	// get product id
	$product_id = isset($atts['product_id']) ? $atts['product_id'] : '';
	// get product
	$product = wc_get_product($product_id);
	// get product type
	$product_type = $product->get_type();
	// check if product type is hotel
	if($product_type == 'hotel'){
		// get product city
		$city = get_post_meta($product_id, '_city', true);
		// get product region id
		$region_id = get_post_meta($product_id, '_region_id', true);
		// get product check in date
		$check_in_date = get_post_meta($product_id, '_check_in_date', true);
		// get product check out date
		$check_out_date = get_post_meta($product_id, '_check_out_date', true);
		// check_in_date to timestamp DD.MM.YYYY
		$check_in_date = strtotime($check_in_date);
		// check_out_date to timestamp DD.MM.YYYY
		$check_out_date = strtotime($check_out_date);
		// $hotels = (new EmergicTravel())->searchHotelInRegion($region_id,date("Y-m-d",$check_in_date),date("Y-m-d",$check_out_date));
		$hotelscontainer = "<div class='hotels_block loading' data-id='".$product_id."'>";
		// get product image
		$product_image = wp_get_attachment_image_src($product->get_image_id(), 'full');
		if($product_image){
			$product_image = $product_image[0];
		} else {
			$product_image = '';
		}
		$product_name = $product->get_name();		
		$hotelscontainer .= "<div class='hotel_top_section' style='background-image:url(\"".$product_image."\");'>";
		$hotelscontainer .= "<div class='loading_hotels'>";
		$hotelscontainer .= "<span class='spinner is-active'>Loading..</span>";
		$hotelscontainer .= '<svg class="spinning" viewBox="0 0 50 50"><circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle></svg>';
		$hotelscontainer .= "</div>";
		$hotelscontainer .= "<div class='hotel_search row'><div class='check_in_out_fields col'>";
		//$hotelscontainer .= "<h1>".$product_name."</h1>";
		$hotelscontainer .= "<h1>Plan your next stay</h1>";
		$hotelscontainer .= "<h3>Explore budget-friendly options on hotels, vacation homes and more..</h3>";
		$hotelscontainer .= '<a class="button primary" style="border-radius:10px;"><span>See tickets</span></a>';
		$hotelscontainer .= '<a class="button secondary is-gloss" style="border-radius:10px;"><span>Find a hotel</span></a>';
		// show label for check in and check out fields
		$hotelscontainer .= "<div class='book_hotel_form'><div class='book_hotel_form_dates'>";
		$hotelscontainer .= "<div class='book_hotel_form_input_wrapper'>";
		$hotelscontainer .= "<label>".__('Check-in: ', 'woo-events-product')."</label>";
		$hotelscontainer .= "<input type='text' class='check_in_date datepicker' value='".date("d.m.Y",$check_in_date)."' />";
		$hotelscontainer .= "</div>";
		$hotelscontainer .= '<svg class="arrow_dates" width="19" height="12" viewBox="0 0 19 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.3" d="M13.1371 11.4205L11.9666 10.2557L15.4723 6.75568H0.773438V5.0625H15.4723L11.9666 1.55682L13.1371 0.397727L18.6484 5.90909L13.1371 11.4205Z" fill="black"/></svg>';
		$hotelscontainer .= "<div class='book_hotel_form_input_wrapper'>";
		$hotelscontainer .= "<label>".__('Check-out: ', 'woo-events-product')."</label>";
		$hotelscontainer .= "<input type='text' class='check_out_date datepicker' value='".date("d.m.Y",$check_out_date)."' />";
		$hotelscontainer .= "</div></div>";
		// show input field for number of rooms
		$hotelscontainer .= "<div class='book_hotel_form_input_wrapper'>";
		$hotelscontainer .= "<label>".__('Rooms: ', 'woo-events-product')."</label>";
		$hotelscontainer .= "<input type='number' class='rooms' value='1' />";
		$hotelscontainer .= "</div>";
		// show input field for number of adults
		$hotelscontainer .= "<div class='book_hotel_form_input_wrapper'>";
		$hotelscontainer .= "<label>".__('Adults: ', 'woo-events-product')."</label>";
		$hotelscontainer .= "<input type='number' class='adults' value='2' />";
		$hotelscontainer .= "</div>";
		// show input field for number of children
		$hotelscontainer .= "<div class='book_hotel_form_input_wrapper' style='display:none;'>";
		$hotelscontainer .= "<label>".__('Children: ', 'woo-events-product')."</label>";
		$hotelscontainer .= "<input type='number' class='children' value='0' />";
		$hotelscontainer .= "</div>";
		// show dropdown for number of stars
		// $hotelscontainer .= "<label>".__('Hotel Rating: ', 'woo-events-product')."</label>";
		// $hotelscontainer .= "<select class='stars' style='max-width:150px; display: inline-block; margin-right:10px;'>";
		// $hotelscontainer .= "<option value=''>".__('All Stars', 'woo-events-product')."</option>";
		// $hotelscontainer .= "<option value='5'>".__('5 Stars', 'woo-events-product')."</option>";
		// $hotelscontainer .= "<option value='4'>".__('4 Stars', 'woo-events-product')."</option>";
		// $hotelscontainer .= "<option value='3'>".__('3 Stars', 'woo-events-product')."</option>";
		// $hotelscontainer .= "<option value='2'>".__('2 Stars', 'woo-events-product')."</option>";
		// $hotelscontainer .= "<option value='1'>".__('1 Star', 'woo-events-product')."</option>";
		// $hotelscontainer .= "</select>";
		$hotelscontainer .= "<button class='search_hotels'>".__('Search Hotel', 'woo-events-product')."</button>";
		$hotelscontainer .= "</div></div></div>";
		$hotelscontainer .= "</div>";
		$hotelscontainer .= "<div class='flex_column flex_column_table row'>";
		// show check in and check out fields and allow user to edit
		
		$hotelscontainer .= "<div class='flex_column_table_cell hotels_list_wrapper col large-6 small-12'>";
		$hotelscontainer .= "<div class='row hotels_list'>";
		
		$hotelscontainer .= "</div>";
		$hotelscontainer .= "</div>";
		$hotelscontainer .= "<div class='flex_column_table_cell hotels_map col large-6 small-12'>";
		$hotelscontainer .= "<div id='map' style='height: 900px;'></div>";
		$hotelscontainer .= "</div>";
		$hotelscontainer .= "</div><br class='clear' /> ";
		$hotelscontainer .= "</div>";
		return $hotelscontainer;
		// show message that prices are orientational and final price will be shown in cart
		$table = '<p class="orientational_price">' . __('Room prices are orientational and final price will be shown in cart.', 'woo-events-product') . '</p>';
		// get table
		$table .= '<table class="table table-striped table-bordered">';
		$table .= '<thead>';
		$table .= '<tr>';
		$table .= '<th>' . __('Hotel Name', 'woo-events-product') . '</th>';
		$table .= '<th>' . __('Hotel Room', 'woo-events-product') . '</th>';
		$table .= '<th>' . __('Price', 'woo-events-product') . '</th>';
		$table .= '<th>' . __('Hotel Buy', 'woo-events-product') . '</th>';
		$table .= '</tr>';
		$table .= '</thead>';
		$table .= '<tbody>';
		if($hotels)
		foreach ($hotels as $hotel) {
			$name = $hotel->id;
			$name = str_replace('_', ' ', $name);
			$name = strtolower($name);
			$name = ucwords($name);
			// get hotel price
			$hotel_price = getHotelProductPrice($product_id,$hotel->rates[0]->payment_options->payment_types[0]->show_amount,$hotel->rates[0]->payment_options->payment_types[0]->currency_code);
			// add table row
			$table .= '<tr>';
			$table .= '<td>' . $name . '</td>';
			$table .= '<td>' . $hotel->rates[0]->room_name.'</td>';
			$table .= '<td>' . $hotel_price['price'] .' '.$hotel_price['currency'].'</td>';
			$table .= '<td class="add_to_cart_product main_color"><a href="#" target="_blank" class="btn btn-primary add_hotel_to_cart button" data-matchhash="'.$hotel->rates[0]->match_hash.'" data-productid="'.$product_id.'" data-hotelid="'.$hotel->id.'" >' . __('Add to cart', 'woo-events-product') . '</a></td>';
			$table .= '</tr>';
		}
		$table .= '</tbody>';
		$table .= '</table>';
		// return table
		return $table;
	}
}

add_filter( 'woocommerce_add_to_cart_validation', 'allowed_products_variation_in_the_cart', 10, 5 );

function allowed_products_variation_in_the_cart( $passed, $product_id, $quantity, $variation_id, $variations) {

	$product = wc_get_product($product_id);
	// get product type
	$product_type = $product->get_type();
	// check if product type is hotel
	if($product_type == 'hotel'){
		$already_in_cart = false;
		$cart_items = WC()->cart->get_cart();
		foreach ( $cart_items as $cart_item_key => $cart_item ) {
			if($cart_item['product_id'] == $product_id){
				$already_in_cart = true;
			}
		}
		if($already_in_cart){
			wc_add_notice(__('You can\'t add this product twice.', 'domain'), 'error');
			$passed = false; // don't add the new product to the cart
		}
	}
    return $passed;
}

add_filter('woocommerce_product_data_tabs', function($tabs) {
	array_push($tabs['inventory']['class'], 'show_if_hotel');
	return $tabs;
}, 10, 1);

function wh_simple_rental_admin_custom_js() {

    if ('product' != get_post_type()) :
        return;
    endif;

    ?>
    <script type='text/javascript'>
        jQuery(document).ready(function () {
            jQuery('#inventory_product_data ._sold_individually_field').parent().addClass('show_if_hotel').show();
            jQuery('#inventory_product_data ._sold_individually_field').addClass('show_if_hotel').show();
        });
    </script>
    <?php

}

add_action('admin_footer', 'wh_simple_rental_admin_custom_js');


add_action( 'woocommerce_before_calculate_totals', 'hotel_price_cart' );

function hotel_price_cart( $cart_object ) {

	foreach ( $cart_object->get_cart() as $item_key => $item ) {

		if( array_key_exists( 'hotel_id', $item ) ) {
			if(isset($item['book_hash'])){
				$item['data']->set_price($item['new_price']);
				continue;
			}
			$hotel_id = $item['hotel_id'];
			// get product
			$product = wc_get_product($item['product_id']);
			// get checkin date
			$check_in_date = $item['check_in'];
			// get checkout date
			$check_out_date = $item['check_out'];
			// get adults
			$adults = $item['adults'];
			// get children
			$children = $item['children'];
			// get rooms
			$rooms = $item['rooms'];
			// get price
			if(isset($item['price'])){
				$price = $item['price'];
			} else {
				$price = false;
			}
			// get hotel
			$hotel = (new EmergicTravel())->getHotel($hotel_id,date("Y-m-d",strtotime($check_in_date)),date("Y-m-d",strtotime($check_out_date)),$rooms,$adults,$children);
			$booking_hash = $item['bookhash'];
			// get hotel price
			$roomfound = false;
			foreach($hotel[0]->rates as $rate){
				if($rate->room_name == $booking_hash){
					// get hotel price
					$hotel_price = getHotelProductPrice($item['product_id'],$rate->payment_options->payment_types[0]->show_amount,$rate->payment_options->payment_types[0]->currency_code)['price'];
					$price_to_find = getHotelProductPrice($item['product_id'],$rate->payment_options->payment_types[0]->show_amount,"GBP")['price'];
					if($price){
						if($price != $price_to_find){
							continue;
						}
					}
					// set price
					$item['data']->set_price($hotel_price);

					// save room name
					$cart_object->cart_contents[$item_key]['room_name'] = $rate->room_name;
					
					// prebook hotel
					$prebook = (new EmergicTravel())->prebookHotel($rate->book_hash);
					
					if($prebook->error == null){
						$data = $prebook->data->hotels[0];
						$cart_object->cart_contents[$item_key]['book_hash'] = $data->rates[0]->book_hash;
						$cart_object->cart_contents[$item_key]['new_price'] = $hotel_price;
					} else {
						var_dump($prebook);
					}
					// set booking hash
					// $cart_object->cart_contents[$item_key]['book_hash'] = $rate->book_hash;
					$roomfound = true;
					break;
				}
			}
			if(!$roomfound){
				$cart_object->remove_cart_item($item_key);
				// set message
				wc_add_notice( __('Room not found or price changed.', 'woo-events-product'), 'error' );
			}
		}
	}
}

// Display custom cart item meta data (in cart and checkout)
add_filter( 'woocommerce_get_item_data', 'display_cart_item_custom_meta_data', 10, 2 );
function display_cart_item_custom_meta_data( $item_data, $cart_item ) {
	if ( isset($cart_item['hotel_id']) ) {
		$item_data[] = array(
			'key'       => 'Hotel Name',
			'value'     => ucwords(str_replace("_"," ",$cart_item['hotel_id'])),
		);
	}
	if ( isset($cart_item['room_name']) ) {
		$item_data[] = array(
			'key'       => 'Room Name',
			'value'     => $cart_item['room_name'],
		);
	}
    if ( isset($cart_item['check_in']) ) {
        $item_data[] = array(
            'key'       => 'Check In',
            'value'     => $cart_item['check_in'],
        );
    }
	if ( isset($cart_item['check_out']) ) {
		$item_data[] = array(
			'key'       => 'Check Out',
			'value'     => $cart_item['check_out'],
		);
	}
	if ( isset($cart_item['adults']) ) {
		$item_data[] = array(
			'key'       => 'Adults',
			'value'     => $cart_item['adults'],
		);
	}
	if ( isset($cart_item['rooms']) ) {
		$item_data[] = array(
			'key'       => 'Rooms',
			'value'     => $cart_item['rooms'],
		);
	}
    return $item_data;
}

// Save cart item custom meta as order item meta data and display it everywhere on orders and email notifications.
add_action( 'woocommerce_checkout_create_order_line_item', 'save_cart_item_custom_meta_as_order_item_meta', 10, 4 );
function save_cart_item_custom_meta_as_order_item_meta( $item, $cart_item_key, $values, $order ) {
    if ( isset($values['hotel_id']) ) {
        $item->update_meta_data( 'Hotel Name', ucwords(str_replace("_"," ",$values['hotel_id']) ) );
    }
	if ( isset($values['check_in']) ) {
		$item->update_meta_data( 'Check In', $values['check_in'] );
	}
	if ( isset($values['check_out']) ) {
		$item->update_meta_data( 'Check Out', $values['check_out'] );
	}
	if ( isset($values['adults']) ) {
		$item->update_meta_data( 'Adults', $values['adults'] );
	}
	if ( isset($values['children']) ) {
		$item->update_meta_data( 'Children', $values['children'] );
	}
	if ( isset($values['rooms']) ) {
		$item->update_meta_data( 'Rooms', $values['rooms'] );
	}
	if ( isset($values['book_hash']) ) {
		$item->update_meta_data( '_book_hash', $values['book_hash'] );
	}
	if ( isset($values['hotel_order_id']) ) {
		$item->update_meta_data( '_hotel_order_id', $values['hotel_order_id'] );
	}
	if ( isset($values['currency_code'])){
		$item->update_meta_data( '_currency_code', $values['currency_code'] );
	}
	if ( isset($values['amount'])){
		$item->update_meta_data( '_amount', $values['amount'] );
	}
	if ( isset($values['room_name'])){
		$item->update_meta_data( 'Room name', $values['room_name'] );
	}
}


// add admin ajax to get hotel reviews dump
add_action('wp_ajax_hotel_reviews_dump', 'get_hotel_reviewsdump');
add_action('wp_ajax_nopriv_hotel_reviews_dump', 'get_hotel_reviewsdump');

function get_hotel_reviewsdump(){
	// set php max execution time
	ini_set('max_execution_time', 3000);
	$hotel = (new EmergicTravel())->getHotelReviewsdump();
	$hotel_dump = json_decode($hotel);
	$data = $hotel_dump->data;
	$last_updated = $data->last_update;
	// set transient for last updated
	set_transient('hotel_reviews_last_updated', $last_updated, 60*60*24);
	$dump_url = $data->url;
	// check if file exists
	if(!file_exists(ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json')){
		// download dump url to wp-content/uploads/hotel_reviews_dump.json.zst
		$ch = curl_init($dump_url);
		$fp = fopen(ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json.zst', 'wb');
		curl_setopt($ch, CURLOPT_FILE, $fp);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_exec($ch);
		curl_close($ch);
		fclose($fp);
	}
	// check if json exists
	if(!file_exists(ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json')){
		// check if file exists
		if(file_exists(ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json.zst')){
			// use zstd to decompress file to wp-content/uploads/hotel_reviews_dump.json
			$command = 'zstd -d ' . ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json.zst -o ' . ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json';
			shell_exec($command);
			// delete zst file
			unlink(ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json.zst');
		} else {
			// return
			echo json_encode(array('status' => 'error', 'message' => 'Hotel reviews dump download failed.'));
		}
	}
	// check if json exists
	// if(file_exists(ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json')){
	// 	// open jsonl file to be read line by line
	// 	$hotel_dump = fopen(ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json', 'r');
	// 	// read jsonl file line by line
	// 	$i = 0;
	// 	$j = 0;
	// 	$max = 10000;
	// 	$start = 0;
	// 	global $wpdb;
	// 	$table_name = 'hotels_reviews';
	// 	// read whole json
	// 	$hotel_reviews = fread($hotel_dump, filesize(ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json'));
	// 	// decode json
	// 	$hotel_reviews = json_decode($hotel_reviews);
	// 	die(var_dump($hotel_reviews));

	// }
	die('here');
}

function getHotelReviews($hotel_id){
	// check if transient exists
	if ( false !== ( $hotel_reviews = get_transient('hotel_reviews3_'.$hotel_id) ) ) {
		return $hotel_reviews;
	}
	$hotel_dump = fopen(ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json', 'r');
	// read whole json
	$hotel_reviews = fread($hotel_dump, filesize(ABSPATH . 'wp-content/uploads/hotel_reviews_dump.json'));

	// decode json
	$hotel_reviews = json_decode($hotel_reviews);
	if(isset($hotel_reviews->{$hotel_id})){
		// set transient
		set_transient('hotel_reviews3_'.$hotel_id, $hotel_reviews->{$hotel_id}, 60*60*24*30);
		return $hotel_reviews->{$hotel_id};
	} else {
		return null;
	}
}

// add wpcli command to run get_hoteldump function
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	WP_CLI::add_command( 'gethoteldump', 'get_hoteldump' );
}

// add wpcli command to run get_hotel_reviewsdump function
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	WP_CLI::add_command( 'gethotelreviewsdump', 'get_hotel_reviewsdump' );
}

// add wpcli command to run get_hotelincrementaldump function
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	WP_CLI::add_command( 'gethotelincrementaldump', 'get_hotelincrementaldump' );
}

// add admin ajax to get hotel incremental dump
add_action('wp_ajax_hotel_incremental_dump', 'get_hotelincrementaldump');
add_action('wp_ajax_nopriv_hotel_incremental_dump', 'get_hotelincrementaldump');

function get_hotelincrementaldump(){
	// set php max execution time
	ini_set('max_execution_time', 3000);
	$hotel = (new EmergicTravel())->getHotelIncrementalDump();
	$hotel_dump = json_decode($hotel);
	$data = $hotel_dump->data;
	$last_updated = $data->last_update;
	$dump_url = $data->url;
	// check if file exists
	if(file_exists(ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json')){
		// delete file
		unlink(ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json');
	}
	if(file_exists(ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json.zst')){
		// delete file
		unlink(ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json.zst');
	}
	// download dump url to wp-content/uploads/hotel_dump.json.zst
	$ch = curl_init($dump_url);
	$fp = fopen(ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json.zst', 'wb');
	curl_setopt($ch, CURLOPT_FILE, $fp);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_exec($ch);
	curl_close($ch);
	fclose($fp);


	// check if file exists
	if(file_exists(ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json.zst')){
		// use zstd to decompress file to wp-content/uploads/hotel_dump.json
		$command = 'zstd -d ' . ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json.zst -o ' . ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json';
		shell_exec($command);
		// delete zst file
		unlink(ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json.zst');
	} else {
		// return
		echo json_encode(array('status' => 'error', 'message' => 'Hotel dump download failed.'));
	}
	// check if json exists
	if(file_exists(ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json')){
		// open jsonl file to be read line by line
		$hotel_dump = fopen(ABSPATH . 'wp-content/uploads/hotel_dump_incremental.json', 'r');
		// read jsonl file line by line
		$i = 0;
		$j = 0;
		$max = 1000000000;
		$start = 0;
		global $wpdb;
		$table_name = 'hotels';
		// die(var_dump($start));
		while(!feof($hotel_dump)){
			if($i == $max) break;
			$j++;
			if($j < $start){
				fgets($hotel_dump);
				continue;
			}
			$line = fgets($hotel_dump);
			$hotel = json_decode($line);
			if($hotel->deleted == true){
				// delete hotel from database
				$wpdb->delete($table_name, array('hotel_id' => $hotel->id));
				$i++;
				continue;
			}
			// check if hotel exists
			if($hotel->id == null) continue;
			$hotel_exists = $wpdb->get_row("SELECT * FROM $table_name WHERE hotel_id = \"$hotel->id\"");
			if(!$hotel_exists){		
				// remove emoji from hotel name
				$hotel->name = remove_emoji($hotel->name);
				if(strlen($hotel->name) > 255){
					$hotel->name = substr($hotel->name, 0, 255);
				}
				// insert data into hotels table
				$result_check = $wpdb->insert($table_name, array(
					'hotel_id' => $hotel->id,
					'address' => remove_emoji($hotel->address),
					'amenities' => json_encode($hotel->amenity_groups),
					'check_in_time' => $hotel->check_in_time,
					'check_out_time' => $hotel->check_out_time,
					'description_struct' => json_encode($hotel->description_struct),
					'images' => json_encode($hotel->images),
					'kind' => $hotel->kind,
					'latitude' => $hotel->latitude,
					'longitude' => $hotel->longitude,
					'name' => $hotel->name,
					'phone' => $hotel->phone,
					'postal_code' => $hotel->postal_code,
					'rating' => NULL,
					'room_groups' => json_encode($hotel->room_groups),
					'star_rating' => $hotel->star_rating,
					'region' => json_encode($hotel->region),
					'email' => $hotel->email,
					'serp_filters' => json_encode($hotel->serp_filters),
					'is_closed' => $hotel->is_closed,
					'is_gender_specification_required' => $hotel->is_gender_specification_required,
					'metapolicy_struct' => json_encode($hotel->metapolicy_struct),
					'metapolicy_extra_info' => json_encode($hotel->metapolicy_extra_info),
					'star_certificate' => $hotel->star_certificate,
					'hotel_chain' => $hotel->hotel_chain,
					'front_desk_time_start' => $hotel->front_desk_time_start,
					'front_desk_time_end' => $hotel->front_desk_time_end,
					'facts' => json_encode($hotel->facts),
					'line_id' => $j,
				));
				if(!$result_check){
					// return
					echo json_encode(array('status' => 'error', 'message' => 'Hotel dump insert failed. ERROR: '.$wpdb->last_error.' On Line '.$j));
					die();
				}
				$i++;
			} else {
				// update data into hotels table
				$result_check = $wpdb->update($table_name, array(
					'address' => remove_emoji($hotel->address),
					'amenities' => json_encode($hotel->amenity_groups),
					'check_in_time' => $hotel->check_in_time,
					'check_out_time' => $hotel->check_out_time,
					'description_struct' => json_encode($hotel->description_struct),
					'images' => json_encode($hotel->images),
					'kind' => $hotel->kind,
					'latitude' => $hotel->latitude,
					'longitude' => $hotel->longitude,
					'name' => $hotel->name,
					'phone' => $hotel->phone,
					'postal_code' => $hotel->postal_code,
					'rating' => NULL,
					'room_groups' => json_encode($hotel->room_groups),
					'star_rating' => $hotel->star_rating,
					'region' => json_encode($hotel->region),
					'email' => $hotel->email,
					'serp_filters' => json_encode($hotel->serp_filters),
					'is_closed' => $hotel->is_closed,
					'is_gender_specification_required' => $hotel->is_gender_specification_required,
					'metapolicy_struct' => json_encode($hotel->metapolicy_struct),
					'metapolicy_extra_info' => json_encode($hotel->metapolicy_extra_info),
					'star_certificate' => $hotel->star_certificate,
					'hotel_chain' => $hotel->hotel_chain,
					'front_desk_time_start' => $hotel->front_desk_time_start,
					'front_desk_time_end' => $hotel->front_desk_time_end,
					'facts' => json_encode($hotel->facts),
				), array('hotel_id' => $hotel->id));
				if(!$result_check && $wpdb->last_error != ''){
					// return
					echo json_encode(array('status' => 'error', 'message' => 'Hotel dump update failed. ERROR: '.$wpdb->last_error.' On Line '.$j));
					die();
				}
				$i++;
			}
		}
		// return
		echo json_encode(array('status' => 'success', 'message' => 'Hotel dump downloaded.'));
	} else {
		// return
		echo json_encode(array('status' => 'error', 'message' => 'Hotel dump decompression failed.'));
	}
	
	// return
	wp_die();
}



// add admin ajax to get hotel dump
add_action('wp_ajax_hotel_dump', 'get_hoteldump');
add_action('wp_ajax_nopriv_hotel_dump', 'get_hoteldump');
function get_hoteldump(){
	// set php max execution time
	ini_set('max_execution_time', 3000);
	$hotel = (new EmergicTravel())->getHoteldump();
	$hotel_dump = json_decode($hotel);
	$data = $hotel_dump->data;
	$last_updated = $data->last_update;
	// set transient
	set_transient('hotel_dump_last_updated', $last_updated, 60*60*24*30);
	$dump_url = $data->url;
	// check if file exists
	if(!file_exists(ABSPATH . 'wp-content/uploads/hotel_dump.json')){
		// download dump url to wp-content/uploads/hotel_dump.json.zst
		$ch = curl_init($dump_url);
		$fp = fopen(ABSPATH . 'wp-content/uploads/hotel_dump.json.zst', 'wb');
		curl_setopt($ch, CURLOPT_FILE, $fp);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_exec($ch);
		curl_close($ch);
		fclose($fp);
	}
	// check if json exists
	if(!file_exists(ABSPATH . 'wp-content/uploads/hotel_dump.json')){
		// check if file exists
		if(file_exists(ABSPATH . 'wp-content/uploads/hotel_dump.json.zst')){
			// use zstd to decompress file to wp-content/uploads/hotel_dump.json
			$command = 'zstd -d ' . ABSPATH . 'wp-content/uploads/hotel_dump.json.zst -o ' . ABSPATH . 'wp-content/uploads/hotel_dump.json';
			shell_exec($command);
			// delete zst file
			unlink(ABSPATH . 'wp-content/uploads/hotel_dump.json.zst');
		} else {
			// return
			echo json_encode(array('status' => 'error', 'message' => 'Hotel dump download failed.'));
		}
	}
	// check if json exists
	if(file_exists(ABSPATH . 'wp-content/uploads/hotel_dump.json')){
		// open jsonl file to be read line by line
		$hotel_dump = fopen(ABSPATH . 'wp-content/uploads/hotel_dump.json', 'r');
		// read jsonl file line by line
		$i = 0;
		$j = 0;
		$max = 10000000;
		$start = 0;
		global $wpdb;
		$table_name = 'hotels';
		// get last row from hotels table
		$last_row = $wpdb->get_row("SELECT * FROM $table_name ORDER BY line_id DESC LIMIT 1");
		if($last_row){
			$start = $last_row->line_id;
		}
		// die(var_dump($start));
		while(!feof($hotel_dump)){
			if($i == $max) break;
			$j++;
			if($j < $start){
				fgets($hotel_dump);
				continue;
			}
			$line = fgets($hotel_dump);
			$hotel = json_decode($line);
			// check if hotel exists
			if($hotel->id == null) continue;
			$hotel_exists = $wpdb->get_row("SELECT * FROM $table_name WHERE hotel_id = \"$hotel->id\"");
			if(!$hotel_exists){		
				// remove emoji from hotel name
				$hotel->name = remove_emoji($hotel->name);
				// insert data into hotels table
				$result_check = $wpdb->insert($table_name, array(
					'hotel_id' => $hotel->id,
					'address' => remove_emoji($hotel->address),
					'amenities' => json_encode($hotel->amenity_groups),
					'check_in_time' => $hotel->check_in_time,
					'check_out_time' => $hotel->check_out_time,
					'description_struct' => json_encode($hotel->description_struct),
					'images' => json_encode($hotel->images),
					'kind' => $hotel->kind,
					'latitude' => $hotel->latitude,
					'longitude' => $hotel->longitude,
					'name' => $hotel->name,
					'phone' => $hotel->phone,
					'postal_code' => $hotel->postal_code,
					'rating' => (isset($hotel->rating)?$hotel->rating:NULL),
					'room_groups' => json_encode($hotel->room_groups),
					'star_rating' => $hotel->star_rating,
					'region' => json_encode($hotel->region),
					'email' => $hotel->email,
					'serp_filters' => json_encode($hotel->serp_filters),
					'is_closed' => $hotel->is_closed,
					'is_gender_specification_required' => $hotel->is_gender_specification_required,
					'metapolicy_struct' => json_encode($hotel->metapolicy_struct),
					'metapolicy_extra_info' => json_encode($hotel->metapolicy_extra_info),
					'star_certificate' => $hotel->star_certificate,
					'hotel_chain' => $hotel->hotel_chain,
					'front_desk_time_start' => $hotel->front_desk_time_start,
					'front_desk_time_end' => $hotel->front_desk_time_end,
					'facts' => json_encode($hotel->facts),
					'line_id' => $j,
				));
				if(!$result_check){
					// return
					echo json_encode(array('status' => 'error', 'message' => 'Hotel dump insert failed. ERROR: '.$wpdb->last_error.' On Line '.$j));
					die();
				}
				$i++;
			}
		}
		// return
		echo json_encode(array('status' => 'success', 'message' => 'Hotel dump downloaded.'));
	} else {
		// return
		echo json_encode(array('status' => 'error', 'message' => 'Hotel dump decompression failed.'));
	}
	// return
	wp_die();
}
function remove_emoji($text){
    return preg_replace('/\x{1F3F4}\x{E0067}\x{E0062}(?:\x{E0077}\x{E006C}\x{E0073}|\x{E0073}\x{E0063}\x{E0074}|\x{E0065}\x{E006E}\x{E0067})\x{E007F}|(?:\x{1F9D1}\x{1F3FF}\x{200D}\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D})?|\x{200D}(?:\x{1F48B}\x{200D})?)\x{1F9D1}|\x{1F469}\x{1F3FF}\x{200D}\x{1F91D}\x{200D}[\x{1F468}\x{1F469}]|\x{1FAF1}\x{1F3FF}\x{200D}\x{1FAF2})[\x{1F3FB}-\x{1F3FE}]|(?:\x{1F9D1}\x{1F3FE}\x{200D}\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D})?|\x{200D}(?:\x{1F48B}\x{200D})?)\x{1F9D1}|\x{1F469}\x{1F3FE}\x{200D}\x{1F91D}\x{200D}[\x{1F468}\x{1F469}]|\x{1FAF1}\x{1F3FE}\x{200D}\x{1FAF2})[\x{1F3FB}-\x{1F3FD}\x{1F3FF}]|(?:\x{1F9D1}\x{1F3FD}\x{200D}\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D})?|\x{200D}(?:\x{1F48B}\x{200D})?)\x{1F9D1}|\x{1F469}\x{1F3FD}\x{200D}\x{1F91D}\x{200D}[\x{1F468}\x{1F469}]|\x{1FAF1}\x{1F3FD}\x{200D}\x{1FAF2})[\x{1F3FB}\x{1F3FC}\x{1F3FE}\x{1F3FF}]|(?:\x{1F9D1}\x{1F3FC}\x{200D}\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D})?|\x{200D}(?:\x{1F48B}\x{200D})?)\x{1F9D1}|\x{1F469}\x{1F3FC}\x{200D}\x{1F91D}\x{200D}[\x{1F468}\x{1F469}]|\x{1FAF1}\x{1F3FC}\x{200D}\x{1FAF2})[\x{1F3FB}\x{1F3FD}-\x{1F3FF}]|(?:\x{1F9D1}\x{1F3FB}\x{200D}\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D})?|\x{200D}(?:\x{1F48B}\x{200D})?)\x{1F9D1}|\x{1F469}\x{1F3FB}\x{200D}\x{1F91D}\x{200D}[\x{1F468}\x{1F469}]|\x{1FAF1}\x{1F3FB}\x{200D}\x{1FAF2})[\x{1F3FC}-\x{1F3FF}]|\x{1F468}(?:\x{1F3FB}(?:\x{200D}(?:\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D}\x{1F468}[\x{1F3FB}-\x{1F3FF}]|\x{1F468}[\x{1F3FB}-\x{1F3FF}])|\x{200D}(?:\x{1F48B}\x{200D}\x{1F468}[\x{1F3FB}-\x{1F3FF}]|\x{1F468}[\x{1F3FB}-\x{1F3FF}]))|\x{1F91D}\x{200D}\x{1F468}[\x{1F3FC}-\x{1F3FF}]|[\x{2695}\x{2696}\x{2708}]\x{FE0F}|[\x{2695}\x{2696}\x{2708}]|[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}]))?|[\x{1F3FC}-\x{1F3FF}]\x{200D}\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D}\x{1F468}[\x{1F3FB}-\x{1F3FF}]|\x{1F468}[\x{1F3FB}-\x{1F3FF}])|\x{200D}(?:\x{1F48B}\x{200D}\x{1F468}[\x{1F3FB}-\x{1F3FF}]|\x{1F468}[\x{1F3FB}-\x{1F3FF}]))|\x{200D}(?:\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D})?|\x{200D}(?:\x{1F48B}\x{200D})?)\x{1F468}|[\x{1F468}\x{1F469}]\x{200D}(?:\x{1F466}\x{200D}\x{1F466}|\x{1F467}\x{200D}[\x{1F466}\x{1F467}])|\x{1F466}\x{200D}\x{1F466}|\x{1F467}\x{200D}[\x{1F466}\x{1F467}]|[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}])|\x{1F3FF}\x{200D}(?:\x{1F91D}\x{200D}\x{1F468}[\x{1F3FB}-\x{1F3FE}]|[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}])|\x{1F3FE}\x{200D}(?:\x{1F91D}\x{200D}\x{1F468}[\x{1F3FB}-\x{1F3FD}\x{1F3FF}]|[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}])|\x{1F3FD}\x{200D}(?:\x{1F91D}\x{200D}\x{1F468}[\x{1F3FB}\x{1F3FC}\x{1F3FE}\x{1F3FF}]|[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}])|\x{1F3FC}\x{200D}(?:\x{1F91D}\x{200D}\x{1F468}[\x{1F3FB}\x{1F3FD}-\x{1F3FF}]|[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}])|(?:\x{1F3FF}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FE}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FD}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FC}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{200D}[\x{2695}\x{2696}\x{2708}])\x{FE0F}|\x{200D}(?:[\x{1F468}\x{1F469}]\x{200D}[\x{1F466}\x{1F467}]|[\x{1F466}\x{1F467}])|\x{1F3FF}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FE}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FD}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FC}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FF}|\x{1F3FE}|\x{1F3FD}|\x{1F3FC}|\x{200D}[\x{2695}\x{2696}\x{2708}])?|(?:\x{1F469}(?:\x{1F3FB}\x{200D}\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D}[\x{1F468}\x{1F469}]|[\x{1F468}\x{1F469}])|\x{200D}(?:\x{1F48B}\x{200D}[\x{1F468}\x{1F469}]|[\x{1F468}\x{1F469}]))|[\x{1F3FC}-\x{1F3FF}]\x{200D}\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D}[\x{1F468}\x{1F469}]|[\x{1F468}\x{1F469}])|\x{200D}(?:\x{1F48B}\x{200D}[\x{1F468}\x{1F469}]|[\x{1F468}\x{1F469}])))|\x{1F9D1}[\x{1F3FB}-\x{1F3FF}]\x{200D}\x{1F91D}\x{200D}\x{1F9D1})[\x{1F3FB}-\x{1F3FF}]|\x{1F469}\x{200D}\x{1F469}\x{200D}(?:\x{1F466}\x{200D}\x{1F466}|\x{1F467}\x{200D}[\x{1F466}\x{1F467}])|\x{1F469}(?:\x{200D}(?:\x{2764}(?:\x{FE0F}\x{200D}(?:\x{1F48B}\x{200D}[\x{1F468}\x{1F469}]|[\x{1F468}\x{1F469}])|\x{200D}(?:\x{1F48B}\x{200D}[\x{1F468}\x{1F469}]|[\x{1F468}\x{1F469}]))|[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}])|\x{1F3FF}\x{200D}[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}]|\x{1F3FE}\x{200D}[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}]|\x{1F3FD}\x{200D}[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}]|\x{1F3FC}\x{200D}[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}]|\x{1F3FB}\x{200D}[\x{1F33E}\x{1F373}\x{1F37C}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}])|\x{1F9D1}(?:\x{200D}(?:\x{1F91D}\x{200D}\x{1F9D1}|[\x{1F33E}\x{1F373}\x{1F37C}\x{1F384}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}])|\x{1F3FF}\x{200D}[\x{1F33E}\x{1F373}\x{1F37C}\x{1F384}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}]|\x{1F3FE}\x{200D}[\x{1F33E}\x{1F373}\x{1F37C}\x{1F384}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}]|\x{1F3FD}\x{200D}[\x{1F33E}\x{1F373}\x{1F37C}\x{1F384}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}]|\x{1F3FC}\x{200D}[\x{1F33E}\x{1F373}\x{1F37C}\x{1F384}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}]|\x{1F3FB}\x{200D}[\x{1F33E}\x{1F373}\x{1F37C}\x{1F384}\x{1F393}\x{1F3A4}\x{1F3A8}\x{1F3EB}\x{1F3ED}\x{1F4BB}\x{1F4BC}\x{1F527}\x{1F52C}\x{1F680}\x{1F692}\x{1F9AF}-\x{1F9B3}\x{1F9BC}\x{1F9BD}])|\x{1F469}\x{200D}\x{1F466}\x{200D}\x{1F466}|\x{1F469}\x{200D}\x{1F469}\x{200D}[\x{1F466}\x{1F467}]|\x{1F469}\x{200D}\x{1F467}\x{200D}[\x{1F466}\x{1F467}]|(?:\x{1F441}\x{FE0F}?\x{200D}\x{1F5E8}|\x{1F9D1}(?:\x{1F3FF}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FE}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FD}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FC}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FB}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{200D}[\x{2695}\x{2696}\x{2708}])|\x{1F469}(?:\x{1F3FF}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FE}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FD}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FC}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FB}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{200D}[\x{2695}\x{2696}\x{2708}])|\x{1F636}\x{200D}\x{1F32B}|\x{1F3F3}\x{FE0F}?\x{200D}\x{26A7}|\x{1F43B}\x{200D}\x{2744}|(?:[\x{1F3C3}\x{1F3C4}\x{1F3CA}\x{1F46E}\x{1F470}\x{1F471}\x{1F473}\x{1F477}\x{1F481}\x{1F482}\x{1F486}\x{1F487}\x{1F645}-\x{1F647}\x{1F64B}\x{1F64D}\x{1F64E}\x{1F6A3}\x{1F6B4}-\x{1F6B6}\x{1F926}\x{1F935}\x{1F937}-\x{1F939}\x{1F93D}\x{1F93E}\x{1F9B8}\x{1F9B9}\x{1F9CD}-\x{1F9CF}\x{1F9D4}\x{1F9D6}-\x{1F9DD}][\x{1F3FB}-\x{1F3FF}]|[\x{1F46F}\x{1F9DE}\x{1F9DF}])\x{200D}[\x{2640}\x{2642}]|[\x{26F9}\x{1F3CB}\x{1F3CC}\x{1F575}](?:[\x{FE0F}\x{1F3FB}-\x{1F3FF}]\x{200D}[\x{2640}\x{2642}]|\x{200D}[\x{2640}\x{2642}])|\x{1F3F4}\x{200D}\x{2620}|[\x{1F3C3}\x{1F3C4}\x{1F3CA}\x{1F46E}\x{1F470}\x{1F471}\x{1F473}\x{1F477}\x{1F481}\x{1F482}\x{1F486}\x{1F487}\x{1F645}-\x{1F647}\x{1F64B}\x{1F64D}\x{1F64E}\x{1F6A3}\x{1F6B4}-\x{1F6B6}\x{1F926}\x{1F935}\x{1F937}-\x{1F939}\x{1F93C}-\x{1F93E}\x{1F9B8}\x{1F9B9}\x{1F9CD}-\x{1F9CF}\x{1F9D4}\x{1F9D6}-\x{1F9DD}]\x{200D}[\x{2640}\x{2642}]|[\xA9\xAE\x{203C}\x{2049}\x{2122}\x{2139}\x{2194}-\x{2199}\x{21A9}\x{21AA}\x{231A}\x{231B}\x{2328}\x{23CF}\x{23ED}-\x{23EF}\x{23F1}\x{23F2}\x{23F8}-\x{23FA}\x{24C2}\x{25AA}\x{25AB}\x{25B6}\x{25C0}\x{25FB}\x{25FC}\x{25FE}\x{2600}-\x{2604}\x{260E}\x{2611}\x{2614}\x{2615}\x{2618}\x{2620}\x{2622}\x{2623}\x{2626}\x{262A}\x{262E}\x{262F}\x{2638}-\x{263A}\x{2640}\x{2642}\x{2648}-\x{2653}\x{265F}\x{2660}\x{2663}\x{2665}\x{2666}\x{2668}\x{267B}\x{267E}\x{267F}\x{2692}\x{2694}-\x{2697}\x{2699}\x{269B}\x{269C}\x{26A0}\x{26A7}\x{26AA}\x{26B0}\x{26B1}\x{26BD}\x{26BE}\x{26C4}\x{26C8}\x{26CF}\x{26D1}\x{26D3}\x{26E9}\x{26F0}-\x{26F5}\x{26F7}\x{26F8}\x{26FA}\x{2702}\x{2708}\x{2709}\x{270F}\x{2712}\x{2714}\x{2716}\x{271D}\x{2721}\x{2733}\x{2734}\x{2744}\x{2747}\x{2763}\x{27A1}\x{2934}\x{2935}\x{2B05}-\x{2B07}\x{2B1B}\x{2B1C}\x{2B55}\x{3030}\x{303D}\x{3297}\x{3299}\x{1F004}\x{1F170}\x{1F171}\x{1F17E}\x{1F17F}\x{1F202}\x{1F237}\x{1F321}\x{1F324}-\x{1F32C}\x{1F336}\x{1F37D}\x{1F396}\x{1F397}\x{1F399}-\x{1F39B}\x{1F39E}\x{1F39F}\x{1F3CD}\x{1F3CE}\x{1F3D4}-\x{1F3DF}\x{1F3F5}\x{1F3F7}\x{1F43F}\x{1F4FD}\x{1F549}\x{1F54A}\x{1F56F}\x{1F570}\x{1F573}\x{1F576}-\x{1F579}\x{1F587}\x{1F58A}-\x{1F58D}\x{1F5A5}\x{1F5A8}\x{1F5B1}\x{1F5B2}\x{1F5BC}\x{1F5C2}-\x{1F5C4}\x{1F5D1}-\x{1F5D3}\x{1F5DC}-\x{1F5DE}\x{1F5E1}\x{1F5E3}\x{1F5E8}\x{1F5EF}\x{1F5F3}\x{1F5FA}\x{1F6CB}\x{1F6CD}-\x{1F6CF}\x{1F6E0}-\x{1F6E5}\x{1F6E9}\x{1F6F0}\x{1F6F3}])\x{FE0F}|\x{1F441}\x{FE0F}?\x{200D}\x{1F5E8}|\x{1F9D1}(?:\x{1F3FF}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FE}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FD}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FC}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FB}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{200D}[\x{2695}\x{2696}\x{2708}])|\x{1F469}(?:\x{1F3FF}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FE}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FD}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FC}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{1F3FB}\x{200D}[\x{2695}\x{2696}\x{2708}]|\x{200D}[\x{2695}\x{2696}\x{2708}])|\x{1F3F3}\x{FE0F}?\x{200D}\x{1F308}|\x{1F469}\x{200D}\x{1F467}|\x{1F469}\x{200D}\x{1F466}|\x{1F636}\x{200D}\x{1F32B}|\x{1F3F3}\x{FE0F}?\x{200D}\x{26A7}|\x{1F635}\x{200D}\x{1F4AB}|\x{1F62E}\x{200D}\x{1F4A8}|\x{1F415}\x{200D}\x{1F9BA}|\x{1FAF1}(?:\x{1F3FF}|\x{1F3FE}|\x{1F3FD}|\x{1F3FC}|\x{1F3FB})?|\x{1F9D1}(?:\x{1F3FF}|\x{1F3FE}|\x{1F3FD}|\x{1F3FC}|\x{1F3FB})?|\x{1F469}(?:\x{1F3FF}|\x{1F3FE}|\x{1F3FD}|\x{1F3FC}|\x{1F3FB})?|\x{1F43B}\x{200D}\x{2744}|(?:[\x{1F3C3}\x{1F3C4}\x{1F3CA}\x{1F46E}\x{1F470}\x{1F471}\x{1F473}\x{1F477}\x{1F481}\x{1F482}\x{1F486}\x{1F487}\x{1F645}-\x{1F647}\x{1F64B}\x{1F64D}\x{1F64E}\x{1F6A3}\x{1F6B4}-\x{1F6B6}\x{1F926}\x{1F935}\x{1F937}-\x{1F939}\x{1F93D}\x{1F93E}\x{1F9B8}\x{1F9B9}\x{1F9CD}-\x{1F9CF}\x{1F9D4}\x{1F9D6}-\x{1F9DD}][\x{1F3FB}-\x{1F3FF}]|[\x{1F46F}\x{1F9DE}\x{1F9DF}])\x{200D}[\x{2640}\x{2642}]|[\x{26F9}\x{1F3CB}\x{1F3CC}\x{1F575}](?:[\x{FE0F}\x{1F3FB}-\x{1F3FF}]\x{200D}[\x{2640}\x{2642}]|\x{200D}[\x{2640}\x{2642}])|\x{1F3F4}\x{200D}\x{2620}|\x{1F1FD}\x{1F1F0}|\x{1F1F6}\x{1F1E6}|\x{1F1F4}\x{1F1F2}|\x{1F408}\x{200D}\x{2B1B}|\x{2764}(?:\x{FE0F}\x{200D}[\x{1F525}\x{1FA79}]|\x{200D}[\x{1F525}\x{1FA79}])|\x{1F441}\x{FE0F}?|\x{1F3F3}\x{FE0F}?|[\x{1F3C3}\x{1F3C4}\x{1F3CA}\x{1F46E}\x{1F470}\x{1F471}\x{1F473}\x{1F477}\x{1F481}\x{1F482}\x{1F486}\x{1F487}\x{1F645}-\x{1F647}\x{1F64B}\x{1F64D}\x{1F64E}\x{1F6A3}\x{1F6B4}-\x{1F6B6}\x{1F926}\x{1F935}\x{1F937}-\x{1F939}\x{1F93C}-\x{1F93E}\x{1F9B8}\x{1F9B9}\x{1F9CD}-\x{1F9CF}\x{1F9D4}\x{1F9D6}-\x{1F9DD}]\x{200D}[\x{2640}\x{2642}]|\x{1F1FF}[\x{1F1E6}\x{1F1F2}\x{1F1FC}]|\x{1F1FE}[\x{1F1EA}\x{1F1F9}]|\x{1F1FC}[\x{1F1EB}\x{1F1F8}]|\x{1F1FB}[\x{1F1E6}\x{1F1E8}\x{1F1EA}\x{1F1EC}\x{1F1EE}\x{1F1F3}\x{1F1FA}]|\x{1F1FA}[\x{1F1E6}\x{1F1EC}\x{1F1F2}\x{1F1F3}\x{1F1F8}\x{1F1FE}\x{1F1FF}]|\x{1F1F9}[\x{1F1E6}\x{1F1E8}\x{1F1E9}\x{1F1EB}-\x{1F1ED}\x{1F1EF}-\x{1F1F4}\x{1F1F7}\x{1F1F9}\x{1F1FB}\x{1F1FC}\x{1F1FF}]|\x{1F1F8}[\x{1F1E6}-\x{1F1EA}\x{1F1EC}-\x{1F1F4}\x{1F1F7}-\x{1F1F9}\x{1F1FB}\x{1F1FD}-\x{1F1FF}]|\x{1F1F7}[\x{1F1EA}\x{1F1F4}\x{1F1F8}\x{1F1FA}\x{1F1FC}]|\x{1F1F5}[\x{1F1E6}\x{1F1EA}-\x{1F1ED}\x{1F1F0}-\x{1F1F3}\x{1F1F7}-\x{1F1F9}\x{1F1FC}\x{1F1FE}]|\x{1F1F3}[\x{1F1E6}\x{1F1E8}\x{1F1EA}-\x{1F1EC}\x{1F1EE}\x{1F1F1}\x{1F1F4}\x{1F1F5}\x{1F1F7}\x{1F1FA}\x{1F1FF}]|\x{1F1F2}[\x{1F1E6}\x{1F1E8}-\x{1F1ED}\x{1F1F0}-\x{1F1FF}]|\x{1F1F1}[\x{1F1E6}-\x{1F1E8}\x{1F1EE}\x{1F1F0}\x{1F1F7}-\x{1F1FB}\x{1F1FE}]|\x{1F1F0}[\x{1F1EA}\x{1F1EC}-\x{1F1EE}\x{1F1F2}\x{1F1F3}\x{1F1F5}\x{1F1F7}\x{1F1FC}\x{1F1FE}\x{1F1FF}]|\x{1F1EF}[\x{1F1EA}\x{1F1F2}\x{1F1F4}\x{1F1F5}]|\x{1F1EE}[\x{1F1E8}-\x{1F1EA}\x{1F1F1}-\x{1F1F4}\x{1F1F6}-\x{1F1F9}]|\x{1F1ED}[\x{1F1F0}\x{1F1F2}\x{1F1F3}\x{1F1F7}\x{1F1F9}\x{1F1FA}]|\x{1F1EC}[\x{1F1E6}\x{1F1E7}\x{1F1E9}-\x{1F1EE}\x{1F1F1}-\x{1F1F3}\x{1F1F5}-\x{1F1FA}\x{1F1FC}\x{1F1FE}]|\x{1F1EB}[\x{1F1EE}-\x{1F1F0}\x{1F1F2}\x{1F1F4}\x{1F1F7}]|\x{1F1EA}[\x{1F1E6}\x{1F1E8}\x{1F1EA}\x{1F1EC}\x{1F1ED}\x{1F1F7}-\x{1F1FA}]|\x{1F1E9}[\x{1F1EA}\x{1F1EC}\x{1F1EF}\x{1F1F0}\x{1F1F2}\x{1F1F4}\x{1F1FF}]|\x{1F1E8}[\x{1F1E6}\x{1F1E8}\x{1F1E9}\x{1F1EB}-\x{1F1EE}\x{1F1F0}-\x{1F1F5}\x{1F1F7}\x{1F1FA}-\x{1F1FF}]|\x{1F1E7}[\x{1F1E6}\x{1F1E7}\x{1F1E9}-\x{1F1EF}\x{1F1F1}-\x{1F1F4}\x{1F1F6}-\x{1F1F9}\x{1F1FB}\x{1F1FC}\x{1F1FE}\x{1F1FF}]|\x{1F1E6}[\x{1F1E8}-\x{1F1EC}\x{1F1EE}\x{1F1F1}\x{1F1F2}\x{1F1F4}\x{1F1F6}-\x{1F1FA}\x{1F1FC}\x{1F1FD}\x{1F1FF}]|[#\*0-9]\x{FE0F}?\x{20E3}|\x{1F93C}[\x{1F3FB}-\x{1F3FF}]|\x{2764}\x{FE0F}?|[\x{1F3C3}\x{1F3C4}\x{1F3CA}\x{1F46E}\x{1F470}\x{1F471}\x{1F473}\x{1F477}\x{1F481}\x{1F482}\x{1F486}\x{1F487}\x{1F645}-\x{1F647}\x{1F64B}\x{1F64D}\x{1F64E}\x{1F6A3}\x{1F6B4}-\x{1F6B6}\x{1F926}\x{1F935}\x{1F937}-\x{1F939}\x{1F93D}\x{1F93E}\x{1F9B8}\x{1F9B9}\x{1F9CD}-\x{1F9CF}\x{1F9D4}\x{1F9D6}-\x{1F9DD}][\x{1F3FB}-\x{1F3FF}]|[\x{26F9}\x{1F3CB}\x{1F3CC}\x{1F575}][\x{FE0F}\x{1F3FB}-\x{1F3FF}]?|\x{1F3F4}|[\x{270A}\x{270B}\x{1F385}\x{1F3C2}\x{1F3C7}\x{1F442}\x{1F443}\x{1F446}-\x{1F450}\x{1F466}\x{1F467}\x{1F46B}-\x{1F46D}\x{1F472}\x{1F474}-\x{1F476}\x{1F478}\x{1F47C}\x{1F483}\x{1F485}\x{1F48F}\x{1F491}\x{1F4AA}\x{1F57A}\x{1F595}\x{1F596}\x{1F64C}\x{1F64F}\x{1F6C0}\x{1F6CC}\x{1F90C}\x{1F90F}\x{1F918}-\x{1F91F}\x{1F930}-\x{1F934}\x{1F936}\x{1F977}\x{1F9B5}\x{1F9B6}\x{1F9BB}\x{1F9D2}\x{1F9D3}\x{1F9D5}\x{1FAC3}-\x{1FAC5}\x{1FAF0}\x{1FAF2}-\x{1FAF6}][\x{1F3FB}-\x{1F3FF}]|[\x{261D}\x{270C}\x{270D}\x{1F574}\x{1F590}][\x{FE0F}\x{1F3FB}-\x{1F3FF}]|[\x{261D}\x{270A}-\x{270D}\x{1F385}\x{1F3C2}\x{1F3C7}\x{1F408}\x{1F415}\x{1F43B}\x{1F442}\x{1F443}\x{1F446}-\x{1F450}\x{1F466}\x{1F467}\x{1F46B}-\x{1F46D}\x{1F472}\x{1F474}-\x{1F476}\x{1F478}\x{1F47C}\x{1F483}\x{1F485}\x{1F48F}\x{1F491}\x{1F4AA}\x{1F574}\x{1F57A}\x{1F590}\x{1F595}\x{1F596}\x{1F62E}\x{1F635}\x{1F636}\x{1F64C}\x{1F64F}\x{1F6C0}\x{1F6CC}\x{1F90C}\x{1F90F}\x{1F918}-\x{1F91F}\x{1F930}-\x{1F934}\x{1F936}\x{1F93C}\x{1F977}\x{1F9B5}\x{1F9B6}\x{1F9BB}\x{1F9D2}\x{1F9D3}\x{1F9D5}\x{1FAC3}-\x{1FAC5}\x{1FAF0}\x{1FAF2}-\x{1FAF6}]|[\x{1F3C3}\x{1F3C4}\x{1F3CA}\x{1F46E}\x{1F470}\x{1F471}\x{1F473}\x{1F477}\x{1F481}\x{1F482}\x{1F486}\x{1F487}\x{1F645}-\x{1F647}\x{1F64B}\x{1F64D}\x{1F64E}\x{1F6A3}\x{1F6B4}-\x{1F6B6}\x{1F926}\x{1F935}\x{1F937}-\x{1F939}\x{1F93D}\x{1F93E}\x{1F9B8}\x{1F9B9}\x{1F9CD}-\x{1F9CF}\x{1F9D4}\x{1F9D6}-\x{1F9DD}]|[\x{1F46F}\x{1F9DE}\x{1F9DF}]|[\xA9\xAE\x{203C}\x{2049}\x{2122}\x{2139}\x{2194}-\x{2199}\x{21A9}\x{21AA}\x{231A}\x{231B}\x{2328}\x{23CF}\x{23ED}-\x{23EF}\x{23F1}\x{23F2}\x{23F8}-\x{23FA}\x{24C2}\x{25AA}\x{25AB}\x{25B6}\x{25C0}\x{25FB}\x{25FC}\x{25FE}\x{2600}-\x{2604}\x{260E}\x{2611}\x{2614}\x{2615}\x{2618}\x{2620}\x{2622}\x{2623}\x{2626}\x{262A}\x{262E}\x{262F}\x{2638}-\x{263A}\x{2640}\x{2642}\x{2648}-\x{2653}\x{265F}\x{2660}\x{2663}\x{2665}\x{2666}\x{2668}\x{267B}\x{267E}\x{267F}\x{2692}\x{2694}-\x{2697}\x{2699}\x{269B}\x{269C}\x{26A0}\x{26A7}\x{26AA}\x{26B0}\x{26B1}\x{26BD}\x{26BE}\x{26C4}\x{26C8}\x{26CF}\x{26D1}\x{26D3}\x{26E9}\x{26F0}-\x{26F5}\x{26F7}\x{26F8}\x{26FA}\x{2702}\x{2708}\x{2709}\x{270F}\x{2712}\x{2714}\x{2716}\x{271D}\x{2721}\x{2733}\x{2734}\x{2744}\x{2747}\x{2763}\x{27A1}\x{2934}\x{2935}\x{2B05}-\x{2B07}\x{2B1B}\x{2B1C}\x{2B55}\x{3030}\x{303D}\x{3297}\x{3299}\x{1F004}\x{1F170}\x{1F171}\x{1F17E}\x{1F17F}\x{1F202}\x{1F237}\x{1F321}\x{1F324}-\x{1F32C}\x{1F336}\x{1F37D}\x{1F396}\x{1F397}\x{1F399}-\x{1F39B}\x{1F39E}\x{1F39F}\x{1F3CD}\x{1F3CE}\x{1F3D4}-\x{1F3DF}\x{1F3F5}\x{1F3F7}\x{1F43F}\x{1F4FD}\x{1F549}\x{1F54A}\x{1F56F}\x{1F570}\x{1F573}\x{1F576}-\x{1F579}\x{1F587}\x{1F58A}-\x{1F58D}\x{1F5A5}\x{1F5A8}\x{1F5B1}\x{1F5B2}\x{1F5BC}\x{1F5C2}-\x{1F5C4}\x{1F5D1}-\x{1F5D3}\x{1F5DC}-\x{1F5DE}\x{1F5E1}\x{1F5E3}\x{1F5E8}\x{1F5EF}\x{1F5F3}\x{1F5FA}\x{1F6CB}\x{1F6CD}-\x{1F6CF}\x{1F6E0}-\x{1F6E5}\x{1F6E9}\x{1F6F0}\x{1F6F3}]|[\x{23E9}-\x{23EC}\x{23F0}\x{23F3}\x{25FD}\x{2693}\x{26A1}\x{26AB}\x{26C5}\x{26CE}\x{26D4}\x{26EA}\x{26FD}\x{2705}\x{2728}\x{274C}\x{274E}\x{2753}-\x{2755}\x{2757}\x{2795}-\x{2797}\x{27B0}\x{27BF}\x{2B50}\x{1F0CF}\x{1F18E}\x{1F191}-\x{1F19A}\x{1F201}\x{1F21A}\x{1F22F}\x{1F232}-\x{1F236}\x{1F238}-\x{1F23A}\x{1F250}\x{1F251}\x{1F300}-\x{1F320}\x{1F32D}-\x{1F335}\x{1F337}-\x{1F37C}\x{1F37E}-\x{1F384}\x{1F386}-\x{1F393}\x{1F3A0}-\x{1F3C1}\x{1F3C5}\x{1F3C6}\x{1F3C8}\x{1F3C9}\x{1F3CF}-\x{1F3D3}\x{1F3E0}-\x{1F3F0}\x{1F3F8}-\x{1F407}\x{1F409}-\x{1F414}\x{1F416}-\x{1F43A}\x{1F43C}-\x{1F43E}\x{1F440}\x{1F444}\x{1F445}\x{1F451}-\x{1F465}\x{1F46A}\x{1F479}-\x{1F47B}\x{1F47D}-\x{1F480}\x{1F484}\x{1F488}-\x{1F48E}\x{1F490}\x{1F492}-\x{1F4A9}\x{1F4AB}-\x{1F4FC}\x{1F4FF}-\x{1F53D}\x{1F54B}-\x{1F54E}\x{1F550}-\x{1F567}\x{1F5A4}\x{1F5FB}-\x{1F62D}\x{1F62F}-\x{1F634}\x{1F637}-\x{1F644}\x{1F648}-\x{1F64A}\x{1F680}-\x{1F6A2}\x{1F6A4}-\x{1F6B3}\x{1F6B7}-\x{1F6BF}\x{1F6C1}-\x{1F6C5}\x{1F6D0}-\x{1F6D2}\x{1F6D5}-\x{1F6D7}\x{1F6DD}-\x{1F6DF}\x{1F6EB}\x{1F6EC}\x{1F6F4}-\x{1F6FC}\x{1F7E0}-\x{1F7EB}\x{1F7F0}\x{1F90D}\x{1F90E}\x{1F910}-\x{1F917}\x{1F920}-\x{1F925}\x{1F927}-\x{1F92F}\x{1F93A}\x{1F93F}-\x{1F945}\x{1F947}-\x{1F976}\x{1F978}-\x{1F9B4}\x{1F9B7}\x{1F9BA}\x{1F9BC}-\x{1F9CC}\x{1F9D0}\x{1F9E0}-\x{1F9FF}\x{1FA70}-\x{1FA74}\x{1FA78}-\x{1FA7C}\x{1FA80}-\x{1FA86}\x{1FA90}-\x{1FAAC}\x{1FAB0}-\x{1FABA}\x{1FAC0}-\x{1FAC2}\x{1FAD0}-\x{1FAD9}\x{1FAE0}-\x{1FAE7}]/u', '', $text);
}

// add filter to product image
add_filter( 'woocommerce_single_product_image_thumbnail_html', 'woo_events_product_image_html', 20, 2 );
function woo_events_product_image_html( $html, $product ) {
	global $post;
	global $wpdb;
	$product = wc_get_product( $post );
	if ( $product->is_type( 'hotel' ) ) {
		if(isset($_GET['hotel'])){
			$db_hotel = $wpdb->get_row("SELECT * FROM hotels WHERE hotel_id = \"".$_GET['hotel']."\"");
			if($db_hotel){
				// get images array
				$images = json_decode($db_hotel->images);
				// get first image
				$first_image = $images[0];
				// replace {size} with full
				$first_image = str_replace("{size}", "x220", $first_image);
				$fullimage = str_replace("{size}", "1024x768", $images[0]);
				$html  = '<div class="woocommerce-product-gallery__image--placeholder">';
				$tempimg = sprintf( '<img src="%s" alt="%s" class="wp-post-image" />', $first_image , $db_hotel->name );
				$html .= sprintf( '<a href="%s" class="%s" title="%s"  rel="prettyPhoto[product-gallery]">%s</a>', $fullimage, "", $db_hotel->name, $tempimg );
				$html .= '</div>';			
			}
		}


	}
	return $html;
}

add_action( 'woocommerce_product_thumbnails', 'custom_product_add_thumbnails', 100, 0 );
function custom_product_add_thumbnails(){
	global $post;
	global $wpdb;
	$product = wc_get_product( $post ); 
	if ( $product->is_type( 'hotel' ) ) {
		if(isset($_GET['hotel'])){
			$db_hotel = $wpdb->get_row("SELECT * FROM hotels WHERE hotel_id = \"".$_GET['hotel']."\"");
			if($db_hotel){
				// get images array
				$images = json_decode($db_hotel->images);
				if(isset($images[0])) unset($images[0]);
				//loop images and show
				echo '<div class="thumbnails">';
				foreach($images as $image){
					$imageslim = str_replace("{size}", "240x240", $image);
					$fullimage = str_replace("{size}", "1024x768", $image);
					$imagex = '<img src="'.$imageslim.'" alt="'.$db_hotel->name.'" class="wp-post-image" />';
					echo sprintf( '<a href="%s" class="%s" title="%s"  rel="prettyPhoto[product-gallery]">%s</a>', $fullimage, "", $db_hotel->name, $imagex );
				} 
				echo '</div>';
			}
		}
	}    
}

add_action('woocommerce_single_product_summary', 'customizing_single_product_summary_hooks', 2  );
function customizing_single_product_summary_hooks(){
	global $product;
	if ( $product->is_type( 'hotel' ) ) {
        remove_action('woocommerce_single_product_summary','woocommerce_template_single_price',10  );
		remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_meta', 40 );
	}
}
//  add action woocommerce_before_add_to_cart_form
add_action('woocommerce_after_single_product_summary', 'customizing_before_add_to_cart_form_hooks' , 1 );

function customizing_before_add_to_cart_form_hooks(){
	global $product;
	global $wpdb;
	if ( $product->is_type( 'hotel' ) ) {
		if(isset($_GET['hotel'])){
			$db_hotel = $wpdb->get_row("SELECT * FROM hotels WHERE hotel_id = \"".$_GET['hotel']."\"");
			if($db_hotel){
				echo '<div class="hotel-details">';
				echo '<h2 class="hotel-name">'.$db_hotel->name.'</h2>';
				// show hotel stars
				$stars = $db_hotel->star_rating;
				$starshtml = '';
				for($i=0; $i<$stars; $i++){
					$starshtml .= '<i class="fa fa-star" data-av_icon="" data-av_iconfont="entypo-fontello" aria-hidden="true"></i>';
				}
				// show reviews
				$reviews = getHotelReviews($db_hotel->hotel_id);
				$reviewshtml = '';
				$reviewsrating = $reviews->rating;
				// create SVG like tripadvisor with 5 circles that can be filled full or halfs knowing that reviews is a number between 0 and 10
				$reviewsrating = intval($reviewsrating);
				$fulls = floor($reviewsrating/2);
				$halfs = $reviewsrating%2;
				$svg = '<svg width="100" height="20">';
				for($i=0; $i<$fulls; $i++){
					$svg .= '<circle cx="'.(10+($i*20)).'" cy="10" r="8" fill="#00aa6c" />';
				}
				if($halfs){
					$svg .= '<circle cx="'.($fulls*20+10).'" cy="10" r="8" fill="#00aa6c" />';
					$svg .= '<circle cx="'.($fulls*20+10).'" cy="10" r="3" fill="#ffffff" />';
				}
				for($i=$fulls+$halfs; $i<5; $i++){
					$svg .= '<circle cx="'.(10+($i*20)).'" cy="10" r="8" fill="#ffffff" />';
				}
				$svg .= "</svg>";
				$reviewshtml .= $svg;
				$reviewshtml .= '<span class="reviews-number">'.count($reviews->reviews).' reviews</span>';
				echo '<p class="hotel-stars">'.$starshtml.'</p>';
				echo '<p class="hotel-reviews">'.$reviewshtml.'</p>';
				echo '<p class="address hotel_data_address">'.$db_hotel->address.'</p>';
				// show description
				echo '<div class="hotel_description">';
				$description_structures = json_decode($db_hotel->description_struct);
				foreach($description_structures as $description_structure){
					foreach($description_structure->paragraphs as $paragraph){
						echo '<p>'.$paragraph.'</p>';
					}
				}
				echo '</div>';
				echo '<div class="hotel-rooms">';
					// show loading element
					echo "<div class='loading_hotels'>";
					echo "<span class='spinner is-active'>Loading..</span>";
					echo "</div>";		
					echo "<div class='col-md-12'><div class='check_in_out_fields'>";
					echo "<input type='hidden' class='product_id' name='product_id' value='".$product->get_id()."' />";
					// hotel id
					echo "<input type='hidden' class='hotel_id' name='hotel_id' value='".$_GET['hotel']."' />";
					// label
					echo "<label>".__('Check In: ', 'woo-events-product')."</label>";
					echo "<input type='text' class='check_in_date datepicker' value='".date("d.m.Y",strtotime($_GET['check_in_date']))."' />";
					echo "<label>".__('Check Out: ', 'woo-events-product')."</label>";
					echo "<input type='text' class='check_out_date datepicker' value='".date("d.m.Y",strtotime($_GET['check_out_date']))."' />";
					// rooms
					echo "<label>".__('Rooms: ', 'woo-events-product')."</label>";
					echo "<input type='text' class='rooms' value='".(isset($_GET['rooms'])?$_GET['rooms']:1)."' />";
					echo "<label>".__('Adults: ', 'woo-events-product')."</label>";
					echo "<input type='text' class='adults' value='".(isset($_GET['adults'])?$_GET['adults']:2)."' />";
					echo "<label>".__('Children: ', 'woo-events-product')."</label>";
					echo "<input type='text' class='childs' value='".(isset($_GET['children'])?$_GET['children']:0)."' />";
					echo "<button class='search_rooms'>".__('Search Rooms', 'woo-events-product')."</button>";
					echo "</div></div>";
					echo '<div class="rooms_list">';
					
					echo '</div>';
				echo '</div>';
				echo '</div>';
			}
		}
	}
}

// ajax get hotel
add_action('wp_ajax_get_hotel', 'get_hotel');
add_action('wp_ajax_nopriv_get_hotel', 'get_hotel');
function get_hotel(){
	$product_id = $_POST['product_id'];
	$hotel_id = $_POST['hotel_id'];
	$checkin = $_POST['check_in_date'];
	$checkout = $_POST['check_out_date'];
	$adults = $_POST['adults'];
	$children = $_POST['children'];
	$rooms = $_POST['rooms'];
	$selected_rooms = $rooms;
	$checkin = date("Y-m-d",strtotime($checkin));
	$checkout = date("Y-m-d",strtotime($checkout));
	$hotel = new EmergicTravel();
	$hotel = $hotel->getHotel($hotel_id,$checkin,$checkout,$rooms,$adults,$children);
	$rooms = [];
	foreach($hotel[0]->rates as $room){
		if($room->payment_options->payment_types[0]->is_need_credit_card_data == true){
			continue;
		}
		$hotel_price = $room->payment_options->payment_types[0]->show_amount;
		$hotel_currency = $room->payment_options->payment_types[0]->currency_code;
		$hotel_price = getHotelProductPrice($product_id,$hotel_price,$hotel_currency);
		$orgroomname = $room->room_name;
		if($selected_rooms && intval($selected_rooms) > 1){
			$room->room_name = $selected_rooms." x ".$room->room_name;
		}
		$rooms[] = [
			'name' => $room->room_name,
			'room_id' => $orgroomname,
			'match_hash' => $room->match_hash,
			'meal' => $room->meal,
			'price' => $hotel_price['price'],
			'currency' => $hotel_price['currency'],
			'bed_type' => $room->room_data_trans->bedding_type,
			'hotel_id' => $hotel_id,
			'checkindate' => $_POST['check_in_date'],
			'checkoutdate' => $_POST['check_out_date'],
			'rooms' => $selected_rooms,
			'adults' => $adults,
			'children' => $children,
			'taxdata' => $room->payment_options->payment_types[0]->tax_data,
		];
	}
	echo json_encode($rooms);
	die();
}

function prebook_hotel() { 
	// check if request is coming from /wp-json/wc/store/v1/checkout
	// if(strpos($_SERVER['REQUEST_URI'], '/wp-json/wc/store/v1/checkout') === false) return;
	foreach ( WC()->cart->get_cart() as $item_key => $item ) {
		if( array_key_exists( 'hotel_id', $item ) ) {
			// get product
			$product = wc_get_product($item['product_id']);
			$book_hash = $item['book_hash'];
			// generate unique partenr order id
			$partner_order_id = uniqid();
			// booking form
			$hotel = new EmergicTravel();
			$hotel = $hotel->orderBookingForm($book_hash,$partner_order_id);
			if($hotel->status == "error"){
				// die(var_dump($hotel));
				$errors->add( 'validation', __( "There is an error booking your room(s), please contact support." ));
			} else {
				WC()->cart->cart_contents[$item_key]['hotel_order_id'] = $partner_order_id;
				WC()->cart->cart_contents[$item_key]['amount'] = $hotel->amount;
				WC()->cart->cart_contents[$item_key]['currency_code'] = $hotel->currency_code;
			}

		}
	}
}
add_action('woocommerce_check_cart_items', 'prebook_hotel');

add_action( 'woocommerce_order_status_processing', 'finalize_hotel_booking', 20, 2 );

function finalize_hotel_booking( $order_id, $order ) {
	// get order
	$order = wc_get_order( $order_id );
	// get order items
	$order_items = $order->get_items();
	// loop through order items
	foreach ( $order_items as $item_id => $item ) {
		// get product id
		$product_id = $item->get_product_id();
		// get product
		$product = wc_get_product($product_id);
		// get product type
		$product_type = $product->get_type();
		// check if product type is hotel
		if ($product_type == 'hotel') {
			// get hotel order id
			$hotel_order_id = $item->get_meta('_hotel_order_id');
			// get hotel currency code
			$currency_code = $item->get_meta('_currency_code');
			// get hotel amount
			$amount = $item->get_meta('_amount');
			// get order first name
			$first_name = $order->get_billing_first_name();
			// get order last name
			$last_name = $order->get_billing_last_name();
			// get hotel adults
			$adults = $item->get_meta('Adults');
			// get hotel childs
			$childs = $item->get_meta('children');
			// get hotel rooms
			$rooms = $item->get_meta('Rooms');
			// get hotel id
			$hotel_id = $item->get_meta('hotel_id');
			// get hotel
			$hotel = new EmergicTravel();
			$hotel = $hotel->orderBooking($hotel_order_id,$amount,$currency_code,$rooms,$adults,$childs,$first_name,$last_name);
			// check if hotel is prebooked
			if($hotel->status == "error"){
				// update order status
				$order->update_status('failed');
				// add note
				$order->add_order_note( "There is an error booking your room(s), please contact support. ERROR: ".$hotel->error );
			} else {
				// update order status
				$order->update_status('wc-pendingratehawk');
				// add note
				$order->add_order_note( "Booking request successfully." );
			}
		}
	}
}

// function to calculate distance
function distance($lat1, $lon1, $lat2, $lon2, $unit) {
	$lat1 = floatval($lat1);
	$lon1 = floatval($lon1);
	$lat2 = floatval($lat2);
	$lon2 = floatval($lon2);
	// make positive values
	if (($lat1 == $lat2) && ($lon1 == $lon2)) {
		return 0;
	}
	else {
		$theta = $lon1 - $lon2;
		$dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
		$dist = acos($dist);
		$dist = rad2deg($dist);
		$miles = $dist * 60 * 1.1515;
		$unit = strtoupper($unit);
		if ($unit == "K") {
			return number_format(($miles * 1.609344),0);
		} else if ($unit == "N") {
			return ($miles * 0.8684);
		} else {
			return $miles;
		}
	}
}

// add woocommerce status type Pending Ratehawk Finish
add_filter( 'wc_order_statuses', 'add_custom_order_statuses' );
function add_custom_order_statuses( $order_statuses ) {
	$order_statuses['wc-pendingratehawk'] = _x( 'Pending Ratehawk Finish Booking', 'Order status', 'woocommerce' );
	return $order_statuses;
}

// add action to add custom status to order
add_action( 'init', 'register_custom_order_statuses' );
function register_custom_order_statuses() {
	register_post_status( 'wc-pendingratehawk', array(
		'label'                     => _x( 'Pending Ratehawk Finish Booking', 'Order status', 'woocommerce' ),
		'public'                    => true,
		'exclude_from_search'       => false,
		'show_in_admin_all_list'    => true,
		'show_in_admin_status_list' => true,
		'label_count'               => _n_noop( 'Pending Ratehawk Finish Booking <span class="count">(%s)</span>', 'Pending Ratehawk Finish Booking <span class="count">(%s)</span>', 'woocommerce' )
	) );
}

// add wordpress cronjob to check if hotel is booked that runs every 5 minutes
add_action('init', 'schedule_hotel_booking_check');
function schedule_hotel_booking_check() {
	if ( ! wp_next_scheduled( 'hotel_booking_check' ) ) {
		wp_schedule_event( time(), 'every_fiveseconds', 'hotel_booking_check' );
	}
}

// add custom cron schedule
add_filter( 'cron_schedules', 'add_custom_cron_schedule' );
function add_custom_cron_schedule( $schedules ) {
	$schedules['every_fiveseconds'] = array(
		'interval' => 5,
		'display'  => __( 'Every 5 seconds' ),
	);
	return $schedules;
}

// add action to check if hotel is booked
add_action('hotel_booking_check', 'check_hotel_booking');

// add ajax call to check hotel booking
add_action('wp_ajax_check_booking_status', 'check_hotel_booking');
add_action('wp_ajax_nopriv_check_booking_status', 'check_hotel_booking');

function check_hotel_booking() {
	// get all orders
	$orders = wc_get_orders( array(
		'limit' => -1,
		'status' => 'wc-pendingratehawk',
	) );
	// loop through orders
	foreach($orders as $order){
		// get items
		$items = $order->get_items();
		// loop through items
		foreach($items as $item){
			// get hotel order id from item
			$hotel_order_id = $item->get_meta('_hotel_order_id');
			// check order status via api
			$hotel = new EmergicTravel();
			$hotel = $hotel->checkOrderStatus($hotel_order_id);
			// check if hotel is booked
			if($hotel->status == "error"){
				// update order status
				$order->update_status('failed');
				// add note
				$order->add_order_note( "There is an error booking your room(s), please contact support." );
			} else {
				// update order status
				$order->update_status('completed');
				// add note
				$order->add_order_note( "Your room(s) has been booked successfully." );
			}
		}
	}
}

add_filter( 'woocommerce_customer_get_downloadable_products', 'add_voucher_download', 9999, 1 );
 
function add_voucher_download( $downloads ) {
	// get user orders
	$customer_orders = wc_get_orders( array(
		'limit' => -1,
		'customer' => get_current_user_id(),
		'status' => array('completed')
	) );
	// loop through orders
	foreach($customer_orders as $order){
		// get items
		$items = $order->get_items();
		// loop through items
		$itemno = 0;
		foreach($items as $item){
			// get product id
			$product_id = $item->get_product_id();
			// get product
			$product = wc_get_product($product_id);
			// get product type
			$product_type = $product->get_type();
			// check if product type is hotel
			if ($product_type == 'hotel') {
				// get hotel name
				$hotel_name = $item->get_meta('Hotel Name');
				// get hotel check in date
				$check_in_date = $item->get_meta('Check In');
				// get hotel check out date
				$check_out_date = $item->get_meta('Check Out');
				// check if voucher is already downloaded
				$voucher_url = $item->get_meta('voucher_url');
				if(!$voucher_url){
					// download voucher
					$api = new EmergicTravel();
					$pdfcontent = $api->downloadVoucher($item->get_meta('_hotel_order_id'));
					if(!$pdfcontent) continue;
					// create file
					$filename = $hotel_name.' - '.$check_in_date.' - '.$check_out_date.'.'.$order->ID.'.'.$itemno.'..pdf';
					$itemno++;
					$upload_dir = wp_upload_dir();
					$upload_path = $upload_dir['path'];
					$upload_url = $upload_dir['url'];
					$upload_file = $upload_path.'/'.$filename;
					$upload_url = $upload_url.'/'.$filename;
					// write file
					file_put_contents($upload_file, $pdfcontent);
					// save file url to item meta
					$item->add_meta_data( 'voucher_url', $upload_url, true );
					$item->save();
					$voucher_url = $upload_url;
				}

				// add download				
				$downloads[] = array(
					'product_name' => $hotel_name.' - '.$check_in_date.' - '.$check_out_date,
					'download_name' => 'Download Voucher',
					'download_url' => $voucher_url,
					'product_url' => '#',
					'downloads_remaining' => 'unlimited',
					'file' => array(
						'file' => $voucher_url,
						'name' => $hotel_name.' - '.$check_in_date.' - '.$check_out_date,
					),
				 );
			}
		}
	}
   return $downloads;
}

// add action for download-file downloads collumn to force download
add_action( 'woocommerce_account_downloads_column_download-file', 'force_download', 10, 1 );
function force_download( $download ) {
	// get file url
	$file_url = $download['download_url'];
	// get file name
	$file_name = $download['download_name'];
	// force download
	echo '<a href="'.$file_url.'" download class="woocommerce-MyAccount-downloads-file button alt" target="_blank">'.$file_name.'</a>';
}

// disable product reviews tab
add_filter( 'woocommerce_product_tabs', 'woo_remove_product_tabs', 98 );

function woo_remove_product_tabs( $tabs ) {
	unset( $tabs['reviews'] );
	return $tabs;
}

// add custom product description
add_action('flatsome_after_product_images', 'customizing_single_product_description', 80  );

function customizing_single_product_description(){
	global $product;
	if ( $product->is_type( 'hotel' ) && !isset($_GET['hotel']) ) {
		echo do_shortcode('[woo_hotels_product_prices product_id="'.$product->id.'"]');
	}
	if(isset($_GET['hotel'])){
		echo do_shortcode('[woo_hotel_product product_id="'.$product->id.'"]');
	}
}

add_shortcode('woo_hotel_product', 'woo_hotel_product');

function reviewsModule($score){
	// create SVG like tripadvisor with 5 circles that can be filled full or halfs knowing that reviews is a number between 0 and 10
	$score = intval($score);
	$fulls = floor($score/2);
	$halfs = $score%2;
	$svg = '<svg width="100" height="20">';
	for($i=0; $i<$fulls; $i++){
		$svg .= '<circle cx="'.(10+($i*20)).'" cy="10" r="8" fill="#00aa6c" />';
	}
	if($halfs){
		$svg .= '<circle cx="'.($fulls*20+10).'" cy="10" r="8" fill="#00aa6c" />';
		$svg .= '<circle cx="'.($fulls*20+10).'" cy="10" r="3" fill="#ffffff" />';
	}
	for($i=$fulls+$halfs; $i<5; $i++){
		$svg .= '<circle cx="'.(10+($i*20)).'" cy="10" r="8" fill="#ffffff" />';
	}
	$svg .= "</svg>";
	return $svg;
}

function woo_hotel_product(){
	if(isset($_GET['hotel'])){
		global $wpdb;
		global $product;
		$html = '';
		$db_hotel = $wpdb->get_row("SELECT * FROM hotels WHERE hotel_id = \"".$_GET['hotel']."\" LIMIT 1");
		if($db_hotel){
			// get hotel info from api
			$hotel = new EmergicTravel();
			$hotel = $hotel->getHotelInfo($_GET['hotel']);
			$db_hotel = $hotel->data;
			$db_hotel->images = json_encode($db_hotel->images);
			$db_hotel->description_struct = json_encode($db_hotel->description_struct);
			$db_hotel->amenities = json_encode($db_hotel->amenity_groups);
			$db_hotel->metapolicy_struct = json_encode($db_hotel->metapolicy_struct);
			$db_hotel->metapolicy_extra_info = json_encode($db_hotel->metapolicy_extra_info);
		}
		if($db_hotel){
			
			//get view from views/hotel.php outside of this folder
			$html = file_get_contents(ABSPATH.'wp-content/plugins/woo-events-product/views/hotel.php');
			
			// get images array
			$images = json_decode($db_hotel->images);
			// get first image
			$first_image = $images[0];
			
			$reviews = getHotelReviews($db_hotel->hotel_id);
			// object(stdClass)#4914 (3) { ["rating"]=> float(8.8) ["detailed_ratings"]=> object(stdClass)#4646 (8) { ["cleanness"]=> float(8.9) ["location"]=> float(9.4) ["price"]=> float(8.6) ["services"]=> float(8.6) ["room"]=> float(8.3) ["meal"]=> float(8.2) ["wifi"]=> int(9) ["hygiene"]=> float(8.5) } ["reviews"]=> array(3) { [0]=> object(stdClass)#4915 (14) { ["id"]=> int(646095) ["review_plus"]=> string(100) "Located in the city and accessible to places in town Very very comfortable room good clean setting" ["review_minus"]=> string(40) "Service during breakfast could be better" ["created"]=> string(10) "2022-12-18" ["author"]=> string(10) "Uzair Sait" ["adults"]=> int(3) ["children"]=> int(0) ["room_name"]=> string(12) "Deluxe Suite" ["nights"]=> int(1) ["images"]=> array(0) { } ["detailed"]=> object(stdClass)#4913 (8) { ["cleanness"]=> int(9) ["location"]=> int(9) ["price"]=> int(8) ["services"]=> int(8) ["room"]=> int(9) ["meal"]=> int(8) ["wifi"]=> string(7) "perfect" ["hygiene"]=> string(11) "unspecified" } ["traveller_type"]=> string(6) "family" ["trip_type"]=> string(7) "leisure" ["rating"]=> float(8.7) } [1]=> object(stdClass)#4912 (14) { ["id"]=> int(613118) ["review_plus"]=> string(107) "Centrally located Very good breakfast with lots of options. Very spacious and clean. Very friendly staff" ["review_minus"]=> string(59) "They did not have universal outlets so i needed an adapter." ["created"]=> string(10) "2022-11-03" ["author"]=> string(4) "Lisl" ["adults"]=> int(2) ["children"]=> int(0) ["room_name"]=> string(36) "Deluxe Double room (full double bed)" ["nights"]=> int(1) ["images"]=> array(0) { } ["detailed"]=> object(stdClass)#4911 (8) { ["cleanness"]=> int(10) ["location"]=> int(10) ["price"]=> NULL ["services"]=> int(10) ["room"]=> int(10) ["meal"]=> int(10) ["wifi"]=> string(7) "perfect" ["hygiene"]=> string(2) "ok" } ["traveller_type"]=> string(11) "solo_travel" ["trip_type"]=> string(8) "business" ["rating"]=> float(9.6) } [2]=> object(stdClass)#4910 (14) { ["id"]=> int(275451) ["review_plus"]=> string(15) "Golden location" ["review_minus"]=> NULL ["created"]=> string(10) "2019-01-20" ["author"]=> string(5) "Vasil" ["adults"]=> int(3) ["children"]=> int(0) ["room_name"]=> string(18) "Deluxe Triple Room" ["nights"]=> int(2) ["images"]=> array(0) { } ["detailed"]=> object(stdClass)#4909 (8) { ["cleanness"]=> int(10) ["location"]=> int(10) ["price"]=> int(10) ["services"]=> int(10) ["room"]=> NULL ["meal"]=> NULL ["wifi"]=> string(11) "unspecified" ["hygiene"]=> string(11) "unspecified" } ["traveller_type"]=> string(11) "unspecified" ["trip_type"]=> string(7) "leisure" ["rating"]=> int(10) } } }
			$reviewshtml = '';
			$rating = $reviews->rating;
			$svg_reviews = reviewsModule($rating);
			if($reviews != null ){

			} else {
				$reviews = new stdClass();
				$reviews->rating = 0;
				$reviews->reviews = [];
			}
			$count_reviews = count($reviews->reviews);
			foreach($reviews->reviews as $review){
				$svg = reviewsModule($review->rating);
				$reviewshtml .= '<div class="review">';
				$reviewshtml .= '<div class="review_author">'.$review->author.'</div>';
				$reviewshtml .= '<div class="review_rating">'.$svg.'</div>';
				$reviewshtml .= '<div class="review_plus">'.$review->review_plus.'</div>';
				$reviewshtml .= '<div class="review_minus">'.$review->review_minus.'</div>';
				$reviewshtml .= '</div>';
			}
			$html = str_replace("{reviews}", $reviewshtml, $html);
			$html = str_replace("{reviews_count}", $count_reviews, $html);
			$html = str_replace("{reviews_rating}", $svg_reviews, $html);
			$html = str_replace("{reviews_svg}", $svg_reviews, $html);
			// product id replace
			$html = str_replace("{product_id}", $product->id, $html);
			$html = str_replace("{check_in_date}", date("d.m.Y",strtotime($_GET['check_in_date'])), $html);
			$html = str_replace("{check_out_date}", date("d.m.Y",strtotime($_GET['check_out_date'])), $html);
			$html = str_replace("{rooms}", $_GET['rooms'], $html);
			$html = str_replace("{adults}", $_GET['adults'], $html);
			$html = str_replace("{children}", $_GET['children'], $html);	
			$metapolicy_struct = json_decode($db_hotel->metapolicy_struct, TRUE);
			$struct = '';
			// Generate HTML tables for each section
			foreach ($metapolicy_struct as $key => $value) {
				if(count($value) == 0) continue;
				$struct .= create_html_table(ucfirst(str_replace("_", " ", $key)), $value);
			}
			if(strlen($db_hotel->metapolicy_extra_info) > 0){
				$html = str_replace("{metapolicy_info}", "<h5>Important Policy</h5><p>".json_decode($db_hotel->metapolicy_extra_info)."</p><p>".$struct."</p>", $html);
			} else {
				$html = str_replace("{metapolicy_info}", "", $html);
			}
			$desc = $db_hotel->description_struct;
			$desc = json_decode($desc);
			$description = '';
			foreach($desc as $d){
				$description .= '<h5>'.$d->title.'</h5>';
				foreach($d->paragraphs as $p){
					$description .= '<p>'.$p.'</p>';
				}
			}
			// replace {size} with full
			$first_image = str_replace("{size}", "x220", $first_image);
			$fullimage = str_replace("{size}", "1024x768", $images[0]);
			$html = str_replace("{hotel_image}", $first_image, $html);
			$html = str_replace("{hotel_name}", $db_hotel->name, $html);
			$html = str_replace("{hotel_address}", $db_hotel->address, $html);
			$html = str_replace("{description}", $description, $html);
			$html = str_replace("{hotel_id}", $_GET['hotel'], $html);
			$html = str_replace("{main_image}", $fullimage, $html);
			$stars = $db_hotel->star_rating;
			$starshtml = '';
			$uploads = wp_upload_dir();
			for($i=0; $i<$stars; $i++){
				$starshtml .= '<img src="'.$uploads['baseurl'].'/2024/06/star.svg'.'" />';
			}
			$thumbs = '';
			$count = 0;
			$amenities = json_decode($db_hotel->amenities);
			$allamenities = [];
			foreach($amenities as $amenity){
				foreach($amenity->amenities as $a){
					$allamenities[] = $a;
				}
			}
			$amenitieshtml = '';
			$mainamenities = '';
			$mains = [
				'TV',
				'Accessibility features',
				'Bar',
				'Restaurant',
				'Free Wi-Fi',
				'Multi-language staff',
				'Parking',
				'Swimming pool',
				'Private beach',
				'Pool facilities',
				'Business center',
				'Spa',
				'Fitness facilities',
			];
			foreach($allamenities as $amenity){
				if(in_array($amenity, $mains)){
					$mainamenities .= '<li class="amenity"><i class="icon-lock" style="color:blue;"></i>'.$amenity.'</li>';
				} else {
					$amenitieshtml .= '<li class="amenity">'.$amenity.'</li>';
				}
			}
			$html = str_replace("{main_amenities}", $mainamenities, $html);
			$html = str_replace("{amenities}", $amenitieshtml, $html);
			$latitude = $db_hotel->latitude;
			$longitude = $db_hotel->longitude;
			// show map with hotel location
			$map = '<div class="acf-map">';
			$map .= '<div class="marker" data-lat="'.$latitude.'" data-lng="'.$longitude.'"></div>';
			$map .= '</div>';
			$html = str_replace("{map}", $map, $html);
			foreach($images as $key => $image){
				if($key == 0) continue;
				$count++;
				$imageslim = str_replace("{size}", "240x240", $image);
				$fullimage = str_replace("{size}", "1024x768", $image);
				$imagex = '<img src="'.$imageslim.'" alt="'.$db_hotel->name.'" class="wp-post-image" />';
				if($count > 6){
					$thumbs .= sprintf( '<a href="%s" class="%s hidden" title="%s" style="display:none;"  rel="prettyPhoto[product-gallery]">%s</a>', $fullimage, "", $db_hotel->name, $imagex );
					continue;
				}
				if($count == 6){
					$remaining = count($images) - 7;
					$thumbs .= sprintf( '<a href="%s" class="%s" title="%s"  rel="prettyPhoto[product-gallery]">%s <span><object type="image/svg+xml" data="https://test.grandstandtickets.com/wp-content/uploads/2024/06/icon_photo.svg"></object> +'.$remaining.' photos</span></a>', $fullimage, "", $db_hotel->name, $imagex );
				} else {
					$thumbs .= sprintf( '<a href="%s" class="%s" title="%s"  rel="prettyPhoto[product-gallery]">%s</a>', $fullimage, "", $db_hotel->name, $imagex );
				}
				
			}
			$html = str_replace("{thumbs}", $thumbs, $html);
			$html = str_replace("{hotel_stars}", $starshtml, $html);
		}
	}	
	return $html;
}

// Function to create an HTML table from a given array
function create_html_table($title, $array) {
	$output = '';
	if (is_array($array) && !empty($array)) {
		$output .= "<h2>$title</h2>";
		if (!empty($array)) {
			$output .= "<table border='1' cellpadding='10'>";
			// Table Headers
			$output .= "<tr>";
			if(!is_array($array[0])){
				return;
			}
			foreach (array_keys($array[0]) as $header) {
				$output .= "<th>" . ucfirst(str_replace("_", " ", $header)) . "</th>";
			}
			$output .= "</tr>";
			
			// Table Rows
			foreach ($array as $row) {
				$output .= "<tr>";
				foreach ($row as $value) {
					// replace per_ with /
					$value = str_replace("_per_", "/", $value);
					$value = str_replace("per_", "/", $value);
					// replace not_included with Not Included
					$value = str_replace("not_included", "Not Included", $value);
					// replace included with Included
					$value = str_replace("included", "Included", $value);
					$output .= "<td>" . (is_null($value) ? 'N/A' : $value) . "</td>";
				}
				$output .= "</tr>";
			}
			$output .= "</table>";
		} else {
			$output .= "<p>No data available</p>";
		}
	}
	return $output;
}