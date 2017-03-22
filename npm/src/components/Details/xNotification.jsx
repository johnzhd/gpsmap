import {notification } from 'antd';

function IsType(type){
    const list = ['success', 'info', 'warning', 'error'];
    for (var one of list){
        if (one == type){
            return true;
        }
    }
    return false;
}

function xNotification(title, description, type, duration){
    if ( !duration && duration !== 0 ){
        duration = 1;
    }

    if (!IsType(type)){
        type = 'info';
    }
    const args = {
        message: title,
        description: description,
        duration: duration,
    };
    notification[type](args);
};

export default xNotification;
