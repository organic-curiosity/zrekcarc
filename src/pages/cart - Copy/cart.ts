import { Component, ViewChild  } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import {Http} from '@angular/http';
import { AppService } from "../../app/app.service";
import { CrackerItem } from '../product/product';
import { OrderHistoryPage } from '../orders/orders';

@Component({
  	selector: 'shopping-cart',
  	templateUrl: 'cart.html'
})
export class ShoppingCartPage {
	public cartList = [];
	public grandTotal;
	public couponCode;
	public couponType;
	public couponId;
	public couponApplicabilityMsg;
	public couponApplicability;
	public selectedPaymentMode;
	public sectionOnDisplay;
	public addressList;
	public selectedDeliveryAddress;
	public selectedDeliveryAddressId;
	public loadingRef;
	public newAddress;
	public loading;
	public ADDRESS_MIN_LENGTH = 3;
	public ADDRESS_MAX_LENGTH = 40;

	@ViewChild(CrackerItem) crackerItem: CrackerItem;

	constructor(public navCtrl: NavController, private http: Http, public appService: AppService, private toastCtrl: ToastController) {
		this.cartList = [];
		this.loadingRef = this.appService.getLoadingRef();
		this.grandTotal = 0;
		this.couponApplicability = "disp-none";
		this.couponApplicabilityMsg = null;
		this.sectionOnDisplay = 0;
		this.resetNewAddress();
	}

	ngAfterViewInit() {
		this.fetchData();
	}

	/* cart item actions start here*/

	addToCart(item){
		this.crackerItem.addToCart(item);
		this.calculateItemTotal(item);
	}

	removeFromCart(item){
		this.crackerItem.removeFromCart(item);
		this.calculateItemTotal(item);
		if(item.cartQuantity===0){
			this.cartList.splice(this.cartList.indexOf(item),1);
		}
	}

	addToWishlist(item){
		this.crackerItem.setAsFav(item);
  	}

	removeFromWishlist(item){
		this.crackerItem.unsetAsFav(item);
  	}

  	/* cart item actions end here*/

  	/*navigation starts*/

  	onClickContinue(){
  		this.sectionOnDisplay = 1;
  		this.fetchAddress();
  	}

  	onClickBack(){
  		this.sectionOnDisplay = 0;
  	}

  	onClickAddNewAddress(){
  		this.sectionOnDisplay = 2;
  	}

  	onClickBackToChooseAddress(){
  		this.sectionOnDisplay = 1;
  	}

  	/*navigation ends here*/

	/* cart item related functions starts here */
  	calculateItemTotal(item){
		item.totalAmount = item.netPrice * item.cartQuantity;
		item.totalAmount = item.totalAmount.toFixed(2);
		this.updateGrandTotal();
	}

	updateGrandTotal(){
		var total = 0;
		this.cartList.forEach((item)=>{
			total += item.netPrice * item.cartQuantity;
		});
		this.grandTotal = total.toFixed(2);
	}

	fetchData(){
		this.loading = true;
		this.loadingRef.present();
		this.appService.getCartItems().subscribe(res => {
	            if(res.response===200){
	                if(res.data && res.data.products && Array.isArray(res.data.products)){
	                    this.cartList = res.data.products;
	                    this.cartList.forEach(item => {
	                    	item.cartQuantity = item.quantity;
	                    	this.calculateItemTotal(item);
	                    });
	                }
	            }else{

	            }
	        },
	        e => {

			},
			() => {
				try{
					this.loadingRef.dismiss();
					this.loading = false;
				}catch(e){

				}
			}
       	);
	}

	disableContinue(){
		return !(this.grandTotal && this.grandTotal>0);
	}


	/* cart item related functions ends here */

	/* coupon code related functions starts here */

