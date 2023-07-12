import { LightningElement, wire, track } from "lwc";
import { picklistOptions } from "c/utils";
import { subscribe, MessageContext } from "lightning/messageService";
import RATES_UPDATED_CHANNEL from "@salesforce/messageChannel/Rates_Updated__c";

export default class MyComponent extends LightningElement {
  subscription = null;
  @track currencyPicklistOptions = picklistOptions;
  @track selectedFirstCurrency;
  @track selectedSecCurrency;
  @track currencyAmountInput;
  @track calculatedSecCurrency;
  @track rates = [];

  @wire(MessageContext)
  messageContext;

  get disableButton() {
    return this.rates.length === 0;
  }

  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      RATES_UPDATED_CHANNEL,
      (message) => this.handleMessage(message)
    );
  }

  handleMessage(message) {
    this.rates = message.rates;
  }

  connectedCallback() {
    this.subscribeToMessageChannel();
  }

  handleFirstPicChange(event) {
    this.selectedFirstCurrency = event.detail.value;
  }

  handleSecPicChange(event) {
    this.selectedSecCurrency = event.detail.value;
  }

  handleCurrencyAmountInput(event) {
    this.currencyAmountInput = event.target.value;
  }

  handleConvertion() {
    const firstRate = this.getRateByCurrency(this.selectedFirstCurrency);
    const secondRate = this.getRateByCurrency(this.selectedSecCurrency);
    this.calculatedSecCurrency = Number(
      ((this.currencyAmountInput * secondRate) / firstRate).toFixed(2)
    );
  }

  getRateByCurrency(currency) {
    const rateObj = this.rates.find((rate) => rate.Currency === currency);
    return rateObj ? rateObj.Rate : null;
  }
}
