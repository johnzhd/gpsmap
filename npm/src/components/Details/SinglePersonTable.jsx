import styles from './DetailsCSS.less';
import React from 'react';
import xAJAX from '../../services/xAjax';
import UrlList from '../../services/UrlList';

import { Row, Col } from 'antd';
import {Card } from 'antd';

const SinglePersonTable = React.createClass({
    getInitialState: function(){
        this.props.wid;
        return {data: []};
    },
    loadData: function(){
        xAJAX(UrlList.show, {id: this.props.wid}, this.onLoadData);
    },
    onLoadData: function(success, data, err){
        if (success && ! err){
            this.setState({data: data});
        }
    },
    componentDidMount: function(){
        this.loadData();
    },
    onOrigin: function(e){
        if (this.props.onOrigin){
            this.props.onOrigin(e);
        }
    },
    onCalc: function(e){
        if (this.props.onCalc){
            this.props.onCalc(e);
        }
    },

    MakeMyCard: function(){
        if (!this.state.data || this.state.data.length == 0 || !this.state.data[0]){
            return (<Card loading title="Person" className={styles.FullWidth} />);
        }
        let node = this.state.data[0];
        let id = '';

        let image = 'http://www.rising.com.cn/favicon.ico';
        let name = '未知';
        let gender = '任意';
        let sign = '';
        let time = '';
        let postion = '';
        let origin = 0;
        let calc = 0;

        id = node.id;

        if (node.img && node.img.length>0 ){
            image = node.img;
        }
        if (node.name){
            name = node.name;
        }
        if (node.gender){
            gender = node.gender;
        }
        if (node.gender == "2" || node.gender == "female"){
            gender = '女';
        }
        if (node.gender == "1" || node.gender == "male"){
            gender = '男';
        }

        if (node.sign){
            sign = node.sign;
        }
        

        if (node.time){
            time = node.time;
        }
        if (node.country){
            postion = node.country;
        }
        if (node.province){
            if (postion){
                postion += ' - ';
            }
            postion += node.province;
        }
        if (node.city){
            if (postion){
                postion += ' - ';
            }
            postion += node.city;
        }

        if (node.ocount){
            origin = node.ocount;
        }
        if (node.pcount){
            calc = node.pcount;
        }
        let calc_dom = (<a onClick={this.onCalc}><span>估算记录: </span>{calc}</a>);
        if (!calc){
            calc_dom = (<a onClick={this.onCalc}><span>尝试估算</span></a>);
        }


        return (<Card >
        <div><img src={image} /></div>
        <div>
            <h3>{name}</h3>
            <p>{gender}</p>
            <p>{postion}</p>
            <p>{sign}</p>
        </div>
        <div><span>{time}</span></div>
        <div><a onClick={this.onOrigin}><span>原始记录: </span>{origin}</a></div>
        <div>{calc_dom}</div>
        </Card>);
    },
    render: function(){
        let tmp = this.MakeMyCard();
        return tmp;
    }
});


// wid 
// onOrigin
// onCalc
export default SinglePersonTable;









