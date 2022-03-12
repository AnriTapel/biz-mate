export default abstract class AppCommonEvent {

  eventName: string;

  protected constructor(eventName: string) {
    this.eventName = eventName;
  }
}
