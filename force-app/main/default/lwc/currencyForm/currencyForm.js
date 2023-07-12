import { LightningElement, track, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import CURRENCY_UPDATED_CHANNEL from "@salesforce/messageChannel/Currency_Updated__c";
import { picklistOptions, getCurrentDate } from "c/utils";

export default class MyComponent extends LightningElement {
  @track currencyPicklistOptions = picklistOptions;
  @track selectedCurrency;
  @track selectedDate;

  @wire(MessageContext)
  messageContext;

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

  connectedCallback() {
    this.selectedDate = getCurrentDate();
  }
}
