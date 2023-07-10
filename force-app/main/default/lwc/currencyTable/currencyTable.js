import { LightningElement, wire, track } from "lwc";
import { subscribe, MessageContext } from "lightning/messageService";
import CURRENCY_UPDATED_CHANNEL from "@salesforce/messageChannel/Currency_Updated__c";
import getExchangeRates from "@salesforce/apex/ExchangeRateCallout.getExchangeRates";
import getLatestExchangeRates from "@salesforce/apex/ExchangeRateCallout.getLatestExchangeRates";

const COLS = [
  { label: "Currency", fieldName: "Currency" },
  { label: "Currency Name", fieldName: "CurrencyName" },
  { label: "Rate", fieldName: "Rate" }
];

const currency_list = {
  AFA: "Afghan Afghani",
  ALL: "Albanian Lek",
  DZD: "Algerian Dinar",
  AOA: "Angolan Kwanza",
  ARS: "Argentine Peso",
  AMD: "Armenian Dram",
  AWG: "Aruban Florin",
  AUD: "Australian Dollar",
  AZN: "Azerbaijani Manat",
  BSD: "Bahamian Dollar",
  BHD: "Bahraini Dinar",
  BDT: "Bangladeshi Taka",
  BBD: "Barbadian Dollar",
  BYN: "Belarusian Ruble",
  BEF: "Belgian Franc",
  BZD: "Belize Dollar",
  BMD: "Bermudan Dollar",
  BTN: "Bhutanese Ngultrum",
  BTC: "Bitcoin",
  BOB: "Bolivian Boliviano",
  BAM: "Bosnia-Herzegovina Convertible Mark",
  BWP: "Botswanan Pula",
  BRL: "Brazilian Real",
  GBP: "British Pound Sterling",
  BND: "Brunei Dollar",
  BGN: "Bulgarian Lev",
  BIF: "Burundian Franc",
  KHR: "Cambodian Riel",
  CAD: "Canadian Dollar",
  CVE: "Cape Verdean Escudo",
  KYD: "Cayman Islands Dollar",
  XOF: "CFA Franc BCEAO",
  XAF: "CFA Franc BEAC",
  XPF: "CFP Franc",
  CLP: "Chilean Peso",
  CLF: "Chilean Unit of Account",
  CNY: "Chinese Yuan",
  COP: "Colombian Peso",
  KMF: "Comorian Franc",
  CDF: "Congolese Franc",
  CRC: "Costa Rican Colón",
  HRK: "Croatian Kuna",
  CUC: "Cuban Convertible Peso",
  CZK: "Czech Republic Koruna",
  DKK: "Danish Krone",
  DJF: "Djiboutian Franc",
  DOP: "Dominican Peso",
  XCD: "East Caribbean Dollar",
  EGP: "Egyptian Pound",
  ERN: "Eritrean Nakfa",
  EEK: "Estonian Kroon",
  ETB: "Ethiopian Birr",
  EUR: "Euro",
  FKP: "Falkland Islands Pound",
  FJD: "Fijian Dollar",
  GMD: "Gambian Dalasi",
  GEL: "Georgian Lari",
  DEM: "German Mark",
  GHS: "Ghanaian Cedi",
  GIP: "Gibraltar Pound",
  GRD: "Greek Drachma",
  GTQ: "Guatemalan Quetzal",
  GNF: "Guinean Franc",
  GYD: "Guyanaese Dollar",
  HTG: "Haitian Gourde",
  HNL: "Honduran Lempira",
  HKD: "Hong Kong Dollar",
  HUF: "Hungarian Forint",
  ISK: "Icelandic Króna",
  INR: "Indian Rupee",
  IDR: "Indonesian Rupiah",
  IRR: "Iranian Rial",
  IQD: "Iraqi Dinar",
  ILS: "Israeli New Sheqel",
  ITL: "Italian Lira",
  JMD: "Jamaican Dollar",
  JPY: "Japanese Yen",
  JOD: "Jordanian Dinar",
  KZT: "Kazakhstani Tenge",
  KES: "Kenyan Shilling",
  KWD: "Kuwaiti Dinar",
  KGS: "Kyrgystani Som",
  LAK: "Laotian Kip",
  LVL: "Latvian Lats",
  LBP: "Lebanese Pound",
  LSL: "Lesotho Loti",
  LRD: "Liberian Dollar",
  LYD: "Libyan Dinar",
  LTC: "Litecoin",
  LTL: "Lithuanian Litas",
  MOP: "Macanese Pataca",
  MKD: "Macedonian Denar",
  MGA: "Malagasy Ariary",
  MWK: "Malawian Kwacha",
  MYR: "Malaysian Ringgit",
  MVR: "Maldivian Rufiyaa",
  MRO: "Mauritanian Ouguiya",
  MUR: "Mauritian Rupee",
  MXN: "Mexican Peso",
  MDL: "Moldovan Leu",
  MNT: "Mongolian Tugrik",
  MAD: "Moroccan Dirham",
  MZM: "Mozambican Metical",
  MMK: "Myanmar Kyat",
  NAD: "Namibian Dollar",
  NPR: "Nepalese Rupee",
  ANG: "Netherlands Antillean Guilder",
  TWD: "New Taiwan Dollar",
  NZD: "New Zealand Dollar",
  NIO: "Nicaraguan Córdoba",
  NGN: "Nigerian Naira",
  KPW: "North Korean Won",
  NOK: "Norwegian Krone",
  OMR: "Omani Rial",
  PKR: "Pakistani Rupee",
  PAB: "Panamanian Balboa",
  PGK: "Papua New Guinean Kina",
  PYG: "Paraguayan Guarani",
  PEN: "Peruvian Nuevo Sol",
  PHP: "Philippine Peso",
  PLN: "Polish Zloty",
  QAR: "Qatari Rial",
  RON: "Romanian Leu",
  RUB: "Russian Ruble",
  RWF: "Rwandan Franc",
  SVC: "Salvadoran Colón",
  WST: "Samoan Tala",
  STD: "São Tomé and Príncipe Dobra",
  SAR: "Saudi Riyal",
  RSD: "Serbian Dinar",
  SCR: "Seychellois Rupee",
  SLL: "Sierra Leonean Leone",
  SGD: "Singapore Dollar",
  SKK: "Slovak Koruna",
  SBD: "Solomon Islands Dollar",
  SOS: "Somali Shilling",
  ZAR: "South African Rand",
  KRW: "South Korean Won",
  SSP: "South Sudanese Pound",
  XDR: "Special Drawing Rights",
  LKR: "Sri Lankan Rupee",
  SHP: "St. Helena Pound",
  SDG: "Sudanese Pound",
  SRD: "Surinamese Dollar",
  SZL: "Swazi Lilangeni",
  SEK: "Swedish Krona",
  CHF: "Swiss Franc",
  SYP: "Syrian Pound",
  TJS: "Tajikistani Somoni",
  TZS: "Tanzanian Shilling",
  THB: "Thai Baht",
  TOP: "Tongan Pa'anga",
  TTD: "Trinidad & Tobago Dollar",
  TND: "Tunisian Dinar",
  TRY: "Turkish Lira",
  TMT: "Turkmenistani Manat",
  UGX: "Ugandan Shilling",
  UAH: "Ukrainian Hryvnia",
  AED: "United Arab Emirates Dirham",
  UYU: "Uruguayan Peso",
  USD: "US Dollar",
  UZS: "Uzbekistan Som",
  VUV: "Vanuatu Vatu",
  VEF: "Venezuelan BolÃvar",
  VND: "Vietnamese Dong",
  YER: "Yemeni Rial",
  ZMK: "Zambian Kwacha",
  ZWL: "Zimbabwean dollar"
};

