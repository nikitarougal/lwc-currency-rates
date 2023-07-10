public class ExchangeRateCallout {
  @AuraEnabled
  public static Map<String, Object> getExchangeRates() {
    Http http = new Http();
    HttpRequest request = new HttpRequest();
    request.setEndpoint(
      'https://api.exchangerate.host/today?base=USD&symbols=EUR,CAD'
    );
    request.setMethod('GET');

    HttpResponse response = http.send(request);
    if (response.getStatusCode() == 200) {
      Map<String, Object> deserializedMap = (Map<String, Object>) JSON.deserializeUntyped(
        response.getBody()
      );
      System.debug('Result: ' + deserializedMap);
      return deserializedMap;
    } else {
      // Handle error response
      System.debug(
        'Error: ' + response.getStatusCode() + ' - ' + response.getStatus()
      );
      return null;
    }
  }

  @AuraEnabled
  public static Map<String, Object> getLatestExchangeRates() {
    String formattedDate = DateTime.now().format('yyyy-MM-dd');
    List<Log__c> todayLogList = [
      SELECT Status_Code__c, Response_Body__c, Response_Date__c
      FROM Log__c
      WHERE Status_Code__c = '200' AND Response_Date__c = :formattedDate
    ];

    if (todayLogList.isEmpty()) {
      Http http = new Http();
      HttpRequest request = new HttpRequest();
      request.setEndpoint('https://api.exchangerate.host/latest');
      request.setMethod('GET');

      HttpResponse response = http.send(request);

      if (response.getStatusCode() == 200) {
        Log__c lg = new Log__c(
          Status_Code__c = String.valueOf(response.getStatusCode()),
          Response_Body__c = response.getBody(),
          Response_Date__c = System.now().format('yyyy-MM-dd')
        );
        insert lg;
        todayLogList.add(lg);
      } else {
        // Handle API call failure
        System.debug(
          'Error: API call failed with status code ' + response.getStatusCode()
        );
        return null;
      }
    }
    if (todayLogList[0].Status_Code__c == '200') {
      Map<String, Object> deserializedMap = (Map<String, Object>) JSON.deserializeUntyped(
        todayLogList[0].Response_Body__c
      );
      return deserializedMap;
    } else {
      // Handle log with error response
      System.debug(
        'Error: Exchange rate API returned status code ' +
        todayLogList[0].Status_Code__c
      );
      return null;
    }
  }
}
