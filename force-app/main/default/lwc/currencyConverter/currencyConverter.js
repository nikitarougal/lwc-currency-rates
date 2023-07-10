import { LightningElement, track } from "lwc";

const rates = [
  { Id: "1", Currency: "USD", CurrencyName: "Dollar", Rate: 1 },
  { Id: "2", Currency: "EUR", CurrencyName: "Euro", Rate: 0.9 },
  { Id: "3", Currency: "CAD", CurrencyName: "Canadian Dollar", Rate: 1.3 }
];

export default class MyComponent extends LightningElement {
  @track picklistOptions = [
    { label: "USD / Dollar", value: "USD" },
    { label: "EUR / Euro", value: "EUR" },
    { label: "CAD / Canadian Dollar", value: "CAD" }
  ];
  @track selectedFirstCurrency;
  @track selectedSecCurrency;
  @track currencyAmountInput;
  @track calculatedSecCurrency;

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
    const rateObj = rates.find((rate) => rate.Currency === currency);
    return rateObj ? rateObj.Rate : null;
  }
}
