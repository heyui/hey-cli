# hey-cli
webpack脚手架，hot-dev-server，build。
主要使用package.json文件配置，支持vue2.0。  
vue1.0的脚手架请前往[vvpvvp/kil](https://github.com/vvpvvp/kil)。  
不需要理解webpack，只需要知道如何配置就可以使用。  
支持es6，热替换，反向代理。  


## 安装

```
npm install -g hey-cli
```

## 配置

### 方式一：package.json
在package.json中添加属性hey：  
注：下面的配置请清除注释，json文件没有办法添加注释。

```javascript
"hey": {
	//端口号
	"port": 9002,
	"root": 'dist', //生成文件的根目录
  "timestamp": false, //build生成的static文件夹是否添加时间戳
	//webpack相关配置    
	"webpack": {
	  //公开path
	  "publicPath": "/", 

	  "output": {
	  	//输出哪些文件，主要是html，默认会加载和html文件名一样的js文件为入口。支持定义公用包。
	    "./*.html": {
	    	"entry":"./src/index.js", //默认加载js文件，并且html自动引用。如果没有配置，则自动加载与html文件名同样的js文件。
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
	    "log": "./js/common/log"
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
	  //定义外部引用
	  "externals":{

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


### 方式二：hey.js
请在项目根目录下添加hey.js配置文件。 
```js
module.exports = {
  port: 9008,
  timestamp: true,
  root: "gen",
  webpack: {
    publicPath: "/",
    output: {
      "./*html": {
        entry: "./src/app"
      }
    },
    commonTrunk: {
      vuec: ["vue-router"]
    },
    global: {
      Vue: "vue"
    },
    devServer: {
      historyApiFallback: true
    },
    externals: {
      Vue: "window.Vue",
      VueRouter: "window.VueRouter"
    }
  },
  copy: ["./static/images/**/*"]
};
```

### 说明

devServer可以配置，具体请前往[webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html)

## 示例

加载vue,vue-router  

```json
"hey": {
  "port": 9008,
  "timestamp": true,
  "root": "gen",
  "webpack": {
    "publicPath": "/",
    "output": {
      "./*.html": {
        "entry":"./src/app",
        "common":["common"]
      }
    },
    "commonTrunk": {
      "common":["vue","vue-router"]
    },
    "global": {
      "Vue": "vue"
    },
    "devServer": {
      "historyApiFallback":true
    }
  },
  "copy":["./static/images/**/*"]
}
```
外部加载vue,vue-router  

```json
"hey": {
  "port": 9008,
  "timestamp": true,
  "root": "gen",
  "webpack": {
    "publicPath": "/",
    "output": {
      "./*.html": {
        "entry":"src/app"
      }
    },
    "global": {
      "Vue": "vue"
    },
    "devServer": {
      "historyApiFallback":true
    },
    "externals": {
      "Vue": "window.Vue",
      "VueRouter": "window.VueRouter"
    }
  },
  "copy":["./static/images/**/*"]
}
```

## 执行

创建项目

```
hey init vue [project-name] // 基于Vue2.0的项目
```

OR

```
hey init simple [project-name] // 简单版，不依赖任何框架
```

启动webpack服务器

```
hey dev
```

打包项目，支持hash文件，按需加载。

```
hey build
```
