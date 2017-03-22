import styles from './TopBar.less';
import React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;



const LinkBar = React.createClass({
    render() {
        if (this.props.disabled)
        {
            return <span><Icon type={this.props.icon} />{this.props.name}</span>;
        }
        if (this.props.icon)
        {
            return <span><Icon type={this.props.icon} /><a href={this.props.url}>{this.props.name}</a></span>;
        }
        return <span><a href={this.props.url}>{this.props.name}</a></span>;
    }
});

const TopBar = React.createClass({
    getInitialState() {
        return {
            list: [
                {key: "base", name: "首页", icon: "home", url: "/", index: true},
                {key: "name", name: "列表", icon: "bars", url: "/name", index: false},
                {key: "search", name: "搜索", icon: "search", url: "/search/normal", index: false,
                    child: [
                        {key: "normal", name: "普通", icon: "bars", url: "/search/normal", index: false},
                        {key: "near", name: "附近", icon: "environment", url: "/search/near", index: false},
                    ]
                },
                {key: "device", name: "设备", icon: "setting", url: "/device", index: false},
            ],
            current: 'base'
        };
    },
    handleClick(e) {
        this.setState({
            current: e.key
        });
    },
    MakeChildBar(children){
        let contain = children.map(function(one){
            return (<Menu.Item key={one.key}>
            <div>
            <Icon type={one.icon} />
            <Link to={one.url}>{one.name}</Link>
            </div>
            </Menu.Item>);
        });
        return contain;
    },
    MakeTopBar(list) {
        const MakeChildren = this.MakeChildBar;
        let contain = list.map(function(one){
            if (one.child){
                let children = MakeChildren(one.child);
                let title = (<span><Icon type={one.icon} />
                <Link to={one.url} activeClassName="active" onlyActiveOnIndex={one.index}>{one.name}
                </Link></span>);
                return (
                    <SubMenu key={one.key} title={title}>
                    {children}
                    </SubMenu>);
            }
            return (<Menu.Item key={one.key}>
            <div>
            <Icon type={one.icon} />
            <Link to={one.url} activeClassName="active" onlyActiveOnIndex={one.index}>{one.name}</Link>
            </div>
            </Menu.Item>);
        });
        return contain;
    },
    render() {
        let contain = this.MakeTopBar(this.state.list);

        return (<div className={styles.topbar_dark}>
          <Menu theme="dark"
           onClick={this.handleClick}
                selectedKeys={[this.state.current]} 
                mode="horizontal"
                defaultSelectedKeys={["base"]}
                >
                {contain}
        </Menu></div>
       );
}
});


export default TopBar;