  	applyCouponCode(couponCode){
		this.loadingRef.present();
		var request = {
			uid: this.appService.getUserId(),
			couponCode: this.couponCode
		};
		var serviceUrl = this.appService.getBaseUrl()+"/store/applyCoupon";
		this.http
			.post(serviceUrl,request)
			.map(res => res.json())
			.subscribe(res => {
				if(res.response===200 && res.data.isApplicable){
					this.couponApplicabilityMsg = "Coupon applied successfully";
					this.couponApplicability = "applicable";
					this.couponType = res.data.couponType;
					this.couponId = res.data.couponId;
				}
				else{
					this.couponApplicabilityMsg = "Sorry, this coupon code is not applicable";
					this.couponApplicability = "not-applicable";
					this.couponType = null;
					this.couponId = null;
				}
			},
			e => {
				this.couponApplicabilityMsg = "Sorry, this coupon code is not applicable";
				this.couponApplicability = "not-applicable";
				this.couponType = null;
				this.couponId = null;
			},
  			() => {
  				try{
					this.loadingRef.dismiss();
				}catch(e){

				}
  			}
  		);
	}

	getCouponConstants(){
		return{
			COUPON_TYPE_NONE : 0,
			COUPON_TYPE_OTHER : 1001,
			COUPON_TYPE_ACK_REFER : 1002,
			COUPON_TYPE_REFER : 1003
		}
	}

	disableApplyCoupon(){
		return !(this.couponCode && (typeof this.couponCode)==="string" && this.couponCode.length>3);
	}

	/* coupon code related functions ends here */

	/* address related functions starts here */

  	fetchAddress(){
  		this.loadingRef.present();
  		var request = {
			uid: this.appService.getUserId()
		};
		var serviceUrl = this.appService.getBaseUrl()+"/store/getAddresses";
		var thisObservable =  this.http
			.post(serviceUrl,request)
			.map(res => res.json());
		thisObservable.subscribe(res => {
				if(res.response===200){
					this.addressList = res.data.addresses;
				}else{

				}
			},
			e => {

			},
			() => {
				try{
					this.loadingRef.dismiss();
				}catch(e){

				}
			}
		);
	}

  	doAddAddress(){
		this.loadingRef.present();
  		var request = {
  			uid: this.appService.getUserId(),
  			address:{
  				addressLine1: this.newAddress.addressLine1,
  				addressLine2: this.newAddress.addressLine2,
  				city: this.newAddress.city,
  				state:this.newAddress.state,
  				pinCode: this.newAddress.pinCode,
  				contactNo: this.newAddress.contactNo,
  				alternateContact: this.newAddress.alternateContact
  			}
		};
		var serviceUrl = this.appService.getBaseUrl()+"/store/addAddress";
		this.http.post(serviceUrl,request)
			.map(res => res.json())
			.subscribe(res => {
				if(res.response===200){
					this.onClickBackToChooseAddress();
					this.fetchAddress();
					this.resetNewAddress();
				}else{

				}
			},
			e => {

			},
			() => {
				this.loadingRef.dismiss();
			}
		);
	}

	onSelectAddress(address){
		this.selectedDeliveryAddress = address;
	}

  	resetNewAddress(){
  		this.newAddress = {
			addressLine1: null,
			addressLine1Invalid: false,
			addressLine2: null,
			addressLine2Invalid: false,
			city: null,
			cityInvalid: false,
			state: null,
			stateInvalid: false,
			pinCode: null,
			pinCodeInvalid: false,
			contactNo: null,
			contactNoInvalid: false,
			alternateContact: null,
			alternateContactInvalid: false,
		}
	}

	validateText(text,field){
		if(text && ( text.length >= this.ADDRESS_MIN_LENGTH) && ( text.length <= this.ADDRESS_MAX_LENGTH)){
			this.newAddress[field] = false;
			return (true);
		}
		this.newAddress[field] = true;
		return (false);
	}

	validateMobileNo(number,field){
		if(isFinite(number) && (number >= Math.pow(10,9)) &&  (number < Math.pow(10,10))){
			this.newAddress[field] = false;
		  return (true);
		}
		this.newAddress[field] = true;
		return (false);
	}

	validatePinCode(number,field){
		if(isFinite(number) && (number >= Math.pow(10,5)) &&  (number < Math.pow(10,6))){
			this.newAddress[field] = false;
		  	return (true);
		}
		this.newAddress[field] = true;
		return (false);
	}

