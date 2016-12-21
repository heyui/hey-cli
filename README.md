# hey-cli
webpack脚手架，hot-dev-server，build。
主要使用package.json文件配置，支持vue2.0。  
vue1.0请前往[kil](https://github.com/lovelypig5/kil)。  
不需要理解webpack，只需要知道如何配置就可以使用。  
支持es6，热替换，反向代理。  

## 安装

```
npm install -g hey-cli
```

## 配置

```json
"hey": {
	"port": 9002,        //端口号
	"webpack": {
	  "publicPath": "/", //公开path
	  "output": {
	    "./*.html": {    //输出哪些文件，主要是html，默认会加载和html文件名一直的js文件为入口。支持定义公用包。
	      "commons": [
	        "common"
	      ]
	    }
	  },
	  "commonTrunk": {   //公共包定义，可以定义多个
	    "common": [
	      "jquery",
	      "vue",
	      "vuex",
	      "manba",
	      "./js/plugin/model/model",
	      "./js/common/log",
	      "./js/common/control",
	      "./js/common.js",
	      "./js/plugin/plugin.js",
	      "./js/plugin/uploader/qiniu",
	      "lightbox2",
	      "tooltipster",
	      "./js/directives_html",
	      "./js/directives",
	      "jsoneditor"
	    ]
	  },
	  "resolve": {       //定义假名
	    "alias": {}
	  },
	  "global": {        //定义全局变量
	    "Vue": "vue",
	    "$": "jquery",
	    "log": "./js/common/log",
	    "Common": "./js/common.js",
	    "Control": "./js/common/control",
	    "jQuery": "jquery",
	    "Model": "./js/plugin/model/model",
	    "Plugin": "./js/plugin/plugin.js",
	    "Qiniu": "./js/plugin/uploader/qiniu"
	  },
	  "devServer": {      //定义反向代理服务器
	    "proxy": {
	      "/api": {		  //设定/api开头的url向定义的接口请求，可以配置pathRewrite，具体请前往[Document](https://webpack.github.io/docs/webpack-dev-server.html#rewriting-urls-of-proxy-request)
	        "target": "http://yoda:9000"
	      }
	    }
	  }
	},
	"copy": [             //未做关联引用的文件在build的时候复制到打包的文件夹中
	  "./images/**/*",
	  "./help/**/*",
	  "./template/**/*"
	]
}
```


## 执行

启动webpack服务器

```
hey dev
```

打包项目，支持hash文件，按需加载。

```
hey build
```

本项目Forked from [lovelypig5/kil](https://github.com/lovelypig5/kil)