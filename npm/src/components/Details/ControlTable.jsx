import styles from './DetailsCSS.less'
import React from 'react';


const ControlTable = React.createClass({
    render: function(){
        return (<div className={styles.fullframe}>{this.props.children}</div>);
    }
});

export default ControlTable;