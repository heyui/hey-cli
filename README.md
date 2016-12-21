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
	//端口号
	"port": 9002,

	//webpack相关配置    
	"webpack": {
	  //公开path
	  "publicPath": "/", 

	  "output": {
	  	//输出哪些文件，主要是html，默认会加载和html文件名一直的js文件为入口。支持定义公用包。
	    "./*.html": {
	      "commons": [
	        "common"
	      ]
	    }
	  },

	  //公共包定义，可以定义多个
	  "commonTrunk": {
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

	  //定义假名
	  "resolve": {
	    "alias": {}
	  },

	  //定义全局变量
	  "global": {
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

	  //定义反向代理服务器
	  "devServer": {
	    "proxy": {
	      //设定/api开头的url向定义的接口请求
	      "/api": {
	        "target": "http://yoda:9000"
	      }
	    }
	  }
	},

	//未做关联引用的文件在build的时候复制到打包的文件夹中
	"copy": [
	  "./images/**/*",
	  "./help/**/*",
	  "./template/**/*"
	]
}
```

反向代理可以配置pathRewrite，具体请前往[Document](https://webpack.github.io/docs/webpack-dev-server.html#rewriting-urls-of-proxy-request)


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