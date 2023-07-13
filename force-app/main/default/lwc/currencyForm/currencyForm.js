import { LightningElement, track, wire } from "lwc";
import { publish, subscribe, MessageContext } from "lightning/messageService";
import CURRENCY_UPDATED_CHANNEL from "@salesforce/messageChannel/Currency_Updated__c";
import RATES_UPDATED_CHANNEL from "@salesforce/messageChannel/Rates_Updated__c";
import { getCurrencyPicklistOptions, getCurrentDate } from "c/utils";

export default class MyComponent extends LightningElement {
  subscription = null;
  @track selectedCurrency = "EUR";
  @track selectedDate;

  @wire(MessageContext)
  messageContext;

  currencyPicklistOptions = getCurrencyPicklistOptions();

  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      RATES_UPDATED_CHANNEL,
      (message) => this.handleMessage(message)
    );
  }

  handleMessage(message) {
    if (message.picklist) {
      this.currencyPicklistOptions = getCurrencyPicklistOptions();
    }
  }

  connectedCallback() {
    this.subscribeToMessageChannel();
    this.selectedDate = getCurrentDate();
  }

  handleCurrencyChange(event) {
    this.selectedCurrency = event.detail.value;
  }

  handleDateChange(event) {
    this.selectedDate = event.target.value;
  }

  handleButtonClick() {
    const payload = {
      selectedCurrency: this.selectedCurrency,
      selectedDate: this.selectedDate
    };
    publish(this.messageContext, CURRENCY_UPDATED_CHANNEL, payload);
  }
}
