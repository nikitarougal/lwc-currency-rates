# Currency App

The Currency App is a Salesforce Lightning Web Component (LWC) application that allows users to retrieve currency rates, display them in a table, and convert currency amounts using current exchange rates. Link to the GitHub Page: https://nikitarougal.github.io/Lightning-Out-Currency-App/


https://github.com/nikitarougal/lwc-currency-rates/assets/77426901/78baacf9-3f8c-4210-aa99-df730a05e107




## Components

The app consists of the following LWC components:

1. **currencyForm**: Allows users to choose a base currency and date to retrieve currency rates.

2. **currencyTable**: Displays currency rates in a table format. Users can also add new currencies to the table using a combobox.

3. **currencyConverter**: Allows users to convert a specified amount of currency to other currencies using the current exchange rates.

## Apex Class

The app uses an Apex class to perform a callout to retrieve currency rates from an external API. The retrieved rates are saved to the Log object and returned as a response.

## Prerequisites

- Salesforce org with Lightning Experience enabled.
- API access and permissions to perform callouts and access the Log object.

## Installation

To use the Currency App in your Salesforce org, follow these steps:

1. Install the Currency App package by clicking on the following link: [Package Installation URL](https://login.salesforce.com/packaging/installPackage.apexp?p0=04t5h000000yWThAAM).

2. Assign the necessary permissions to the user profile to access the Currency App components and perform callouts.

## Usage

1. Add the **currencyForm** component to a Lightning page. This component allows users to choose a base currency and date to retrieve currency rates.

2. Add the **currencyTable** component to a Lightning page. This component displays the retrieved currency rates in a table format. Users can also add new currencies to the table using the provided combobox.

3. Add the **currencyConverter** component to a Lightning page. This component allows users to convert a specified amount of currency to other currencies using the current exchange rates.

4. Customize the components as per your requirements and styling preferences.

## License

This project is licensed under the [MIT License](LICENSE).
