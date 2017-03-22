import './index.html';
import './index.less';
import ReactDOM from 'react-dom';
import React from 'react';
// import { browserHistory } from 'react-router';
import { hashHistory } from 'react-router';
import App from '../components/App';
import Routes from '../routes/index';

ReactDOM.render((
    <Routes history={hashHistory} />
), document.getElementById('root'));