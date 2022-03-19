import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {UserSubscriptionsService} from "../../services/user-subscriptions/user-subscriptions.service";
import {DialogConfigType, MatDialogConfig} from "../../dialogs/MatDialogConfig";
import {DialogModuleNames} from "../../dialogs/DialogModuleNames";
import {EventObserver} from "../../services/event-observer/event-observer.service";
import {OpenDialogEvent} from "../../events/OpenDialogEvent";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @ViewChild('mobileMenuWrapper') mobileMenuWrapper: ElementRef;

  public loggedIn: boolean;
  public userName: string;

  constructor(private auth: AuthService, private router: Router, private userSubscriptionsService: UserSubscriptionsService, private eventObserver: EventObserver) {
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

  private openLoginDialog(): void {
    this.eventObserver.dispatchEvent(new OpenDialogEvent(DialogModuleNames.LOGIN_MODULE_NAME,
      MatDialogConfig.getConfigWithData(DialogConfigType.NARROW_CONFIG, {redirectUrl: '/profile'})));
    this.hideMobileMenu();
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
