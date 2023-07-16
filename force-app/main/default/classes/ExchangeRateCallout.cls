public class ExchangeRateCallout {
  @AuraEnabled
  public static Map<String, Object> getExchangeRates(String currencyDate) {
    // Query a Log record with specific parameters
    List<Log__c> logList = [
      SELECT Status_Code__c, Response_Body__c, Response_Date__c
      FROM Log__c
      WHERE Response_Date__c = :currencyDate
    ];
    // Make a callout to retrieve currency data if no Log records
    if (logList.isEmpty()) {
      Http http = new Http();
      HttpRequest request = new HttpRequest();
      request.setEndpoint('https://api.exchangerate.host/' + currencyDate);
      request.setMethod('GET');

      HttpResponse response = http.send(request);

      if (response.getStatusCode() == 200) {
        Map<String, Object> deserializedMap = (Map<String, Object>) JSON.deserializeUntyped(
          response.getBody()
        );
        String apiCurrencyDate = (String) deserializedMap.get('date');
        // Insert a new record with data from response
        Log__c lg = new Log__c(
          Status_Code__c = String.valueOf(response.getStatusCode()),
          Response_Body__c = response.getBody(),
          Response_Date__c = currencyDate
        );
        insert lg;
        logList.add(lg);
      } else {
        // Handle API call failure
        System.debug(
          'Error: API call failed with status code ' + response.getStatusCode()
        );
        return null;
      }
    }
    // Deserialize a JSON response string contained in the Response_Body__c field for return
    Map<String, Object> deserializedMap = (Map<String, Object>) JSON.deserializeUntyped(
      logList[0].Response_Body__c
    );
    return deserializedMap;
  }
}
