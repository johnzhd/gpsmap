import React, { PropTypes } from 'react';
import { Router, Route, IndexRoute, Link } from 'react-router';

import App from '../components/App';
import ShowDevice from '../components/MapManager/ShowDevice';
import Name from '../components/Name';
import SingleName from '../components/SingleName';
import Seek from '../components/Seek';
import Normal from '../components/Search/Normal';
import Near from '../components/Search/Near';
import Filter from '../components/Search/Filter';
import Device from '../components/Device';

import NotFound from '../components/NotFound';

const Routes = ({ history }) =>
  <Router history={history}>
    <Route path="/" component={App}>
      <IndexRoute component={ShowDevice} />
      <Route path="/index.html" component={ShowDevice} />
      <Route path="/name" component={Name} />
      <Route path="/name/:wid" component={SingleName} />
      <Route path="/search" component={Seek}>
        <Route path="/search/normal" component={Normal} />
        <Route path="/search/near" component={Near} />
        <Route path="/search/filter" component={Filter} />
      </Route>

      <Route path="/device" component={Device} />
      <Route path="/*" component={NotFound}/>
    </Route>
  </Router>;

Routes.propTypes = {
  history: PropTypes.any,
};

export default Routes;
