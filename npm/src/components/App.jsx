import React, { Component, PropTypes } from 'react';
import MainLayout from '../layouts/MainLayout/MainLayout';

import ShowDevice from './MapManager/ShowDevice'
import Login from './Login';

import xAJAX from '../services/xAjax';
import UrlList from '../services/UrlList';
import xToken from '../services/xToken';

import openNotificationWithIcon from './Details/Notification';

const App = React.createClass({
  getInitialState(){
        return {
          token: "",
          visible: true,

        };
    },
  onLoad(success, data, err){
    console.log(success, data, err);
        if (success && !err && data.length > 0){
          console.log(data);
          console.log('token', data[0]);
          xToken(data[0]);
            this.setState({token: data[0], visible: false});
        } else {
          this.setState({token: "", visible: true});
          // openNotificationWithIcon('warning', '登陆失败', '请重新尝试');
        }
    },
  handleLogin(data){
    this.setState({visible: false});
    xAJAX(UrlList.login, data, this.onLoad);
  },
  render(){
    let token = xToken();
    let child = (<Login onSubmit={this.handleLogin} visible={this.state.visible}/>);

    if (token){
      child = this.props.children || (<ShowDevice />);
    }

    return (
    <MainLayout>
      {child}
    </MainLayout>
  );
  }
  
});


export default App;
