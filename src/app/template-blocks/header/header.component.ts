import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {UserSubscriptionsService} from "../../services/user-subscriptions/user-subscriptions.service";
import {LazyLoadingService} from "../../services/lazy-loading/lazy-loading.service";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/mat-dialog-config";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @ViewChild('mobileMenuWrapper') mobileMenuWrapper: ElementRef;

  public loggedIn: boolean;
  public userName: string;

  constructor(private dialog: MatDialog, private auth: AuthService, private router: Router,
              private userSubscriptionsService: UserSubscriptionsService, private lazyLoadingService: LazyLoadingService) {
  }

  ngOnInit(): void {
    this.auth.credentials$.subscribe((user) => {
      this.loggedIn = user && !user.isAnonymous;
      if (this.loggedIn) {
        this.userName = user.displayName;
      }
    });
  }

  ngAfterViewInit(): void {
    this.hideMobileMenu();
  }

  public onAuthButtonClick(): void {
    if (this.loggedIn) {
      this.logOut();
    } else {
      this.openLoginDialog();
    }
  }

  public openLoginDialog(): void {
    this.lazyLoadingService.getLazyLoadedComponent(LazyLoadingService.LOGIN_MODULE_NAME)
      .then((comp) => {
        this.dialog.open(comp, MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {redirectUrl: '/profile'}));
        this.hideMobileMenu();
      }).catch(console.error);
  }

  public onNotificationButtonClick(): void {
    this.userSubscriptionsService.showNewOffersSubscriptionDialog();
  }

  public showMobileMenu(): void {
    if (!this.mobileMenuWrapper) {
      return;
    }
    this.mobileMenuWrapper.nativeElement.style.visibility = 'visible';
    this.mobileMenuWrapper.nativeElement.style.opacity = '1';
  }

  public hideMobileMenu(): void {
    if (!this.mobileMenuWrapper) {
      return;
    }
    this.mobileMenuWrapper.nativeElement.style.visibility = 'hidden';
    this.mobileMenuWrapper.nativeElement.style.opacity = '0';
  }

  public logOut(): void {
    this.auth.signOut().then(() => {
      this.router.navigateByUrl("/");
      this.hideMobileMenu();
    });
  }
}
