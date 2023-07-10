import { LightningElement, wire } from "lwc";
import { subscribe, MessageContext } from "lightning/messageService";
import CURRENCY_UPDATED_CHANNEL from "@salesforce/messageChannel/Currency_Updated__c";

const COLS = [
  { label: "Currency", fieldName: "Currency" },
  { label: "Currency Name", fieldName: "CurrencyName" },
  { label: "Rate", fieldName: "Rate" }
];

const rates = [
  { Id: "1", Currency: "USD", CurrencyName: "Dollar", Rate: 1 },
  { Id: "2", Currency: "EUR", CurrencyName: "Euro", Rate: 0.9 },
  { Id: "3", Currency: "CAD", CurrencyName: "Canadian Dollar", Rate: 1.3 }
];
export default class DatatableCustomDataType extends LightningElement {
  columns = COLS;
  rates = rates;
  @wire(MessageContext)
  messageContext;
  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      CURRENCY_UPDATED_CHANNEL,
      (message) => this.handleMessage(message)
    );
  }
  handleMessage(message) {
    const selectedCurrency = message.selectedCurrency;
    const prevBaseRate = this.getRateByCurrency(selectedCurrency);
    if (prevBaseRate !== 1) {
      rates.forEach((rate) => {
        if (rate.Currency === selectedCurrency) {
          rate.Rate = 1;
        } else {
          const prevCurRate = this.getRateByCurrency(rate.Currency);
          rate.Rate = Number((prevCurRate / prevBaseRate).toFixed(2));
        }
      });

      this.rates = [...rates];
      console.log(this.rates);
    }
  }

  connectedCallback() {
    this.subscribeToMessageChannel();
  }

  getRateByCurrency(currency) {
    const rateObj = rates.find((rate) => rate.Currency === currency);
    return rateObj ? rateObj.Rate : null;
  }
}
