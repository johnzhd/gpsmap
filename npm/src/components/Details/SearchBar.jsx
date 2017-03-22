import React from 'react';
import { Row, Col } from 'antd';
import { Input, Button } from 'antd';
import classnames from 'classnames';

const SearchBar = React.createClass({
  getInitialState() {
    return {
      value: this.lazy_get_name(),
      focus: false,
    };
  },
  lazy_get_name(){
    var v = '';
    if (this.props.initkey && this.props.initkey["name"]){
        v = this.props.initkey["name"];
    }
    return v;
  },
  handleInputChange(e) {
    if (this.props.onUpdateSearch){
        this.props.onUpdateSearch({"name": e.target.value});
    }
  },
  handleFocusBlur(e) {
    this.setState({
      focus: e.target === document.activeElement,
    });
  },
  handleSearch() {
    var v = this.lazy_get_name();
    if (this.props.onSearch) {
        this.props.onSearch({"name":v});
    }
  },
  render() {
    const { placeholder } = this.props;
    const btnCls = classnames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.value.trim(),
    });
    const searchCls = classnames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.focus,
    });
    var v = this.lazy_get_name();
    return (
        <div><Row>
        <Col span={20}><Input className={searchCls} placeholder={placeholder} value={v} onChange={this.handleInputChange}
            onFocus={this.handleFocusBlur} onBlur={this.handleFocusBlur} onPressEnter={this.handleSearch}
          />
          </Col>
          <Col span={4}><Button icon="search" className={btnCls} onClick={this.handleSearch} />
          </Col>
         </Row></div>
    );
  },
});




// initkey
// onUpdateSearch
// onSearch
// placeholder
export default SearchBar;
