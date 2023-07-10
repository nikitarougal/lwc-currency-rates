import { LightningElement, track, wire } from "lwc";
import { publish, MessageContext } from "lightning/messageService";
import CURRENCY_UPDATED_CHANNEL from "@salesforce/messageChannel/Currency_Updated__c";

export default class MyComponent extends LightningElement {
  @track picklistOptions = [
    { label: "USD / Dollar", value: "USD" },
    { label: "EUR / Euro", value: "EUR" },
    { label: "CAD / Canadian Dollar", value: "CAD" }
  ];
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
    let rightNow = new Date();
    rightNow.setMinutes(
      new Date().getMinutes() - new Date().getTimezoneOffset()
    );
    this.selectedDate = rightNow.toISOString().slice(0, 10);
  }
}
