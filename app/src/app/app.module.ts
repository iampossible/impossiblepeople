import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler, Events } from 'ionic-angular';
import { XHRBackend, RequestOptions, HttpModule } from '@angular/http';
import { Push } from '@ionic-native/push';
import { Facebook } from '@ionic-native/facebook';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Contacts } from '@ionic-native/contacts';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Camera } from '@ionic-native/camera';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';
import { Badge } from '@ionic-native/badge';
import { Network } from '@ionic-native/network';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppVersion } from '@ionic-native/app-version';

import { MyApp } from './app.component';

import { AuthPage } from '../pages/auth/auth';
import { FeedPage } from '../pages/feed/feed';
import { ExplorePage } from '../pages/explore/explore';
import { PostDetailsPage } from '../pages/post-details/post-details';
import { CreatePostPage } from '../pages/create-post/create-post';
import { TabsPage } from '../pages/tabs/tabs';
import { LandingPage } from '../pages/landing/landing';
import { SignupPage } from '../pages/signup/signup';
import { ProfilePage } from '../pages/profile/profile';
import { SettingsPage } from '../pages/settings/settings';
import { InterestsPage } from '../pages/interests/interests';
import { MyPostsPage } from '../pages/my-posts/my-posts';
import { MyFriendsPage } from '../pages/my-friends/my-friends';
import { PreferencesPage } from '../pages/preferences/preferences';
import { InviteFriendsPage } from '../pages/invite-friends/invite-friends';
import { SelectContactsModalPage } from '../pages/select-contacts-modal/select-contacts-modal';
import { ForgottenPasswordPage } from '../pages/forgotten-password/forgotten-password';
import { TermsConditionsPage } from '../pages/terms-conditions/terms-conditions';
import { PrivacyPolicyPage } from '../pages/privacy-policy/privacy-policy';
import { SuggestInterestModalPage } from '../pages/suggest-interest-modal/suggest-interest-modal';
import { EditProfileModalPage } from '../pages/edit-profile-modal/edit-profile-modal';
import { AddLocationModalPage } from '../pages/add-location-modal/add-location-modal';

import { FacebookConnectComponent } from '../components/facebook-connect/facebook-connect';
import { FacebookService } from '../providers/facebook-service/facebook-service';
import { InterceptedHttp } from '../providers/intercepted-http/intercepted-http';
import { ApiService } from '../providers/api-service/api-service';
import { NotificationService } from '../providers/notification-service/notification-service';
import { UserService } from '../providers/user-service/user-service';
import { NavigationService } from '../providers/navigation-service/navigation-service';
import { AuthService } from '../providers/auth-service/auth-service';
import { PostCardComponent } from '../components/post-card/post-card';
import { PostService } from '../providers/post-service/post-service';
import { FeedService } from '../providers/feed-service/feed-service';
import { ExploreService } from '../providers/explore-service/explore-service';
import { ScrollTopProvider } from '../providers/scroll-top/scroll-top';
import { ProfileService } from '../providers/profile-service/profile-service';
import { InterestPickerComponent } from '../components/interest-picker/interest-picker';
import { InterestService } from '../providers/interest-service/interest-service';
import { ImageService } from '../providers/image-service/image-service';
import { EmailPage } from '../pages/email/email';
import { TagInterestPage } from '../pages/tag-interest/tag-interest';
import { ButtonDropdownComponent } from '../components/button-dropdown/button-dropdown';
import { ActivityPage } from '../pages/activity/activity';
import { FindFriendsPage } from '../pages/find-friends/find-friends';
import { InviteContactsComponent } from '../components/invite-contacts/invite-contacts';
import { QuickFeedbackComponent } from '../components/quick-feedback/quick-feedback';
import { AddLocationContextPage } from '../pages/add-location-context/add-location-context';
import { InterestButtonComponent } from '../components/interest-button/interest-button';
import { NearMePage } from '../pages/near-me/near-me';
import { ExploreInterestPage } from '../pages/explore-interest/explore-interest';
import { GoogleMapsProvider } from '../providers/google-maps/google-maps';

export function interceptFactory(backend: XHRBackend, opts: RequestOptions, events: Events) {
  return new InterceptedHttp(backend, opts, events);
}

@NgModule({
  declarations: [
    MyApp,
    FeedPage,
    ExplorePage,
    CreatePostPage,
    TabsPage,
    LandingPage,
    FacebookConnectComponent,
    AuthPage,
    SignupPage,
    ForgottenPasswordPage,
    PrivacyPolicyPage,
    TermsConditionsPage,
    PostCardComponent,
    PostDetailsPage,
    ProfilePage,
    SettingsPage,
    InviteFriendsPage,
    SelectContactsModalPage,
    SuggestInterestModalPage,
    EditProfileModalPage,
    AddLocationModalPage,
    InterestsPage,
    MyFriendsPage,
    MyPostsPage,
    PreferencesPage,
    InterestPickerComponent,
    EmailPage,
    TagInterestPage,
    ButtonDropdownComponent,
    ActivityPage,
    FindFriendsPage,
    InviteContactsComponent,
    QuickFeedbackComponent,
    AddLocationContextPage,
    InterestButtonComponent,
    NearMePage,
    ExploreInterestPage
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    FeedPage,
    ExplorePage,
    CreatePostPage,
    TabsPage,
    LandingPage,
    AuthPage,
    SignupPage,
    ForgottenPasswordPage,
    PrivacyPolicyPage,
    TermsConditionsPage,
    PostDetailsPage,
    ProfilePage,
    SettingsPage,
    InviteFriendsPage,
    InterestsPage,
    MyFriendsPage,
    MyPostsPage,
    PreferencesPage,
    EmailPage,
    TagInterestPage,
    ActivityPage,
    FindFriendsPage,
    SelectContactsModalPage,
    SuggestInterestModalPage,
    EditProfileModalPage,
    AddLocationModalPage,
    AddLocationContextPage,
    NearMePage,
    ExploreInterestPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Push,
    Facebook,
    FacebookService,
    InAppBrowser,
    Contacts,
    SocialSharing,
    Camera,
    Diagnostic,
    Geolocation,
    Badge,
    Network,
    AppVersion,
    {
      provide: InterceptedHttp,
      useFactory: interceptFactory,
      deps: [XHRBackend, RequestOptions, Events]
    },
    ApiService,
    NotificationService,
    UserService,
    NavigationService,
    AuthService,
    PostService,
    FeedService,
    ScrollTopProvider,
    ProfileService,
    InterestService,
    ImageService,
    ExploreService,
    GoogleMapsProvider
  ]
})
export class AppModule { }
