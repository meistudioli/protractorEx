Feature: google index
    As a user of google
    I could do some search


    @NG0001 @E2E
    Scenario: 頁面 header 是否存在
    	Given I go to "google"
    	Then header should exist


    @NG0002 @E2E
    Scenario: 頁面 footer 是否存在
        Given I go to "google"
        Then footer should exist


    @NG0003 @E2E
    Scenario: 頁面 logo 是否存在
        Given I go to "google"
        Then logo should exist


    @NG0004 @E2E
    Scenario: 搜尋 "google", 第一筆資料顯示正確
        Given I go to "google"
        When I search "google" from google
        Then search result should have more than "1" record
        And first record title should be "Google"


    @NG0005 @E2E
    Scenario: login as "mei" & 搜尋 "yahoo", 第一筆資料顯示正確
        Given I login as account - "mei"
        And I go to "google"
        When I search "yahoo" from google
        Then search result should have more than "1" record
        And first record title should be "Yahoo奇摩"