@isTest
private class ExchangeRateCalloutTest {
  @isTest
  static void testGetExchangeRates() {
    // Create a mock HTTP response with the desired JSON body
    String jsonResponse = '{"motd":{"msg":"Mock message","url":"https://example.com"},"success":true,"historical":true,"base":"USD","date":"2023-07-09","rates":{"CAD":1.327181,"GBP":0.778681}}';
    HttpResponse mockResponse = new HttpResponse();
    mockResponse.setStatusCode(200);
    mockResponse.setBody(jsonResponse);

    // Create a mock HTTP callout
    Test.setMock(
      HttpCalloutMock.class,
      new MockHttpResponseGenerator(mockResponse)
    );

    // Call the method to test
    Map<String, Object> exchangeRates = ExchangeRateCallout.getExchangeRates(
      '2023-07-09'
    );

    // Verify the expected result
    System.assertEquals(true, exchangeRates.containsKey('success'));
    System.assertEquals('USD', exchangeRates.get('base'));

    // Verify that a Log__c record was inserted
    List<Log__c> logs = [SELECT Id FROM Log__c];
    System.assertEquals(1, logs.size());
  }

  // Class to generate a mock HTTP response
  private class MockHttpResponseGenerator implements HttpCalloutMock {
    private HttpResponse response;

    public MockHttpResponseGenerator(HttpResponse response) {
      this.response = response;
    }

    public HttpResponse respond(HttpRequest request) {
      return this.response;
    }
  }
}
