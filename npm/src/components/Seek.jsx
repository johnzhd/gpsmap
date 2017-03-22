import React from 'react';

import Normal from './Search/Normal';

const Seek = React.createClass({

    render(){
        let child = this.props.children || (<Normal />);
        return child;
    }
});


export default Seek;
