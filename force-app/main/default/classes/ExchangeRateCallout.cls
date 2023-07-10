public class ExchangeRateCallout {
  @AuraEnabled(cacheable=true)
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
}
