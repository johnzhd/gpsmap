// Learn more on how to config.
// - https://github.com/dora-js/dora-plugin-proxy#规则定义

module.exports = {
  '/api/todos': function(req, res) {
    setTimeout(function() {
      res.json({
        success: true,
        data: [
          {
            id: 1,
            text: 'Learn antd',
            isComplete: true,
          },
          {
            id: 2,
            text: 'Learn ant-tool',
          },
          {
            id: 3,
            text: 'Learn dora',
          },
        ],
      });
    }, 500);
  },
  '/api/device': function (req, res){
    setTimeout(function(){
      res.json({"data": [
        {"device": "node0020", "latitude": 22.816908, "longitude": 108.405397, "time": "2016-08-29 12:35:37"},
        {"device": "node0014", "latitude": 22.808324, "longitude": 108.403169, "time": "2016-08-29 12:35:37"},
        {"device": "node0008", "latitude": 22.812186, "longitude": 108.397834, "time": "2016-08-29 12:35:37"},
        {"device": "node0009", "latitude": 22.804049, "longitude": 108.393387, "time": "2016-08-29 12:35:37"},
        {"device": "node0019", "latitude": 22.814437, "longitude": 108.4082, "time": "2016-08-29 12:35:37"},
        {"device": "node0018", "latitude": 22.815193, "longitude": 108.401858, "time": "2016-08-29 12:35:37"},
        {"device": "node0017", "latitude": 22.81807, "longitude": 108.398031, "time": "2016-08-29 12:35:37"},
        {"device": "node0005", "latitude": 22.809071, "longitude": 108.39813, "time": "2016-08-29 12:35:37"},
        {"device": "node0006", "latitude": 22.807131, "longitude": 108.394779, "time": "2016-08-29 12:35:37"},
        {"device": "node0007", "latitude": 22.801775, "longitude": 108.397879, "time": "2016-08-29 12:35:37"},
        {"device": "node0013", "latitude": 22.811195, "longitude": 108.403116, "time": "2016-08-29 12:35:37"},
        {"device": "node0001", "latitude": 22.807081, "longitude": 108.398076, "time": "2016-08-29 12:35:37"},
        {"device": "node0002", "latitude": 22.805165, "longitude": 108.401292, "time": "2016-08-29 12:35:37"},
        {"device": "node0003", "latitude": 22.804624, "longitude": 108.398022, "time": "2016-08-29 12:35:37"},
        {"device": "node0012", "latitude": 22.805159, "longitude": 108.405397, "time": "2016-08-29 12:35:37"},
        {"device": "node0021", "latitude": 22.807076, "longitude": 108.401193, "time": "2016-08-29 12:35:37"},
        {"device": "node0011", "latitude": 22.812686, "longitude": 108.400295, "time": "2016-08-29 12:35:37"},
        {"device": "node0016", "latitude": 22.809024, "longitude": 108.406799, "time": "2016-08-29 12:35:37"},
        {"device": "node0010", "latitude": 22.809788, "longitude": 108.401247, "time": "2016-08-29 12:35:37"},
        {"device": "node0015", "latitude": 22.809979, "longitude": 108.40493, "time": "2016-08-29 12:35:37"}],
        "success": 1});
    }, 500);
  }
};
