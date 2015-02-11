Feature: Dragon series - 「failure」


  @C0007 @E2E
  Scenario: 搜尋 "yahoo", 且選擇限縮地區為 "國家/地區：台灣", 呈現的第一筆資料 title 必須要有 "Yahoo奇摩"   
    Given I visit "google"                                                   
    When I search "yahoo"                                                    
    And filter area as "國家/地區：台灣"                                            
    Then search result must have more than "1" record                        
    And first record title must start with "Yahoo奇摩"                         
