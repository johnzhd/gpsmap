import React, { Component, PropTypes } from 'react';
import MainLayout from '../layouts/MainLayout/MainLayout';

// import Todos from './Todos/Todos';
import NamePage from './Details/NamePage'

const Name = React.createClass({
    render(){
        return (
      <NamePage wid={this.props.params.wid || ''} />);
    }
});


Name.propTypes = {
};

export default Name;
