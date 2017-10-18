import { Component, ViewChild, EventEmitter, Input, Output } from '@angular/core';
import { Slides, Events, ModalController } from 'ionic-angular';
import { InterestService } from '../../providers/interest-service/interest-service';
import { SuggestInterestModalPage } from '../../pages/suggest-interest-modal/suggest-interest-modal';

@Component({
  selector: 'interest-picker',
  templateUrl: 'interest-picker.html'
})
export class InterestPickerComponent {
  static bucketSize = 10;

  @Input() defaultInterests: any;
  @Input() canSuggest: boolean;
  @Input() isSingleMode: boolean;

  @Output() pageChanged: any = new EventEmitter();
  @Output() selected: any = new EventEmitter();

  @ViewChild(Slides) slider: Slides;

  private interests: Array<Object> = [];
  private pages: Array<any>;
  private selectedInterests: any = {};

  constructor(private interestService: InterestService,
    private events: Events,
    private modalCtrl: ModalController) {
  }

  ngOnInit() {
    this.fetchInterests();
    this.events.subscribe('change-slide', (slideIndex) => {
      this.slider.slideTo(slideIndex, 500, false);
    });
  }

  ngOnChanges(changes: any) {
    if ('defaultInterests' in changes) {
      this.selectedInterests = {};
      changes.defaultInterests.currentValue.forEach((interestId) => {
        this.selectedInterests[interestId] = true;
      });
    }
  }

  public onSlideChanged(event) {
    this.events.publish('slide-changed', {
      isEnd: event.isEnd,
      isBeginning: event.isBeginning,
      activeIndex: event.activeIndex,
    });
  }

  private emitSelectedInterests() {
    console.log('emitting', this.interests.filter((interest: any) => {
      return this.selectedInterests[interest.interestID] ? interest : false;
    }));
    this.selected.emit(this.interests.filter((interest: any) => {
      return this.selectedInterests[interest.interestID] ? interest : false;
    }));
  }

  private fetchInterests() {
    this.interestService.getFeaturedInterests((response) => {
      this.interests = response.json().map((interest) => {
        if (!interest.image) {
          return interest;
        }
        return Object.assign(interest, {
          imageUrl: `url(${interest.image.replace('/interests/', '/interestBackgrounds/').replace('build', 'assets')})`
        });
      });
      this.pages = this.paginate();
      this.emitSelectedInterests();
    });
  }

  public toggleInterest(event, interest: any) {
    let currentlySelected = this.selectedInterests[interest.interestID];

    if (this.isSingleMode) {
      this.selectedInterests = {};
    }

    this.selectedInterests[interest.interestID] = (!currentlySelected);

    this.emitSelectedInterests();
  }

  private paginate(): Array<any> {
    let buckets = [];

    for (let i = 0; i < this.interests.length; i += InterestPickerComponent.bucketSize) {
      buckets.push(this.interests.slice(i, i + InterestPickerComponent.bucketSize));
    }

    return buckets;
  }

  public openModal() {
    let suggestInterestModal = this.modalCtrl.create(SuggestInterestModalPage);
    return suggestInterestModal.present();
  }
}
