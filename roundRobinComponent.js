import { LightningElement ,track,wire } from 'lwc';
import CustomSetting from '@salesforce/apex/roundRobinClass.CustomSetting';
import getSupportedQueues from '@salesforce/apex/roundRobinClass.getSupportedQueues';
import getUsersOfQueue from '@salesforce/apex/roundRobinClass.getUsersOfQueue';
//import QueueSettingObjectData from '@salesforce/apex/roundRobinClass.QueueSettingObjectData';
import DistroObjectData from '@salesforce/apex/roundRobinClass.DistroObjectData';
export default class RoundRobinComponent extends LightningElement {
    selectedValue = '--None--';
    customSettingApiNames = [];
    @track queqes;
    @track supportedQueues=true;
    @track selectedQueue;
    @track UsersOfQueue;
    managedQueueValue = false; 
    @track remainderValue = 0;
    baseDistributionDateTime;

    @wire(CustomSetting)
    wiredObjectApiNames({ data, error }) {
        if (data) {
            // Parse the comma-separated string and create options array
            this.customSettingApiNames = data.split(',').map(option => ({ label: option, value: option }));
           
        } else if (error) {
            console.error('Error loading object API names', error);
        }
    }

    handleChange(event) {
        this.selectedValue = event.detail.value;
        this.managedQueueValue = false;
    }
    QueuehandleChange(event){
        this.selectedQueue=event.detail.value;
        console.log('log--------------'+this.selectedQueue);
    }
    @wire(getSupportedQueues, { selectedObject: '$selectedValue' })
    wiredSupportedQueues({ data, error }) {
        if (data) {
            console.log('data-------------'+JSON.stringify(data));
            this.queqes = data.map(option => ({ label: option, value: option }));
            console.log('queues----------'+this.queqes);
            this.supportedQueues=true;
        } else if (error) {
            console.error('Error loading supported queues', error);
        }
    }
    @wire(getUsersOfQueue, { selectedQueue: '$selectedQueue' })
    wiredGetUsersQueues({ data, error }) {
        if (data) {
          
            this.UsersOfQueue=data;
            console.log('UsersOfQueue-------------'+JSON.stringify(this.UsersOfQueue));
            this.managedQueueValue = true;
        } else if (error) {
            console.error('Error loading supported queues', error);
        }
    }
    // @wire(QueueSettingObjectData)
    // wiredGetQueueSettingObj({ data, error }) {
    //     if (data) {
    //         console.log('data--- of queue setting----------'+JSON.stringify(data));
    //     } else if (error) {
    //         console.error('Error loading supported queues', error);
       
    //    }
    // }
    @wire(DistroObjectData)
    wiredGetDistroObj({ data, error }) {
        if (data) {
          //  console.log('data--- of queue setting----------'+JSON.stringify(data));
        } else if (error) {
            console.error('Error loading supported queues', error);
       
       }
    }
    handleManagedQueueChange(event) {
        this.managedQueueValue = event.target.checked;
    }

  
    handleBaseDistributionDateTimeChange(event) {
        this.baseDistributionDateTime = event.target.value;
    }
    @track UserChecked;
    handleCheckboxChange(event) {
        const userId = event.target.dataset.userId;
        console.log('userId-------------',userId);
        const selected = event.target.checked;
        console.log('selected-------------',selected);
    
        // Update isSelected for the selected user
        const updatedUsers = this.UsersOfQueue.map(user => {
            if (user.Id === userId) {
                return { ...user, isSelected: selected };
            }
            console.log('users-----------------'+user);
            return user;

        });
    
        this.UsersOfQueue = updatedUsers;
    
        // Calculate the new percentage based on the number of selected checkboxes
        this.updatePercentage();
    }
    
    updatePercentage() {
        const selectedUsers = this.UsersOfQueue.filter(user => user.isSelected);
        const totalSelected = selectedUsers.length;
    
        // Update the Percentage__c field based on the number of selected checkboxes
        const newPercentage = totalSelected > 0 ? 100 / totalSelected : 0;
    
        // Update the Percentage__c field for selected users
        const updatedUsers = this.UsersOfQueue.map(user => {
            if (user.isSelected) {
                return { ...user, Percentage__c: newPercentage };
            }
            return user;
        });
    
        this.UsersOfQueue = updatedUsers;
    }
    @track percentValue = 0;
    @track userIdforpercent;
handlePercentageChange(event) {
    this.userIdforpercent = event.target.dataset.userId;
    this.percentValue=event.target.value;
    console.log('data of UserID----------' + this.userIdforpercent);
    console.log('data of percent----------' + this.percentValue);
}

// handleReminderClick() {
//     const selectedUsers = this.UsersOfQueue.filter(user => user.isSelected);
//     const totalSelected = selectedUsers.length;

//     if (totalSelected === 0) {
//         // Handle case where no users are selected
//         return;
//     }

//     const remainderPerUser = 100 - this.percentValue;
//     console.log('remainderPerUser-----------'+remainderPerUser);

//       // Update the Percentage__c field for the specific user
//       const updatedUsers = this.UsersOfQueue.map(user => {
//         if (user.isSelected && user.Id === this.userIdforpercent) {
//             console.log('user.isSelected------------'+user.isSelected);
//             console.log('user.Id------------'+user.Id);
//             console.log('this.userIdforpercent------------'+this.userIdforpercent);
//             const adjustedPercentage = parseFloat(user.Percentage__c) + remainderPerUser;
//             return {
//                 ...user,
//                 Percentage__c: adjustedPercentage > 100 ? 100 : adjustedPercentage,
//             };
//         }
//         return user;
//     });
//     console.log('updated user------------'+JSON.stringify(updatedUsers));
//     this.UsersOfQueue = updatedUsers;

// }
handleReminderClick() {
    const selectedUsers = this.UsersOfQueue.filter(user => user.isSelected);
    const totalSelected = selectedUsers.length;

    if (totalSelected === 0) {
        // Handle case where no users are selected
        return;
    }

    const totalPercentage = selectedUsers.reduce((total, user) => total + parseFloat(user.Percentage__c), 0);
    const remainderPerUser = (this.percentValue / 100) * totalPercentage;

    // Update the Percentage__c field for each selected user
    const updatedUsers = this.UsersOfQueue.map(user => {
        if (user.isSelected) {
            const userPercentage = parseFloat(user.Percentage__c);
            const adjustedPercentage = userPercentage + (userPercentage / totalPercentage) * remainderPerUser;
            return {
                ...user,
                Percentage__c: adjustedPercentage > 100 ? 100 : adjustedPercentage,
            };
        }
        return user;
    });

    this.UsersOfQueue = updatedUsers;
}



}