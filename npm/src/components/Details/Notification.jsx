import React from 'react';
import { notification } from 'antd';

const order = ["success", "info", "warning", "error"]; 

function openNotificationWithIcon(level, message, desc) {
    if (level.length == 1){
        switch(level){
            case "s":
            level = "success";
            break;
            case "i":
            level = "info";
            break;
            case "w":
            level = "warning";
            break;
            case "e":
            level = "error";
            break;
        }
    }

    notification[level]({
      message: message,
      description: desc,
      duration: 2
    });
};


export default openNotificationWithIcon;

