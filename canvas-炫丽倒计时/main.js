'use strict';
(function() {
  CountDown.DEFAULTS = {
    r: 8, //小圆球半径
    marginTop: 60, //每个数字距离顶部
    marginLeft: 30, //每个数字距离左边
    hours: 1,
    minutes: 0,
    seconds: 0,
    endDate: '',
    colors: ['#33b5e5', '#0099cc', '#aa66cc', '#9933cc', '#99cc00', '#669900', '#ffbb33', '#ff8800', '#ff4444', '#cc0000']
  };
  /**
   * canvas倒计时主函数
   */
  function CountDown(opts) {
    var canvas = document.getElementById('canvas');
    if (!canvas.getContext) {
      return;
    }
    var w = canvas.offsetWidth,
      h = canvas.offsetHeight,
      dpr = window.devicePixelRatio;

    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    //画布
    this.context = canvas.getContext('2d');
    //当前屏幕dpr
    this.dpr = dpr;
    this.opts = $extend(CountDown.DEFAULTS, opts);
    this.data = getData();
    this.balls = [];
    this.render();
  }
  CountDown.prototype = {
    render: function() {
      var opts = this.opts;
      var context = this.context;
      var _this = this;
      //倒计时总秒数
      var totalSeconds = opts.endDate ? (Math.floor((opts.endDate * 1 - new Date() * 1) / 1000)) : calcTotalSeconds(opts.hours, opts.minutes, opts.seconds);
      console.log(totalSeconds);
      var last = Math.floor(new Date() * 1);
      var lastHours = [],
        lastMinutes = [],
        lastSeconds = [];

      setInterval(function() {
        digitDraw();
        var cur = Math.floor(new Date() * 1);
        if (cur - last >= 1000) {
          totalSeconds && totalSeconds--;
          last = cur;
        }
      }, 50);

      function digitDraw() {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds - hours * 3600) / 60);
        var seconds = totalSeconds - hours * 3600 - minutes * 60;
        var curHours = transNum(hours).split('');
        var curMinutes = transNum(minutes).split('');
        var curSeconds = transNum(seconds).split('');
        var xWidth = opts.marginLeft;
        //时
        curHours.forEach(function(num, i) {
          _this.renderDigit(xWidth, opts.marginTop, num);
          //添加彩球
          if (lastHours.length > i && lastHours[i] !== num) {
            _this.addBalls(xWidth, opts.marginTop, num);
          }
          xWidth += 8 * (opts.r + 1) * 2;
        });
        //冒号
        _this.renderDigit(xWidth, opts.marginTop, 'M');
        xWidth += 5 * (opts.r + 1) * 2;
        //分
        curMinutes.forEach(function(num, i) {
          _this.renderDigit(xWidth, opts.marginTop, num);
          //添加彩球
          if (lastMinutes.length > i && lastMinutes[i] !== num) {
            _this.addBalls(xWidth, opts.marginTop, num);
          }
          xWidth += 8 * (opts.r + 1) * 2;
        });
        //冒号
        _this.renderDigit(xWidth, opts.marginTop, 'M');
        xWidth += 5 * (opts.r + 1) * 2;
        //秒
        curSeconds.forEach(function(num, i) {
          _this.renderDigit(xWidth, opts.marginTop, num);
          //添加彩球
          if (lastSeconds.length > i && lastSeconds[i] !== num) {
            _this.addBalls(xWidth, opts.marginTop, num);
          }
          xWidth += 8 * (opts.r + 1) * 2;
        });
        //绘制小球
        _this.renderBalls();
        lastHours = curHours;
        lastMinutes = curMinutes;
        lastSeconds = curSeconds;
      }
    },
    /**
     * 绘制数字
     */
    renderDigit: function(x, y, num) {
      var opts = this.opts;
      var context = this.context;
      var rectlen = 2 * (opts.r + 1);
      var r = opts.r;
      var dpr = this.dpr;
      context.fillStyle = 'rgb(0,102,153)';
      this.data[num].forEach(function(row, rowIndex) {
        row.forEach(function(nb, i) {
          if (nb === 1) {
            var xAxis = x + i * rectlen + rectlen / 2,
              yAxis = y + rowIndex * rectlen + rectlen / 2;
            //绘制圆球
            context.beginPath();
            context.arc(xAxis * dpr, yAxis * dpr, r * dpr, 0, 2 * Math.PI, false);
            context.fill();
          }
        });
      });
    },
    /**
     *添加彩球
     */
    addBalls: function(x, y, num) {
      var opts = this.opts;
      var context = this.context;
      var colors = this.opts.colors;
      var r = opts.r;
      var dpr = this.dpr;
      var rectlen = 2 * (opts.r + 1);
      var _this = this;
      this.data[num].forEach(function(row, rowIndex) {
        row.forEach(function(nb, i) {
          if (nb === 1) {
            var xAxis = x + i * rectlen + rectlen / 2,
              yAxis = y + rowIndex * rectlen + rectlen / 2;
            var ball = {
              x: xAxis * dpr,
              y: yAxis * dpr,
              r: opts.r * dpr,
              g: 1.8 + Math.random(),
              vx: Math.pow(-1, Math.ceil(Math.random() * 100)) * 4, //4或－4
              vy: -5,
              color: colors[Math.floor(Math.random() * colors.length)]
            }
            _this.balls.push(ball);
          }
        });
      });
    },
    /**
     *绘制彩球
     */
    renderBalls: function() {
      var context = this.context;
      var digitheight = 2 * (this.opts.r + 1) * 10 + this.opts.marginTop;
      var canvasHeight = context.canvas.height / this.dpr;
      var percent = (canvasHeight - digitheight) / (canvasHeight - this.opts.marginTop);

      this.balls.forEach(function(ball) {
        var dpr = this.dpr;
        context.beginPath();
        context.fillStyle = ball.color;
        context.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI, false);
        context.fill();
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vy += ball.g;
        if (ball.y > context.canvas.height - ball.r) {
          ball.y = context.canvas.height - ball.r;
          ball.vy = -ball.vy * percent;
        }
      }.bind(this));
      //删除走出可视区域的彩球
      this.removeBalls();
      console.log(this.balls.length);
    },
    removeBalls: function() {
      var context = this.context;
      var cnt = 0;
      this.balls.forEach(function(ball) {
        if (ball.x + ball.r > 0 && ball.x - ball.r < context.canvas.width) {
          this.balls[cnt++] = ball;
        }
      }.bind(this));
      this.balls.splice(cnt, this.balls.length - cnt);
    }
  };

  /**
   * 计算倒计时总秒数
   */
  function calcTotalSeconds(hours, minutes, seconds) {
    var h = parseFloat(hours) || 0;
    var m = parseFloat(minutes) || 0;
    var s = parseFloat(seconds) || 0;
    return Math.floor(h * 60 * 60 + m * 60 + s);
  }

  function transNum(num) {
    var ns = num.toString();
    return ns.length === 1 ? '0' + ns : ns;
  }

  function $extend(defaults, obj) {
    if (!obj) {
      return defaults;
    }
    var result = {};
    for (var o in defaults) {
      result[o] = obj.hasOwnProperty(o) ? obj[o] : defaults[o];
    }
    return result;
  }

  function getData() {
    return {
      '0': [
        [0, 0, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 1, 1, 0],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [0, 1, 1, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 0, 0]
      ],
      '1': [
        [0, 0, 0, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1]
      ],
      '2': [
        [0, 1, 1, 1, 1, 1, 0],
        [1, 1, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 1, 1, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 1, 1, 1]
      ],
      '3': [
        [1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [0, 1, 1, 1, 1, 1, 0]
      ],
      '4': [
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0],
        [0, 1, 1, 0, 1, 1, 0],
        [1, 1, 0, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 1, 1, 0]
      ],
      '5': [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [0, 1, 1, 1, 1, 1, 0]
      ],
      '6': [
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 1, 1, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 1, 0],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [0, 1, 1, 1, 1, 1, 0]
      ],
      '7': [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0]
      ],
      '8': [
        [0, 1, 1, 1, 1, 1, 0],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [0, 1, 1, 1, 1, 1, 0],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [0, 1, 1, 1, 1, 1, 0]
      ],
      '9': [
        [0, 1, 1, 1, 1, 1, 0],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 1, 1],
        [0, 1, 1, 1, 0, 1, 1],
        [0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1, 1, 0],
        [0, 0, 0, 1, 1, 0, 0],
        [0, 1, 1, 0, 0, 0, 0]
      ],
      'M': [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
    };
  }
  window.CountDown = CountDown;
})();
