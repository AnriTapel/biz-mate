interface ExtraButton {
  route: string;
  buttonText: string;
  buttonClass: string;
}

export default interface NotificationEvent {
  title: string;
  mainText: string;
  actionText?: string;
  extraButton?: ExtraButton[];
}
