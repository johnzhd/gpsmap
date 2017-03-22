import React from 'react';
import { Link } from 'react-router';
import { Table, Card, Popover, Icon } from 'antd';

import UrlList from '../../services/UrlList';

function ColumnsImg(text, record, index, onShowPop){
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
                        </Card>);
    let VisbleChange = (b)=>{};
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
                    onVisibleChange={VisbleChange}
                    >
                    <img alt="Waiting..." style={{width: 30, height: 30}} src={i} />
                </Popover>
            </div>);
}


const SelectNameList = React.createClass({
    getInitialState(){
        return {selectKeys: this.props.id};
    },
    SelectChange(selectedRowKeys, selectedRows){
        if (this.props.onChange){
            this.props.onChange(selectedRowKeys);
        }
        this.setState({selectKeys: selectedRowKeys});
    },
    SearchID(id){
        if (!this.props.id){
            return false;
        }
        for (var one of this.props.id){
            if (one == id){
                return true;
            }
        }
        return false;
    },
    MakeColumns(){
        let that = this;
        const ret = [
            {
                title: '*',
                dataIndex: 'id',
                key: 'id',
                render: function(text, record){
                    if (!that.SearchID(text) ){
                        
                        let click=function(e){
                            that.props.onChange([record.id]);
                        }
                        return <Icon type="check-circle-o" onClick={click} />
                    }
                    return <Icon type="check-circle"/>
                }
            },
            {
                title: '#',
                dataIndex: 'img',
                key: 'img',
                render: ColumnsImg, 
            },
            {
                title: '昵称',
                dataIndex: 'name',
                key: 'name',
                sorter: (a,b)=>{
                    if (a['name'] > b['name']){
                        return 1;
                    }
                    if (a['name'] < b['name']){
                        return -1;
                    }
                    return 0;
                },
                render: function(text, record){
                    let url = UrlList.MakeSingleLinkURL(record.id);
                    return (<Link to={url}>{text}</Link>);
                },
            },
        ];
        return ret;
    },
    render(){
        let data = this.props.data;
        let selectKeys = this.props.id || this.state.selectKeys;
        const pagination = {
            total: (data ? data.length : 0),
            showSizeChanger: true,
            onShowSizeChange(current, pageSize) {
            },
            onChange(current) {
            },
        };
        const rowSelection = {
            type: 'radio',
            selectedRowKeys: selectKeys,
            onChange: this.SelectChange,
        };
        const columns = this.MakeColumns();

        return (<Table
                    rowKey={record => record.id}
                    size="small"
                    pagination={pagination}
                    columns={columns}
                    dataSource={data}
                />);
    }
});


// data
// id
// onChange
export default SelectNameList;

