import { LightningElement, wire, track } from "lwc";
import { publish, subscribe, MessageContext } from "lightning/messageService";
import CURRENCY_UPDATED_CHANNEL from "@salesforce/messageChannel/Currency_Updated__c";
import RATES_UPDATED_CHANNEL from "@salesforce/messageChannel/Rates_Updated__c";
import getExchangeRates from "@salesforce/apex/ExchangeRateCallout.getExchangeRates";
import {
  getPicklistOptions,
  updatePicklistOptions,
  getCurrencyList,
  getCurrentDate
} from "c/utils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const COLS = [
  { label: "Currency", fieldName: "Currency" },
  { label: "Currency Name", fieldName: "CurrencyName" },
  { label: "Rate", fieldName: "Rate" }
];

export default class DatatableCustomDataType extends LightningElement {
  subscription = null;
  columns = COLS;
  currencyList = getCurrencyList();
  @track basicCurrencies = getPicklistOptions();
  currencyListOptions;
  @track rates = [];
  @track selectedCurrency = "EUR";
  @track selectedDate;
  @track isLoading = false;

  @wire(MessageContext)
  messageContext;

  get baseCurrencyName() {
    return this.currencyList[this.selectedCurrency];
  }

  connectedCallback() {
    this.selectedDate = getCurrentDate();
    this.subscribeToMessageChannel();
    this.loadData();
    this.currencyListOptions = this.getCurrencyListOptions();
  }

  async loadData() {
    await this.getExchangeRateData();
    this.handleRatesUpdate();
  }

  async getExchangeRateData() {
    this.isLoading = true; // Show the spinner

    try {
      // Process the result and update the rates
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
      // Send rates currencyConverter
      if (this.selectedDate === getCurrentDate()) {
        const payload = {
          rates: this.rates,
          picklist: false
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
  // recalculate rates if the base currency has changed
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
    }
  }

  addNewCurrency(event) {
    const newCurrency = event.detail.value;
    const newCurrencyName = this.currencyList[newCurrency];
    const newOption = {
      label: `${newCurrency} / ${newCurrencyName}`,
      value: newCurrency
    };
    // Update the picklistOptions with the new values
    updatePicklistOptions(newOption);
    // Publish a message to notify currencyForm and currencyConverter to update the picklist options
    const payload = {
      picklist: true
    };
    publish(this.messageContext, RATES_UPDATED_CHANNEL, payload);

    this.loadData();
  }

  getRateByCurrency(currency) {
    const rateObj = this.rates.find((rate) => rate.Currency === currency);
    return rateObj ? rateObj.Rate : null;
  }

  checkIfValueExists(value) {
    return this.basicCurrencies.some((option) => option.value === value);
  }
  // form options for the combobox for Add New currency functionality
  getCurrencyListOptions() {
    const currencyListOptions = Object.entries(this.currencyList).map(
      ([value, label]) => ({
        label: `${value} / ${label}`,
        value: value
      })
    );
    return currencyListOptions;
  }
}