	disableAddAddress(){
		var valid = Boolean(this.newAddress.addressLine1) && !this.newAddress.addressLine1Invalid
					&& Boolean(this.newAddress.addressLine2)  && !this.newAddress.addressLine2Invalid
					&& Boolean(this.newAddress.city) && !this.newAddress.cityInvalid
					&& Boolean(this.newAddress.state) && !this.newAddress.stateInvalid
					&& Boolean(this.newAddress.pinCode) && !this.newAddress.pinCodeInvalid
					&& Boolean(this.newAddress.contactNo) && !this.newAddress.contactNoInvalid
					&& Boolean(this.newAddress.alternateContact) && !this.newAddress.alternateContactInvalid
		return !valid;
	}

	/* address related functions ends here  */

	/* payment related functions starts here */

	onSelectPaymentMode(paymentMode){
		this.selectedPaymentMode = paymentMode;
	}

  	disablePlaceOrder(){
  		var flag = false;
  		try{
  			if(this.selectedDeliveryAddressId && this.selectedPaymentMode){
  				flag = false;
  			}
  			else{
  				flag = true;
  			}
  		}
  		catch(e){
  			flag = true;
  		}
  		return flag;
	}

	onClickPlaceOrder(){
		var request = {
		  uid: this.appService.getUserId(),
		  addressId: this.selectedDeliveryAddressId,
		  paymentMode: null,
		  couponId: 2343,
		  couponType: 2343,
	  	};

		if(this.couponApplicability == "applicable"){
			request.couponId = this.couponCode;
			request.couponType = this.couponType;
		}
		switch(this.selectedPaymentMode){
			case "cod":
				request.paymentMode = 100;
				this.doCashOnDeliveryPayment(request);
				break;
			case "online":
				request.paymentMode = 101;
				this.doPayUMoneyPayment(request);
				break;
			default:
				request.paymentMode = 100;
				this.doCashOnDeliveryPayment(request);
				break;
		}
	}

	doPayUMoneyPayment(request){
		request = {
			"notifyUrl": "https://your.eshop.com/notify",
			"customerIp": "127.0.0.1",
			"merchantPosId": "145227",
			"description": "RTV market",
			"currencyCode": "PLN",
			"totalAmount": "15000",
			"extOrderId":"xviosvztc71h5u0w2k8bf0",
			"buyer": {
			  "email": "john.doe@example.com",
			  "phone": "654111654",
			  "firstName": "John",
			  "lastName": "Doe",
			  "language": "en"
					 },
			"products": [
				{
					"name": "Wireless Mouse for Laptop",
					"unitPrice": "15000",
					"quantity": "1"
			   }
			]
		};
		var requestHeaders = {
			headers : null
		};
		requestHeaders.headers = {
			"Content-Type": "application/json",
			"Authorization": "Bearer 3e5cac39-7e38-4139-8fd6-30adc06a61bd"
		};
		this.loadingRef.present();
		var serviceUrl = "https://secure.snd.payu.com/api/v2_1/orders";
		var thisObservable =  this.http
			.post(serviceUrl,request,requestHeaders)
			.map(res => res.json());
		thisObservable.subscribe(res => {
			console.info("doPayUMoneyPayment",res);
			this.presentToast("Order placed successfully")
			this.loadingRef.dismiss();
		});
	}

	doCashOnDeliveryPayment(request){
		this.loadingRef.present();
		var serviceUrl = this.appService.getBaseUrl()+"/store/checkOut";
		var thisObservable =  this.http
			.post(serviceUrl,request)
			.map(res => res.json());
		thisObservable.subscribe(res => {
			if(res.response===200){
				this.presentToast("Order placed successfully")
				this.navCtrl.push(OrderHistoryPage);
			}else{

			}
			this.loadingRef.dismiss();
		});
	}

	/* payment related functions ends here  */

	presentToast(msg) {
		let toast = this.toastCtrl.create({
			message: msg,
			duration: this.appService.getToastSettings().duration,
			showCloseButton: this.appService.getToastSettings().showCloseButton,
			closeButtonText : this.appService.getToastSettings().closeButtonText,
			position: this.appService.getToastSettings().position
		});

		toast.present();
	}

}
