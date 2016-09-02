'use strict';
(function() {
    var PI = Math.PI;
    var ATTR_MAP = {
        "className": "class",
        "svgHref": "href"
    };
    var NS_MAP = {
        "svgHref": 'http://www.w3.org/1999/xlink'
    };
    var template = {
        open: '<svg id="pa-pie-chart" width="{{length}}" height="{{length}}" viewBox="0 0 {{length}} {{length}}" style="border-radius:50%;"><defs><circle id="graph" r="{{halfLength}}" cx="{{halfLength}}" cy="{{halfLength}}" /></defs><g class="graph" stroke-width="{{length}}" fill="none" transform="rotate(-120 {{halfLength}} {{halfLength}})">',
        piece: '<use xlink:href="#graph" stroke="{{color}}" stroke-dasharray="0 {{offset}} {{percent}} {{length}}"></use>',
        innerCircle: '<circle fill="#ffffff" cx="{{cx}}" cy="{{cy}}" r="{{r}}"></circle>',
    };

    function makeSVG(tag, attributes) {
        var elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var attribute in attributes) {
            var name = (attribute in ATTR_MAP ? ATTR_MAP[attribute] : attribute);
            var value = attributes[attribute];
            if (attribute in NS_MAP)
                elem.setAttributeNS(NS_MAP[attribute], name, value);
            else
                elem.setAttribute(name, value);
        }
        return elem;
    }

    function Piece(data, color) {
        this.color = color;
        this.percent = data.percent;
        this.number = data.percent;
    }

    Piece.prototype.render = function(total, r, label) {
        var length = Math.PI * 2 * r;
        return template.piece
            .replace('{{color}}', this.color)
            .replace('{{offset}}', (this.offset / total) * length)
            .replace('{{percent}}', this.percent / 100 * length)
            .replace('{{length}}', length);
    }

    // 构造函数用来传入参数
    function Pie(options) {
        this.colors = options.colors;
        this.r = options.r || 100; // 如果不传入默认半径为100;
        this.container = options.container;
        var container = this.container;
        if (typeof container == 'string') {
            // 如果传入的是字符串就去取对应的id值的dom
            var ele = document.getElementById(container);
        } else {
            // 否则直接把他当做dom去操作，如果传入的不对浏览器会报错。
            var ele = container;
        }
        this.ele = ele;
        var eleHeight = ele.offsetHeight;
        var eleWidth = ele.offsetWidth;

        if (!!eleHeight && !!eleWidth) {
            this.r = (eleHeight > eleWidth ? eleWidth : eleHeight) / 2;
        }
        this.d = this.r * 2;
        // 替换半径数据
        template.open = template.open.replace(/{{length}}/g, this.d)
            .replace(/{{halfLength}}/g, this.r);
    }
    // draw方法用来执行画图函数，参数是对应的容器id或者dom
    Pie.prototype.draw = function(data) {
        this.data = data || [];
        this.pieces = [];
        this.total = 0;
        var ele = this.ele;
        ele.innerHTML = 0;
        var len = this.data.length,piece;
        for (var i = 0; i < len; i++) {
            piece = new Piece(this.data[i], this.colors[i % this.colors.length]);
            piece.offset = this.total;
            this.total += parseFloat(piece.number);
            this.pieces.push(piece);
        }
        var _this = this;
        var length = Math.PI * 2 * this.r;
        var len = this.pieces.length;
        var output = "";
        for (i = 0; i < len; i++) {
            output += this.pieces[i].render(this.total, this.r, this.data[i].label);
        }
        output += template.innerCircle.replace('{{cx}}', this.r)
            .replace('{{cy}}', this.r)
            .replace('{{r}}', this.r * 0.5);
        var circleMask = makeSVG('circle', {
            cx: _this.r,
            cy: _this.r,
            r: _this.r,
            fill: 'none',
            stroke: '#ffffff'
        });
        circleMask.style.webkitTransition = 'stroke-dasharray 1s';
        circleMask.style.strokeDasharray = "0 0 " + length + " " + length;
        circleMask.setAttribute('id', 'pa-pie-chart-mask');
        ele.innerHTML = template.open + output + circleMask.outerHTML;
        var mask = document.getElementById('pa-pie-chart-mask');
        setTimeout(function() {
            mask.style.strokeDasharray = "0 " + length + " 0 0";
        }, 0);

    }
    module.exports = Pie;
})();
