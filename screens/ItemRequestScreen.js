import React,{Component} from 'react';
import {
    View,
    Text,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
  TouchableHighlight,
FlatList,
Image} from 'react-native';

import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader';
import {BookSearch} from 'react-native-google-books';
import { RFValue } from 'react-native-responsive-fontsize';
import { Input } from 'react-native-elements';

export default class BookRequestScreen extends Component{
    constructor(){
        super()
        this.state={
            userid: firebase.auth().currentUser.email,
            bookName: '',
            reasonToRequest:'',
            isBookRequestActive: '',
            requestedBookName: '',
            bookStatus: '',
            requestID: '',
            userDocID: '',
            docID: '',
            imageLink: '',
            dataSource: '',
            showFlatlist: false,
            requestedImageLink: ''
        }
    }

    createUniqueId(){
        return Math.random().toString(36).substring(7)
    }

    addRequest=async(bookName, reasonToRequest)=>{
      console.log('here')
        var userid = this.state.userid
        var randomRequestId = this.createUniqueId()
        var books = await BookSearch.searchbook(bookName, 'AIzaSyCwklL5X2Z3eYmP03BPNnSIdBIxRgk4__0')  
        db.collection('requested_books').add({
            'user_id': userid,
            'book_Name': bookName,
            'reason_to_request': reasonToRequest,
            'request_id': randomRequestId,
            'book_Status': 'requested',
            'date': firebase.firestore.FieldValue.serverTimestamp(),
            'image_link': books.data[0].volumeInfo.imageLinks.smallThumbnail
        })
        console.log("56")
        await this.getBookRequest()
        db.collection('users').where('email_ID', '==', userid).get()
        .then()
        .then((snapshot)=>{
          snapshot.forEach((doc)=>{
            console.log("62")
            db.collection('users').doc(doc.id).update({
              isBookRequestActive: true
            })
          })
        })
        console.log("68")
        this.setState({
            bookName: '',
            reasonToRequest: '',
            requestID: randomRequestId
        })
        return alert('Book Requested Successfully')
    }

    receivedBooks=(bookName)=>{
        var userid = this.state.userid
        var requestID = this.state.requestID
        db.collection('received_books').add({
            "user_id": userid,
            "book_Name":bookName,
            "request_id"  : requestID,
            "bookStatus"  : "received",
      
        })
      }

      getIsBookRequestActive(){
        db.collection('users')
        .where('email_ID','==',this.state.userid)
        .onSnapshot(querySnapshot => {
          querySnapshot.forEach(doc => {
            this.setState({
            isBookRequestActive:doc.data().isBookRequestActive,
              userDocID : doc.id
            })
          })
        })
      }

      getBookRequest=()=>{
          var bookRequest = db.collection('requested_books')
          .where('user_id','==',this.state.userid)
          .get()
          .then((snapshot)=>{
              snapshot.forEach((doc)=>{
                  if(doc.data().bookStatus!=='received'){
                      this.setState({
                          requestID: doc.data().request_id,
                          requestedBookName: doc.data().book_Name,
                          bookStatus: doc.data().book_Status,
                          docID: doc.id,
                          requestedImageLink: doc.data().image_link
                      })
                  }
              })
          })
      }

      sendNotification=()=>{
        //to get the first name and last name
        db.collection('users').where('email_ID','==',this.state.userid).get()
        .then((snapshot)=>{
          snapshot.forEach((doc)=>{
            var name = doc.data().first_Name
            var lastName = doc.data().last_Name
      
            // to get the donor id and book nam
            db.collection('all_notifications').where('request_id','==',this.state.requestId).get()
            .then((snapshot)=>{
              snapshot.forEach((doc) => {
                var donorId  = doc.data().donar_id
                var bookName =  doc.data().book_Name
      
                //targert user id is the donor id to send notification to the user
                db.collection('all_notifications').add({
                  "targeted_user_ID" : donorId,
                  "message" : name +" " + lastName + " received the book " + bookName ,
                  "notification_status" : "unread",
                  "book_Name" : bookName
                })
              })
            })
          })
        })
      }

      componentDidMount(){
          this.getBookRequest()
          this.getIsBookRequestActive()
      }

      updateBookRequestStatus=()=>{
        //updating the book status after receiving the book
        db.collection('requested_books').doc(this.state.docID)
        .update({
          bookStatus : 'received'
        })
      
        //getting the  doc id to update the users doc
        db.collection('users').where('email_ID','==',this.state.userid).get()
        .then((snapshot)=>{
          snapshot.forEach((doc) => {
            //updating the doc
            db.collection('users').doc(doc.id).update({
              isBookRequestActive: false
            })
          })
        })
      }

      async getBooksFromApi(bookName){
        this.setState({
          bookName: bookName
        })
        if(bookName.length>2){
          var books = await BookSearch.searchbook(bookName, 'c474208be3973959ee8f98bd2921128f')
          this.setState({
            dataSource: books.data,
            showFlatlist: true
          })
        }

      }

