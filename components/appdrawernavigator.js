import React from 'react';
import {createDrawerNavigator} from 'react-navigation-drawer';
import {AppTabNavigator} from './appTabNavigator';
import CustomSideBarMenu from './CustomSideBarMenu';
import SettingScreen from '../screens/settingscreen';
import MyDonationScreen from '../screens/MyDonationScreen';
import NotificationScreen from '../screens/notificationscreen';
import MyReceivedItemsScreen from '../screens/MyReceivedItemsScreen';
import { Icon } from 'react-native-elements';

export const AppDrawerNavigator = createDrawerNavigator({
    Home:{
        screen: AppTabNavigator,
        navigationOptions:{
            drawerIcon: <Icom name='home' type='fontawesome5'/>
        }
    },
    MyDonations:{
        screen: MyDonationScreen,
        navigationOptions:{
            drawerIcon: <Icom name='gift' type='font-awesome'/>,
            drawerLabel: 'My Donations'
        }
    },
    Notifications:{
        screen: NotificationScreen,
        navigationOptions:{
            drawerIcon: <Icom name='bell' type='font-awesome'/>,
            drawerLabel: 'Notifications'
        }
    },
    MyReceivedItems:{
        screen: MyReceivedItemsScreen,
        navigationOptions:{
            drawerIcon: <Icom name='gift' type='font-awesome'/>,
            drawerLabel: 'My Received Books'
        }
    },
    Settings:{
        screen: SettingScreen,
        navigationOptions:{
            drawerIcon: <Icom name='settings' type='fontawesome5'/>,
            drawerLabel: 'Settings'
        }
    }
},
{
    contentComponent: CustomSideBarMenu
},
{
    initialRouteName: 'Home'
})