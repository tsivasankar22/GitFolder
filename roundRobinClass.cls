
/* 
apex class name : roundRobinClass
Description : Custom Round robin Class Demo class venu

*/
public with sharing class roundRobinClass {
    @AuraEnabled(cacheable=true)
    public static String CustomSetting() {
        RROV__c record = [SELECT id, Object_API_Names__c FROM RROV__c LIMIT 1];
        return record.Object_API_Names__c;
    }
    @AuraEnabled(cacheable=true)
    public static List<String> getSupportedQueues(String selectedObject) {
        System.debug('selected-----------'+selectedObject);
    
        // Query the QueueSobject records
        List<QueueSobject> queueSobjects = [SELECT QueueId, Queue.Name, SobjectType FROM QueueSobject WHERE SobjectType =:selectedObject];
    
        // Extract Queue Name from the queried records
        List<String> supportedQueues = new List<String>();
        for (QueueSobject queueSobject : queueSobjects) {
            supportedQueues.add(queueSobject.Queue.Name);
        }
       System.debug('supportedQueues-----------'+supportedQueues);
        return supportedQueues;
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, String>> getUsersOfQueue(String selectedQueue) {
        System.debug('selectedQueue-----------'+selectedQueue);
    
        // Query the GroupMember records for the specified queue
        List<GroupMember> queueMembers = [SELECT UserOrGroupId FROM GroupMember WHERE Group.Name = :selectedQueue];
        System.debug('queueMembers------------'+queueMembers);
        // Extract User IDs from the queried records
        List<String> userIDs = new List<String>();
        for (GroupMember member : queueMembers) {
            // Convert the Id to a String and then check if it starts with '005'
            if (String.valueOf(member.UserOrGroupId).startsWith('005')) {
                userIDs.add((String) member.UserOrGroupId);
            }
        }

        // Query User records based on the obtained User IDs
        List<User> users = [SELECT Id, Name FROM User WHERE Id IN :userIDs];

        // Extract User names from the queried User records
        List<Map<String, String>> userInfos = new List<Map<String, String>>();
    
    for (User user : users) {
        Map<String, String> userInfo = new Map<String, String>();
        userInfo.put('Name', user.Name);
        userInfo.put('Id', user.Id);
        userInfos.add(userInfo);
    }

    System.debug('userInfos-----------'+userInfos);
    return userInfos;
        // @AuraEnabled(cacheable=true)
        // public static List<QueueSettings__c> QueueSettingObjectData() {
        //     try {
        //         // Query the records
        //         List<QueueSettings__c> queueSettingsList = [SELECT Id, Base_Distribution_on_start_Date_Time_of__c, Managed_Queue__c, TotalPercentage__c, QueueSettings_Name__c, Queue_Type__c, Name FROM QueueSettings__c];
        
        //         return queueSettingsList;
        //     } catch (Exception e) {
        //         // Handle any exceptions and return an error message
        //         System.debug('Error: ' + e.getMessage());
        //         return null; // Or handle the error in a way that fits your requirements
        //     }
        }
        @AuraEnabled(cacheable=true)
        public static List<Distro__c> DistroObjectData() {
            try {
                // Query the records
                List<Distro__c> queueSettingsList = [SELECT Id, Name, Percentages__c, Choose__c, QueueSettings__c, User__c FROM Distro__c];
        
                return queueSettingsList;
            } catch (Exception e) {
                // Handle any exceptions and return an error message
                System.debug('Error: ' + e.getMessage());
                return null; // Or handle the error in a way that fits your requirements
            }
        }
        

}