const basicCurrencies = ["USD", "EUR", "CAD"];

// const rates = [
//   { Id: "1", Currency: "USD", CurrencyName: "Dollar", Rate: 1 },
//   { Id: "2", Currency: "EUR", CurrencyName: "Euro", Rate: 0.9 },
//   { Id: "3", Currency: "CAD", CurrencyName: "Canadian Dollar", Rate: 1.3 }
// ];
export default class DatatableCustomDataType extends LightningElement {
  columns = COLS;
  currencyList = currency_list;
  basicCurrencies = basicCurrencies;
  @track rates = [];
  @wire(MessageContext)
  messageContext;
  subscribeToMessageChannel() {
    this.subscription = subscribe(
      this.messageContext,
      CURRENCY_UPDATED_CHANNEL,
      (message) => this.handleMessage(message)
    );
  }

  get baseCurrencyName() {
    return this.rates.length > 0 ? this.rates[0].CurrencyName : "";
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
    getLatestExchangeRates()
      .then((result) => {
        const baseCurrency = result.base;
        const rates = Object.entries(result.rates).map(([currency, rate]) => {
          if (
            this.basicCurrencies.includes(currency) &&
            currency !== baseCurrency
          ) {
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
      })
      .catch((error) => {
        console.error("Error retrieving exchange rate data:", error);
      });
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
