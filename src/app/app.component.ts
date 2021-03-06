import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, ToastController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Events } from 'ionic-angular';

import { AppService } from "./app.service";

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { ShowLoading } from '../pages/loading/loading';
import { ListingPage } from '../pages/listing/listing';
import { DetailsPage } from '../pages/details/details';
import { ShoppingCartPage } from '../pages/cart/cart';
import { OrderHistoryPage } from '../pages/orders/orders';
import { WishlistPage } from '../pages/wishlist/wishlist';
//import { CrackerItem } from '../pages/product/product';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav;
  rootPage:any = HomePage;
  public slideOutLoginPopup = true;
  public showLoading = true;
  public userId = null;
  public myApp = this;
  constructor(public appService: AppService, platform: Platform, public splashScreen: SplashScreen, statusBar: StatusBar,public events : Events, public toastCtrl: ToastController) {
      platform.ready().then(() => {
        //setTimeout(() => {
          statusBar.styleDefault();
          this.hideSplashScreen();
        //}, 100);
      });
      appService.openPage = this.openPage;
      appService.myApp = this.myApp;
      events.subscribe('logIn', (status,userId,userName,isAdmin) => {
          this.processLoginInfo(status,userId,userName,isAdmin);
      });
      events.subscribe('showLogInScreen', (status) => {
          this.slideOutLoginPopup = !status;
      });
      events.subscribe('showLoading', (status) => {
        this.showLoading = status;
    });
  }

  hideSplashScreen() {
    if (this.splashScreen) {
      setTimeout(() => {
        this.splashScreen.hide();
      }, 100);
    }
  }

  processLoginInfo(status, userId, userName, isAdmin){
    //ToDo : rename hasLoggedIn to slideOutLoginPopup everywhere
    this.slideOutLoginPopup = status;
    this.userId = userId;
    this.appService.setUserId(userId);
    this.appService.setUserName(userName);
    this.appService.setIsAdmin(isAdmin);
    if(this.appService.getIsAdmin()){
      this.nav.setRoot(OrderHistoryPage);
    };
  }

  doLogout(){
    this.processLoginInfo(true,null,null,false);
    this.presentToast("You've been Logged out :(");
    this.openPage('homePage');
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: this.appService.getToastSettings().duration,
      showCloseButton: this.appService.getToastSettings().showCloseButton,
      closeButtonText : this.appService.getToastSettings().closeButtonText,
      position: this.appService.getToastSettings().position
    });

    toast.onDidDismiss(() => {

    });

    toast.present();
  }

  openPage(page){
    switch (page) {
       case "loginPage":
         //this.nav.push(LoginPage);
         this.slideOutLoginPopup = false;
        break;
      case "showLoading":
        this.nav.push(ShowLoading);
       break;
      case "homePage":
        this.nav.setRoot(HomePage);
        break;
      case "listingPage":
        this.nav.push(ListingPage);
        break;
      case "detailsPage":
        this.nav.push(DetailsPage);
        break;
       case "shoppingCartPage":
         if(!(this.appService.getUserId() > 0)){
            this.events.publish('showLogInScreen',true);
        }	else{
          this.nav.push(ShoppingCartPage);
        }
        break;
      case "orderHistoryPage":
        if(!(this.appService.getUserId() > 0)){
            this.events.publish('showLogInScreen',true);
        }	else{
          this.nav.push(OrderHistoryPage);
        }
        break;
      case "wishlistPage":
        if(!(this.appService.getUserId() > 0)){
            this.events.publish('showLogInScreen',true);
        }	else{
          this.nav.push(WishlistPage);
        }
        break;
      case "signupPage":
         this.nav.push(LoginPage);
        break;

      default:
        this.nav.setRoot(HomePage);
        break;
    }
  }
}


