<?php
namespace WooEventsProduct;

class EmergicTravel {

	function __construct(){
		$this->apiurl = get_option('woo_events_product_emergingtravel_api_url');
		$this->user = get_option('woo_events_product_emergingtravel_api_id'); // Key Id
		$this->key = get_option('woo_events_product_emergingtravel_api_key'); // Key
	}

	// add logging function
	function log($data,$type){
		// check if loggedin
		if(is_user_logged_in()){
			$user = wp_get_current_user();
			$username = $user->user_login;
		} else {
			$username = 'guest';
		}
		// check if user loggedin and get username

		// log data
		$fp = fopen(WOO_EVENTS_PRODUCT_DIR.'log-ratehawk.txt', 'a');
		fwrite($fp, date("m/d/Y h:i a ")."USER:".$username." - ".$type.": ".json_encode($data)."\n\n");
		fclose($fp);
	}
	

	public function searchRegion($query){
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => $this->apiurl.'search/multicomplete/',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>'{
			"query": "'.$query.'",
			"language": "en"
		}',
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($this->user.':'.$this->key), // Base64 encode of user:key
		),
		));
		// log request
		$this->log([
			'url' => $this->apiurl.'search/multicomplete/',
			'query' => $query,
			'language' => 'en',
		], 'searchRegion request');
		$response = curl_exec($curl);
		// log response
		$this->log(json_decode($response), 'searchRegion response');
		$response = json_decode($response);
		if(isset($response->data) && isset($response->data->regions)){
			return $response->data->regions;
		}
	}

	public function getHoteldump(){
		$curl = curl_init();
		curl_setopt_array($curl, array(
		// CURLOPT_URL => 'https://api.worldota.net/api/b2b/v3/hotel/info/incremental_dump/',
		CURLOPT_URL => 'https://api.worldota.net/api/b2b/v3/hotel/info/dump/',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>'{
			"inventory": "all",
			"language": "en"
		}',
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($this->user.':'.$this->key), // Base64 encode of user:key
		),
		));
		$response = curl_exec($curl);
		return $response;
	
	}

	public function getHotelReviewsdump(){
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => 'https://api.worldota.net/api/b2b/v3/hotel/reviews/dump/',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>'{
			"language": "en"
		}',
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($this->user.':'.$this->key), // Base64 encode of user:key
		),
		));
		$response = curl_exec($curl);
		return $response;

	}

	public function searchHotelInRegion($region_id,$checkin,$checkout,$adults = 2, $children = [],$rooms = 1,$rating = false){
		$guests = [];
		$adultsperroom = 0;
		$childrenperroom = 0;
		if($adults == 0){
			$adults = 1;
		}
		if($rooms == 0){
			$rooms = 1;
		}
		$adultsperroom = ceil($adults / $rooms);
		$childrenperroom = ceil($children / $rooms);
		$maxadults = $adults;
		$maxchildren = $children;
		for($i = 0; $i < $rooms; $i++){
			if($maxadults < $adultsperroom){
				$adultsperroom = $maxadults;
			}
			if($maxchildren < $childrenperroom){
				$childrenperroom = $maxchildren;
			}
			$maxadults -= $adultsperroom;
			
			$childs = [];
			if($childrenperroom > 0 && $maxadults == 0){
				$maxchildren -= $childrenperroom;
				for($j = 0; $j < $childrenperroom; $j++){
					$childs[] = 14;
				}
			}
			$guests[] = [
				"adults" => $adultsperroom,
				"children" => $childs,
			];
		}
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => $this->apiurl.'search/serp/region/',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>'{
			"region_id": '.$region_id.',
			"checkin": "'.$checkin.'",
			"checkout": "'.$checkout.'",
			"guests": '.json_encode($guests).',
			"hotels_limit": '.(isset($_POST['max_results']) ? $_POST['max_results'] : 20).',
			"language": "en"
		}',
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($this->user.':'.$this->key), // Base64 encode of user:key
		),
		));
		// log request
		$this->log([
			'url' => $this->apiurl.'search/serp/region/',
			'region_id' => $region_id,
			'checkin' => $checkin,
			'checkout' => $checkout,
			'guests' => $guests,
			'hotels_limit' => 10,
			'language' => 'en',
		], 'searchHotelInRegion request');
		$response = curl_exec($curl);
		// log response
		$this->log(json_decode($response), 'searchHotelInRegion response');
		$response = json_decode($response);
		if(isset($response->data) && isset($response->data->hotels)){
			return $response->data->hotels;
		}
	}
	// get hotel info
	public function getHotelInfo($hotel_id) {
		// curl get hotel info
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => $this->apiurl.'hotel/info/',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>'{
			"id": "'.$hotel_id.'",
			"language": "en"
		}',
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($this->user.':'.$this->key), // Base64 encode of user:key
		),
		));
		// log request
		$this->log([
			'url' => $this->apiurl.'hotel/info/',
		], 'getHotelInfo request');
		$response = curl_exec($curl);
		// log response
		$this->log(json_decode($response), 'getHotelInfo response');
		$response = json_decode($response);
		if(isset($response->data)){
			return $response;
		}
	}

	// get hotel
	public function getHotel($hotel_id,$checkin,$checkout,$rooms = 1, $adults = 2, $children = 0 ) {
		$guests = [];
		$adultsperroom = 0;
		$childrenperroom = 0;
		if($adults == 0){
			$adults = 1;
		}
		if($rooms == 0){
			$rooms = 1;
		}
		$adultsperroom = ceil($adults / $rooms);
		$childrenperroom = ceil($children / $rooms);
		$maxadults = $adults;
		$maxchildren = $children;
		for($i = 0; $i < $rooms; $i++){
			if($maxadults < $adultsperroom){
				$adultsperroom = $maxadults;
			}
			if($maxchildren < $childrenperroom){
				$childrenperroom = $maxchildren;
			}
			$maxadults -= $adultsperroom;
			
			$childs = [];
			if($childrenperroom > 0 && $maxadults == 0){
				$maxchildren -= $childrenperroom;
				for($j = 0; $j < $childrenperroom; $j++){
					$childs[] = 14;
				}
			}
			$guests[] = [
				"adults" => $adultsperroom,
				"children" => $childs,
			];
		}
		// echo json_encode($guests);die();
		$request_data = '{
			"id": "'.$hotel_id.'",
			"checkin": "'.$checkin.'",
			"checkout": "'.$checkout.'",
			"guests": '.json_encode($guests).',
			"language": "en"
		}';
		// check if response is cached
		// if($response = get_transient('hotel_'.md5($request_data))){
		// 	// log response
		// 	$response = json_decode($response);
		// 	if(isset($response->data) && isset($response->data->hotels)){
		// 		return $response->data->hotels;
		// 	}
		// }
		// curl get hotel
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => $this->apiurl.'search/hp',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>'{
			"id": "'.$hotel_id.'",
			"checkin": "'.$checkin.'",
			"checkout": "'.$checkout.'",
			"guests": '.json_encode($guests).',
			"language": "en"
		}',
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($this->user.':'.$this->key), // Base64 encode of user:key
		),
		));
		// log request
		$this->log([
			'url' => $this->apiurl.'search/hp',
			'id' => $hotel_id,
			'checkin' => $checkin,
			'checkout' => $checkout,
			'guests' => $guests,
			'language' => 'en',
		], 'getHotel request');
		$response = curl_exec($curl);
		// cache response for 1 hour
		set_transient('hotel_'.md5($request_data), $response, 60*60);		
		// log response
		$this->log(json_decode($response), 'getHotel response');
		$response = json_decode($response);
		if(isset($response->data) && isset($response->data->hotels)){
			return $response->data->hotels;
		}
	}

	// prebook hotel
	public function prebookHotel($hash) {
		
		// curl prebook hotel
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => $this->apiurl.'hotel/prebook',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>'{
			"hash": "'.$hash.'",
			"price_increase_percent": 0
		}',
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($this->user.':'.$this->key), // Base64 encode of user:key
		),
		));
		// log request
		$this->log([
			'url' => $this->apiurl.'hotel/prebook',
			'hash' => $hash,
			'price_increase_percent' => 0,
		], 'prebookHotel request');
		$response = curl_exec($curl);
		// log response
		$this->log(json_decode($response), 'prebookHotel response');
		$response = json_decode($response);
		// var_dump($response);
		return $response;
	}

	// order booking form
	public function orderBookingForm($hash,$partner_order_id) {
		$postfields = [
			"book_hash" => $hash,
			"partner_order_id" => $partner_order_id,
			"language" => "en",
			"user_ip" => $_SERVER['REMOTE_ADDR'],
		];
		$postfields = json_encode($postfields);
		// curl order booking form
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => $this->apiurl.'hotel/order/booking/form/',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>$postfields,
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($this->user.':'.$this->key), // Base64 encode of user:key
		),
		));
		// log request
		$this->log([
			'url' => $this->apiurl.'hotel/order/booking/form/',
			'book_hash' => $hash,
			'partner_order_id' => $partner_order_id,
			'language' => 'en',
			'user_ip' => $_SERVER['REMOTE_ADDR'],
		], 'orderBookingForm request');
		$response = curl_exec($curl);
		// log response
		$this->log(json_decode($response), 'orderBookingForm response');
		$response = json_decode($response);
		$response = $response->data;
		// find payment type deposit
		$payment_type = null;
		foreach($response->payment_types as $type){
			if($type->type == 'deposit'){
				$payment_type = $type;
				$response->amount = $type->amount;
				$response->currency_code = $type->currency_code;
				break;
			}
		}
		if($payment_type == null){
		    if($response == null){
		        $response = new \stdClass;
		    }
			$response->status = 'error';
		}
		return $response;
	}

	// order booking
	public function orderBooking($partner_order_id,$amount,$currency_code,$rooms,$adults,$childs,$first_name,$last_name) {
		$roomsdata = [];
		$adultsperroom = ceil($adults / $rooms);
		$childrenperroom = ceil($children / $rooms);
		$maxadults = $adults;
		$maxchildren = $children;
		for($i = 0; $i < $rooms; $i++){
			$guests = [];
			if($maxadults < $adultsperroom){
				$adultsperroom = $maxadults;
			}
			if($maxchildren < $childrenperroom){
				$childrenperroom = $maxchildren;
			}
			$maxadults -= $adultsperroom;
			
			for($j=0 ; $j < $adultsperroom; $j++){
				$guests[] = [
					// "first_name" => $first_name,
					"first_name" => "Ratehawk",
					"last_name" => $last_name,
				];
			}
			if($childrenperroom > 0 && $maxadults == 0){
				$maxchildren -= $childrenperroom;
				for($j = 0; $j < $childrenperroom; $j++){
					$guests[] = [
						"first_name" => "Ratehawk",
						"last_name" => $last_name,
						"is_child" => true,
					];
				}
			}
			$roomsdata[] = ["guests" => $guests];
		}

		$postfields = [
			"language" => "en",
			'partner' => [
				"partner_order_id" => $partner_order_id,
				"comment" => "Booking from Grandstand Tickets",
			],
			"payment_type" => [
				"type" => "deposit",
				"amount" => $amount,
				"currency_code" => $currency_code,
			],
			"rooms" => $roomsdata,
			"user" => [
				"email" => "info@grandstandtickets.com",
				"phone" => "1234567890",
			]

		];
		$postfields = json_encode($postfields);
		// curl order booking
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => $this->apiurl.'hotel/order/booking/finish/',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>$postfields,
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($this->user.':'.$this->key), // Base64 encode of user:key
		),
		));
		// log request
		$this->log([
			'url' => $this->apiurl.'hotel/order/booking/finish/',
			'postfields' => $postfields,
			'partner_order_id' => $partner_order_id,
			'amount' => $amount,
			'currency_code' => $currency_code,
			'rooms' => $rooms,
			'adults' => $adults,
			'childs' => $childs,
			'first_name' => $first_name,
			'last_name' => $last_name,
			'language' => 'en',
			'user' => [
				"email" => "info@grandstandtickets.com",
				"phone" => "1234567890",
			],
		], 'orderBooking request');
		$response = curl_exec($curl);
		// log response
		$this->log(json_decode($response), 'orderBooking response');
		$response = json_decode($response);
		// die(var_dump($response));
		return $response;
	}

	// check order status using partner order id
	function checkOrderStatus($partner_order_id){
		$emergictravel = new EmergicTravel();
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => $emergictravel->apiurl.'hotel/order/booking/finish/status/',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>'{
			"partner_order_id": "'.$partner_order_id.'"
		}',
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($emergictravel->user.':'.$emergictravel->key), // Base64 encode of user:key
		),
		));
		// log request
		$this->log([
			'url' => $emergictravel->apiurl.'hotel/order/booking/finish/status/',
			'partner_order_id' => $partner_order_id,
		], 'checkOrderStatus request');
		$response = curl_exec($curl);
		// log response
		$this->log(json_decode($response), 'checkOrderStatus response');
		$response = json_decode($response);
		return $response;
	}
	public function getHotelIncrementalDump(){
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => 'https://api.worldota.net/api/b2b/v3/hotel/info/incremental_dump/',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'POST',
		CURLOPT_POSTFIELDS =>'{
			"language": "en"
		}',
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($this->user.':'.$this->key), // Base64 encode of user:key
		),
		));
		$response = curl_exec($curl);
		return $response;
	}
	// download voucher
	function downloadVoucher($partner_order_id){
		$emergictravel = new EmergicTravel();
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => $emergictravel->apiurl.'hotel/order/document/voucher/download/?data={"partner_order_id":"'.$partner_order_id.'","language":"en"}',
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => '',
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => 'GET',
		CURLOPT_HTTPHEADER => array(
			'Content-Type: application/json',
			'Authorization: Basic '.base64_encode($emergictravel->user.':'.$emergictravel->key), // Base64 encode of user:key
		),
		));
		// log request
		$this->log([
			'url' => $emergictravel->apiurl.'hotel/order/document/voucher/download/',
			'partner_order_id' => $partner_order_id,
			'language' => 'en',
		], 'downloadVoucher request');
		$response = curl_exec($curl);
		// check if response is json
		if(json_decode($response)){
			return false;
		}
		return $response;
	}
}

