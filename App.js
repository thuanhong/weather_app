import React, {Component} from 'react';
import {StyleSheet, Text, View, StatusBar, Picker, Image,
        TouchableOpacity, ImageBackground, AppRegistry,
        TextInput, Keyboard,Alert} from 'react-native';
import * as Facebook from 'expo-facebook';

export default class App extends Component {
  constructor(props) {
    super(props);
    list_cities = require('./Info.json');
    this.state = {
      selected_name : list_cities[0].name,
      selected_id : list_cities[0].id,
      temperature : 0,
      pressure : 0,
      humidity : 0,
      text : list_cities[0].name,
      keyboard : false,
      signup: 'Sign up with Facebook',
      src_img: '1'
    }
  }

  async logIn() {
    try {
      const {
        type,
        token,
        permissions,
      } = await Facebook.logInWithReadPermissionsAsync('[API KEY]', {
        permissions: ['public_profile'],
      });
      if (type === 'success') {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
        let temp = (await response.json()).name
        Alert.alert('Logged in!', `Hi ${temp}!`);
        this.setState({signup: temp})
      }
    } catch ({ message }) {
      console.log(message);
      alert(`Facebook Login Error: ${message}`);
    }
  }

  changeWeatherId = (itemValue) => {
    this.setState({selected_id: itemValue}, function() {
      this.SyncDatabyID();
    })
  }

  componentWillMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    this.SyncDatabyID()
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow () {
    this.setState({keyboard : true})
  }

  _keyboardDidHide () {
    if (this.state.keyboard) {
      this.SyncDatabyName()
      this.setState({keyboard : false})
    }
  }

  changeState(responseJson) {
    this.setState({selected_name : responseJson.name,
                   text : responseJson.name,
                   temperature : responseJson.main.temp,
                   pressure : responseJson.main.pressure,
                   humidity : responseJson.main.humidity,
                   src_img: "http://openweathermap.org/img/wn/" + responseJson.weather[0].icon + "@2x.png"})
  }

  SyncDatabyID() {
    fetch('http://api.openweathermap.org/data/2.5/weather?id=' + this.state.selected_id + '&APPID=[API_KEY_WEATHERMAP]&units=metric', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.changeState(responseJson);
      })
      .catch((error) => {
        Alert.alert("Something were wrong");
      });
  }

  SyncDatabyName() {
    fetch('http://api.openweathermap.org/data/2.5/weather?q=' + this.state.text + ',vn&APPID=8d988ff56fe16924285c8bd3e93497d4&units=metric', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.id) {
          this.changeWeatherId(responseJson.id)
          this.changeState(responseJson);
        }
        else {
          Alert.alert("No found city");
        }
      })
      .catch((error) => {
        Alert.alert("Something were wrong");
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true}/>
        <Text style={styles.header}>Weather App</Text>
        <View style={styles.content}>
          <Text style={styles.title}>Weather Statistics</Text>
          <TouchableOpacity onPress={() => this.logIn()}>
            <View style={styles.btn}>
              <Image source={require('./img/images.png')} style={styles.img}/>
              <Text style={styles.signup}>{this.state.signup}</Text>
            </View>
          </TouchableOpacity>
          <View>
            <TextInput
              style={styles.choice}
              onChangeText={(text) => this.setState({text})}
              value={this.state.text}
              onSubmitEditing={Keyboard.dismiss}
            />
            <Picker
              selectedValue={this.state.selected_id}
              onValueChange={(itemValue) => this.changeWeatherId(itemValue)}
              style={{width: '80%', alignSelf: 'center'}}
            >
              {list_cities.map((city) => <Picker.Item key={city.id} label={city.name} value={city.id}/>)}
            </Picker>
          </View>
        </View>
        
        <ImageBackground source={{uri: this.state.src_img }} style={styles.content}>
          <Text style={styles.info}>City : {this.state.selected_name}</Text>
          <Text style={styles.info}>Temperature : {this.state.temperature} C</Text>
          <Text style={styles.info}>Pressure : {this.state.pressure} P</Text>
          <Text style={styles.info}>Humidity : {this.state.humidity} %</Text>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignContent: 'stretch',
    justifyContent: 'space-around'
  },
  content: {
    flex: 4,
    justifyContent:"space-around"
  },
  header: {
    flex: 1,
    backgroundColor: "#3398db",
    textAlignVertical: "center",
    textAlign: "center",
    fontSize: 30,
    color: 'white'
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10
  },
  btn: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#4367b2',
    alignSelf: 'center',
    margin:10
  },
  img: {
    width: 40,
    height: 40
  },
  signup: {
    color: 'white',
    fontSize: 20,
    padding: 5
  },
  choice: {
    fontSize: 20,
    padding: 5,
    alignSelf: 'center',
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 3,
    padding: 7,
    minWidth: "50%"
  },
  info: {
    fontSize: 22,
    padding: 10,
    fontWeight: 'bold',
    flex: 1,
    alignSelf: 'center'
  }
});


AppRegistry.registerComponent('nativeApp', () => App);
