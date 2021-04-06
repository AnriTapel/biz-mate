interface ExtraButton {
  route: string;
  buttonText: string;
  buttonClass: string;
}

export default interface NotificationDataModel {
  title: string;
  mainText: string;
  actionText?: string;
  extraButton?: ExtraButton[];
}
