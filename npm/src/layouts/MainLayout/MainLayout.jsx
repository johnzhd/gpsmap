import React, { Component, PropTypes } from 'react';
import { Router, Route, IndexRoute, Link } from 'react-router';
import styles from './MainLayout.less';
import TopBar from './libs/TopBar';
import { Row, Col } from 'antd';

const MainLayout = ({ children }) => {
  return (<div className={styles.framework_dark} >
    <Row type="flex" className={styles.TopZ}>
        <Col span="24"><TopBar /></Col>
    </Row>
    <Row type="flex" className={styles.Main}>
      <Col span="24">
      {children}
      </Col>
    </Row>
    </div>
    );
};

MainLayout.propTypes = {
  children: PropTypes.element.isRequired,
};

export default MainLayout;
