import { LightningElement, wire } from "lwc";
import { subscribe, MessageContext } from "lightning/messageService";
import CURRENCY_UPDATED_CHANNEL from "@salesforce/messageChannel/Currency_Updated__c";
import getExchangeRates from "@salesforce/apex/ExchangeRateCallout.getExchangeRates";

const COLS = [
  { label: "Currency", fieldName: "Currency" },
  { label: "Currency Name", fieldName: "CurrencyName" },
  { label: "Rate", fieldName: "Rate" }
];

// const rates = [
//   { Id: "1", Currency: "USD", CurrencyName: "Dollar", Rate: 1 },
//   { Id: "2", Currency: "EUR", CurrencyName: "Euro", Rate: 0.9 },
//   { Id: "3", Currency: "CAD", CurrencyName: "Canadian Dollar", Rate: 1.3 }
// ];
export default class DatatableCustomDataType extends LightningElement {
  columns = COLS;
  rates = [];
  @wire(MessageContext)
  messageContext;
  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      CURRENCY_UPDATED_CHANNEL,
      (message) => this.handleMessage(message)
    );
  }

  async handleMessage(message) {
    const selectedCurrency = message.selectedCurrency;

    if (this.rates.length === 0) {
      await this.getExchangeRateData();
    }
    const prevBaseRate = this.getRateByCurrency(selectedCurrency);
    if (prevBaseRate !== 1) {
      this.rates.forEach((rate) => {
        if (rate.Currency === selectedCurrency) {
          rate.Rate = 1;
        } else {
          const prevCurRate = this.getRateByCurrency(rate.Currency);
          rate.Rate = Number((prevCurRate / prevBaseRate).toFixed(2));
        }
      });

      this.rates = [...this.rates];
      console.log(this.rates);
    }
  }

  connectedCallback() {
    this.subscribeToMessageChannel();
  }

  getExchangeRateData() {
    getExchangeRates()
      .then((result) => {
        console.log(result);
        this.rates = [
          {
            Currency: result.base,
            CurrencyName: "Dollar",
            Rate: 1
          },
          ...Object.entries(result.rates).map(([currency, rate]) => ({
            Currency: currency,
            CurrencyName: currency === "EUR" ? "EURO" : "Canadian Dollar",
            Rate: parseFloat(rate).toFixed(2)
          }))
        ];
      })
      .catch((error) => {
        console.error("Error retrieving exchange rate data:", error);
      });
  }

  getRateByCurrency(currency) {
    const rateObj = this.rates.find((rate) => rate.Currency === currency);
    return rateObj ? rateObj.Rate : null;
  }
}
