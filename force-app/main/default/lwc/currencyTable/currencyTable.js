import { LightningElement, wire, track } from "lwc";
import { publish, subscribe, MessageContext } from "lightning/messageService";
import CURRENCY_UPDATED_CHANNEL from "@salesforce/messageChannel/Currency_Updated__c";
import RATES_UPDATED_CHANNEL from "@salesforce/messageChannel/Rates_Updated__c";
import getExchangeRates from "@salesforce/apex/ExchangeRateCallout.getExchangeRates";
import { picklistOptions, getCurrencyList, getCurrentDate } from "c/utils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const COLS = [
  { label: "Currency", fieldName: "Currency" },
  { label: "Currency Name", fieldName: "CurrencyName" },
  { label: "Rate", fieldName: "Rate" }
];

export default class DatatableCustomDataType extends LightningElement {
  columns = COLS;
  currencyList = getCurrencyList();
  basicCurrencies = picklistOptions;
  @track rates = [];
  @track selectedCurrency = "EUR";
  @track selectedDate;
  @track isLoading = false;

  @wire(MessageContext)
  messageContext;
  subscription;

  get baseCurrencyName() {
    return this.currencyList[this.selectedCurrency];
  }

  connectedCallback() {
    this.selectedDate = getCurrentDate();
    this.subscribeToMessageChannel();
    this.loadData();
  }

  async loadData() {
    await this.getExchangeRateData();
    this.handleRatesUpdate();
  }

  async getExchangeRateData() {
    this.isLoading = true; // Show the spinner

    try {
      const result = await getExchangeRates({
        currencyDate: this.selectedDate
      });
      const baseCurrency = result.base;
      const rates = Object.entries(result.rates).map(([currency, rate]) => {
        if (this.checkIfValueExists(currency) && currency !== baseCurrency) {
          return {
            Currency: currency,
            CurrencyName: this.currencyList[currency],
            Rate: parseFloat(rate).toFixed(2)
          };
        }
        return null;
      });
      this.rates = [
        {
          Currency: baseCurrency,
          CurrencyName: this.currencyList[baseCurrency],
          Rate: 1.0
        },
        ...rates.filter((rate) => rate !== null)
      ];
    } catch (error) {
      console.error("Error retrieving exchange rate data:", error);
      this.showToast(
        "Error",
        "An error occurred while fetching exchange rates.",
        "error"
      );
    } finally {
      this.isLoading = false; // Hide the spinner
      if (this.selectedDate === getCurrentDate()) {
        const payload = {
          rates: this.rates
        };
        publish(this.messageContext, RATES_UPDATED_CHANNEL, payload);
      }
    }
  }

  showToast(title, message, variant) {
    const toastEvent = new ShowToastEvent({
      title: title,
      message: message,
      variant: variant
    });
    this.dispatchEvent(toastEvent);
  }

  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      CURRENCY_UPDATED_CHANNEL,
      (message) => this.handleMessage(message)
    );
  }

  handleMessage(message) {
    this.selectedCurrency = message.selectedCurrency;

    if (this.selectedDate !== message.selectedDate || this.rates.length === 0) {
      this.selectedDate = message.selectedDate;
      this.loadData();
    } else {
      this.handleRatesUpdate();
    }
  }

  handleRatesUpdate() {
    const prevBaseRate = this.getRateByCurrency(this.selectedCurrency);
    if (prevBaseRate !== 1 && prevBaseRate !== 0) {
      this.rates.forEach((rate) => {
        if (rate.Currency === this.selectedCurrency) {
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

  getRateByCurrency(currency) {
    const rateObj = this.rates.find((rate) => rate.Currency === currency);
    return rateObj ? rateObj.Rate : null;
  }

  checkIfValueExists = (value) => {
    return this.basicCurrencies.some((option) => option.value === value);
  };

  disconnectedCallback() {
    this.subscription.unsubscribe();
  }
}