      renderItem=({item, i})=>{
        let obj = {
          title: item.volumeInfo.title,
          selfLink: item.selfLink,
          buyLink: item.saleInfo.buyLink,
          imageLink: item.volumeInfo.imageLinks
        }
        return (
          <TouchableHighlight
          style={{alignItems: 'center', backgroundColor: '#dddddd', padding: 10, width : '90%'}}
          activeOpacity={0.6}
          underlayColor='#dddddd'
          onPress={()=>{this.setState({showFlatlist: false, bookName: item.volumeInfo.title})}}
          bottomDivider
          >
            <Text>{item.volumeInfo.title}</Text>
          </TouchableHighlight>
        )
      }

    render(){
        if(this.state.isBookRequestActive === true){
            return(
      
              // Status screen
      
              <View style = {{flex:1,}}>
                <View style={styles.imageView}>
                  <Image
                  source={{uri: this.state.requestedImageLink}}
                  style={styles.imageStyle}
                  />
                </View>
                <View style={styles.bookStatus}>
                <Text style={{fontSize: RFValue(20)}}>Item Name</Text>
                <Text>{this.state.requestedBookName}</Text>
                <Text> Item Status </Text>
      
                <Text>{this.state.bookStatus}</Text>
      
                <TouchableOpacity style={{borderWidth:1,borderColor:'orange',backgroundColor:"orange",width:300,alignSelf:'center',alignItems:'center',height:30,marginTop:30}}
                onPress={()=>{
                  this.sendNotification()
                  this.updateBookRequestStatus();
                  this.receivedBooks(this.state.requestedBookName)
                }}>
                <Text>I recieved the item </Text>
                </TouchableOpacity>
              </View>
              </View>
            )
          }

          else
          {
          return(
            // Form screen
              <View style={{flex:1}}>
                <MyHeader title="Request Book" navigation ={this.props.navigation}/>
      
                <View>
      
                <Input
                  style ={styles.formTextInput}
                  label={'Book Name'}
                  placeholder={"enter book name"}
                  containerStyle={{marginTop: RFValue(60)}}
                  onChangeText={text => this.getBooksFromApi(text)}
                  onClear={text => this.getBooksFromApi('')}
                  value={this.state.bookName}
                />
      
            {  this.state.showFlatlist ?
      
              (  <FlatList
              data={this.state.dataSource}
              renderItem={this.renderItem}
              enableEmptySections={true}
              style={{ marginTop: RFValue(10) }}
              keyExtractor={(item, index) => index.toString()}  
            /> )
            :(
              <View style={{alignItems:'center'}}>
              <Input
                style ={styles.formTextInput}
                containerStyle={{marginTop: RFValue(30)}}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the book?"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={[styles.button, {marginTop: RFValue(30)}]}
                onPress={()=>{ this.addRequest(this.state.bookName,this.state.reasonToRequest);
                }}
                >
                <Text>Request</Text>
              </TouchableOpacity>
              </View>
            )
          }
                  </View>
              </View>
          )
        }
    }
}

const styles = StyleSheet.create({
   keyBoardStyle: {
      flex: 1, alignItems: "center",
    justifyContent: "center", },
    formTextInput: { 
      width: "75%", height: RFValue(35), borderWidth: 1, padding: 10, },
    ImageView:{ 
      flex: 0.3, justifyContent: "center", alignItems: "center", marginTop:20 }, 
    imageStyle:{ 
      height: RFValue(150), width: RFValue(150), alignSelf: "center", borderWidth: 5, borderRadius: RFValue(10), }, 
    bookstatus:{ 
      flex: 0.4, alignItems: "center", }, 
    requestedbookName:{ 
      fontSize: RFValue(30), fontWeight: "500", padding: RFValue(10), fontWeight: "bold", alignItems:'center', marginLeft:RFValue(60) }, 
    status:{ 
      fontSize: RFValue(20), marginTop: RFValue(30), },
    bookStatus:{ 
      fontSize: RFValue(30), fontWeight: "bold", marginTop: RFValue(10), }, 
    buttonView:{ 
      flex: 0.2, justifyContent: "center", alignItems: "center", },
    buttontxt:{ 
      fontSize: RFValue(18), fontWeight: "bold", color: "#fff", }, 
    touchableopacity:{ 
      alignItems: "center", backgroundColor: "#DDDDDD", padding: 10, width: "90%", }, 
    requestbuttontxt:{ 
      fontSize: RFValue(20), fontWeight: "bold", color: "#fff", }, 
    button: { 
      width: "75%", height: RFValue(60), justifyContent: "center", alignItems: "center", borderRadius: RFValue(50), backgroundColor: "#32867d", shadowColor: "#000", shadowOffset: { width: 0, height: 8, }, shadowOpacity: 0.44, shadowRadius: 10.32, elevation: 16, }, 
    });

