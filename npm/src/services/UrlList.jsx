
function FormatURL(order){
    return '/api/' + order;
}

function MakeSingleLinkURL(wid, type){
    return '/name/' + wid;
}

const UrlList = {
    device: 'device',
    show: 'show',
    country: 'country',
    origin: 'origin',
    result: 'result',
    near: 'near',
    login: 'login',
    token: 'token',

    MakeSingleLinkURL: MakeSingleLinkURL,
    FormatURL: FormatURL,
};

export default UrlList;
