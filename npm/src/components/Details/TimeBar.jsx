import React from 'react';
import TimeAPI from './TimeAPI';
import { Row, Col } from 'antd';
import { Input } from 'antd';
import { Slider } from 'antd';

const TimeBar = React.createClass({
    getInitialState(){
        let total_start = NaN;
        let total_end = NaN;

        if (this.props.total_start){
            total_start = this.props.total_start;
        }

        if (this.props.total_end){
            total_end = this.props.total_end;
        }



        return {
            total_start: total_start,
            total_end: total_end,
            ui_start: TimeAPI.SecondToString(this.props.total_start),
            ui_end: TimeAPI.SecondToString(this.props.total_end)
        };
    },
    componentWillMount(){
    },
    componentDidMount(){
    },
    onChanged(e){
        let start = e[0];
        let end = e[1];

        this.setState({
            ui_start: TimeAPI.SecondToString(start),
            ui_end: TimeAPI.SecondToString(end)
        });

        if (this.props.SetFilter){
            this.props.SetFilter('middle', e);
        }
    },
    FormatSilderTips(value){
        return TimeAPI.SecondToString(value);
    },
    render(){
        if (isNaN( this.props.total_start) || isNaN( this.props.total_end) ){
            return (<div></div>);
        }

        let defaultValue = [(this.props.start || this.props.total_start),
            (this.props.end || this.props.total_end)];

        let time = this.state.ui_start + ' - ' + this.state.ui_end;

        let marks = this.props.marks || {};

        let tmp = {};

        for (var key in marks){
            tmp[key] = marks[key];
        }
        marks = tmp;
        console.log(marks);

        return (
                <Slider tipFormatter={this.FormatSilderTips}
                 range
                 marks={marks}
                 min={this.props.total_start}
                 max={this.props.total_end} 
                 defaultValue={defaultValue}
                 onAfterChange={this.onChanged}
                 />);
    }
});


export default TimeBar;

