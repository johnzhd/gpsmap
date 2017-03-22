let GlobalTokenManager = {token: ""};

function GetSetToken(token, bClear){
    if (token && token.length > 0){
        GlobalTokenManager.token = token;
    }
    if (bClear){
        GlobalTokenManager.token = "";
    }
    return GlobalTokenManager.token;
}

export default GetSetToken;

