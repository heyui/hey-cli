# hey-cli
webpack脚手架，hot-dev-server，build。  
不需要理解webpack，只需要知道如何配置就可以使用，摆脱繁琐重复的webpack配置。   


## 特性
全局安装，所有的项目都将支持，不需要每个项目都安装配置webpack。    
支持<code>ES6</code>，热替换，反向代理，默认支持<code>vue2.0</code>，支持<code>react</code>项目。  
只需要在package.json中配置<code>hey</code>属性，或者在项目根目录下添加<code>hey.js</code>配置文件即可。  
可以用于打包UMD模式的公用包。

## 安装

```
npm install -g hey-cli
```

## 配置

### 方式一：hey.js
请在项目根目录下添加hey.js配置文件。 
```js
module.exports = {
	//端口号
	"port": 9002,
	"dist": 'dist', //生成文件的根目录
  "timestamp": false, //build生成的static文件夹是否添加时间戳
  "react": "true", //支持react项目
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
	    },
      historyApiFallback: true
	  },
	  //定义外部引用
	  "externals":{

	  },

    //定义全局less参数定义，可以在任意less中使用参数
    globalVars: './static/css/var.less',
	},

	//未做关联引用的文件在build的时候复制到打包的文件夹中
	"copy": [
	  "./images/**/*",
	  "./help/**/*",
	  "./template/**/*"
	]
};
```


### 方式二：package.json
在package.json中添加属性hey：  
注：推荐使用hey.js方式配置，因为json文件没有办法添加注释，并且不能注释代码，不方便调试。

```javascript
"hey": {
  port: 9008,
  timestamp: true,
  dist: "gen",
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
}
```

### 说明

devServer可以配置，具体请前往[webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html)

## 示例

### 加载vue,vue-router  

```json
"hey": {
  "port": 9008,
  "timestamp": true,
  "dist": "gen",
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
### 外部加载vue,vue-router  

```json
"hey": {
  "port": 9008,
  "timestamp": true,
  "dist": "gen",
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

### 打包UMD模式的公用包
主要用于一些自己开发的公用包，简单配置即可使用。  
*由于是打包成UMD模式的公用包，请不要使用import模式。*

```js
module.exports = {
  dist: "build",
  webpack: {
    umd: {
      entry: "./src/index.js",
      library: "Validator",
      filename: 'validator.js'
    }
  }
};
```

## 执行

启动webpack服务器

```
hey dev
```

打包项目，支持hash文件，按需加载。  
配置文件中使用<code>timestamp</code>属性，可以生成static[hash]命名的文件夹，这样可以防止所有版本的文件汇聚在一个文件夹。

```
hey build
```
