import styles from './DetailsCSS.less'
import React from 'react';
import { Row, Col } from 'antd';
import { Table, Card, Popover, Button } from 'antd';
import { Link } from 'react-router';
import SearchBar from './SearchBar';

import UrlList from '../../services/UrlList';


function create_order(name){
    return function(a,b){
        if (a[name] > b[name]){ return 1; }
        else if (a[name] < b[name]){ return -1; }
        else {return 0;}
    }
}

function ColumnImg(onShowPop){ return {
            title: '#',
            dataIndex: 'img',
            key: 'img',
            render: function(text, record){
                var i = "http://www.rising.com.cn/favicon.ico";
                if (record.img && record.img.length > 0){
                    i = record.img;
                }
                var sign = record.sign || "无";
                var gender = "任意";
                var postion = '任意区域';

                if (record.gender){
                    if (record.gender == "male" || record.gender == 1){
                        gender = "男";
                    } else if (record.gender == "female" || record.gender == 2){
                        gender = "女";
                    }
                }
                
                var name = (record.name || '未知') + ' - ' + gender;

                if (record.country){
                    postion = record.country;
                }
                if (record.province){
                    if (postion){
                        postion += ' - ';
                    }
                    postion += record.province;
                }
                if (record.city){
                    if (postion){
                        postion += ' - ';
                    }
                    postion += record.city;
                }
                let CardDOM=(<Card bodyStyle={{padding:0}}>
                        <div className="custom-image">
                        <img alt="Waiting..." src={i} />
                        </div>
                        <div className="custom-card">
                            <h3>{name}</h3>
                            <p>{postion}</p>
                            <p>{sign}</p>
                            </div>
                        </Card>
                );
                let VisbleChange = null;
                if (onShowPop){
                    VisbleChange = (b)=>{
                    if (b){
                        onShowPop(record.id, b);
                    }
                };
                }
                return (<div><Popover content={CardDOM}
                                    trigger="hover"
                                    placement="right"
                                    onVisibleChange={VisbleChange} >
                        <img alt="Waiting..." style={{width: 30, height: 30}} src={i} />
                     </Popover></div>);
            }
}};
function ColumnName(){ return {
                title: '昵称',
                dataIndex: 'name',
                key: 'name',
                sorter: create_order('name'),
                render: function(text, record){
                    let url = UrlList.MakeSingleLinkURL(record.id);
                    return (<Link to={url}>{text}</Link>);
                }
}};


const NameList = React.createClass({
    //////  Event     ////////////////
    getInitialState() {
        return {
            namefilter: null,
        }
    },

    ////        Render          //////////
    FormatColumn(){
        let col = [ 
            ColumnImg(this.props.onShowPop),
            ColumnName(),
            ];
        return col;
    },
    FormatData(){
        return this.props.data;
    },
    onRowClick(record, index){
        if (this.props.onRowClick){
            this.props.onRowClick(record.id);
        }
    },
    render: function(){
        const columns = this.FormatColumn();

        let childdata = this.FormatData(); 

        const pagination = {
            total: (this.state.childdata ? this.state.childdata.length : 0),
            showSizeChanger: true,
            onShowSizeChange(current, pageSize) {
            },
            onChange(current) {
            },
        };

        return (
          <Table 
            size="small"
            dataSource={childdata}
            columns={columns}
            rowKey={record => record.id}
            pagination={pagination}
            onRowClick={this.onRowClick}
            />);
    }
});

// data
// onRowClick
export default NameList;
