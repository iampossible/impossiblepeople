export class AppConstants {

  static OFFER: string = 'OFFERS';
  static ASK: string = 'ASKS';

  static REQUIRED_TIME_ASK_LABEL = 'How much time do you need?';
  static REQUIRED_TIME_OFFER_LABEL = 'How much time can you give?';


  static REQUIRED_TIME_OPTIONS = {
    label: AppConstants.REQUIRED_TIME_OFFER_LABEL,
    values: [{
      text: '1 hour',
      optionValue: 3600
    }, {
      text: 'Half a day',
      optionValue: 43200
    }, {
      text: 'To be determined',
      optionValue: 0
    }]
  };

}
